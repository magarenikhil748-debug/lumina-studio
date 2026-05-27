import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { BarChart3, Monitor, Smartphone, Tablet, TrendingUp, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { portfolioAPI } from '../utils/api';

const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const AnimatedNumber = ({ value }) => {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return undefined;
    }
    const controls = animate(motionValue, value, { duration: 0.75, ease: [0.22, 1, 0.36, 1] });
    const unsubscribe = motionValue.on('change', (latest) => setDisplay(Math.round(latest)));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, reduceMotion, value]);

  return <span>{display.toLocaleString()}</span>;
};

AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired
};

const DrawerSkeleton = () => (
  <div className="space-y-4">
    {[0, 1, 2, 3].map((item) => (
      <div key={item} className="animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
        <div className="h-4 w-24 rounded-full bg-white/[0.08]" />
        <div className="mt-4 h-10 w-32 rounded-full bg-white/[0.08]" />
      </div>
    ))}
  </div>
);

const Sparkline = ({ points }) => {
  const path = useMemo(() => {
    const values = points.map((point) => point.views);
    const max = Math.max(...values, 1);
    const width = 340;
    const height = 112;
    return points.map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
      const y = height - (point.views / max) * (height - 12) - 6;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  }, [points]);

  return (
    <svg viewBox="0 0 340 120" role="img" aria-label="Views over time sparkline" className="h-32 w-full overflow-visible">
      <path d={path} fill="none" stroke="url(#viewsGradient)" strokeLinecap="round" strokeWidth="4" />
      <defs>
        <linearGradient id="viewsGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

Sparkline.propTypes = {
  points: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    views: PropTypes.number
  })).isRequired
};

const DeviceBox = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
    <Icon className="h-5 w-5 text-[#c4b5fd]" aria-hidden="true" />
    <p className="mt-4 text-2xl font-black">{value?.percentage || 0}%</p>
    <p className="text-sm text-white/45">{label}</p>
  </div>
);

DeviceBox.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.shape({
    count: PropTypes.number,
    percentage: PropTypes.number
  })
};

const AnalyticsDrawer = ({ isOpen, onClose, portfolioId }) => {
  const reduceMotion = useReducedMotion();
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !portfolioId) return undefined;
    let active = true;
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await portfolioAPI.getAnalytics(portfolioId, days);
        if (active) setAnalytics(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load analytics');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadAnalytics();
    return () => {
      active = false;
    };
  }, [days, isOpen, portfolioId]);

  const bestDay = analytics?.bestPerformingDay?.date
    ? dayFormatter.format(new Date(`${analytics.bestPerformingDay.date}T00:00:00`))
    : 'None yet';
  const maxReferrer = Math.max(...(analytics?.topReferrers || []).map((item) => item.count), 1);

  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm" onClick={onClose} aria-label="Close analytics drawer overlay" />}
      <motion.aside
        className="analytics-drawer fixed right-0 top-0 z-[90] h-full w-full max-w-[400px] overflow-y-auto border-l border-white/[0.08] bg-[#0a0a0f]/95 p-5 text-white shadow-[0_0_48px_rgba(168,85,247,0.22)] backdrop-blur-xl"
        initial={false}
        animate={isOpen ? { x: 0 } : { x: '110%' }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 34 }}
        aria-hidden={!isOpen}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#c4b5fd]">Public portfolio</p>
            <h2 className="mt-1 font-display text-3xl font-black">Analytics</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-white/60 hover:bg-white/[0.08] hover:text-white" aria-label="Close analytics drawer">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
          {[7, 30, 90].map((item) => (
            <button key={item} type="button" onClick={() => setDays(item)} className={`rounded-full px-3 py-2 text-sm font-bold ${days === item ? 'bg-white text-[#0a0a0f]' : 'text-white/55 hover:text-white'}`}>
              {item}d
            </button>
          ))}
        </div>

        {isLoading || !analytics ? (
          <div className="mt-6"><DrawerSkeleton /></div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <TrendingUp className="h-5 w-5 text-[#c4b5fd]" aria-hidden="true" />
                <p className="mt-4 text-2xl font-black"><AnimatedNumber value={analytics.totalViews || 0} /></p>
                <p className="text-xs text-white/45">Views</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <Users className="h-5 w-5 text-[#c4b5fd]" aria-hidden="true" />
                <p className="mt-4 text-2xl font-black"><AnimatedNumber value={analytics.uniqueSessions || 0} /></p>
                <p className="text-xs text-white/45">Sessions</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <BarChart3 className="h-5 w-5 text-[#c4b5fd]" aria-hidden="true" />
                <p className="mt-4 text-lg font-black">{bestDay}</p>
                <p className="text-xs text-white/45">Best day</p>
              </div>
            </div>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
              <h3 className="font-bold">Views over time</h3>
              <Sparkline points={analytics.viewsOverTime || []} />
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
              <h3 className="font-bold">Top referrers</h3>
              <div className="mt-4 space-y-3">
                {(analytics.topReferrers || []).length === 0 && <p className="text-sm text-white/45">No referrers yet.</p>}
                {(analytics.topReferrers || []).map((item) => (
                  <div key={item.referrer}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-white/75">{item.referrer}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#3b82f6]" style={{ width: `${Math.max(8, (item.count / maxReferrer) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-bold">Device breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                <DeviceBox icon={Smartphone} label="Mobile" value={analytics.deviceBreakdown?.mobile} />
                <DeviceBox icon={Tablet} label="Tablet" value={analytics.deviceBreakdown?.tablet} />
                <DeviceBox icon={Monitor} label="Desktop" value={analytics.deviceBreakdown?.desktop} />
              </div>
            </section>
          </div>
        )}
      </motion.aside>
    </>
  );
};

AnalyticsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  portfolioId: PropTypes.string
};

export default AnalyticsDrawer;
