import { findBillingUserById } from './helpers.js';
import { canAccess, getEffectivePlan } from './plans.js';

export const withPlanAccess = async (userId, requiredFeature) => {
  const user = await findBillingUserById(userId);
  const plan = getEffectivePlan(user);
  return {
    allowed: canAccess(user, requiredFeature),
    plan,
    feature: requiredFeature
  };
};

export default withPlanAccess;
