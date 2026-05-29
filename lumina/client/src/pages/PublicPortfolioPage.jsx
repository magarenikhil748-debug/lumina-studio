import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Edit3, Eye, Globe2, Lock, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AnalyticsDrawer from '../components/AnalyticsDrawer';
import ShareModal from '../components/ShareModal';
import PortfolioSkeleton from '../components/layouts/PortfolioSkeleton';
import { portfolioShape } from '../components/layouts/layoutShared';
import TemplateRenderer from '../templates/TemplateRenderer';
import { resolveTemplateId } from '../templates/shared/templateData';
import NotFoundPage from './NotFoundPage';
import { fetchPortfolio, portfolioAPI } from '../utils/api';
import { getPublicBaseUrl } from '../utils/publicUrl';

const fallbackPalette = { primary: '#a78bfa', secondary: '#2dd4bf', accent: '#fb7185', bg: '#08080d', text: '#f8fafc' };
const publicBaseUrl = getPublicBaseUrl();

const setMetaTag = (selector, attribute, value) => {
  const tag = document.querySelector(selector);
  if (tag) tag.setAttribute(attribute, value);
};

const OwnerToolbar = ({ portfolio, onShare, onAnalytics, onToggle }) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const id = portfolio.id || portfolio._id;

  return (
    <motion.header
      className="portfolio-owner-toolbar fixed inset-x-0 top-0 z-[70] border-b border-white/[0.08] bg-[#0a0a0f]/82 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-white/75">
          <Eye className="h-4 w-4 text-[#c4b5fd]" aria-hidden="true" /> You&apos;re viewing your public portfolio
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onToggle} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${portfolio.isPublic ? 'bg-emerald-400/14 text-emerald-200' : 'bg-white/[0.08] text-white/65'}`} aria-label="Toggle public portfolio visibility">
            {portfolio.isPublic ? <Globe2 className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
            {portfolio.isPublic ? 'Public' : 'Private'}
          </button>
          <button type="button" onClick={() => navigate(`/build?id=${id}`, { state: { portfolio } })} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2 text-sm font-black hover:bg-white/[0.06]">
            <Edit3 className="h-4 w-4" aria-hidden="true" /> Edit Portfolio
          </button>
          <button type="button" onClick={onShare} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2 text-sm font-black hover:bg-white/[0.06]">
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </button>
          <button type="button" onClick={onAnalytics} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#0a0a0f]">
            <BarChart3 className="h-4 w-4" aria-hidden="true" /> Analytics
          </button>
        </div>
      </div>
    </motion.header>
  );
};

OwnerToolbar.propTypes = {
  portfolio: PropTypes.shape(portfolioShape).isRequired,
  onShare: PropTypes.func.isRequired,
  onAnalytics: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired
};

const PublicPortfolioPage = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState('loading');
  const [shareOpen, setShareOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadPortfolio = async () => {
      setStatus('loading');
      try {
        const data = await fetchPortfolio(slug);
        if (!active) return;
        setPortfolio({ ...data, colorPalette: data.colorPalette || fallbackPalette });
        setStatus('ready');
      } catch (error) {
        if (active) setStatus('not-found');
      }
    };
    loadPortfolio();
    return () => {
      active = false;
    };
  }, [slug]);

  const publicUrl = `${publicBaseUrl}/p/${portfolio?.slug || slug}`;
  const bio = portfolio?.selectedBio || portfolio?.bioVersions?.[0] || portfolio?.tagline || '';
  const imageUrl = portfolio?.photoUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(portfolio?.name || 'Lumina')}`;
  const structuredData = useMemo(() => portfolio ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.name,
    jobTitle: portfolio.title,
    email: portfolio.email,
    url: publicUrl,
    sameAs: [portfolio.linkedin, portfolio.github].filter(Boolean),
    knowsAbout: (portfolio.skills || []).map((skill) => skill.name).filter(Boolean)
  } : null, [portfolio, publicUrl]);

  const templateId = useMemo(() => resolveTemplateId(portfolio || {}, portfolio?.templateId), [portfolio]);

  useEffect(() => {
    if (!portfolio) return;
    setMetaTag('meta[name="description"]', 'content', bio.substring(0, 160));
    setMetaTag('meta[property="og:title"]', 'content', `${portfolio.name} — ${portfolio.title}`);
    setMetaTag('meta[property="og:description"]', 'content', portfolio.tagline);
    setMetaTag('meta[property="og:type"]', 'content', 'profile');
  }, [bio, portfolio]);

  const toggleVisibility = async () => {
    const id = portfolio?.id || portfolio?._id;
    if (!id) return;
    try {
      const result = await portfolioAPI.toggleVisibility(id);
      const nextValue = result.isPublic ?? result.data?.isPublic;
      setPortfolio((current) => ({ ...current, isPublic: nextValue }));
      toast.success(result.message || (nextValue ? 'Portfolio is now public' : 'Portfolio is now private'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update visibility');
    }
  };

  if (status === 'loading') return <PortfolioSkeleton />;
  if (status === 'not-found') return <NotFoundPage />;

  return (
    <>
      <Helmet>
        <title>{portfolio.name} — {portfolio.title} | Lumina</title>
        <meta name="description" content={bio.substring(0, 160)} />
        <meta property="og:title" content={`${portfolio.name} — ${portfolio.title}`} />
        <meta property="og:description" content={portfolio.tagline} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={publicUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${portfolio.name} — ${portfolio.title}`} />
        <meta name="twitter:description" content={portfolio.tagline} />
        <link rel="canonical" href={publicUrl} />
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      </Helmet>

      {portfolio.isOwner && (
        <OwnerToolbar
          portfolio={portfolio}
          onShare={() => setShareOpen(true)}
          onAnalytics={() => setAnalyticsOpen(true)}
          onToggle={toggleVisibility}
        />
      )}

      <div className={portfolio.isOwner ? 'pt-16 sm:pt-14' : ''}>
        <TemplateRenderer portfolio={portfolio} templateId={templateId} />
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} portfolio={portfolio} publicUrl={publicUrl} />
      <AnimatePresence>
        <AnalyticsDrawer isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} portfolioId={portfolio.id || portfolio._id} />
      </AnimatePresence>
    </>
  );
};

export default PublicPortfolioPage;
