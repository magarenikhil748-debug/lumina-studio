import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, FolderKanban, Sparkles } from 'lucide-react';

const percent = (used, limit) => {
  if (!Number.isFinite(limit) || limit <= 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
};

const barColor = (value) => {
  if (value >= 90) return 'from-red-400 to-rose-300';
  if (value >= 70) return 'from-amber-300 to-orange-300';
  return 'from-emerald-300 to-sky-300';
};

const resetText = (value) => {
  if (!value) return 'Resets monthly';
  const days = Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
  return `Resets in ${days} day${days === 1 ? '' : 's'}`;
};

const MeterRow = ({ icon: Icon, label, used, limit }) => {
  const reduceMotion = useReducedMotion();
  const value = percent(used, limit);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="inline-flex items-center gap-2 font-bold text-white/78"><Icon className="h-4 w-4 text-[#c4b5fd]" />{label}</span>
        <span className="font-black text-white">{used}/{limit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: reduceMotion ? `${value}%` : 0 }}
          animate={{ width: `${value}%` }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
          className={`h-full rounded-full bg-gradient-to-r ${barColor(value)}`}
        />
      </div>
    </div>
  );
};

MeterRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  used: PropTypes.number.isRequired
};

const UsageMeter = ({ generationsUsed = 0, generationsLimit = 3, portfolioCount = 0, portfolioLimit = 1, resetsAt }) => (
  <section className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 text-white backdrop-blur-xl">
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-black text-[#c4b5fd]"><BarChart3 className="h-4 w-4" /> Starter usage</p>
        <p className="mt-1 text-sm text-white/45">{resetText(resetsAt)}</p>
      </div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <MeterRow icon={Sparkles} label="AI generations" used={generationsUsed} limit={generationsLimit} />
      <MeterRow icon={FolderKanban} label="Portfolios" used={portfolioCount} limit={portfolioLimit} />
    </div>
  </section>
);

UsageMeter.propTypes = {
  generationsLimit: PropTypes.number,
  generationsUsed: PropTypes.number,
  portfolioCount: PropTypes.number,
  portfolioLimit: PropTypes.number,
  resetsAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};

export default UsageMeter;
