// API endpoint: GET /api/schedules/[shareId]
// Retrieves a schedule by its share ID

import { getCollection } from '../../../lib/mongodb'
import { isExpired } from '../../../lib/timezone-utils'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shareId } = req.query;

    if (!shareId || typeof shareId !== 'string') {
      return res.status(400).json({ error: 'Valid share ID is required' });
    }

    console.log('Fetching schedule for shareId:', shareId);

    // Get schedule from MongoDB
    const schedulesCollection = await getCollection('availability_schedules');
    const schedule = await schedulesCollection.findOne({ shareId });
    
    if (!schedule) {
      console.log('❌ Schedule not found for shareId:', shareId);
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Check if schedule has expired (timezone-safe)
    if (isExpired(schedule.expiresAt)) {
      console.log('❌ Schedule expired for shareId:', shareId);
      return res.status(410).json({ error: 'Schedule has expired' });
    }

    // Increment view count and update last viewed time
    await schedulesCollection.updateOne(
      { shareId },
      { 
        $inc: { viewCount: 1 }, 
        $set: { lastViewedAt: new Date() } 
      }
    );

    console.log('✅ Schedule retrieved and view count updated for:', shareId);

    // Prepare response (remove MongoDB _id)
    const { _id, ...scheduleResponse } = schedule;
    
    res.status(200).json({
      ...scheduleResponse,
      viewCount: schedule.viewCount + 1 // Include the updated view count
    });

  } catch (error) {
    console.error('❌ Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 