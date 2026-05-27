import express from 'express';
import passport from 'passport';
import { getMe, googleCallback, login, logout, refreshToken, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginValidators, registerValidators } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidators, validateRequest, register);
router.post('/login', authLimiter, loginValidators, validateRequest, login);
router.post('/logout', requireAuth, logout);
router.post('/refresh', authLimiter, refreshToken);
router.get('/me', requireAuth, getMe);
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`
}), googleCallback);

export default router;
