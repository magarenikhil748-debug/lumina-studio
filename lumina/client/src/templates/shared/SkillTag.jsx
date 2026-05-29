import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const variantStyles = {
  terminal: {
    border: '1px solid rgba(0,255,65,0.28)',
    color: '#00ff41',
    background: 'rgba(0,255,65,0.055)'
  },
  blueprint: {
    border: '1px dashed rgba(74,144,217,0.5)',
    color: '#b8ddff',
    background: 'rgba(74,144,217,0.08)'
  },
  neon: {
    border: '1px solid rgba(0,255,255,0.5)',
    color: '#bfffff',
    background: 'rgba(0,255,255,0.08)',
    boxShadow: '0 0 18px rgba(0,255,255,0.16)'
  },
  glass: {
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)'
  },
  light: {
    border: '1px solid rgba(24,24,27,0.12)',
    color: '#18181b',
    background: 'rgba(255,255,255,0.7)'
  }
};

const SkillTag = ({ skill, index = 0, variant = 'glass', className = '' }) => {
  const reduceMotion = useReducedMotion();
  const style = variantStyles[variant] || variantStyles.glass;

  return (
    <motion.span
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: reduceMotion ? 0 : index * 0.035, duration: 0.35 }}
      whileHover={reduceMotion ? undefined : { scale: 1.06, y: -2 }}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-black ${className}`}
      style={style}
    >
      {skill.name}
    </motion.span>
  );
};

SkillTag.propTypes = {
  skill: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string
  }).isRequired,
  index: PropTypes.number,
  variant: PropTypes.string,
  className: PropTypes.string
};

export default SkillTag;
