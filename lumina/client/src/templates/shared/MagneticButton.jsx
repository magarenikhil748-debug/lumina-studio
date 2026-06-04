import { memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const MagneticButton = memo(({
  children,
  href,
  strength = 0.22,
  className = '',
  style = {},
  disabled = false,
  ...props
}) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 340, damping: 24, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 340, damping: 24, mass: 0.45 });

  const handlePointerMove = (event) => {
    if (reduceMotion || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  const sharedProps = {
    ref,
    className,
    onPointerMove: handlePointerMove,
    onPointerLeave: resetPosition,
    onPointerCancel: resetPosition,
    whileTap: disabled ? undefined : { scale: 0.97 },
    style: { x: springX, y: springY, ...style },
    ...props
  };

  if (href) {
    return (
      <motion.a href={href} {...sharedProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" disabled={disabled} {...sharedProps}>
      {children}
    </motion.button>
  );
});

MagneticButton.displayName = 'MagneticButton';

MagneticButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  href: PropTypes.string,
  strength: PropTypes.number,
  style: PropTypes.object
};

export default MagneticButton;
