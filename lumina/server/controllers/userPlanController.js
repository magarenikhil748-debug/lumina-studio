import { getEffectivePlan, getPlanLimits } from '../lib/stripe/plans.js';

export const getUserPlan = async (req, res, next) => {
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
        billingCycle: user.billingCycle || null,
        subscriptionStatus: user.subscriptionStatus || 'none',
        trialEndsAt: user.trialEndsAt || null,
        trialUsed: Boolean(user.trialUsed),
        isTrialing: user.subscriptionStatus === 'trialing',
        currentPeriodEnd: user.currentPeriodEnd || null,
        cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
        inGracePeriod: Boolean(user.inGracePeriod),
        gracePeriodEndsAt: user.gracePeriodEndsAt || null,
        planLimits
      }
    });
  } catch (error) {
    next(error);
  }
};
