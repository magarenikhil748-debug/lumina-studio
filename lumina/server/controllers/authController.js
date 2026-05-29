import User from '../models/User.js';
import { compareDevPassword, createDevUser, findDevUserByEmail, findDevUserById, toPublicUser, usingDb } from '../utils/devStore.js';
import { clearTokenCookies, generateAccessToken, generateRefreshToken, setTokenCookies, verifyRefreshToken } from '../utils/tokenUtils.js';
import { isStrongPassword, isValidEmail, isValidName, strip } from '../utils/validation.js';

const nextMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const avatarForName = (name) => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;

const clientUrl = () => {
  const raw = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');
  try {
    return new URL(raw).origin;
  } catch {
    return raw || 'http://localhost:5173';
  }
};

const issueSession = (res, user) => {
  const id = String(user._id || user.id);
  const tier = user.tier || 'free';
  const accessToken = generateAccessToken(id, tier);
  const refreshToken = generateRefreshToken(id);
  setTokenCookies(res, accessToken, refreshToken);
};

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

export const register = async (req, res, next) => {
  try {
    const name = strip(req.body.name);
    const email = strip(req.body.email).toLowerCase();
    const password = String(req.body.password || '');

    if (!isValidName(name)) throw validationError('Name must be 2-100 characters and contain only letters, spaces, or hyphens');
    if (!isValidEmail(email)) throw validationError('A valid email is required');
    if (!isStrongPassword(password)) throw validationError('Password must be at least 8 characters and include uppercase, number, and special character');

    const existingUser = usingDb() ? await User.findOne({ email }) : findDevUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const payload = {
      name,
      email,
      password,
      avatar: avatarForName(name),
      generationsResetAt: nextMonthStart()
    };
    const user = usingDb() ? await User.create(payload) : await createDevUser(payload);
    issueSession(res, user);
    res.status(201).json({ success: true, user: toPublicUser(user), message: 'Account created successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = strip(req.body.email).toLowerCase();
    const password = String(req.body.password || '');
    const user = usingDb() ? await User.findByEmail(email) : findDevUserByEmail(email);
    const matches = usingDb() ? await user?.comparePassword(password) : await compareDevPassword(user, password);

    if (!user || !matches) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    issueSession(res, user);
    res.json({ success: true, user: toPublicUser(user), message: 'Logged in successfully' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearTokenCookies(res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, error: 'Refresh token required' });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
      return;
    }

    const user = usingDb() ? await User.findById(payload.userId) : findDevUserById(payload.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
      return;
    }

    issueSession(res, user);
    res.json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: toPublicUser(req.user) });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      res.redirect(`${clientUrl()}/login?error=oauth_failed`);
      return;
    }
    issueSession(res, req.user);
    res.redirect(`${clientUrl()}/auth/callback?success=true`);
  } catch (error) {
    next(error);
  }
};
