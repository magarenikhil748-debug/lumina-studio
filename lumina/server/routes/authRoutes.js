import express from 'express';
import passport from 'passport';
import { getMe, googleCallback, login, logout, refreshToken, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginValidators, registerValidators } from '../middleware/validators.js';
import logger from '../utils/logger.js';

const router = express.Router();

const clientUrl = () => {
  const raw = String(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');
  try {
    return new URL(raw).origin;
  } catch {
    return raw || 'http://localhost:5173';
  }
};

router.post('/register', authLimiter, registerValidators, validateRequest, register);
router.post('/login', authLimiter, loginValidators, validateRequest, login);
router.post('/logout', requireAuth, logout);
router.post('/refresh', authLimiter, refreshToken);
router.get('/me', requireAuth, getMe);
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (error, user, info) => {
    if (error) {
      logger.error('Google OAuth callback failed', {
        errorName: error.name,
        errorMessage: error.message,
        oauthError: error.oauthError?.data,
        info
      });
      res.redirect(`${clientUrl()}/login?error=oauth_failed`);
      return;
    }

    if (!user) {
      logger.warn('Google OAuth callback returned no user', { info });
      res.redirect(`${clientUrl()}/login?error=oauth_failed`);
      return;
    }

    req.user = user;
    googleCallback(req, res, next);
  })(req, res, next);
});

export default router;
