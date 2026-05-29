import { findBillingUserByCustomerId, findBillingUserBySubscriptionId, syncSubscriptionToUser, downgradeToStarter } from '../lib/stripe/helpers.js';
import { getStripe } from '../lib/stripe/client.js';
import { GRACE_PERIOD_DAYS, getPlanLimits } from '../lib/stripe/plans.js';
import { scheduleGracePeriodDowngrade } from '../lib/stripe/graceQueue.js';
import { saveDevUser, usingDb } from '../utils/devStore.js';
import logger from '../utils/logger.js';

const saveUser = async (user) => {
  if (usingDb()) return user.save();
  return saveDevUser(user);
};

const customerIdOf = (value) => (typeof value === 'string' ? value : value?.id || '');

const userIdOf = (user) => String(user?._id || user?.id || '');

const retrieveSubscription = async (subscriptionId) => {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
};

const handleCheckoutCompleted = async (session) => {
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return null;
  const subscription = await retrieveSubscription(subscriptionId);
  const userId = session.metadata?.userId || subscription.metadata?.userId;
  const user = await syncSubscriptionToUser(subscription, userId);
  logger.info('[WEBHOOK] checkout.session.completed', { userId: userIdOf(user), subscriptionId });
  return user;
};

const handleSubscriptionUpdated = async (subscription) => {
  const userId = subscription.metadata?.userId;
  const fallbackUser = userId ? null : await findBillingUserBySubscriptionId(subscription.id);
  const user = await syncSubscriptionToUser(subscription, userId || userIdOf(fallbackUser));
  logger.info('[WEBHOOK] customer.subscription.updated', { userId: userIdOf(user), subscriptionId: subscription.id });
  return user;
};

const handleSubscriptionDeleted = async (subscription) => {
  const user = await findBillingUserBySubscriptionId(subscription.id);
  if (!user) return null;
  user.canceledAt = new Date();
  await saveUser(user);
  const downgraded = await downgradeToStarter(userIdOf(user));
  if (downgraded) {
    downgraded.canceledAt = new Date();
    downgraded.planLimits = getPlanLimits('starter');
    await saveUser(downgraded);
  }
  logger.info('[WEBHOOK] customer.subscription.deleted', { userId: userIdOf(user), subscriptionId: subscription.id });
  return downgraded || user;
};

const handleInvoicePaymentFailed = async (invoice) => {
  const user = await findBillingUserByCustomerId(customerIdOf(invoice.customer));
  if (!user) return null;
  user.subscriptionStatus = 'past_due';
  user.inGracePeriod = true;
  user.gracePeriodEndsAt = new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  await saveUser(user);
  await scheduleGracePeriodDowngrade(userIdOf(user));
  logger.info('[WEBHOOK] invoice.payment_failed', { userId: userIdOf(user), customerId: customerIdOf(invoice.customer) });
  return user;
};

const handleInvoicePaid = async (invoice) => {
  const user = await findBillingUserByCustomerId(customerIdOf(invoice.customer));
  if (!user) return null;
  user.subscriptionStatus = 'active';
  user.inGracePeriod = false;
  user.gracePeriodEndsAt = null;
  await saveUser(user);
  logger.info('[WEBHOOK] invoice.paid', { userId: userIdOf(user), customerId: customerIdOf(invoice.customer) });
  return user;
};

export const handleStripeWebhook = async (req, res) => {
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    event = getStripe().webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logger.error('[WEBHOOK] Stripe signature verification failed', { error: error.message });
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  try {
    let user = null;
    if (event.type === 'checkout.session.completed') user = await handleCheckoutCompleted(event.data.object);
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') user = await handleSubscriptionUpdated(event.data.object);
    if (event.type === 'customer.subscription.deleted') user = await handleSubscriptionDeleted(event.data.object);
    if (event.type === 'invoice.payment_failed') user = await handleInvoicePaymentFailed(event.data.object);
    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') user = await handleInvoicePaid(event.data.object);

    logger.info('[WEBHOOK] Event handled', { type: event.type, userId: userIdOf(user) || 'unresolved' });
    res.json({ received: true });
  } catch (error) {
    logger.error('[WEBHOOK] Handler failed', { type: event.type, error: error.message });
    res.status(500).json({ received: false });
  }
};
