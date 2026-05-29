import User from '../../models/User.js';
import { findDevUserById, saveDevUser, usingDb } from '../../utils/devStore.js';
import logger from '../../utils/logger.js';
import { getStripe } from './client.js';
import { getPlanByPriceId, getPlanLimits, PLANS } from './plans.js';

const paidStatuses = new Set(['active', 'trialing']);

const toDate = (timestamp) => (timestamp ? new Date(timestamp * 1000) : null);

const userIdOf = (user) => String(user?._id || user?.id || '');

const saveUser = async (user) => {
  if (usingDb()) return user.save();
  return saveDevUser(user);
};

export const findBillingUserById = async (userId) => (
  usingDb() ? User.findById(userId) : findDevUserById(userId)
);

export const findBillingUserByCustomerId = async (stripeCustomerId) => (
  usingDb()
    ? User.findOne({ stripeCustomerId })
    : Array.from((await import('../../utils/devStore.js')).devStore.usersById.values()).find((user) => user.stripeCustomerId === stripeCustomerId) || null
);

export const findBillingUserBySubscriptionId = async (stripeSubscriptionId) => (
  usingDb()
    ? User.findOne({ stripeSubscriptionId })
    : Array.from((await import('../../utils/devStore.js')).devStore.usersById.values()).find((user) => user.stripeSubscriptionId === stripeSubscriptionId) || null
);

export const getOrCreateStripeCustomer = async (userId) => {
  try {
    const user = await findBillingUserById(userId);
    if (!user) throw new Error('User not found');
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: userIdOf(user) }
    });

    user.stripeCustomerId = customer.id;
    await saveUser(user);
    return customer.id;
  } catch (error) {
    logger.error('[STRIPE] getOrCreateStripeCustomer failed', { error: error.message });
    throw error;
  }
};

export const syncSubscriptionToUser = async (subscription, userId) => {
  try {
    const user = userId ? await findBillingUserById(userId) : await findBillingUserBySubscriptionId(subscription.id);
    if (!user) throw new Error('User not found for subscription sync');

    const price = subscription.items?.data?.[0]?.price;
    const matchedPlan = getPlanByPriceId(price?.id);
    const plan = matchedPlan?.planId || 'starter';
    const billingCycle = matchedPlan?.billingCycle || null;
    const status = subscription.status || 'none';
    const graceEndsAt = user.gracePeriodEndsAt ? new Date(user.gracePeriodEndsAt) : null;
    const hasActiveGrace = Boolean(user.inGracePeriod && graceEndsAt && graceEndsAt > new Date());
    const shouldKeepPaidAccess = paidStatuses.has(status) || (status === 'past_due' && hasActiveGrace);
    const periodStart = subscription.current_period_start || subscription.items?.data?.[0]?.current_period_start;
    const periodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;

    user.stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || user.stripeCustomerId;
    user.stripeSubscriptionId = subscription.id;
    user.plan = shouldKeepPaidAccess ? plan : 'starter';
    user.tier = shouldKeepPaidAccess && plan !== 'starter' ? plan : 'free';
    user.billingCycle = billingCycle;
    user.subscriptionStatus = status;
    user.currentPeriodStart = toDate(periodStart);
    user.currentPeriodEnd = toDate(periodEnd);
    user.cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
    user.canceledAt = toDate(subscription.canceled_at);
    user.trialStartedAt = toDate(subscription.trial_start) || user.trialStartedAt;
    user.trialEndsAt = toDate(subscription.trial_end) || user.trialEndsAt;
    if (status === 'trialing') user.trialUsed = true;
    if (paidStatuses.has(status)) {
      user.inGracePeriod = false;
      user.gracePeriodEndsAt = null;
    }
    user.planLimits = getPlanLimits(user.plan);

    await saveUser(user);
    logger.info('[WEBHOOK] Subscription synced', { userId: userIdOf(user), subscriptionId: subscription.id, status, plan: user.plan });
    return user;
  } catch (error) {
    logger.error('[STRIPE] syncSubscriptionToUser failed', { error: error.message });
    throw error;
  }
};

export const downgradeToStarter = async (userId) => {
  try {
    const user = await findBillingUserById(userId);
    if (!user) return null;
    user.plan = 'starter';
    user.tier = 'free';
    user.billingCycle = null;
    user.subscriptionStatus = 'none';
    user.stripeSubscriptionId = null;
    user.currentPeriodStart = null;
    user.currentPeriodEnd = null;
    user.cancelAtPeriodEnd = false;
    user.canceledAt = null;
    user.gracePeriodEndsAt = null;
    user.inGracePeriod = false;
    user.planLimits = getPlanLimits('starter');
    await saveUser(user);
    return user;
  } catch (error) {
    logger.error('[STRIPE] downgradeToStarter failed', { error: error.message });
    throw error;
  }
};

export const createCheckoutSession = async ({ userId, priceId, billingCycle, successUrl, cancelUrl, withTrial }) => {
  try {
    const customer = await getOrCreateStripeCustomer(userId);
    const stripe = getStripe();
    return stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      payment_method_collection: withTrial ? 'if_required' : 'always',
      metadata: { userId, billingCycle },
      subscription_data: {
        ...(withTrial ? { trial_period_days: 14 } : {}),
        metadata: { userId, billingCycle }
      }
    });
  } catch (error) {
    logger.error('[STRIPE] createCheckoutSession failed', { error: error.message });
    throw error;
  }
};

export const createPortalSession = async (userId, returnUrl) => {
  try {
    const customer = await getOrCreateStripeCustomer(userId);
    const stripe = getStripe();
    return stripe.billingPortal.sessions.create({ customer, return_url: returnUrl });
  } catch (error) {
    logger.error('[STRIPE] createPortalSession failed', { error: error.message });
    throw error;
  }
};

export const resolveCheckoutPrice = (planId, billingCycle) => {
  const plan = PLANS[planId];
  const priceId = plan?.stripePriceId?.[billingCycle];
  if (!plan || !priceId) return null;
  return priceId;
};
