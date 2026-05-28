import { createCheckoutSession, createPortalSession, findBillingUserById, resolveCheckoutPrice } from '../lib/stripe/helpers.js';
import { getPlanLimits, isPaidPlan, PLANS, TRIAL_DAYS } from '../lib/stripe/plans.js';
import { saveDevUser, usingDb } from '../utils/devStore.js';
import logger from '../utils/logger.js';
import { strip } from '../utils/validation.js';

const appUrl = () => (process.env.CLIENT_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');

const userIdOf = (user) => String(user?._id || user?.id || '');

const saveUser = async (user) => {
  if (usingDb()) return user.save();
  return saveDevUser(user);
};

export const createBillingCheckout = async (req, res, next) => {
  try {
    const userId = userIdOf(req.user);
    const planId = strip(req.body.planId);
    const billingCycle = strip(req.body.billingCycle || 'monthly');

    if (!isPaidPlan(planId)) {
      res.status(400);
      throw new Error('Checkout is only available for Pro or Studio plans');
    }
    if (!['monthly', 'annual'].includes(billingCycle)) {
      res.status(400);
      throw new Error('Billing cycle must be monthly or annual');
    }

    const priceId = resolveCheckoutPrice(planId, billingCycle);
    if (!priceId) {
      res.status(500);
      throw new Error(`${PLANS[planId].name} ${billingCycle} Stripe price is not configured`);
    }

    const user = await findBillingUserById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const withTrial = user.trialUsed === false && (user.plan || 'starter') === 'starter';
    if (withTrial) {
      const now = new Date();
      user.trialUsed = true;
      user.trialStartedAt = now;
      user.trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      await saveUser(user);
    }

    const baseUrl = appUrl();
    const session = await createCheckoutSession({
      userId,
      priceId,
      billingCycle,
      successUrl: `${baseUrl}/dashboard?billing=success&plan=${planId}`,
      cancelUrl: `${baseUrl}/pricing?billing=cancelled`,
      withTrial
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    logger.error('[STRIPE] createBillingCheckout controller failed', { error: error.message });
    next(error);
  }
};

export const createBillingPortal = async (req, res, next) => {
  try {
    const session = await createPortalSession(userIdOf(req.user), `${appUrl()}/dashboard?billing=portal`);
    res.json({ success: true, url: session.url });
  } catch (error) {
    logger.error('[STRIPE] createBillingPortal controller failed', { error: error.message });
    next(error);
  }
};

export const getBillingPlans = async (req, res, next) => {
  try {
    const plans = Object.values(PLANS).map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      annualSavings: plan.annualSavings,
      limits: getPlanLimits(plan.id)
    }));
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};
