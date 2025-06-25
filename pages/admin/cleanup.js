// Admin Cleanup Dashboard
// URL: /admin/cleanup

import { useState, useEffect } from 'react';

export default function CleanupDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/cleanup');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const runCleanup = async (action, options = {}) => {
    if (!adminKey) {
      alert('Please enter admin key first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminKey,
          action,
          ...options
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => [data, ...prev]);
        loadAnalytics(); // Refresh analytics after cleanup
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Failed to run cleanup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🧹</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Database Cleanup Dashboard
              </h1>
              <p className="text-gray-600">Manage schedule expiration and cleanup operations</p>
            </div>
          </div>
        </div>

        {/* Admin Key Input */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Authentication</h2>
          <input
            type="password"
            placeholder="Enter admin key..."
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            Use development key: <code className="bg-gray-100 px-2 py-1 rounded">dev-cleanup-key-123</code>
          </p>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Total Schedules</h3>
              <p className="text-2xl font-bold text-blue-800">{analytics.overview.totalSchedules}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-2">Active Schedules</h3>
              <p className="text-2xl font-bold text-green-800">{analytics.overview.activeSchedules}</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-700 mb-2">Expired Schedules</h3>
              <p className="text-2xl font-bold text-yellow-800">{analytics.overview.expiredSchedules}</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-sm font-medium text-purple-700 mb-2">Usage Rate</h3>
              <p className="text-2xl font-bold text-purple-800">{analytics.usage.usageRate}%</p>
            </div>
          </div>
        )}

        {/* Cleanup Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Cleanup Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => runCleanup('stats')}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all duration-300"
            >
              📊 Get Stats
            </button>
            <button
              onClick={() => runCleanup('expired', { dryRun: true })}
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-all duration-300"
            >
              👀 Preview Expired
            </button>
            <button
              onClick={() => runCleanup('expired', { dryRun: false })}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all duration-300"
            >
              🗑️ Delete Expired
            </button>
            <button
              onClick={() => runCleanup('unused', { dryRun: true })}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-3 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-all duration-300"
            >
              🔍 Preview Unused
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {analytics?.recommendations?.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h2>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border ${
                    rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                    rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{rec.message}</h3>
                      <p className="text-sm text-gray-600">{rec.action}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Log */}
        {results.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Operation Results</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{result.action || result.message}</span>
                    <span className="text-sm text-gray-500">{formatDate(result.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.deletedCount !== undefined && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Deleted: {result.deletedCount} records
                    </p>
                  )}
                  {result.expiredCount !== undefined && (
                    <p className="text-sm font-medium text-yellow-600 mt-1">
                      Found: {result.expiredCount} expired records
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Running cleanup operation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 