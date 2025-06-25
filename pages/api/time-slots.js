import { getCollection } from '../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timeSlotsCollection = await getCollection('quick_time_slots')
    const timeSlots = await timeSlotsCollection.find({ active: true }).toArray()
    
    res.status(200).json({
      success: true,
      timeSlots
    });

  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch time slots',
      details: error.message 
    });
  }
} 