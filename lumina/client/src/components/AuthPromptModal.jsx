import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Sparkles, X } from 'lucide-react';

const AuthPromptModal = ({ onClose, title = 'Sign in to generate your portfolio', copy = 'Create a free account to protect your draft, use monthly AI generations, and save your portfolio to your dashboard.' }) => {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const from = `${location.pathname}${location.search || ''}`;

  return (
    <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/65 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 18 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-6 text-white shadow-[0_0_40px_rgba(168,85,247,0.22)]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-[#a855f7]/15">
            <Lock className="h-5 w-5 text-[#c4b5fd]" />
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Close sign in prompt">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-3 leading-7 text-white/55">{copy}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/login" state={{ from }} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-bold"><Sparkles className="h-4 w-4" />Login</Link>
          <Link to="/login?mode=create" state={{ from }} className="inline-flex items-center justify-center rounded-full border border-white/[0.08] px-5 py-3 font-bold text-white hover:bg-white/[0.06]">Create Account</Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

AuthPromptModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  copy: PropTypes.string
};

export default AuthPromptModal;
