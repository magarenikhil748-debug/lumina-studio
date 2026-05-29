import express from 'express';
import {
  createBillingCheckout,
  createBillingPortal,
  getBillingHistory,
  getBillingPlans,
  getBillingStatus
} from '../controllers/billingController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { billingCheckoutValidators } from '../middleware/validators.js';

const router = express.Router();

router.get('/plans', getBillingPlans);
router.get('/prices', getBillingPlans);
router.get('/status', requireAuth, getBillingStatus);
router.get('/history', requireAuth, getBillingHistory);
router.post('/checkout', requireAuth, billingCheckoutValidators, validateRequest, createBillingCheckout);
router.post('/portal', requireAuth, createBillingPortal);

export default router;
