import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

const NotFoundPage = () => {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0a0a0f] p-6 text-center text-white">
      <AnimatedBackground />
      {!reduceMotion && (
        <>
          <motion.span className="absolute left-[18%] top-[24%] h-24 w-24 rounded-full border border-white/[0.08]" animate={{ y: [0, -16, 0], rotate: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.span className="absolute bottom-[18%] right-[20%] h-32 w-32 rounded-[2rem] border border-white/[0.08]" animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </>
      )}
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-8 backdrop-blur-xl"
      >
        <h1 className="gradient-text font-display text-7xl font-black">404</h1>
        <p className="mt-3 text-xl font-bold text-white">Page not found</p>
        <p className="mt-2 text-white/50">The page may have moved, or the link may be incomplete.</p>
        <Link className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 font-bold" to="/">Go Home</Link>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
