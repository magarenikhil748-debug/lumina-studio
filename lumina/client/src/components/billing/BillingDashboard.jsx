import { useState } from 'react';
import { AlertTriangle, CreditCard, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { billingAPI } from '../../utils/api';
import { PLANS } from '../../lib/stripe/plans';
import usePlan from '../../hooks/usePlan';

const statusStyles = {
  active: 'bg-emerald-400/14 text-emerald-200',
  trialing: 'bg-sky-400/14 text-sky-200',
  past_due: 'bg-amber-400/14 text-amber-200',
  canceled: 'bg-red-400/14 text-red-200',
  none: 'bg-white/[0.08] text-white/55'
};

const daysUntil = (value) => {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
};

const formatDate = (value) => (value ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'Not scheduled');

const BillingDashboard = () => {
  const plan = usePlan();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const planName = PLANS[plan.plan]?.name || 'Starter';
  const status = plan.subscriptionStatus || 'none';

  const openPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const response = await billingAPI.portal();
      window.location.assign(response.url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open billing portal');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (plan.isLoading) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-xl">
        <div className="h-5 w-40 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-white/[0.06]" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 text-white backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-[#c4b5fd]"><Sparkles className="h-4 w-4" /> Billing</p>
          <h2 className="mt-2 text-2xl font-black">{planName}</h2>
          <p className="mt-1 text-sm text-white/50">Current period ends {formatDate(plan.currentPeriodEnd)}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${statusStyles[status] || statusStyles.none}`}>{status.replace('_', ' ')}</span>
      </div>

      {plan.isTrialing && (
        <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-400/10 p-4 text-sm font-bold text-sky-100">
          Your free trial ends in {daysUntil(plan.trialEndsAt)} days.
        </div>
      )}

      {plan.inGracePeriod && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-400/10 p-4 text-sm font-bold text-amber-100">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Payment failed - you have {daysUntil(plan.gracePeriodEndsAt)} days before being downgraded to Starter. Update your payment method.
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {plan.plan !== 'starter' && (
          <button
            type="button"
            onClick={openPortal}
            disabled={isOpeningPortal}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#0a0a0f] disabled:opacity-60"
          >
            {isOpeningPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Manage Billing
          </button>
        )}
        {plan.plan === 'starter' ? (
          <Link to="/pricing" className="inline-flex items-center rounded-full border border-white/[0.08] px-5 py-3 text-sm font-black text-white hover:bg-white/[0.06]">
            Upgrade Plan
          </Link>
        ) : null}
      </div>
    </section>
  );
};

export default BillingDashboard;
