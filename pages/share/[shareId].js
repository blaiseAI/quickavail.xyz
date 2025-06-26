import { useState, useEffect } from 'react';
import QuickAvail from '../../components/QuickAvail';
import { NextSeo, EventJsonLd } from 'next-seo';
import { generateScheduleSEO } from '../../lib/seo.config';

export default function SharePage({ shareId, initialSchedule }) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [loading, setLoading] = useState(!initialSchedule);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shareId && !initialSchedule) {
      fetchSchedule(shareId);
    }
  }, [shareId, initialSchedule]);

  const fetchSchedule = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedules/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Schedule not found');
        } else if (response.status === 410) {
          setError('This schedule has expired');
        } else {
          setError('Failed to load schedule');
        }
        return;
      }

      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  // Timezone-safe date formatting
  const formatDateSafe = (dateString, timezone = null) => {
    const date = new Date(dateString);
    
    // Use user's timezone if available, otherwise local timezone
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: timezone || undefined
    };
    
    return date.toLocaleDateString(undefined, options);
  };

  // Timezone-safe expiration calculations
  const getExpirationInfo = () => {
    if (!schedule?.expiresAt) return null;
    
    const now = new Date();
    const expiresAt = new Date(schedule.expiresAt);
    const timeUntilExpiration = expiresAt.getTime() - now.getTime();
    
    // Use precise millisecond calculations to avoid timezone drift
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInDay = millisecondsInHour * 24;
    
    const daysUntilExpiration = Math.ceil(timeUntilExpiration / millisecondsInDay);
    const hoursUntilExpiration = Math.ceil(timeUntilExpiration / millisecondsInHour);
    
    const isExpiringSoon = daysUntilExpiration <= 2 && daysUntilExpiration > 0;
    const isExpiringToday = daysUntilExpiration <= 0 && hoursUntilExpiration > 0;
    const isExpired = timeUntilExpiration <= 0;
    
    return {
      timeUntilExpiration,
      daysUntilExpiration,
      hoursUntilExpiration,
      isExpiringSoon,
      isExpiringToday,
      isExpired
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {error === 'This schedule has expired' ? 'Schedule Expired' : 
             error === 'Schedule not found' ? 'Schedule Not Found' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {error === 'This schedule has expired' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
              This schedule has passed its expiration date. The creator may need to generate a new one.
            </div>
          )}
        </div>
      </div>
    );
  }

  const expirationInfo = getExpirationInfo();
  
  const getExpirationWarning = () => {
    if (!expirationInfo) return null;
    
    const { isExpired, isExpiringToday, isExpiringSoon, daysUntilExpiration, hoursUntilExpiration } = expirationInfo;
    
    if (isExpired) {
      return {
        type: 'expired',
        color: 'red',
        icon: '⏰',
        title: 'Schedule Expired',
        message: 'This schedule has expired and may no longer be accurate.'
      };
    } else if (isExpiringToday) {
      return {
        type: 'today',
        color: 'orange',
        icon: '⚠️',
        title: 'Expires Today',
        message: `This schedule expires in ${hoursUntilExpiration} hour${hoursUntilExpiration !== 1 ? 's' : ''}.`
      };
    } else if (isExpiringSoon) {
      return {
        type: 'soon',
        color: 'yellow',
        icon: '📅',
        title: 'Expires Soon',
        message: `This schedule expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}.`
      };
    }
    return null;
  };

  const warning = getExpirationWarning();

  // Generate SEO for the schedule
  const seoData = generateScheduleSEO(schedule);

  return (
    <>
      {schedule && <NextSeo {...seoData} />}
      {schedule && (
        <EventJsonLd
          name={`${schedule.personName}'s Availability`}
          startDate={schedule.createdAt}
          endDate={schedule.expiresAt}
          location={{
            name: 'Online',
            address: {
              addressCountry: 'Global',
            },
          }}
          organizer={{
            type: 'Person',
            name: schedule.personName,
            email: schedule.personEmail,
          }}
          description={`View availability schedule for ${schedule.personName}`}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Expiration Warning Banner */}
        {warning && (
          <div className={`bg-${warning.color}-50 border border-${warning.color}-200 rounded-2xl p-4 shadow-lg`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-${warning.color}-100 rounded-lg flex items-center justify-center`}>
                <span className="text-lg">{warning.icon}</span>
              </div>
              <div>
                <h3 className={`font-semibold text-${warning.color}-800`}>{warning.title}</h3>
                <p className={`text-${warning.color}-700 text-sm`}>{warning.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Header */}
        <div className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {schedule.personName}'s Availability
              </h1>
              <p className="text-gray-600">
                Contact: {schedule.personEmail}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3">
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="text-blue-600 font-semibold">
                {formatDateSafe(schedule.createdAt, schedule.userTimezone)}
              </p>
              {schedule.userTimezone && schedule.userTimezone !== 'UTC' && (
                <p className="text-xs text-gray-500">{schedule.userTimezone}</p>
              )}
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
              <p className="text-sm font-medium text-gray-700">Expires</p>
              <p className="text-purple-600 font-semibold">
                {formatDateSafe(schedule.expiresAt, schedule.userTimezone)}
              </p>
              {expirationInfo && !expirationInfo.isExpired && (
                <p className="text-xs text-purple-500">
                  {expirationInfo.daysUntilExpiration > 0 
                    ? `${expirationInfo.daysUntilExpiration} day${expirationInfo.daysUntilExpiration !== 1 ? 's' : ''} left`
                    : `${expirationInfo.hoursUntilExpiration} hour${expirationInfo.hoursUntilExpiration !== 1 ? 's' : ''} left`
                  }
                </p>
              )}
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3">
              <p className="text-sm font-medium text-gray-700">Views</p>
              <p className="text-green-600 font-semibold">
                {schedule.viewCount} time{schedule.viewCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">
                Last: {formatDateSafe(schedule.lastViewedAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Pass the schedule data to QuickAvail in read-only mode */}
        <QuickAvail 
          initialData={schedule} 
          readOnly={true}
        />
      </div>
      </div>
    </>
  );
}

// This runs on the server to get the shareId from the URL and fetch schedule data for SEO
export async function getServerSideProps(context) {
  const { shareId } = context.params;
  
  try {
    // Fetch the schedule data on the server for better SEO
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/schedules/${shareId}`);
    
    if (response.ok) {
      const schedule = await response.json();
      return {
        props: {
          shareId,
          initialSchedule: schedule
        }
      };
    }
  } catch (error) {
    console.error('Error fetching schedule in getServerSideProps:', error);
  }
  
  // Fallback if fetch fails - will show loading state and fetch client-side
  return {
    props: {
      shareId
    }
  };
} 