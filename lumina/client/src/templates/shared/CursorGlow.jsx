import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const CursorGlow = memo(({
  color = 'rgba(168,85,247,0.18)',
  size = 420,
  blur = 70,
  zIndex = 1
}) => {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const pointerX = useMotionValue(-size);
  const pointerY = useMotionValue(-size);
  const x = useSpring(pointerX, { stiffness: 90, damping: 25, mass: 0.65 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 25, mass: 0.65 });

  useEffect(() => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return undefined;

    const handlePointerMove = (event) => {
      pointerX.set(event.clientX - size / 2);
      pointerY.set(event.clientY - size / 2);
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const handleVisibility = () => setVisible(document.visibilityState === 'visible');

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', hide);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pointerX, pointerY, reduceMotion, size]);

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: size,
        height: size,
        x,
        y,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        willChange: 'transform',
        zIndex
      }}
    />
  );
});

CursorGlow.displayName = 'CursorGlow';

CursorGlow.propTypes = {
  blur: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  zIndex: PropTypes.number
};

export default CursorGlow;
