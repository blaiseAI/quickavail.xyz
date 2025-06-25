// Timezone-safe utilities for QuickAvail
// Ensures consistent date handling across different timezones

/**
 * Creates an expiration date that's consistent across timezones
 * @param {number} days - Number of days from now
 * @returns {Date} - UTC-based expiration date
 */
export function createExpirationDate(days) {
  const now = new Date();
  return new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
}

/**
 * Checks if a date has expired (timezone-safe)
 * @param {string|Date} expirationDate - The expiration date
 * @returns {boolean} - True if expired
 */
export function isExpired(expirationDate) {
  const now = new Date();
  const expires = new Date(expirationDate);
  return now.getTime() > expires.getTime();
}

/**
 * Gets time remaining until expiration
 * @param {string|Date} expirationDate - The expiration date
 * @returns {Object} - Time remaining info
 */
export function getTimeUntilExpiration(expirationDate) {
  const now = new Date();
  const expires = new Date(expirationDate);
  const timeUntilExpiration = expires.getTime() - now.getTime();
  
  const millisecondsInHour = 1000 * 60 * 60;
  const millisecondsInDay = millisecondsInHour * 24;
  
  const daysUntilExpiration = Math.ceil(timeUntilExpiration / millisecondsInDay);
  const hoursUntilExpiration = Math.ceil(timeUntilExpiration / millisecondsInHour);
  const minutesUntilExpiration = Math.ceil(timeUntilExpiration / (1000 * 60));
  
  return {
    timeUntilExpiration,
    daysUntilExpiration,
    hoursUntilExpiration,
    minutesUntilExpiration,
    isExpired: timeUntilExpiration <= 0,
    isExpiringSoon: daysUntilExpiration <= 2 && daysUntilExpiration > 0,
    isExpiringToday: daysUntilExpiration <= 0 && hoursUntilExpiration > 0,
  };
}

/**
 * Formats a date safely across timezones
 * @param {string|Date} date - The date to format
 * @param {string} timezone - Optional timezone (e.g., 'America/New_York')
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatDateSafe(date, timezone = null, options = {}) {
  const dateObj = new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: timezone || undefined,
    ...options
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats a date with time safely across timezones
 * @param {string|Date} date - The date to format
 * @param {string} timezone - Optional timezone
 * @returns {string} - Formatted date and time string
 */
export function formatDateTimeSafe(date, timezone = null) {
  return formatDateSafe(date, timezone, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Gets user's detected timezone
 * @returns {string} - Timezone string (e.g., 'America/New_York')
 */
export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Could not detect timezone, falling back to UTC');
    return 'UTC';
  }
}

/**
 * Validates if a timezone string is valid
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} - True if valid
 */
export function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets a human-readable expiration message
 * @param {string|Date} expirationDate - The expiration date
 * @returns {string} - Human-readable message
 */
export function getExpirationMessage(expirationDate) {
  const info = getTimeUntilExpiration(expirationDate);
  
  if (info.isExpired) {
    return 'This schedule has expired';
  }
  
  if (info.isExpiringToday) {
    if (info.hoursUntilExpiration <= 1) {
      return `Expires in ${info.minutesUntilExpiration} minute${info.minutesUntilExpiration !== 1 ? 's' : ''}`;
    }
    return `Expires in ${info.hoursUntilExpiration} hour${info.hoursUntilExpiration !== 1 ? 's' : ''}`;
  }
  
  if (info.daysUntilExpiration === 1) {
    return 'Expires tomorrow';
  }
  
  return `Expires in ${info.daysUntilExpiration} day${info.daysUntilExpiration !== 1 ? 's' : ''}`;
} 