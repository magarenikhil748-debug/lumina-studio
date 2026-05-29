import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Crown, Sparkles } from 'lucide-react';

const daysUntil = (value) => {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
};

const tierStyles = {
  starter: 'border-white/[0.08] bg-white/[0.08] text-white/60',
  free: 'border-white/[0.08] bg-white/[0.08] text-white/60',
  pro: 'border-[#c4b5fd]/20 bg-[#a855f7]/18 text-[#e9d5ff]',
  studio: 'border-[#f8d49b]/25 bg-[#f8d49b]/14 text-[#fed7aa]'
};

const TierBadge = ({ plan = 'starter', subscriptionStatus = 'none', trialEndsAt, inGracePeriod = false, gracePeriodEndsAt, compact = false }) => {
  const reduceMotion = useReducedMotion();
  const normalizedPlan = plan === 'free' ? 'starter' : plan;
  const isTrial = subscriptionStatus === 'trialing';
  const Icon = inGracePeriod ? AlertTriangle : normalizedPlan === 'studio' ? Crown : Sparkles;
  const label = inGracePeriod
    ? `Payment failed - ${daysUntil(gracePeriodEndsAt)}d left`
    : isTrial
      ? `${normalizedPlan === 'studio' ? 'Studio' : 'Pro'} trial - ${daysUntil(trialEndsAt)}d left`
      : normalizedPlan === 'studio'
        ? 'Studio'
        : normalizedPlan === 'pro'
          ? 'Pro'
          : 'Free';

  return (
    <motion.span
      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${inGracePeriod ? 'border-red-300/25 bg-red-400/12 text-red-200' : tierStyles[normalizedPlan] || tierStyles.starter} ${compact ? 'px-2.5 py-1' : ''}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </motion.span>
  );
};

TierBadge.propTypes = {
  compact: PropTypes.bool,
  gracePeriodEndsAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  inGracePeriod: PropTypes.bool,
  plan: PropTypes.string,
  subscriptionStatus: PropTypes.string,
  trialEndsAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};

export default TierBadge;
