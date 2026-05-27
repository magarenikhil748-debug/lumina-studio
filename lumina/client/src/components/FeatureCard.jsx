import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, index, accent }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduceMotion ? { duration: 0 } : { delay: index * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl"
    >
      <motion.div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)]" style={{ color: accent }}>
        <Icon className="h-6 w-6 transition group-hover:scale-110" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-white/50">{description}</p>
    </motion.article>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  accent: PropTypes.string.isRequired
};

export default FeatureCard;
