import { memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const ParallaxLayer = memo(({
  children,
  className = '',
  style = {},
  distance = 80,
  offset = ['start end', 'end start']
}) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const translatedY = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y: reduceMotion ? 0 : translatedY }}
    >
      {children}
    </motion.div>
  );
});

ParallaxLayer.displayName = 'ParallaxLayer';

ParallaxLayer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  distance: PropTypes.number,
  offset: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
};

export default ParallaxLayer;
