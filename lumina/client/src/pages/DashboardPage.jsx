import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Check, Copy, Edit3, Eye, Globe2, Lock, Plus, Share2, Sparkles, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import AnalyticsDrawer from '../components/AnalyticsDrawer';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI } from '../utils/api';
import { formatPublicUrl, getPublicBaseUrl } from '../utils/publicUrl';

const publicBaseUrl = getPublicBaseUrl();

const formatDate = (value) => new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric'
}).format(new Date(value || Date.now()));

const SkeletonCard = () => (
  <div className="h-64 animate-pulse rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5">
    <div className="h-5 w-2/3 rounded-full bg-white/[0.08]" />
    <div className="mt-4 h-4 w-1/2 rounded-full bg-white/[0.08]" />
    <div className="mt-10 h-24 rounded-2xl bg-white/[0.06]" />
    <div className="mt-5 h-10 rounded-full bg-white/[0.08]" />
  </div>
);

const DeleteModal = ({ portfolio, onCancel, onConfirm }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-6 shadow-[0_0_40px_rgba(168,85,247,0.22)]"
      >
        <h2 className="text-2xl font-black text-white">Delete Portfolio?</h2>
        <p className="mt-2 text-white/50">This action cannot be undone. “{portfolio?.name}” will be removed from your dashboard.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-white/[0.08] px-5 py-3 font-bold text-white">Cancel</button>
          <button onClick={onConfirm} className="rounded-full bg-red-500 px-5 py-3 font-bold text-white shadow-[0_0_24px_rgba(239,68,68,0.28)]">Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

DeleteModal.propTypes = {
  portfolio: PropTypes.shape({ name: PropTypes.string }),
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

const PortfolioCard = ({ portfolio, copiedId, onAnalytics, onCopy, onDelete, onShare, onToggleVisibility }) => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const id = portfolio.id || portfolio._id;
  const layout = portfolio.layout || portfolio.template || 'minimal';
  const publicUrl = `${publicBaseUrl}/p/${portfolio.slug}`;
  const isPublic = portfolio.isPublic !== false;

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.98 }}
      whileHover={reduceMotion ? undefined : { y: -4, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">{portfolio.name}</h3>
          <p className="mt-1 text-sm text-white/50">{portfolio.title}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-[#a855f7]/15 px-3 py-1 text-xs font-bold capitalize text-[#c4b5fd]">{layout}</span>
          <button type="button" onClick={() => onToggleVisibility(portfolio)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${isPublic ? 'bg-emerald-400/12 text-emerald-200' : 'bg-white/[0.08] text-white/50'}`}>
            {isPublic ? <Globe2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
            {isPublic ? 'Public' : 'Private'}
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4">
        <p className="text-sm text-white/45">Created</p>
        <p className="mt-1 font-semibold text-white">{formatDate(portfolio.createdAt)}</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-white/55"><TrendingUp className="h-4 w-4 text-[#60a5fa]" aria-hidden="true" />{portfolio.views || 0} views</p>
        {portfolio.slug && (
          <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-4 block truncate text-sm font-semibold text-[#c4b5fd] hover:text-white">
            {formatPublicUrl(publicUrl)}
          </a>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button onClick={() => onCopy(portfolio)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-sm font-bold text-white hover:bg-white/[0.06]">
          {copiedId === id ? <Check className="h-4 w-4 text-[#c4b5fd]" /> : <Copy className="h-4 w-4" />} Copy Link
        </button>
        <button onClick={() => onShare(portfolio)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-sm font-bold text-white hover:bg-white/[0.06]"><Share2 className="h-4 w-4" />Share</button>
        <button onClick={() => onAnalytics(portfolio)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-sm font-bold text-white hover:bg-white/[0.06]"><BarChart3 className="h-4 w-4" />Analytics</button>
        <button onClick={() => navigate(`/preview?id=${id}`, { state: { portfolio } })} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-sm font-bold text-white hover:bg-white/[0.06]"><Eye className="h-4 w-4" />Preview</button>
        <button onClick={() => navigate(`/build?id=${id}`, { state: { portfolio } })} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-sm font-bold text-white hover:bg-white/[0.06]"><Edit3 className="h-4 w-4" />Edit</button>
        <button onClick={() => onDelete(portfolio)} className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/20 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" />Delete</button>
      </div>
    </motion.article>
  );
};

PortfolioCard.propTypes = {
  portfolio: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    layout: PropTypes.string,
    template: PropTypes.string,
    slug: PropTypes.string,
    isPublic: PropTypes.bool,
    createdAt: PropTypes.string,
    views: PropTypes.number
  }).isRequired,
  copiedId: PropTypes.string,
  onAnalytics: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onToggleVisibility: PropTypes.func.isRequired
};

const DashboardPage = () => {
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [sharePortfolio, setSharePortfolio] = useState(null);
  const [analyticsPortfolio, setAnalyticsPortfolio] = useState(null);

  const totals = useMemo(() => ({
    views: portfolios.reduce((total, portfolio) => total + Number(portfolio.views || 0), 0),
    exports: portfolios.reduce((total, portfolio) => total + Number(portfolio.exportCount || portfolio.exports || 0), 0)
  }), [portfolios]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await portfolioAPI.getAll();
        if (active) setPortfolios(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load portfolios');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const copyPublicUrl = async (portfolio) => {
    const id = portfolio.id || portfolio._id;
    const publicUrl = `${publicBaseUrl}/p/${portfolio.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    toast.success('Public URL copied');
    window.setTimeout(() => setCopiedId(''), 1200);
  };

  const toggleVisibility = async (portfolio) => {
    const id = portfolio.id || portfolio._id;
    try {
      const result = await portfolioAPI.toggleVisibility(id);
      const nextValue = result.isPublic ?? result.data?.isPublic;
      setPortfolios((current) => current.map((item) => (
        String(item.id || item._id) === String(id) ? { ...item, isPublic: nextValue } : item
      )));
      toast.success(result.message || (nextValue ? 'Portfolio is now public' : 'Portfolio is now private'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update visibility');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const id = deleting.id || deleting._id;
    try {
      await portfolioAPI.delete(id);
      setPortfolios((current) => current.filter((portfolio) => String(portfolio.id || portfolio._id) !== String(id)));
      toast.success('Portfolio deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete portfolio');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-28 text-white">
      <AnimatedBackground />
      <Navbar compact />
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        <section className="mb-8 flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <img className="h-16 w-16 rounded-full border border-white/[0.12] object-cover" src={user?.avatar} alt={`${user?.name} avatar`} width="64" height="64" loading="lazy" />
            <div>
              <p className="text-sm font-bold text-[#c4b5fd]">Welcome back</p>
              <h1 className="text-3xl font-black text-white sm:text-4xl">{user?.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${user?.tier === 'pro' ? 'btn-primary' : 'bg-white/[0.08] text-white/60'}`}>{user?.tier || 'free'}</span>
                {user?.tier !== 'pro' && <span className="text-sm text-white/50">Generations this month: {user?.generationsUsedThisMonth || 0}/3</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.tier !== 'pro' && <Link to="/#pricing" className="rounded-full border border-white/[0.08] px-5 py-3 font-bold text-white hover:bg-white/[0.06]">Upgrade to Pro</Link>}
            <Link to="/build" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-bold"><Plus className="h-4 w-4" />New portfolio</Link>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Saved portfolios', portfolios.length],
            ['Portfolio views', totals.views],
            ['HTML exports', totals.exports]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl">
              <p className="text-sm text-white/50">{label}</p>
              <p className="mt-2 text-3xl font-black text-white">{value}</p>
            </div>
          ))}
        </section>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : portfolios.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-10 text-center backdrop-blur-xl">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] border border-white/[0.08] bg-[#a855f7]/15">
              <Sparkles className="h-9 w-9 text-[#c4b5fd]" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-white">No portfolios yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/50">Create your first portfolio, generate the direction, and your saved work will appear here with views, exports, and share links.</p>
            <Link to="/build" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 font-bold">Build your first portfolio</Link>
          </div>
        ) : (
          <motion.div layout={!reduceMotion} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id || portfolio._id}
                  portfolio={portfolio}
                  copiedId={copiedId}
                  onAnalytics={setAnalyticsPortfolio}
                  onCopy={copyPublicUrl}
                  onDelete={setDeleting}
                  onShare={setSharePortfolio}
                  onToggleVisibility={toggleVisibility}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
      <AnimatePresence>
        {deleting && <DeleteModal portfolio={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />}
      </AnimatePresence>
      <ShareModal
        isOpen={Boolean(sharePortfolio)}
        onClose={() => setSharePortfolio(null)}
        portfolio={sharePortfolio}
        publicUrl={sharePortfolio?.slug ? `${publicBaseUrl}/p/${sharePortfolio.slug}` : publicBaseUrl}
      />
      <AnalyticsDrawer
        isOpen={Boolean(analyticsPortfolio)}
        onClose={() => setAnalyticsPortfolio(null)}
        portfolioId={analyticsPortfolio ? String(analyticsPortfolio.id || analyticsPortfolio._id) : ''}
      />
    </main>
  );
};

export default DashboardPage;
