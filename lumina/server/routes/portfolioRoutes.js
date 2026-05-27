import express from 'express';
import {
  createPortfolio,
  deletePortfolio,
  getPortfolioAnalytics,
  getPortfolioById,
  getPortfolios,
  getPublicPortfolio,
  trackExport,
  togglePortfolioVisibility,
  updatePortfolioById
} from '../controllers/portfolioController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { analyticsDaysQuery, mongoIdParam, portfolioValidators, slugParam } from '../middleware/validators.js';

const router = express.Router();

router.get('/', requireAuth, getPortfolios);
router.post('/', requireAuth, portfolioValidators, validateRequest, createPortfolio);
router.get('/public/:slug', optionalAuth, slugParam, validateRequest, cacheMiddleware(5 * 60 * 1000), getPublicPortfolio);
router.post('/public/:slug/export', optionalAuth, slugParam, validateRequest, trackExport);
router.get('/:id/analytics', requireAuth, mongoIdParam, analyticsDaysQuery, validateRequest, getPortfolioAnalytics);
router.put('/:id/visibility', requireAuth, mongoIdParam, validateRequest, togglePortfolioVisibility);
router.get('/:id', requireAuth, mongoIdParam, validateRequest, getPortfolioById);
router.put('/:id', requireAuth, mongoIdParam, portfolioValidators, validateRequest, updatePortfolioById);
router.patch('/:id', requireAuth, mongoIdParam, portfolioValidators, validateRequest, updatePortfolioById);
router.delete('/:id', requireAuth, mongoIdParam, validateRequest, deletePortfolio);
router.post('/:id/export', requireAuth, mongoIdParam, validateRequest, trackExport);

export default router;
