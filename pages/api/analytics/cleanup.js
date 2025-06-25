// API endpoint: GET /api/analytics/cleanup
// Provides cleanup and usage analytics

import { getCollection } from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const schedulesCollection = await getCollection('availability_schedules');
    const now = new Date();

    // Time ranges for analytics
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalSchedules = await schedulesCollection.countDocuments({});
    const activeSchedules = await schedulesCollection.countDocuments({ expiresAt: { $gt: now } });
    const expiredSchedules = await schedulesCollection.countDocuments({ expiresAt: { $lte: now } });

    // Creation analytics
    const createdLast24h = await schedulesCollection.countDocuments({ createdAt: { $gte: last24h } });
    const createdLast7days = await schedulesCollection.countDocuments({ createdAt: { $gte: last7days } });
    const createdLast30days = await schedulesCollection.countDocuments({ createdAt: { $gte: last30days } });

    // Usage analytics
    const viewAnalytics = await schedulesCollection.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewCount" },
          avgViews: { $avg: "$viewCount" },
          maxViews: { $max: "$viewCount" },
          schedulesWithViews: {
            $sum: { $cond: [{ $gt: ["$viewCount", 1] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const viewStats = viewAnalytics[0] || {
      totalViews: 0,
      avgViews: 0,
      maxViews: 0,
      schedulesWithViews: 0
    };

    // Expiration distribution
    const expirationAnalytics = await schedulesCollection.aggregate([
      {
        $match: { expiresAt: { $gt: now } }
      },
      {
        $project: {
          daysUntilExpiration: {
            $divide: [
              { $subtract: ["$expiresAt", now] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$daysUntilExpiration",
          boundaries: [0, 1, 2, 3, 7, 14, 30],
          default: "30+",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]).toArray();

    // Project usage analytics
    const projectAnalytics = await schedulesCollection.aggregate([
      {
        $unwind: "$analytics.projectsUsed"
      },
      {
        $group: {
          _id: "$analytics.projectsUsed",
          count: { $sum: 1 },
          totalHours: { $sum: "$analytics.totalHours" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();

    // Cleanup recommendations
    const recommendations = [];
    
    if (expiredSchedules > 0) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: `${expiredSchedules} expired schedules can be cleaned up`,
        action: 'Run cleanup endpoint with action=expired'
      });
    }

    const unusedSchedules = await schedulesCollection.countDocuments({
      viewCount: { $lte: 1 },
      createdAt: { $lt: last24h }
    });

    if (unusedSchedules > 5) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        message: `${unusedSchedules} schedules created >24h ago have no views`,
        action: 'Consider cleanup of unused schedules'
      });
    }

    if (totalSchedules > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Database has ${totalSchedules} total schedules`,
        action: 'Consider implementing automated cleanup policies'
      });
    }

    const analytics = {
      timestamp: now.toISOString(),
      overview: {
        totalSchedules,
        activeSchedules,
        expiredSchedules,
        unusedSchedules
      },
      creation: {
        last24h: createdLast24h,
        last7days: createdLast7days,
        last30days: createdLast30days
      },
      usage: {
        totalViews: viewStats.totalViews,
        averageViews: Math.round(viewStats.avgViews * 100) / 100,
        maxViews: viewStats.maxViews,
        schedulesWithViews: viewStats.schedulesWithViews,
        usageRate: totalSchedules > 0 ? Math.round((viewStats.schedulesWithViews / totalSchedules) * 100) : 0
      },
      expiration: {
        distribution: expirationAnalytics,
        expiredCount: expiredSchedules
      },
      projects: {
        topProjects: projectAnalytics
      },
      recommendations
    };

    res.status(200).json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Analytics failed',
      details: error.message 
    });
  }
} 