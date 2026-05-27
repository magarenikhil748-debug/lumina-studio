import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const PulseBlock = ({ className }) => (
  <div className={`rounded-2xl bg-white/[0.07] ${className}`} />
);

const PortfolioSkeleton = () => (
  <main className="min-h-screen bg-[#0a0a0f] px-5 py-16 text-white">
    <motion.section
      className="mx-auto max-w-6xl"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
    >
      <PulseBlock className="h-20 max-w-3xl" />
      <PulseBlock className="mt-5 h-8 max-w-xl rounded-full" />
      <div className="mt-12 max-w-3xl space-y-3">
        <PulseBlock className="h-4 w-full rounded-full" />
        <PulseBlock className="h-4 w-11/12 rounded-full" />
        <PulseBlock className="h-4 w-10/12 rounded-full" />
        <PulseBlock className="h-4 w-8/12 rounded-full" />
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        {[0, 1, 2, 3, 4, 5].map((item) => <PulseBlock key={item} className="h-10 w-24 rounded-full" />)}
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <PulseBlock className="h-64" />
        <PulseBlock className="h-64" />
      </div>
    </motion.section>
  </main>
);

PulseBlock.propTypes = {
  className: PropTypes.string.isRequired
};

export default PortfolioSkeleton;
