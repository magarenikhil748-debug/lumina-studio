import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const OFFSETS = {
  up: { x: 0, y: 34 },
  down: { x: 0, y: -34 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
  none: { x: 0, y: 0 }
};

const ScrollReveal = memo(({
  children,
  className = '',
  style = {},
  direction = 'up',
  distance = 1,
  delay = 0,
  duration = 0.65,
  once = true,
  amount = 0.18
}) => {
  const reduceMotion = useReducedMotion();
  const offset = OFFSETS[direction] || OFFSETS.up;
  const initial = reduceMotion
    ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }
    : {
      opacity: 0,
      x: offset.x * distance,
      y: offset.y * distance,
      filter: 'blur(8px)'
    };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{
        duration: reduceMotion ? 0 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

ScrollReveal.propTypes = {
  amount: PropTypes.number,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'none']),
  distance: PropTypes.number,
  duration: PropTypes.number,
  once: PropTypes.bool,
  style: PropTypes.object
};

export default ScrollReveal;
