// API endpoint: POST /api/schedules
// Creates a new availability schedule and returns share info

import { getCollection } from '../../../lib/mongodb'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personName, personEmail, selectedProject, projects, selectedDates, expirationDays = 7, userTimezone } = req.body;

    // Validate required fields
    if (!personName || !personEmail || !selectedDates) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate expiration days (1-30 days allowed)
    const validExpirationDays = Math.min(Math.max(parseInt(expirationDays) || 7, 1), 30);

    // Generate unique share ID (crypto-secure)
    const shareId = generateShareId();
    
    // Calculate expiration in UTC to avoid timezone issues
    // This ensures consistent expiration across all timezones
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (validExpirationDays * 24 * 60 * 60 * 1000));
    
    // Store user's timezone for better display later (optional)
    const detectedTimezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // Calculate analytics
    const analytics = calculateAnalytics(selectedDates, projects);

    // Prepare schedule data
    const scheduleData = {
      shareId,
      personName: personName.trim(),
      personEmail: personEmail.toLowerCase().trim(),
      selectedProject,
      projects: projects || [],
      selectedDates,
      createdAt: now,
      expiresAt,
      userTimezone: detectedTimezone, // Store for display purposes
      viewCount: 0,
      lastViewedAt: now,
      analytics
    };

    console.log('Saving schedule to MongoDB:', scheduleData);

    // Save to MongoDB
    const schedulesCollection = await getCollection('availability_schedules');
    const result = await schedulesCollection.insertOne(scheduleData);

    console.log('✅ Schedule saved with ID:', result.insertedId);

    // Generate the full share URL using environment variable or request headers
    const baseUrl = process.env.NEXTAUTH_URL || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const shareUrl = `${baseUrl}/share/${shareId}`;

    res.status(201).json({
      success: true,
      shareId,
      shareUrl,
      expiresAt: expiresAt.toISOString(), // Return as ISO string for consistency
      expirationDays: validExpirationDays,
      userTimezone: detectedTimezone,
      analytics
    });

  } catch (error) {
    console.error('❌ Error creating schedule:', error);
    
    // Handle duplicate shareId (very unlikely but possible)
    if (error.code === 11000) {
      return res.status(500).json({ error: 'Failed to generate unique share ID, please try again' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Generate cryptographically secure share ID
function generateShareId() {
  return crypto.randomBytes(8).toString('base64url'); // Generates 11-character URL-safe string
}

// Calculate analytics for the schedule
function calculateAnalytics(selectedDates, _projects) {
  let totalHours = 0;
  let daysSelected = 0;
  const projectsUsed = new Set();

  // Count total hours and days across all projects
  Object.keys(selectedDates).forEach(projectId => {
    projectsUsed.add(projectId);
    const projectDates = selectedDates[projectId];
    
    Object.keys(projectDates).forEach(dateKey => {
      daysSelected++;
      const dayData = projectDates[dateKey];
      
      // Add quick slot hours
      if (dayData.quickSlots) {
        dayData.quickSlots.forEach(slotId => {
          switch (slotId) {
            case 'morning': totalHours += 3; break;
            case 'afternoon': totalHours += 5; break;
            case 'evening': totalHours += 3; break;
          }
        });
      }
      
      // Add custom slot hours
      if (dayData.customSlots) {
        dayData.customSlots.forEach(slot => {
          const start = parseTime(slot.startTime);
          const end = parseTime(slot.endTime);
          totalHours += (end - start) / (1000 * 60 * 60); // Convert to hours
        });
      }
    });
  });

  return {
    totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    daysSelected,
    projectsUsed: Array.from(projectsUsed)
  };
}

// Helper function to parse time strings like "09:00" into Date objects
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
} 