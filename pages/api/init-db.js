import { getDatabase } from '../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initializing database schema...')
    const db = await getDatabase()
    
    // 1. Create availability_schedules collection with validation
    try {
      await db.createCollection("availability_schedules", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["shareId", "personName", "personEmail", "selectedDates", "createdAt", "expiresAt"],
            properties: {
              shareId: { bsonType: "string", minLength: 10 },
              personName: { bsonType: "string", minLength: 1 },
              personEmail: { bsonType: "string", pattern: "^.+@.+\\..+$" },
              clerkUserId: { bsonType: ["string", "null"] },
              selectedProject: { bsonType: "string" },
              projects: { bsonType: "array" },
              selectedDates: { bsonType: "object" },
              createdAt: { bsonType: "date" },
              expiresAt: { bsonType: "date" },
              viewCount: { bsonType: "int", minimum: 0 },
              lastViewedAt: { bsonType: "date" },
              analytics: { bsonType: "object" }
            }
          }
        }
      });
      console.log('✅ availability_schedules collection created with validation')
    } catch (err) {
      if (err.code === 48) {
        console.log('ℹ️  availability_schedules collection already exists')
      } else {
        throw err
      }
    }

    // 2. Create indexes for availability_schedules
    const schedulesCollection = db.collection('availability_schedules')
    
    // Primary sharing lookup (unique)
    await schedulesCollection.createIndex({ "shareId": 1 }, { unique: true })
    console.log('✅ shareId index created')
    
    // TTL index for auto-expiration
    await schedulesCollection.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
    console.log('✅ TTL expiration index created')
    
    // User lookup indexes
    await schedulesCollection.createIndex({ "personEmail": 1, "createdAt": -1 })
    await schedulesCollection.createIndex({ "clerkUserId": 1, "createdAt": -1 })
    console.log('✅ User lookup indexes created')

    // 3. Create quick_time_slots collection
    try {
      await db.createCollection("quick_time_slots")
      console.log('✅ quick_time_slots collection created')
    } catch (err) {
      if (err.code === 48) {
        console.log('ℹ️  quick_time_slots collection already exists')
      } else {
        throw err
      }
    }

    // 4. Insert default quick time slots
    const timeSlotsCollection = db.collection('quick_time_slots')
    const existingSlots = await timeSlotsCollection.countDocuments()
    
    if (existingSlots === 0) {
      await timeSlotsCollection.insertMany([
        { 
          id: "morning", 
          label: "Morning", 
          time: "9:00 AM - 12:00 PM", 
          startTime: "09:00", 
          endTime: "12:00", 
          durationHours: 3,
          active: true
        },
        { 
          id: "afternoon", 
          label: "Afternoon", 
          time: "12:00 PM - 5:00 PM", 
          startTime: "12:00", 
          endTime: "17:00", 
          durationHours: 5,
          active: true
        },
        { 
          id: "evening", 
          label: "Evening", 
          time: "5:00 PM - 8:00 PM", 
          startTime: "17:00", 
          endTime: "20:00", 
          durationHours: 3,
          active: true
        }
      ])
      console.log('✅ Default time slots inserted')
    } else {
      console.log('ℹ️  Time slots already exist, skipping insert')
    }

    // 5. Prepare for future users collection (Clerk integration)
    try {
      await db.createCollection("users")
      console.log('✅ users collection created (for future Clerk integration)')
    } catch (err) {
      if (err.code === 48) {
        console.log('ℹ️  users collection already exists')
      } else {
        throw err
      }
    }

    res.status(200).json({
      success: true,
      message: 'Database schema initialized successfully',
      collections: {
        availability_schedules: 'Created with validation and indexes',
        quick_time_slots: 'Created with default data',
        users: 'Created for future Clerk integration'
      }
    });

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Database initialization failed',
      details: error.message 
    });
  }
} 