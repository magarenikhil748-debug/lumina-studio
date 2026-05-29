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

const cookieBase = () => ({
  httpOnly: true,
  path: '/',
  secure: false,
  sameSite: 'lax'
});

/**
 * Generates a short-lived JWT access token for authenticated API requests.
 * @param {string} userId - User id.
 * @param {'free'|'pro'|'studio'} tier - User subscription tier.
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

const publicUserFallback = (user) => ({
  id: String(user._id || user.id),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  tier: user.tier || user.plan || 'free',
  plan: user.plan || user.tier || 'free',
  generationsUsedThisMonth: user.generationsUsedThisMonth || 0,
  createdAt: user.createdAt
});

/**
 * Sends authenticated user data and bearer tokens in the JSON response.
 * @param {import('express').Response} res - Express response.
 * @param {number} statusCode - HTTP status code.
 * @param {object} user - User document or dev-store user.
 * @param {string} accessToken - Short-lived access token.
 * @param {string} refreshToken - Rotating refresh token.
 * @param {object} [publicUser] - Sanitized user payload.
 * @returns {import('express').Response} JSON response.
 */
export const sendTokenResponse = (res, statusCode, user, accessToken, refreshToken, publicUser) => res
  .status(statusCode)
  .json({
    success: true,
    user: publicUser || publicUserFallback(user),
    accessToken,
    refreshToken,
    message: statusCode === 201 ? 'Account created successfully' : 'Login successful'
  });

/**
 * Sets development-only HTTP-only auth cookies for local compatibility.
 * Production uses Authorization headers and localStorage because Vercel and
 * Railway do not share a parent domain.
 * @param {import('express').Response} res - Express response.
 * @param {string} accessToken - JWT access token.
 * @param {string} refreshToken - JWT refresh token.
 * @returns {void}
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  if (process.env.NODE_ENV === 'production') return;
  res.cookie('accessToken', accessToken, { ...cookieBase(), maxAge: accessMaxAge });
  res.cookie('refreshToken', refreshToken, { ...cookieBase(), maxAge: refreshMaxAge, path: '/api/auth/refresh' });
};

/**
 * Clears development auth cookies from the browser by expiring them immediately.
 * @param {import('express').Response} res - Express response.
 * @returns {void}
 */
export const clearTokenCookies = (res) => {
  if (process.env.NODE_ENV === 'production') return;
  res.cookie('accessToken', '', { ...cookieBase(), maxAge: 0 });
  res.cookie('refreshToken', '', { ...cookieBase(), maxAge: 0, path: '/api/auth/refresh' });
};

/**
 * Verifies a refresh token and returns its decoded payload.
 * @param {string} token - Refresh token from request body or Authorization header.
 * @returns {object} Decoded token payload.
 */
export const verifyRefreshToken = (token) => jwt.verify(token, getJwtSecret('JWT_REFRESH_SECRET'));
