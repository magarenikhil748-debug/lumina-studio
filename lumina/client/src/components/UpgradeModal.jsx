import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Crown, Gem, Lock, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const featureNames = {
  template: 'premium animated templates',
  pdfExport: 'PDF export',
  reactExport: 'React source export',
  analytics: 'advanced analytics'
};

const UpgradeModal = ({ isOpen, onClose, feature = 'template', requiredTier = 'pro' }) => {
  const reduceMotion = useReducedMotion();
  const Icon = requiredTier === 'studio' ? Gem : Crown;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 18 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#0a0a0f] p-7 text-white shadow-[0_0_60px_rgba(168,85,247,0.28)]"
          >
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-[radial-gradient(circle,rgba(168,85,247,0.32),transparent_68%)] blur-2xl" />
            <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Close upgrade modal">
              <X className="h-5 w-5" />
            </button>
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.1] bg-white/[0.08]">
              <Icon className="h-6 w-6 text-[#d8b4fe]" />
            </div>
            <h2 className="relative mt-6 font-display text-3xl font-black leading-tight">Unlock {featureNames[feature] || feature}</h2>
            <p className="relative mt-4 leading-7 text-white/58">
              This template is part of Lumina {requiredTier === 'studio' ? 'Studio' : 'Pro'} so your public portfolio can ship with more motion, polish, and export control.
            </p>
            <div className="relative mt-6 grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4 text-sm text-white/68">
              {['All animated templates', 'No public watermark', 'More exports and analytics'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#c4b5fd]" /> {item}
                </span>
              ))}
            </div>
            <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
              <Link to="/pricing" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-black">
                View pricing <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={onClose} className="rounded-full border border-white/[0.08] px-5 py-3 font-black text-white hover:bg-white/[0.06]">
                Keep previewing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

UpgradeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  feature: PropTypes.string,
  requiredTier: PropTypes.oneOf(['pro', 'studio'])
};

export default UpgradeModal;
