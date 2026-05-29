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

const oauthFailureUrl = (reason = 'oauth_failed') => {
  const redirectUrl = new URL(`${clientUrl()}/login`);
  redirectUrl.searchParams.set('error', 'oauth_failed');
  redirectUrl.searchParams.set('reason', reason);
  return redirectUrl.toString();
};

const classifyGoogleError = (error) => {
  const raw = [
    error?.name,
    error?.message,
    error?.oauthError?.data,
    error?.oauthError?.statusCode
  ].filter(Boolean).join(' ').toLowerCase();

  if (raw.includes('redirect_uri_mismatch')) return 'redirect_uri_mismatch';
  if (raw.includes('invalid_client') || raw.includes('unauthorized_client')) return 'google_client_config';
  if (raw.includes('invalid_grant')) return 'stale_google_code';
  if (raw.includes('access_denied')) return 'access_denied';
  return 'google_exchange_failed';
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
      const reason = classifyGoogleError(error);
      logger.error('Google OAuth callback failed', {
        errorName: error.name,
        errorMessage: error.message,
        oauthError: error.oauthError?.data,
        reason,
        info
      });
      res.redirect(oauthFailureUrl(reason));
      return;
    }

    if (!user) {
      logger.warn('Google OAuth callback returned no user', { info });
      res.redirect(oauthFailureUrl('no_google_user'));
      return;
    }

    req.user = user;
    googleCallback(req, res, next);
  })(req, res, next);
});

export default router;
