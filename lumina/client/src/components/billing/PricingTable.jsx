import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Crown, Gem, Loader2, LockKeyhole, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { billingAPI } from '../../utils/api';
import { billingCycles, planList, PLANS } from '../../lib/stripe/plans';

const cardMeta = {
  starter: {
    icon: Sparkles,
    eyebrow: 'Start here',
    border: 'border-white/[0.08]',
    glow: 'from-white/[0.08] via-white/[0.04] to-transparent',
    button: 'border-white/[0.1] bg-white text-[#0a0a0f] hover:shadow-[0_0_28px_rgba(255,255,255,0.2)]'
  },
  pro: {
    icon: Crown,
    eyebrow: 'Most chosen',
    border: 'border-[#c4b5fd]/70',
    glow: 'from-[#a855f7]/28 via-[#3b82f6]/14 to-transparent',
    button: 'border-[#c4b5fd]/30 bg-[#f5f3ff] text-[#160f24] hover:shadow-[0_0_36px_rgba(168,85,247,0.34)]'
  },
  studio: {
    icon: Gem,
    eyebrow: 'Client-ready',
    border: 'border-[#f8d49b]/45',
    glow: 'from-[#f8d49b]/20 via-[#ec4899]/12 to-transparent',
    button: 'border-[#f8d49b]/30 bg-[#fff7ed] text-[#211308] hover:shadow-[0_0_36px_rgba(248,212,155,0.24)]'
  }
};

const comparisonRows = [
  ['Portfolios', '1', 'Unlimited', 'Unlimited'],
  ['AI generations', '3 / month', 'Unlimited', 'Unlimited'],
  ['Animated templates', '3 basic', 'All 9', 'All 9 + white-label'],
  ['Watermark', 'Lumina mark', 'Removed', 'Removed'],
  ['Analytics', 'Views only', 'Full dashboard', '1-year dashboard'],
  ['Exports', 'HTML', 'HTML, JSON, PDF', 'HTML, JSON, PDF, React'],
  ['Collaboration', 'Solo', 'Solo', '3 seats'],
  ['Priority AI', 'No', 'Yes', 'Yes']
];

const faqs = [
  ['Can I cancel anytime?', 'Yes. You can manage cancellation from Stripe Billing Portal and keep access until the current period ends.'],
  ['Is there a free trial?', 'Yes. Eligible Starter users can start a 14-day trial before committing to Pro or Studio.'],
  ['What happens if I downgrade?', 'Your portfolios stay saved. Paid-only creation, exports, and analytics pause until you upgrade again.'],
  ['Do paid plans remove Lumina branding?', 'Pro removes the public watermark. Studio is built for white-label client delivery.']
];

const formatPrice = (plan, billingCycle) => {
  if (plan.id === 'starter') return '$0';
  if (billingCycle === 'annual') return `$${Math.floor(plan.price.annual / 12)}/mo`;
  return `$${plan.price.monthly}/mo`;
};

const priceSubtext = (plan, billingCycle) => {
  if (plan.id === 'starter') return 'forever';
  if (billingCycle === 'annual') return `billed $${plan.price.annual} yearly`;
  return 'billed monthly';
};

const ctaLabel = ({ activePlan, targetPlan, billingCycle, trialUsed, isAuthenticated }) => {
  if (targetPlan.id === 'starter') return isAuthenticated ? 'Build Free' : 'Get Started Free';
  if (activePlan === targetPlan.id) return 'Current Plan';
  if (activePlan === 'starter' && !trialUsed) return 'Start 14-Day Free Trial';
  if (activePlan === 'pro' && targetPlan.id === 'studio') return 'Upgrade to Studio';
  if (activePlan === 'studio' && targetPlan.id === 'pro') return 'Manage downgrade';
  return `Upgrade to ${targetPlan.name}${billingCycle === 'annual' ? ' Annual' : ''}`;
};

const PricingTable = ({ planState, compact = false }) => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [error, setError] = useState('');
  const activePlan = planState?.plan || 'starter';
  const trialUsed = Boolean(planState?.trialUsed);

  const annualMode = billingCycle === 'annual';
  const visiblePlans = useMemo(() => planList, []);

  const handleCheckout = async (planId) => {
    if (planId === 'starter') {
      navigate(isAuthenticated ? '/build' : '/login', { state: { from: '/build' } });
      return;
    }
    if (planId === activePlan) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
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
    <section className={`relative overflow-hidden px-4 text-white ${compact ? 'py-20' : 'py-28'}`}>
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),rgba(59,130,246,0.08),transparent_68%)] blur-3xl" />
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-7xl"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.34em] text-[#c4b5fd]">Pricing</p>
          <h2 className="mt-4 font-display text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">Simple pricing for serious portfolio launches.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/58">Start free, then unlock the export, analytics, and client-ready systems when Lumina becomes part of your opportunity engine.</p>
        </div>

        <div className="mx-auto mt-10 flex w-fit items-center rounded-full border border-white/[0.1] bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          {Object.values(billingCycles).map((cycle) => (
            <button
              key={cycle.id}
              type="button"
              onClick={() => setBillingCycle(cycle.id)}
              className={`relative min-w-28 rounded-full px-5 py-3 text-sm font-black transition ${billingCycle === cycle.id ? 'text-[#0a0a0f]' : 'text-white/55 hover:text-white'}`}
            >
              {billingCycle === cycle.id && (
                <motion.span layoutId="billing-cycle-pill" className="absolute inset-0 rounded-full bg-white" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 34 }} />
              )}
              <span className="relative">{cycle.label}</span>
            </button>
          ))}
          <span className="ml-2 hidden rounded-full bg-emerald-400/14 px-3 py-2 text-xs font-black text-emerald-200 sm:inline-flex">Save 33%</span>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center text-sm font-bold text-red-100">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
          className="mt-12 grid gap-5 lg:grid-cols-3"
        >
          {visiblePlans.map((plan) => {
            const meta = cardMeta[plan.id];
            const Icon = meta.icon;
            const isActive = activePlan === plan.id;
            const isLoading = loadingPlan === plan.id;
            const annualBadge = annualMode && plan.annualSavings > 0;
            const disabled = plan.id !== 'starter' && (isActive || isLoading);
            const label = ctaLabel({ activePlan, targetPlan: plan, billingCycle, trialUsed, isAuthenticated });

            return (
              <motion.article
                key={plan.id}
                variants={{ hidden: { opacity: 0, y: 28, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1 } }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -8, scale: plan.id === 'pro' ? 1.015 : 1.01 }}
                className={`group relative min-h-[620px] overflow-hidden rounded-[28px] border ${meta.border} bg-[rgba(255,255,255,0.055)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl ${plan.id === 'pro' ? 'lg:-mt-5' : ''}`}
              >
                <motion.div aria-hidden="true" className={`absolute inset-x-0 -top-20 h-56 bg-gradient-to-b ${meta.glow} blur-2xl`} animate={reduceMotion ? undefined : { opacity: [0.75, 1, 0.75] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                <div className="relative flex items-center justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.08]">
                    <Icon className="h-6 w-6 text-[#d8b4fe]" />
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/62">{meta.eyebrow}</span>
                </div>

                <div className="relative mt-8">
                  <h3 className="text-3xl font-black">{plan.name}</h3>
                  <p className="mt-3 min-h-14 text-sm leading-6 text-white/55">{plan.description}</p>
                  <div className="mt-7 min-h-20">
                    <AnimatePresence mode="wait">
                      <motion.div key={`${plan.id}-${billingCycle}`} initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        <span className="font-display text-6xl font-black tracking-normal">{formatPrice(plan, billingCycle)}</span>
                        <p className="mt-2 text-sm font-bold text-white/42">{priceSubtext(plan, billingCycle)}</p>
                      </motion.div>
                    </AnimatePresence>
                    {annualBadge && <span className="mt-3 inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200">Save {plan.annualSavings}% annually</span>}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCheckout(plan.id)}
                  className={`relative mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border px-5 py-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-55 ${disabled ? 'border-white/[0.08] bg-white/[0.07] text-white/45' : meta.button}`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {label}
                  {!isLoading && !disabled ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
                {activePlan === 'starter' && plan.id !== 'starter' && !trialUsed && (
                  <p className="mt-3 text-center text-xs font-bold text-[#c4b5fd]">14 days included for eligible accounts.</p>
                )}

                <ul className="relative mt-8 space-y-3 text-sm text-white/70">
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
        </motion.div>

        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: 0.1 }}
          className="mt-16 overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.045] backdrop-blur-xl"
        >
          <div className="grid min-w-[760px] grid-cols-4 border-b border-white/[0.08] bg-white/[0.04] text-sm font-black text-white">
            {['Feature', 'Starter', 'Pro', 'Studio'].map((heading) => <div key={heading} className="px-5 py-4">{heading}</div>)}
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {comparisonRows.map((row, index) => (
                <div key={row[0]} className={`grid grid-cols-4 text-sm ${index % 2 ? 'bg-white/[0.025]' : ''}`}>
                  {row.map((cell, cellIndex) => (
                    <div key={`${row[0]}-${cell}`} className={`px-5 py-4 ${cellIndex === 0 ? 'font-bold text-white' : 'text-white/62'}`}>
                      {cell === 'No' ? <span className="inline-flex items-center gap-2 text-white/38"><X className="h-4 w-4" />No</span> : cell === 'Yes' ? <span className="inline-flex items-center gap-2 text-emerald-200"><Check className="h-4 w-4" />Yes</span> : cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-7 backdrop-blur-xl">
            <LockKeyhole className="h-6 w-6 text-[#c4b5fd]" />
            <h3 className="mt-4 font-display text-3xl font-black">Built for clean upgrades.</h3>
            <p className="mt-3 leading-7 text-white/52">Free stays useful. Paid plans remove friction when you need exports, analytics depth, and client-facing polish.</p>
          </div>
          <div className="space-y-3">
            {faqs.map(([question, answer], index) => (
              <motion.button
                key={question}
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 text-left backdrop-blur-xl"
                whileHover={reduceMotion ? undefined : { y: -2 }}
              >
                <span className="flex items-center justify-between gap-4 font-black text-white">{question}<span className="text-[#c4b5fd]">{openFaq === index ? '-' : '+'}</span></span>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3 text-sm leading-6 text-white/55">
                      {answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

PricingTable.propTypes = {
  compact: PropTypes.bool,
  planState: PropTypes.shape({
    plan: PropTypes.oneOf(Object.keys(PLANS)),
    trialUsed: PropTypes.bool
  })
};

export default PricingTable;
