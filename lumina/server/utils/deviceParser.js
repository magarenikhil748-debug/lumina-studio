import crypto from 'node:crypto';

/**
 * Parses a user agent into a coarse device class.
 * @param {string} userAgent - Browser user-agent header.
 * @returns {'mobile'|'tablet'|'desktop'} Device category.
 */
export const parseDevice = (userAgent = '') => {
  const value = String(userAgent);
  if (/Tablet|iPad/i.test(value)) return 'tablet';
  if (/Mobile|Android/i.test(value)) return 'mobile';
  return 'desktop';
};

/**
 * Parses a user agent into a browser family.
 * @param {string} userAgent - Browser user-agent header.
 * @returns {string} Browser name.
 */
export const parseBrowser = (userAgent = '') => {
  const value = String(userAgent);
  if (/Edg\//i.test(value)) return 'Edge';
  if (/OPR\/|Opera/i.test(value)) return 'Opera';
  if (/Firefox\//i.test(value)) return 'Firefox';
  if (/Chrome\//i.test(value) || /CriOS\//i.test(value)) return 'Chrome';
  if (/Safari\//i.test(value)) return 'Safari';
  return 'unknown';
};

/**
 * Normalizes a referrer header into a useful source label.
 * @param {string} refHeader - HTTP Referer header.
 * @returns {string} Referrer label.
 */
export const parseReferrer = (refHeader = '') => {
  if (!refHeader) return 'direct';
  const value = String(refHeader).toLowerCase();
  if (value.includes('google')) return 'google';
  if (value.includes('linkedin')) return 'linkedin';
  if (value.includes('twitter') || value.includes('x.com')) return 'twitter';
  if (value.includes('github')) return 'github';
  try {
    return new URL(refHeader).hostname;
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Creates an anonymous daily session id without setting tracking cookies.
 * @param {import('express').Request} req - Express request.
 * @returns {string} First 16 chars of a SHA-256 digest.
 */
export const generateSessionId = (req) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwardedFor || req.ip || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const date = new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256').update(`${ip}:${userAgent}:${date}`).digest('hex').slice(0, 16);
};
