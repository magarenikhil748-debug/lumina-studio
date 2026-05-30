import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart2,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
  Plus,
  Sparkles,
  Trash2,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TierBadge from '../components/TierBadge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import usePlan from '../hooks/usePlan';
import { billingAPI, portfolioAPI } from '../utils/api';
import { getPublicBaseUrl } from '../utils/publicUrl';

const publicBaseUrl = getPublicBaseUrl();

const normalizePlan = (value) => {
  if (!value || value === 'free') return 'starter';
  return value;
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

function CountUp({ end = 0, duration = 1.4 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!end) {
      setCount(0);
      return undefined;
    }
    let frame;
    let start;
    const animate = (time) => {
      start = start || time;
      const progress = Math.min((time - start) / (duration * 1000), 1);
      setCount(Math.round(progress * end));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, end]);

  return <span>{count.toLocaleString()}</span>;
}

CountUp.propTypes = {
  duration: PropTypes.number,
  end: PropTypes.number
};

function UsageBar({ label, icon: Icon, used, limit, unlimited = false }) {
  const percent = unlimited ? 100 : Math.min((used / Math.max(limit, 1)) * 100, 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '9px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'rgba(255,255,255,0.64)' }}>
          <Icon size={14} color="#a855f7" />
          {label}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
          {unlimited ? 'Unlimited' : `${used}/${limit}`}
        </span>
      </div>
      <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: '100%',
            borderRadius: '999px',
            background: !unlimited && used >= limit
              ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
              : 'linear-gradient(90deg, #a855f7, #3b82f6, #14b8a6)'
          }}
        />
      </div>
    </div>
  );
}

UsageBar.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  unlimited: PropTypes.bool,
  used: PropTypes.number.isRequired
};

function SkeletonCard() {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.72, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        height: '210px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}
    />
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const planState = usePlan();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [openingPortal, setOpeningPortal] = useState(false);

  const currentPlan = normalizePlan(planState.plan || user?.plan || user?.tier);
  const isStarter = currentPlan === 'starter';
  const generationsUsed = Number(user?.generationsUsedThisMonth || 0);
  const generationLimit = isStarter ? Number(planState.limits?.aiGenerationsPerMonth || 3) : -1;
  const portfolioLimit = isStarter ? Number(planState.limits?.portfolioLimit || 1) : -1;
  const totalViews = useMemo(() => portfolios.reduce((sum, item) => sum + Number(item.views || 0), 0), [portfolios]);
  const totalGenerations = generationsUsed;
  const initials = (user?.name || 'Lumina User')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    let active = true;
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const data = await portfolioAPI.getAll();
        if (active) setPortfolios(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load portfolios');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPortfolios();
    return () => {
      active = false;
    };
  }, []);

  const handleCopyLink = async (portfolio) => {
    if (!portfolio.slug) {
      toast.error('Save this portfolio before sharing it');
      return;
    }
    const url = `${publicBaseUrl}/p/${portfolio.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(portfolio._id || portfolio.id);
    window.setTimeout(() => setCopiedId(''), 1600);
    toast.success('Link copied');
  };

  const handleDelete = async (portfolio) => {
    const id = portfolio._id || portfolio.id;
    try {
      setDeletingId(id);
      await portfolioAPI.delete(id);
      setPortfolios((current) => current.filter((item) => String(item._id || item.id) !== String(id)));
      setConfirmDeleteId('');
      toast.success('Portfolio deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete portfolio');
    } finally {
      setDeletingId('');
    }
  };

  const openBillingPortal = async () => {
    if (isStarter) {
      navigate('/pricing');
      return;
    }
    try {
      setOpeningPortal(true);
      const response = await billingAPI.portal();
      window.location.assign(response.url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open billing portal');
    } finally {
      setOpeningPortal(false);
    }
  };

  if (authLoading) return <LoadingScreen message="Opening your dashboard" />;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  const periodEnd = formatDate(planState.currentPeriodEnd);
  const visibleStatus = planState.subscriptionStatus && planState.subscriptionStatus !== 'none'
    ? planState.subscriptionStatus.replace('_', ' ')
    : '';

  return (
    <main className="lumina-page" style={{ padding: '104px 24px 80px' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.section variants={itemVariants}>
            <Card hover={false} padding="20px 24px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#fff',
                    boxShadow: '0 0 22px rgba(168,85,247,0.34)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {user?.avatar ? <img src={user.avatar} alt="" width="48" height="48" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 750, color: '#fff', lineHeight: 1.2 }}>{user?.name}</h1>
                    <TierBadge
                      plan={currentPlan}
                      subscriptionStatus={planState.subscriptionStatus}
                      isOnTrial={planState.isTrialing}
                      trialEndsAt={planState.trialEndsAt}
                      inGracePeriod={planState.inGracePeriod}
                      gracePeriodEndsAt={planState.gracePeriodEndsAt}
                      size="sm"
                    />
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>{user?.email}</p>
                </div>
              </div>
              <Button onClick={() => navigate('/build')} leftIcon={<Plus size={16} />}>
                New Portfolio
              </Button>
            </Card>
          </motion.section>

          <motion.section variants={itemVariants}>
            <Card hover={false} padding="20px 24px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.34)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                    {isStarter ? 'Starter usage' : 'Plan capacity'}
                  </p>
                  <p style={{ marginTop: '5px', color: 'rgba(255,255,255,0.56)', fontSize: '13px' }}>
                    {isStarter ? 'Your free limits, kept visible and calm.' : 'Unlimited creation is active on your workspace.'}
                  </p>
                </div>
                <Link to="/pricing" style={{ color: '#c084fc', fontSize: '13px', fontWeight: 700 }}>
                  {isStarter ? 'Upgrade for unlimited' : 'Compare plans'}
                </Link>
              </div>
              <div className="lumina-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                <UsageBar label="AI Generations" icon={Sparkles} used={generationsUsed} limit={generationLimit > 0 ? generationLimit : 3} unlimited={!isStarter} />
                <UsageBar label="Portfolios" icon={Globe} used={portfolios.length} limit={portfolioLimit > 0 ? portfolioLimit : 1} unlimited={!isStarter} />
              </div>
              {isStarter && user?.generationsResetAt ? (
                <p style={{ marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.32)' }}>
                  Resets {formatDate(user.generationsResetAt) || 'soon'}
                </p>
              ) : null}
            </Card>
          </motion.section>

          <motion.section variants={itemVariants} className="lumina-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
            {[
              { label: 'Saved Portfolios', value: portfolios.length, icon: Globe, color: '#a855f7' },
              { label: 'Total Views', value: totalViews, icon: Eye, color: '#3b82f6' },
              { label: 'AI Generations Used', value: totalGenerations, icon: Zap, color: '#ec4899' }
            ].map((stat) => (
              <Card key={stat.label} padding="20px" glow>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: `${stat.color}18`,
                    border: `1px solid ${stat.color}30`,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '13px'
                  }}
                >
                  <stat.icon size={17} color={stat.color} />
                </div>
                <p style={{ fontSize: '30px', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '5px' }}>
                  <CountUp end={stat.value} />
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', fontWeight: 600 }}>{stat.label}</p>
                {stat.value === 0 ? <p style={{ marginTop: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.24)' }}>No data yet</p> : null}
              </Card>
            ))}
          </motion.section>

          <motion.section variants={itemVariants}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 750, color: '#fff' }}>Your Portfolios</h2>
                {portfolios.length ? (
                  <span style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.22)', borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 700, color: '#c084fc' }}>
                    {portfolios.length}
                  </span>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="lumina-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : portfolios.length === 0 ? (
              <Card hover={false} padding="60px 24px" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.22)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 20px'
                  }}
                >
                  <Sparkles size={28} color="#a855f7" />
                </motion.div>
                <h3 style={{ fontSize: '18px', fontWeight: 750, color: '#fff', marginBottom: '8px' }}>No portfolios yet</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.44)', margin: '0 auto 24px', maxWidth: '340px' }}>
                  Build your first AI-powered portfolio in minutes. Your work, beautifully presented.
                </p>
                <Button onClick={() => navigate('/build')}>Build your first portfolio</Button>
              </Card>
            ) : (
              <div className="lumina-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <AnimatePresence>
                  {portfolios.map((portfolio, index) => {
                    const id = portfolio._id || portfolio.id;
                    const template = portfolio.templateId || portfolio.layout || portfolio.template || 'glass';
                    return (
                      <motion.article
                        key={id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.04, duration: 0.25 }}
                        whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 36px rgba(168,85,247,0.12)' }}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(24px)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '16px',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ height: '5px', background: 'linear-gradient(90deg, #a855f7, #3b82f6, #ec4899)' }} />
                        <div style={{ padding: '16px' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 750, color: '#fff', marginBottom: '3px' }}>{portfolio.name}</h3>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.46)' }}>{portfolio.title}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 650, color: 'rgba(255,255,255,0.54)', textTransform: 'capitalize' }}>{template}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.36)' }}><Eye size={11} />{portfolio.views || 0} views</span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.27)' }}>{formatDate(portfolio.createdAt) || 'Recently'}</span>
                          </div>
                          <AnimatePresence>
                            {confirmDeleteId === id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.72)' }}><AlertTriangle size={12} color="#ef4444" />Delete this portfolio?</span>
                                  <span style={{ display: 'flex', gap: '6px' }}>
                                    <Button size="sm" variant="secondary" onClick={() => setConfirmDeleteId('')}>Cancel</Button>
                                    <Button size="sm" variant="danger" loading={deletingId === id} onClick={() => handleDelete(portfolio)}>Delete</Button>
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {[
                            { icon: copiedId === id ? Check : Copy, onClick: () => handleCopyLink(portfolio), color: copiedId === id ? '#22c55e' : 'rgba(255,255,255,0.56)', title: 'Copy link' },
                            { icon: ExternalLink, onClick: () => portfolio.slug && window.open(`/p/${portfolio.slug}`, '_blank'), color: 'rgba(255,255,255,0.56)', title: 'View live' },
                            { icon: Edit3, onClick: () => navigate(`/build?id=${id}`, { state: { portfolio } }), color: 'rgba(255,255,255,0.56)', title: 'Edit' },
                            { icon: Trash2, onClick: () => setConfirmDeleteId(id), color: '#f87171', title: 'Delete' }
                          ].map((action) => (
                            <motion.button
                              key={action.title}
                              type="button"
                              title={action.title}
                              onClick={action.onClick}
                              whileHover={{ background: 'rgba(255,255,255,0.08)', scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                color: action.color,
                                cursor: 'pointer',
                                padding: '7px',
                                display: 'grid',
                                placeItems: 'center'
                              }}
                            >
                              <action.icon size={13} />
                            </motion.button>
                          ))}
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.section>

          <motion.section variants={itemVariants}>
            <Card hover={false} padding="20px 24px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '7px' }}>
                  <TierBadge plan={currentPlan} size="md" />
                  <h2 style={{ fontSize: '15px', fontWeight: 750, color: '#fff' }}>
                    {currentPlan === 'pro' ? 'Pro Plan' : currentPlan === 'studio' ? 'Studio Plan' : 'Starter Plan'}
                  </h2>
                  {visibleStatus ? (
                    <span style={{ borderRadius: '999px', padding: '3px 8px', background: 'rgba(34,197,94,0.12)', color: '#86efac', fontSize: '11px', fontWeight: 800, textTransform: 'capitalize' }}>
                      {visibleStatus}
                    </span>
                  ) : null}
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>
                  {periodEnd ? `Renews ${periodEnd}` : isStarter ? 'Free plan - no billing' : '-'}
                </p>
              </div>
              <Button
                variant={isStarter ? 'primary' : 'secondary'}
                loading={openingPortal}
                onClick={openBillingPortal}
                leftIcon={isStarter ? <Sparkles size={15} /> : <BarChart2 size={15} />}
              >
                {isStarter ? 'Upgrade to Pro' : 'Manage Billing'}
              </Button>
            </Card>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
}
