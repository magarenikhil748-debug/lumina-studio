import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { findBillingUserById, downgradeToStarter } from './helpers.js';
import { GRACE_PERIOD_DAYS } from './plans.js';
import logger from '../../utils/logger.js';

const queueName = 'lumina-billing-grace-period';
const graceDelayMs = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
let queue = null;
let worker = null;

const createConnection = () => {
  if (!process.env.REDIS_URL) return null;
  return new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
};

const getQueue = () => {
  if (queue) return queue;
  const connection = createConnection();
  if (!connection) return null;
  queue = new Queue(queueName, { connection });
  worker = new Worker(queueName, async (job) => {
    const user = await findBillingUserById(job.data.userId);
    if (!user) return { downgraded: false, reason: 'user_missing' };
    if (user.subscriptionStatus === 'past_due' && user.inGracePeriod) {
      await downgradeToStarter(job.data.userId);
      return { downgraded: true };
    }
    return { downgraded: false, reason: 'user_recovered' };
  }, { connection });
  worker.on('failed', (job, error) => {
    logger.error('[WEBHOOK] Grace period job failed', { jobId: job?.id, error: error.message });
  });
  return queue;
};

export const scheduleGracePeriodDowngrade = async (userId) => {
  const billingQueue = getQueue();
  if (!billingQueue) {
    logger.warn('[WEBHOOK] REDIS_URL missing; BullMQ grace downgrade job was not scheduled', { userId });
    return false;
  }

  await billingQueue.add(
    'downgrade-after-grace',
    { userId },
    {
      delay: graceDelayMs,
      jobId: `downgrade-${userId}`,
      removeOnComplete: true,
      removeOnFail: 20
    }
  );
  return true;
};
