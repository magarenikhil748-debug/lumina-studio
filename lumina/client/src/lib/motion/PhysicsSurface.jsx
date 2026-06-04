import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import usePhysicsInteraction from './usePhysicsInteraction';

const PhysicsSurface = memo(({
  children,
  type = 'tilt',
  intensity = 0.5,
  resetDuration = 360,
  className = '',
  style = {}
}) => {
  const physics = usePhysicsInteraction({ type, intensity, resetDuration });
  return (
    <motion.div
      ref={physics.ref}
      className={className}
      style={{ ...physics.style, ...style }}
      onHoverStart={physics.onHoverStart}
      onHoverEnd={physics.onHoverEnd}
      onPointerMove={physics.onPointerMove}
      onPointerLeave={physics.onPointerLeave}
      onClick={physics.onClick}
    >
      {children}
    </motion.div>
  );
});

PhysicsSurface.displayName = 'PhysicsSurface';

PhysicsSurface.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  intensity: PropTypes.number,
  resetDuration: PropTypes.number,
  style: PropTypes.object,
  type: PropTypes.oneOf(['tilt', 'magnetic', 'elastic', 'ripple', 'shatter'])
};

export default PhysicsSurface;
