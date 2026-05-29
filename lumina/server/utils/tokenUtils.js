import jwt from 'jsonwebtoken';

const accessMaxAge = 15 * 60 * 1000;
const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

export const getJwtSecret = (key) => {
  const secret = process.env[key];
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${key} is not configured`);
  }
  return `${key.toLowerCase()}-development-only-secret-replace-before-deployment-64`;
};

const cookieBase = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'none' : String(process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  const secure = isProduction || sameSite === 'none' || process.env.COOKIE_SECURE === 'true';
  const options = {
    httpOnly: true,
    path: '/',
    secure,
    sameSite
  };
  if (process.env.COOKIE_DOMAIN) options.domain = process.env.COOKIE_DOMAIN;
  return options;
};

/**
 * Generates a short-lived JWT access token for authenticated API requests.
 * @param {string} userId - User id.
 * @param {'free'|'pro'} tier - User subscription tier.
 * @returns {string} Signed access token.
 */
export const generateAccessToken = (userId, tier = 'free') => jwt.sign(
  { userId: String(userId), tier },
  getJwtSecret('JWT_ACCESS_SECRET'),
  { expiresIn: '15m' }
);

/**
 * Generates a rotating JWT refresh token used to obtain new access tokens.
 * @param {string} userId - User id.
 * @returns {string} Signed refresh token.
 */
export const generateRefreshToken = (userId) => jwt.sign(
  { userId: String(userId) },
  getJwtSecret('JWT_REFRESH_SECRET'),
  { expiresIn: '7d' }
);

/**
 * Sets secure HTTP-only access and refresh token cookies.
 * @param {import('express').Response} res - Express response.
 * @param {string} accessToken - JWT access token.
 * @param {string} refreshToken - JWT refresh token.
 * @returns {void}
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, { ...cookieBase(), maxAge: accessMaxAge });
  res.cookie('refreshToken', refreshToken, { ...cookieBase(), maxAge: refreshMaxAge, path: '/api/auth/refresh' });
};

/**
 * Clears auth cookies from the browser by expiring them immediately.
 * @param {import('express').Response} res - Express response.
 * @returns {void}
 */
export const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', { ...cookieBase(), maxAge: 0 });
  res.cookie('refreshToken', '', { ...cookieBase(), maxAge: 0, path: '/api/auth/refresh' });
};

/**
 * Verifies a refresh token and returns its decoded payload.
 * @param {string} token - Refresh token from cookies.
 * @returns {object} Decoded token payload.
 */
export const verifyRefreshToken = (token) => jwt.verify(token, getJwtSecret('JWT_REFRESH_SECRET'));
