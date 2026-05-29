import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const offsets = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 }
};

const AnimatedSection = ({ children, delay = 0, direction = 'up', className = '', once = true }) => {
  const prefersReducedMotion = useReducedMotion();
  const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, ...(offsets[direction] || offsets.up) };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : 0.62,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

AnimatedSection.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'none']),
  className: PropTypes.string,
  once: PropTypes.bool
};

export default AnimatedSection;
