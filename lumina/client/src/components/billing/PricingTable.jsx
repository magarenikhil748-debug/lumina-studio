import PropTypes from 'prop-types';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { billingAPI } from '../../utils/api';
import { billingCycles, planList, PLANS } from '../../lib/stripe/plans';

const formatPrice = (plan, billingCycle) => {
  const price = plan.price[billingCycle];
  if (!price) return '$0';
  return billingCycle === 'annual' ? `$${price}/yr` : `$${price}/mo`;
};

const ctaLabel = ({ activePlan, targetPlan, billingCycle, trialUsed }) => {
  if (activePlan === targetPlan.id) return 'Current Plan';
  if (targetPlan.id === 'starter') return 'Manage on billing portal';
  if (activePlan === 'starter' && !trialUsed) return 'Start 14-Day Free Trial - No Card Required';
  if (activePlan === 'pro' && targetPlan.id === 'studio') return 'Upgrade to Studio';
  if (activePlan === 'studio' && targetPlan.id === 'pro') return 'Downgrade to Pro';
  return `Upgrade to ${targetPlan.name}${billingCycle === 'annual' ? ' Annual' : ''}`;
};

const PricingTable = ({ planState }) => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const activePlan = planState?.plan || 'starter';
  const trialUsed = Boolean(planState?.trialUsed);

  const handleCheckout = async (planId) => {
    if (planId === activePlan) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    if (planId === 'starter') {
      toast('Use Manage Billing to change or cancel an active subscription.');
      return;
    }

    setLoadingPlan(planId);
    setError('');
    try {
      const response = await billingAPI.checkout({ planId, billingCycle });
      window.location.assign(response.url);
    } catch (checkoutError) {
      const message = checkoutError.response?.data?.message || 'Could not open Stripe Checkout';
      setError(message);
      toast.error(message);
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#c4b5fd]">Pricing</p>
        <h1 className="mt-4 font-display text-5xl font-black sm:text-6xl">Pick the launch system that matches your ambition.</h1>
        <p className="mt-5 text-lg leading-8 text-white/55">Start free, then upgrade when Lumina becomes part of your opportunity engine.</p>
      </div>

      <div className="mx-auto mt-10 flex w-fit rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
        {Object.values(billingCycles).map((cycle) => (
          <button
            key={cycle.id}
            type="button"
            onClick={() => setBillingCycle(cycle.id)}
            className={`relative rounded-full px-5 py-2 text-sm font-black transition ${billingCycle === cycle.id ? 'text-[#0a0a0f]' : 'text-white/60 hover:text-white'}`}
          >
            {billingCycle === cycle.id && (
              <motion.span layoutId="billing-cycle-pill" className="absolute inset-0 rounded-full bg-white" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{cycle.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center text-sm font-bold text-red-100">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {planList.map((plan) => {
          const isActive = activePlan === plan.id;
          const isLoading = loadingPlan === plan.id;
          const label = ctaLabel({ activePlan, targetPlan: plan, billingCycle, trialUsed });
          const annualBadge = billingCycle === 'annual' && plan.annualSavings > 0;
          return (
            <motion.article
              key={plan.id}
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl border p-6 backdrop-blur-xl ${isActive ? 'border-[#c4b5fd] bg-[#a855f7]/10 shadow-[0_0_42px_rgba(168,85,247,0.24)]' : 'border-white/[0.08] bg-white/[0.045]'}`}
            >
              {annualBadge && <span className="absolute right-5 top-5 rounded-full bg-emerald-400/14 px-3 py-1 text-xs font-black text-emerald-200">Save {plan.annualSavings}%</span>}
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.06]">
                <Sparkles className="h-5 w-5 text-[#c4b5fd]" />
              </div>
              <h2 className="mt-5 text-2xl font-black">{plan.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-white/55">{plan.description}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">{formatPrice(plan, billingCycle)}</span>
              </div>
              {activePlan === 'starter' && plan.id !== 'starter' && !trialUsed && (
                <p className="mt-3 text-sm font-bold text-[#c4b5fd]">Free for 14 days, then {formatPrice(plan, billingCycle)}</p>
              )}
              <button
                type="button"
                disabled={isActive || isLoading}
                onClick={() => handleCheckout(plan.id)}
                className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${isActive ? 'cursor-not-allowed bg-white/[0.08] text-white/45' : 'bg-white text-[#0a0a0f] hover:shadow-[0_0_30px_rgba(255,255,255,0.24)]'}`}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {label}
              </button>
              <ul className="mt-6 space-y-3 text-sm text-white/66">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#86efac]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

PricingTable.propTypes = {
  planState: PropTypes.shape({
    plan: PropTypes.oneOf(Object.keys(PLANS)),
    trialUsed: PropTypes.bool
  })
};

export default PricingTable;
