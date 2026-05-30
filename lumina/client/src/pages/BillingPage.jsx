import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CreditCard, ExternalLink, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierBadge from '../components/TierBadge';
import BillingDashboard from '../components/billing/BillingDashboard';
import PricingTable from '../components/billing/PricingTable';
import usePlan from '../hooks/usePlan';
import { billingAPI } from '../utils/api';
import { PLANS } from '../lib/stripe/plans';

const formatDate = (value) => (value
  ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
  : 'Not available');

const formatAmount = (invoice) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: invoice.currency || 'USD'
}).format(invoice.amount || 0);

const BillingPage = () => {
  const reduceMotion = useReducedMotion();
  const plan = usePlan();
  const [invoices, setInvoices] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const data = await billingAPI.history();
        if (active) setInvoices(data.invoices || []);
      } catch (error) {
        if (active) toast.error(error.response?.data?.message || 'Could not load billing history');
      } finally {
        if (active) setIsHistoryLoading(false);
      }
    };
    loadHistory();
    return () => {
      active = false;
    };
  }, []);

  const planName = PLANS[plan.plan]?.name || 'Starter';

  return (
    <main className="lumina-page min-h-screen px-4 py-28 text-white">
      <Navbar />
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        <header className="mb-8 rounded-[28px] border border-white/[0.08] bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#c4b5fd]"><CreditCard className="h-4 w-4" /> Billing</p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">Plan, usage, and invoices.</h1>
              <p className="mt-4 max-w-2xl text-white/55">Keep Lumina aligned with how you ship: free portfolio experiments, Pro creator workflows, or Studio client delivery.</p>
            </div>
            <TierBadge
              plan={plan.plan}
              subscriptionStatus={plan.subscriptionStatus}
              trialEndsAt={plan.trialEndsAt}
              inGracePeriod={plan.inGracePeriod}
              gracePeriodEndsAt={plan.gracePeriodEndsAt}
            />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <BillingDashboard />
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 text-sm font-black text-[#c4b5fd]"><Sparkles className="h-4 w-4" /> Included in {planName}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['Portfolio limit', plan.limits?.portfolioLimit < 0 ? 'Unlimited' : plan.limits?.portfolioLimit || 1],
                ['AI generations', plan.limits?.aiGenerationsPerMonth < 0 ? 'Unlimited' : `${plan.limits?.aiGenerationsPerMonth || 3}/month`],
                ['Watermark', plan.limits?.watermark ? 'Included' : 'Removed'],
                ['Analytics', plan.limits?.fullAnalytics ? 'Full dashboard' : 'Views only']
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black text-[#c4b5fd]"><FileText className="h-4 w-4" /> Billing history</p>
              <p className="mt-1 text-sm text-white/45">Invoices are synced directly from Stripe.</p>
            </div>
            <Link to="/pricing" className="rounded-full border border-white/[0.08] px-4 py-2 text-sm font-black text-white hover:bg-white/[0.06]">Compare plans</Link>
          </div>
          {isHistoryLoading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-2xl bg-white/[0.06]" />)}
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/50 p-8 text-center text-white/50">No invoices yet. Your billing history will appear here after the first Stripe checkout.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-white/35">
                  <tr>
                    <th className="py-3">Date</th>
                    <th className="py-3">Description</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-4 text-white/60">{formatDate(invoice.date)}</td>
                      <td className="py-4 font-bold text-white">{invoice.description}</td>
                      <td className="py-4 text-white/70">{formatAmount(invoice)}</td>
                      <td className="py-4"><span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-black text-white/60">{invoice.status}</span></td>
                      <td className="py-4 text-right">
                        {invoice.invoiceUrl && (
                          <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 font-bold text-[#c4b5fd] hover:bg-white/[0.06]">
                            Open <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <PricingTable compact planState={plan} />
      </motion.div>
    </main>
  );
};

export default BillingPage;
