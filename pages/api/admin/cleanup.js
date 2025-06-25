// API endpoint: POST /api/admin/cleanup
// Manual cleanup endpoint for testing and admin purposes

import { getCollection } from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple admin authentication (in production, use proper auth)
    const { adminKey, action, dryRun = true } = req.body;
    
    // Check admin key (use environment variable in production)
    if (adminKey !== process.env.ADMIN_CLEANUP_KEY && adminKey !== 'dev-cleanup-key-123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const schedulesCollection = await getCollection('availability_schedules');
    const now = new Date();

    let result = {};

    switch (action) {
      case 'expired':
        // Clean up expired schedules
        const expiredQuery = { expiresAt: { $lt: now } };
        
        if (dryRun) {
          const expiredCount = await schedulesCollection.countDocuments(expiredQuery);
          const expiredSamples = await schedulesCollection.find(expiredQuery)
            .limit(5)
            .project({ shareId: 1, personName: 1, expiresAt: 1 })
            .toArray();
          
          result = {
            action: 'expired (dry run)',
            expiredCount,
            expiredSamples,
            message: `Found ${expiredCount} expired schedules. Use dryRun: false to delete them.`
          };
        } else {
          const deleteResult = await schedulesCollection.deleteMany(expiredQuery);
          result = {
            action: 'expired (executed)',
            deletedCount: deleteResult.deletedCount,
            message: `Deleted ${deleteResult.deletedCount} expired schedules`
          };
        }
        break;

      case 'old':
        // Clean up schedules older than X days (regardless of expiration)
        const { daysOld = 30 } = req.body;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        const oldQuery = { createdAt: { $lt: cutoffDate } };
        
        if (dryRun) {
          const oldCount = await schedulesCollection.countDocuments(oldQuery);
          const oldSamples = await schedulesCollection.find(oldQuery)
            .limit(5)
            .project({ shareId: 1, personName: 1, createdAt: 1 })
            .toArray();
          
          result = {
            action: `old (dry run, >${daysOld} days)`,
            oldCount,
            oldSamples,
            message: `Found ${oldCount} schedules older than ${daysOld} days. Use dryRun: false to delete them.`
          };
        } else {
          const deleteResult = await schedulesCollection.deleteMany(oldQuery);
          result = {
            action: `old (executed, >${daysOld} days)`,
            deletedCount: deleteResult.deletedCount,
            message: `Deleted ${deleteResult.deletedCount} schedules older than ${daysOld} days`
          };
        }
        break;

      case 'unused':
        // Clean up schedules with zero views after 24 hours
        const unusedCutoff = new Date();
        unusedCutoff.setHours(unusedCutoff.getHours() - 24);
        
        const unusedQuery = { 
          viewCount: { $lte: 1 }, // Only creator view
          createdAt: { $lt: unusedCutoff }
        };
        
        if (dryRun) {
          const unusedCount = await schedulesCollection.countDocuments(unusedQuery);
          const unusedSamples = await schedulesCollection.find(unusedQuery)
            .limit(5)
            .project({ shareId: 1, personName: 1, viewCount: 1, createdAt: 1 })
            .toArray();
          
          result = {
            action: 'unused (dry run)',
            unusedCount,
            unusedSamples,
            message: `Found ${unusedCount} unused schedules older than 24h. Use dryRun: false to delete them.`
          };
        } else {
          const deleteResult = await schedulesCollection.deleteMany(unusedQuery);
          result = {
            action: 'unused (executed)',
            deletedCount: deleteResult.deletedCount,
            message: `Deleted ${deleteResult.deletedCount} unused schedules older than 24h`
          };
        }
        break;

      case 'stats':
        // Get cleanup statistics
        const totalSchedules = await schedulesCollection.countDocuments({});
        const expiredSchedules = await schedulesCollection.countDocuments({ expiresAt: { $lt: now } });
        const activeSchedules = totalSchedules - expiredSchedules;
        
        const avgViewCount = await schedulesCollection.aggregate([
          { $group: { _id: null, avgViews: { $avg: "$viewCount" } } }
        ]).toArray();
        
        result = {
          action: 'stats',
          totalSchedules,
          activeSchedules,
          expiredSchedules,
          averageViewCount: avgViewCount[0]?.avgViews || 0,
          message: 'Database statistics retrieved'
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid action. Use: expired, old, unused, or stats' });
    }

    console.log('🧹 Admin cleanup action:', result);

    res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      ...result
    });

  } catch (error) {
    console.error('❌ Admin cleanup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Cleanup failed',
      details: error.message 
    });
  }
} 