import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { useTemplateMotion } from '../../lib/motion/TemplateMotionContext';

const ParallaxLayer = memo(({
  children,
  className = '',
  style = {},
  distance = 80
}) => {
  const reduceMotion = useReducedMotion();
  const { scrollProgress } = useTemplateMotion();
  const translatedY = useTransform(scrollProgress, [0, 1], [-distance, distance]);

  return (
    <motion.div
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
  style: PropTypes.object
};

export default ParallaxLayer;
