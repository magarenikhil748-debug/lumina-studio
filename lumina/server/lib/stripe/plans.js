export const GRACE_PERIOD_DAYS = 3;
export const TRIAL_DAYS = 14;

const starterLimits = {
  portfolioLimit: 1,
  aiGenerationsPerMonth: 3,
  basicTemplates: 3,
  animatedTemplates: 0,
  publicUrl: true,
  watermark: true,
  analyticsViewsOnly: true,
  fullAnalytics: false,
  unlimitedPortfolios: false,
  unlimitedAiGenerations: false,
  customDomainExport: false,
  pdfExport: false,
  priorityAiGeneration: false,
  emailViewNotifications: false,
  portfolioVersions: 1,
  vercelDeploy: false,
  whiteLabel: false,
  teamSeats: 1,
  linkedInResumeImport: false,
  aiPortfolioScore: false,
  careerCoaching: false,
  passwordProtectedPortfolios: false,
  customFontsUpload: false,
  reactSourceExport: false,
  prioritySupport: false
};

const proLimits = {
  ...starterLimits,
  portfolioLimit: -1,
  aiGenerationsPerMonth: -1,
  animatedTemplates: 9,
  watermark: false,
  analyticsViewsOnly: false,
  fullAnalytics: true,
  unlimitedPortfolios: true,
  unlimitedAiGenerations: true,
  customDomainExport: true,
  pdfExport: true,
  priorityAiGeneration: true,
  emailViewNotifications: true,
  portfolioVersions: 3
};

const studioLimits = {
  ...proLimits,
  vercelDeploy: true,
  whiteLabel: true,
  teamSeats: 3,
  linkedInResumeImport: true,
  aiPortfolioScore: true,
  careerCoaching: true,
  passwordProtectedPortfolios: true,
  customFontsUpload: true,
  reactSourceExport: true,
  prioritySupport: true
};

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    annualSavings: 0,
    stripePriceId: { monthly: null, annual: null },
    limits: starterLimits
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 12, annual: 96 },
    annualSavings: 33,
    stripePriceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null
    },
    limits: proLimits
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: { monthly: 29, annual: 232 },
    annualSavings: 33,
    stripePriceId: {
      monthly: process.env.STRIPE_STUDIO_MONTHLY_PRICE_ID || null,
      annual: process.env.STRIPE_STUDIO_ANNUAL_PRICE_ID || null
    },
    limits: studioLimits
  }
};

export const isPaidPlan = (planId) => ['pro', 'studio'].includes(planId);

export const getPlanLimits = (planId = 'starter') => ({ ...(PLANS[planId]?.limits || PLANS.starter.limits) });

export const getPlanByPriceId = (priceId) => {
  if (!priceId) return null;
  return Object.values(PLANS).reduce((match, plan) => {
    if (match || plan.id === 'starter') return match;
    if (plan.stripePriceId.monthly === priceId) return { planId: plan.id, billingCycle: 'monthly', plan };
    if (plan.stripePriceId.annual === priceId) return { planId: plan.id, billingCycle: 'annual', plan };
    return null;
  }, null);
};

export const getEffectivePlan = (user) => {
  if (!user) return 'starter';
  const plan = isPaidPlan(user.plan) ? user.plan : 'starter';
  const status = user.subscriptionStatus || 'none';
  const graceEndsAt = user.gracePeriodEndsAt ? new Date(user.gracePeriodEndsAt) : null;
  const inActiveGrace = Boolean(user.inGracePeriod && graceEndsAt && graceEndsAt > new Date());

  if (inActiveGrace && isPaidPlan(plan)) return plan;
  if (['active', 'trialing'].includes(status) && isPaidPlan(plan)) return plan;
  return 'starter';
};

export const canAccess = (user, feature) => {
  const limits = getPlanLimits(getEffectivePlan(user));
  const value = limits[feature];
  if (typeof value === 'number') return value < 0 || value > 0;
  return Boolean(value);
};
