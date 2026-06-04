import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

export default function LuminaLogo({ size = 32, showGlow = true, animate = true }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;
  const radius = size * 0.28;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0
      }}
    >
      {showGlow && (
        <motion.div
          animate={shouldAnimate ? {
            opacity: [0.4, 0.9, 0.4]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: `-${size * 0.18}px`,
            borderRadius: `${radius * 1.4}px`,
            background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(236,72,153,0.2) 50%, transparent 75%)',
            filter: `blur(${size * 0.25}px)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      <motion.div
        animate={shouldAnimate ? { rotate: 360 } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${radius}px`,
          background: 'conic-gradient(from 0deg, #a855f7 0%, #ec4899 30%, #3b82f6 60%, #a855f7 100%)',
          zIndex: 1
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '2px',
          borderRadius: `${Math.max(radius - 2, 0)}px`,
          background: 'radial-gradient(circle at 30% 30%, #1e0a38, #0d0b1a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
      >
        <span
          style={{
            fontSize: size * 0.44,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '0',
            fontFamily: "'Inter', sans-serif",
            userSelect: 'none'
          }}
        >
          L
        </span>
      </div>
    </div>
  );
}

LuminaLogo.propTypes = {
  animate: PropTypes.bool,
  showGlow: PropTypes.bool,
  size: PropTypes.number
};
