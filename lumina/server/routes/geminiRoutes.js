import express from 'express';
import { generateWithGemini } from '../controllers/geminiController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { geminiGenerateValidators } from '../middleware/validators.js';
import { findDevUserById, saveDevUser, usingDb } from '../utils/devStore.js';

const router = express.Router();

const nextMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const resetIfNeeded = async (user) => {
  if (!user || user.tier === 'pro') return user;
  const resetAt = user.generationsResetAt ? new Date(user.generationsResetAt) : new Date(0);
  if (resetAt > new Date()) return user;
  user.generationsUsedThisMonth = 0;
  user.generationsResetAt = nextMonthStart();
  if (usingDb()) await user.save();
  else saveDevUser(user);
  return user;
};

const enforceGenerationLimit = async (req, res, next) => {
  try {
    await resetIfNeeded(req.user);
    if (req.user?.tier === 'pro') {
      next();
      return;
    }
    if (Number(req.user?.generationsUsedThisMonth || 0) >= 3) {
      res.status(403).json({ success: false, error: 'Monthly generation limit reached', limit: 3, upgradeUrl: '/pricing' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

const incrementGenerationUsage = async (user) => {
  if (!user || user.tier === 'pro') return;
  user.generationsUsedThisMonth = Number(user.generationsUsedThisMonth || 0) + 1;
  if (usingDb()) await user.save();
  else saveDevUser(findDevUserById(user._id || user.id) || user);
};

const generateAndTrack = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (payload) => {
    if (res.statusCode < 400 && payload?.success) {
      try {
        await incrementGenerationUsage(req.user);
      } catch (error) {
        return next(error);
      }
    }
    return originalJson(payload);
  };
  return generateWithGemini(req, res, next);
};

router.post('/generate', requireAuth, geminiGenerateValidators, validateRequest, enforceGenerationLimit, aiLimiter, generateAndTrack);

export default router;
