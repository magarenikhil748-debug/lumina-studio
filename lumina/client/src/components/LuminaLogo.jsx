import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

export default function LuminaLogo({ size = 32, showGlow = true, animate = true }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.15, 1]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(236,72,153,0.2) 50%, transparent 70%)',
            filter: 'blur(6px)',
            pointerEvents: 'none'
          }}
        />
      )}

      <motion.div
        animate={shouldAnimate ? { rotate: 360 } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: '1.5px',
          background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #3b82f6, #a855f7)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '2px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0d1a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span
          style={{
            fontSize: size * 0.38,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '0',
            fontFamily: "'Inter', sans-serif",
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
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
