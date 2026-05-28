import express from 'express';
import { createBillingCheckout, createBillingPortal, getBillingPlans } from '../controllers/billingController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { billingCheckoutValidators } from '../middleware/validators.js';

const router = express.Router();

router.get('/plans', getBillingPlans);
router.post('/checkout', requireAuth, billingCheckoutValidators, validateRequest, createBillingCheckout);
router.post('/portal', requireAuth, createBillingPortal);

export default router;
