import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertTriangle, Crown, Sparkles, Zap } from 'lucide-react';

const TIER_CONFIG = {
  starter: {
    label: 'Starter',
    icon: Zap,
    style: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.58)'
    }
  },
  free: {
    label: 'Starter',
    icon: Zap,
    style: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.58)'
    }
  },
  pro: {
    label: 'Pro',
    icon: Sparkles,
    style: {
      background: 'rgba(168,85,247,0.12)',
      border: '1px solid rgba(168,85,247,0.25)',
      color: '#c084fc'
    }
  },
  studio: {
    label: 'Studio',
    icon: Crown,
    style: {
      background: 'rgba(251,191,36,0.1)',
      border: '1px solid rgba(251,191,36,0.25)',
      color: '#fbbf24'
    }
  }
};

const sizes = {
  sm: { padding: '3px 8px', fontSize: '11px', iconSize: 10, gap: '4px' },
  md: { padding: '4px 10px', fontSize: '12px', iconSize: 11, gap: '5px' },
  lg: { padding: '6px 14px', fontSize: '13px', iconSize: 12, gap: '6px' }
};

const daysUntil = (value) => {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
};

export default function TierBadge({
  tier,
  plan,
  size = 'md',
  compact = false,
  subscriptionStatus,
  isOnTrial = false,
  trialEndsAt,
  inGracePeriod = false,
  gracePeriodEndsAt,
  onClick,
  className,
  style = {}
}) {
  const normalized = (tier || plan || 'starter') === 'free' ? 'starter' : (tier || plan || 'starter');
  const isTrial = isOnTrial || subscriptionStatus === 'trialing';
  const config = inGracePeriod
    ? {
      label: `Payment Failed - ${daysUntil(gracePeriodEndsAt)}d`,
      icon: AlertTriangle,
      style: {
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#fca5a5'
      }
    }
    : isTrial
      ? {
        label: `${normalized === 'studio' ? 'Studio' : 'Pro'} Trial - ${daysUntil(trialEndsAt)}d`,
        icon: Sparkles,
        style: TIER_CONFIG.pro.style
      }
      : TIER_CONFIG[normalized] || TIER_CONFIG.starter;
  const Icon = config.icon;
  const s = compact ? sizes.sm : (sizes[size] || sizes.md);

  return (
    <motion.span
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        borderRadius: '999px',
        fontSize: s.fontSize,
        fontWeight: 650,
        cursor: onClick ? 'pointer' : 'default',
        letterSpacing: '0',
        whiteSpace: 'nowrap',
        ...config.style,
        ...style
      }}
    >
      <Icon size={s.iconSize} />
      {config.label}
    </motion.span>
  );
}

TierBadge.propTypes = {
  className: PropTypes.string,
  compact: PropTypes.bool,
  gracePeriodEndsAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  inGracePeriod: PropTypes.bool,
  isOnTrial: PropTypes.bool,
  onClick: PropTypes.func,
  plan: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  style: PropTypes.object,
  subscriptionStatus: PropTypes.string,
  tier: PropTypes.string,
  trialEndsAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};
