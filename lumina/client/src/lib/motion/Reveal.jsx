import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useRevealOnScroll } from './sectionReveal';

const Reveal = memo(({
  children,
  variant = 'fadeUp',
  className = '',
  style = {},
  once = true,
  threshold = 0.18
}) => {
  const reveal = useRevealOnScroll(variant, { once, threshold });
  return (
    <motion.div
      ref={reveal.ref}
      className={className}
      variants={reveal.variants}
      animate={reveal.controls}
      style={{ willChange: 'transform, opacity', ...style }}
    >
      {children}
    </motion.div>
  );
});

Reveal.displayName = 'Reveal';

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  once: PropTypes.bool,
  style: PropTypes.object,
  threshold: PropTypes.number,
  variant: PropTypes.oneOf(['fadeUp', 'slideLeft', 'slideRight', 'scaleIn', 'rotateIn', 'glitchIn', 'inkDrop', 'filmGrain', 'bruteSlam', 'typeReveal'])
};

export default Reveal;
