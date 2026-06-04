import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion, useSpring } from 'framer-motion';
import useCursorSystem from './useCursorSystem';

const TYPE_STYLE = {
  default: { size: 12, borderRadius: '50%', background: '#fff', mixBlendMode: 'difference' },
  caret: { size: 22, width: 2, borderRadius: 0, background: '#00ff41', boxShadow: '0 0 12px #00ff41' },
  neon: { size: 8, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 16px #00f5ff, 0 0 30px #ff00ff' },
  film: { size: 34, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 0 0 7px rgba(0,0,0,0.62), 0 0 24px rgba(255,255,255,0.18)' },
  ink: { size: 18, borderRadius: '52% 48% 61% 39% / 44% 63% 37% 56%', background: '#18120c', boxShadow: '0 0 0 2px rgba(24,18,12,0.12)' },
  crosshair: { size: 34, borderRadius: '50%', background: 'transparent', border: '1px solid currentColor' },
  orbital: { size: 9, borderRadius: '50%', background: '#d8b4fe', boxShadow: '0 0 18px #a855f7' }
};

const TrailDot = ({ sourceX, sourceY, index, total, type, color }) => {
  const stiffness = Math.max(80, 360 - index * 17);
  const x = useSpring(sourceX, { stiffness, damping: 30 + index, mass: 0.45 + index * 0.035 });
  const y = useSpring(sourceY, { stiffness, damping: 30 + index, mass: 0.45 + index * 0.035 });
  const ratio = 1 - index / Math.max(1, total);
  const neonColor = index > total / 2 ? '#ff00ff' : '#00f5ff';

  return (
    <motion.span
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        width: type === 'neon' ? 5 : 4,
        height: type === 'neon' ? 5 : 4,
        marginLeft: -2,
        marginTop: -2,
        borderRadius: '50%',
        background: type === 'neon' ? neonColor : color,
        boxShadow: type === 'neon' ? `0 0 ${8 + ratio * 8}px ${neonColor}` : 'none',
        opacity: ratio * 0.34,
        willChange: 'transform'
      }}
    />
  );
};

TrailDot.propTypes = {
  color: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  sourceX: PropTypes.object.isRequired,
  sourceY: PropTypes.object.isRequired,
  total: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired
};

const CursorRenderer = memo(({ config }) => {
  const reduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState([]);
  const {
    type = 'default',
    color = '#ffffff',
    trailLength = 0
  } = config;
  const {
    cursorX,
    cursorY,
    cursorVariant,
    isTouch,
    isVisible
  } = useCursorSystem(config);

  useEffect(() => {
    if (!isTouch || reduceMotion) return undefined;
    const handleTap = (event) => {
      if (event.pointerType !== 'touch') return;
      const ripple = { id: `${Date.now()}-${event.pointerId}`, x: event.clientX, y: event.clientY };
      setRipples((current) => [...current.slice(-5), ripple]);
      window.setTimeout(() => setRipples((current) => current.filter((item) => item.id !== ripple.id)), 620);
    };
    window.addEventListener('pointerdown', handleTap, { passive: true });
    return () => window.removeEventListener('pointerdown', handleTap);
  }, [isTouch, reduceMotion]);

  if (isTouch) {
    return (
      <div className="lumina-no-print" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none', overflow: 'hidden' }}>
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                left: ripple.x - 42,
                top: ripple.y - 42,
                width: 84,
                height: 84,
                borderRadius: '50%',
                border: `1px solid ${color}`,
                boxShadow: `0 0 22px ${color}`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }
  const base = TYPE_STYLE[type] || TYPE_STYLE.default;
  const baseSize = base.size || 12;
  const variantScale = cursorVariant === 'pressed' ? 0.72 : cursorVariant === 'hover' ? 1.75 : 1;

  return (
    <div
      aria-hidden="true"
      className="lumina-no-print"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <style>{`[data-template] a, [data-template] button, [data-template] [role="button"] { cursor: none !important; }`}</style>
      {Array.from({ length: trailLength }, (_, index) => (
        <TrailDot
          key={index}
          sourceX={cursorX}
          sourceY={cursorY}
          index={index + 1}
          total={trailLength}
          type={type}
          color={color}
        />
      ))}
      <motion.div
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: variantScale,
          rotate: cursorVariant === 'pressed' && type === 'film' ? 35 : 0
        }}
        transition={{ opacity: { duration: 0.16 }, scale: { duration: 0.18 }, rotate: { duration: 0.18 } }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorX,
          y: cursorY,
          width: base.width || baseSize,
          height: baseSize,
          marginLeft: -(base.width || baseSize) / 2,
          marginTop: -baseSize / 2,
          color,
          willChange: 'transform',
          ...base,
          background: type === 'default' || type === 'caret' || type === 'neon' || type === 'ink' || type === 'orbital'
            ? color
            : base.background
        }}
      >
        {type === 'crosshair' ? (
          <>
            <span style={{ position: 'absolute', left: '50%', top: -6, bottom: -6, width: 1, background: 'currentColor' }} />
            <span style={{ position: 'absolute', top: '50%', left: -6, right: -6, height: 1, background: 'currentColor' }} />
          </>
        ) : null}
        {type === 'orbital' ? [0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8 + index * 0.55, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 28 + index * 9,
              height: 28 + index * 9,
              marginLeft: -(28 + index * 9) / 2,
              marginTop: -(28 + index * 9) / 2,
              border: '1px solid rgba(216,180,254,0.26)',
              borderRadius: '50%'
            }}
          >
            <span style={{ position: 'absolute', left: '50%', top: -2, width: 4, height: 4, borderRadius: '50%', background: color }} />
          </motion.span>
        )) : null}
        {type === 'caret' ? (
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.06, repeat: Infinity, times: [0, 0.49, 0.5, 1] }}
            style={{ position: 'absolute', inset: 0, background: color }}
          />
        ) : null}
      </motion.div>
    </div>
  );
});

CursorRenderer.displayName = 'CursorRenderer';

CursorRenderer.propTypes = {
  config: PropTypes.shape({
    type: PropTypes.oneOf(['default', 'caret', 'neon', 'film', 'ink', 'crosshair', 'orbital']).isRequired,
    color: PropTypes.string,
    trailLength: PropTypes.number,
    magneticStrength: PropTypes.number,
    springConfig: PropTypes.shape({
      stiffness: PropTypes.number,
      damping: PropTypes.number,
      mass: PropTypes.number
    })
  }).isRequired
};

export default CursorRenderer;
