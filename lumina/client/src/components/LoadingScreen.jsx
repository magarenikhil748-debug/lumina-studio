import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

const LoadingScreen = ({ message = 'Designing your portfolio direction', detail = 'Gemini is polishing your bio, projects, layout, and color system.' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="glass grid min-h-[360px] place-items-center rounded-2xl p-8 text-center">
      <div>
        <div className="relative mx-auto mb-6 grid h-24 w-24 place-items-center">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-white/[0.08] border-t-[#a855f7] border-r-[#3b82f6] border-b-[#ec4899]"
            animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.1, 1] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
            className="grid h-20 w-20 place-items-center rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] shadow-[0_0_40px_rgba(168,85,247,0.4)] backdrop-blur-xl"
          >
            <Sparkles className="h-9 w-9 text-neon" aria-hidden="true" />
          </motion.div>
        </div>
        <h2 className="font-display text-2xl font-bold text-white">{message}</h2>
        <p className="mt-3 text-white/50">{detail}</p>
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="relative h-3 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#ec4899]"
                animate={reduceMotion ? { x: 0 } : { x: ['-100%', '220%'] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, delay: item * 0.18, ease: 'easeInOut' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  detail: PropTypes.string,
  message: PropTypes.string
};

export default LoadingScreen;
