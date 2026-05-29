import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import usePlan from '../hooks/usePlan';
import { PLANS } from '../lib/stripe/plans';

const BillingSuccessPage = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const plan = usePlan();
  const [countdown, setCountdown] = useState(10);
  const planName = PLANS[plan.plan]?.name || 'Pro';

  useEffect(() => {
    if (!reduceMotion) {
      confetti({
        particleCount: 140,
        spread: 72,
        origin: { y: 0.64 },
        colors: ['#a855f7', '#3b82f6', '#ec4899', '#f8d49b']
      });
    }
  }, [reduceMotion]);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    const redirect = window.setTimeout(() => navigate('/dashboard', { replace: true }), 10000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#0a0a0f] px-4 py-28 text-white">
      <AnimatedBackground />
      <Navbar compact />
      <motion.section
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 24 }}
        className="relative max-w-2xl overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.055] p-8 text-center shadow-[0_30px_120px_rgba(168,85,247,0.28)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-64 w-64 rounded-full bg-[#a855f7]/25 blur-3xl" />
        <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border border-emerald-300/25 bg-emerald-400/14">
          <Check className="h-9 w-9 text-emerald-200" />
        </div>
        <p className="relative mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-[#c4b5fd]"><Sparkles className="h-4 w-4" /> Billing activated</p>
        <h1 className="relative mt-4 font-display text-5xl font-black leading-tight">Welcome to Lumina {planName}.</h1>
        <p className="relative mx-auto mt-5 max-w-xl text-lg leading-8 text-white/58">Your plan is being synced from Stripe. You can keep building now, and Lumina will refresh your unlocked features automatically.</p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/build" className="rounded-full bg-white px-6 py-3 font-black text-[#0a0a0f]">Start Building</Link>
          <Link to="/dashboard" className="rounded-full border border-white/[0.1] px-6 py-3 font-black text-white hover:bg-white/[0.06]">View Dashboard</Link>
        </div>
        <p className="relative mt-6 text-sm text-white/38">Redirecting to dashboard in {countdown}s</p>
      </motion.section>
    </main>
  );
};

export default BillingSuccessPage;
