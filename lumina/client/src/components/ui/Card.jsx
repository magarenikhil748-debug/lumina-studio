import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Card({
  children,
  hover = true,
  glow = false,
  padding = '24px',
  style = {},
  onClick,
  ...props
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        y: -4,
        boxShadow: glow
          ? '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(168,85,247,0.15)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        borderColor: 'rgba(255,255,255,0.12)'
      } : {}}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  glow: PropTypes.bool,
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  padding: PropTypes.string,
  style: PropTypes.object
};
