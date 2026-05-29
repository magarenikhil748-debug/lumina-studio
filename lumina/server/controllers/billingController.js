import { createCheckoutSession, createPortalSession, findBillingUserById, resolveCheckoutPrice } from '../lib/stripe/helpers.js';
import { getEffectivePlan, getPlanByPriceId, getPlanLimits, isPaidPlan, PLANS, TRIAL_DAYS } from '../lib/stripe/plans.js';
import { getStripe } from '../lib/stripe/client.js';
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
    const requestedPriceId = strip(req.body.priceId);
    let planId = strip(req.body.planId);
    let billingCycle = strip(req.body.billingCycle || 'monthly');
    let priceId = '';

    if (requestedPriceId) {
      const matchedPrice = getPlanByPriceId(requestedPriceId);
      if (!matchedPrice || !isPaidPlan(matchedPrice.planId)) {
        res.status(400);
        throw new Error('Invalid Stripe price ID');
      }
      planId = matchedPrice.planId;
      billingCycle = matchedPrice.billingCycle;
      priceId = requestedPriceId;
    }

    if (!isPaidPlan(planId)) {
      res.status(400);
      throw new Error('Checkout is only available for Pro or Studio plans');
    }
    if (!['monthly', 'annual'].includes(billingCycle)) {
      res.status(400);
      throw new Error('Billing cycle must be monthly or annual');
    }

    priceId = priceId || resolveCheckoutPrice(planId, billingCycle);
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
      successUrl: `${baseUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
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
      stripePriceId: plan.stripePriceId,
      limits: getPlanLimits(plan.id)
    }));
    const priceConfig = plans.reduce((config, plan) => ({
      ...config,
      [plan.id]: plan.stripePriceId
    }), {});
    res.json({ success: true, data: plans, priceConfig });
  } catch (error) {
    next(error);
  }
};

export const getBillingStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const plan = getEffectivePlan(user);
    const planLimits = user.planLimits && Object.keys(user.planLimits).length
      ? user.planLimits
      : getPlanLimits(plan);

    res.json({
      success: true,
      data: {
        plan,
        tier: plan,
        billingCycle: user.billingCycle || null,
        subscriptionStatus: user.subscriptionStatus || 'none',
        trialEndsAt: user.trialEndsAt || null,
        trialUsed: Boolean(user.trialUsed),
        isTrialing: user.subscriptionStatus === 'trialing',
        currentPeriodEnd: user.currentPeriodEnd || null,
        cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
        inGracePeriod: Boolean(user.inGracePeriod),
        gracePeriodEndsAt: user.gracePeriodEndsAt || null,
        planLimits,
        limits: planLimits,
        usage: {
          generationsThisMonth: Number(user.generationsUsedThisMonth || 0),
          generationsLimit: planLimits.aiGenerationsPerMonth,
          generationsResetAt: user.generationsResetAt || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBillingHistory = async (req, res, next) => {
  try {
    if (!req.user?.stripeCustomerId) {
      res.json({ success: true, data: { invoices: [] }, invoices: [] });
      return;
    }

    const invoices = await getStripe().invoices.list({
      customer: req.user.stripeCustomerId,
      limit: 24
    });

    const formatted = invoices.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      description: invoice.lines?.data?.[0]?.description || 'Lumina subscription',
      amount: Number(invoice.amount_paid || 0) / 100,
      currency: String(invoice.currency || 'usd').toUpperCase(),
      status: invoice.status,
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf
    }));

    res.json({ success: true, data: { invoices: formatted }, invoices: formatted });
  } catch (error) {
    next(error);
  }
};
