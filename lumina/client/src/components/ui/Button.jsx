import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 20px rgba(168,85,247,0.3)',
    hover: { scale: 1.03, boxShadow: '0 0 30px rgba(168,85,247,0.5)' }
  },
  secondary: {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(255,255,255,0.1)',
    hover: { background: 'rgba(255,255,255,0.09)' }
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.62)',
    border: 'none',
    hover: { color: '#fff', background: 'rgba(255,255,255,0.05)' }
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
    hover: { background: 'rgba(239,68,68,0.18)' }
  },
  outline: {
    background: 'transparent',
    color: '#c084fc',
    border: '1px solid rgba(168,85,247,0.3)',
    hover: { background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.6)' }
  }
};

const sizes = {
  sm: { padding: '6px 14px', fontSize: '12px', borderRadius: '999px', height: '32px' },
  md: { padding: '9px 20px', fontSize: '14px', borderRadius: '999px', height: '40px' },
  lg: { padding: '12px 28px', fontSize: '15px', borderRadius: '999px', height: '48px' },
  icon: { padding: '8px', fontSize: '14px', borderRadius: '10px', height: '36px', width: '36px' }
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  style = {},
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? v.hover : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        boxShadow: v.boxShadow,
        borderRadius: s.borderRadius,
        fontSize: s.fontSize,
        fontWeight: 600,
        padding: s.padding,
        height: s.height,
        width: fullWidth ? '100%' : size === 'icon' ? s.width : 'auto',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
        fontFamily: 'inherit',
        letterSpacing: '0',
        whiteSpace: 'nowrap',
        ...style
      }}
      {...props}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%'
          }}
        />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </motion.button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  rightIcon: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  style: PropTypes.object,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'outline'])
};
