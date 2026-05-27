import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Check, Code2, Copy, Download, ExternalLink, FileJson, Linkedin, Monitor, RefreshCw, Save, Smartphone, Tablet, Twitter, WandSparkles } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthPromptModal from '../components/AuthPromptModal';
import GeneratedPortfolio from '../components/GeneratedPortfolio';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useGemini } from '../hooks/useGemini';
import { usePortfolio } from '../hooks/usePortfolio';
import { buildStandaloneHtml, calculateQuality, palettes, plans, samplePortfolio, templates } from '../utils/helpers';
import { trackPortfolioExport } from '../utils/api';
import { getPublicBaseUrl } from '../utils/publicUrl';

const widths = { mobile: 375, tablet: 768, desktop: 1120 };
const publicBaseUrl = getPublicBaseUrl();

const openShareWindow = (url) => window.open(url, '_blank', 'width=600,height=400');

const PreviewPage = () => {
  const reduceMotion = useReducedMotion();
  const { state } = useLocation();
  const base = state?.portfolio || samplePortfolio;
  const { isAuthenticated } = useAuth();
  const { save, isSaving } = usePortfolio();
  const { generate, isGenerating } = useGemini();
  const [portfolio, setPortfolio] = useState(base);
  const [device, setDevice] = useState('desktop');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [livePortfolio, setLivePortfolio] = useState(null);
  const quality = useMemo(() => calculateQuality(portfolio), [portfolio]);
  const activePlan = plans[portfolio.plan || 'free'];

  const updatePortfolio = (patch) => setPortfolio((current) => ({ ...current, ...patch }));

  const copyCode = async () => {
    await navigator.clipboard.writeText(buildStandaloneHtml(portfolio));
    if (portfolio.slug) await trackPortfolioExport(portfolio.slug).catch(() => null);
    toast.success('Standalone HTML copied');
  };

  const downloadHtml = async () => {
    const blob = new Blob([buildStandaloneHtml(portfolio)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${portfolio.slug || portfolio.name || 'lumina-portfolio'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    if (portfolio.slug) await trackPortfolioExport(portfolio.slug).catch(() => null);
    toast.success('HTML downloaded');
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(portfolio, null, 2));
    toast.success('Portfolio JSON copied');
  };

  const saveCurrent = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const saved = await save({ ...portfolio, qualityScore: quality.score });
    if (saved) {
      setPortfolio(saved);
      setLivePortfolio(saved);
      setShowConfetti(true);
      confetti({
        particleCount: 150,
        spread: 70,
        colors: ['#a855f7', '#3b82f6', '#ec4899']
      });
      window.setTimeout(() => setShowConfetti(false), 1400);
    }
  };

  const liveUrl = livePortfolio?.slug ? `${publicBaseUrl}/p/${livePortfolio.slug}` : '';
  const copyLiveUrl = async () => {
    if (!liveUrl) return;
    await navigator.clipboard.writeText(liveUrl);
    toast.success('Live portfolio URL copied');
  };

  const regenerate = async (field) => {
    const result = await generate({ ...portfolio, regenerate: field });
    if (!result) return;
    const patch = {
      bioVersions: [result.bio.version1, result.bio.version2, result.bio.version3].filter(Boolean),
      selectedBio: result.bio.version1,
      tagline: result.tagline,
      projects: portfolio.projects.map((project, index) => ({ ...project, description: result.projectDescriptions?.[index] || project.description })),
      layout: result.layoutSuggestion || portfolio.layout,
      colorPalette: result.colorPalette || portfolio.colorPalette,
      skillsHeadline: result.skillsHeadline,
      generationMetadata: result.metadata
    };
    updatePortfolio(field === 'palette' ? { colorPalette: patch.colorPalette } : field === 'tagline' ? { tagline: patch.tagline } : field === 'projects' ? { projects: patch.projects } : patch);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-28 text-white">
      <AnimatedBackground />
      <Navbar compact />
      <AnimatePresence>
        {showAuthPrompt && !isAuthenticated && (
          <AuthPromptModal
            onClose={() => setShowAuthPrompt(false)}
            title="Sign in to save your portfolio"
            copy="Your preview is ready. Sign in to save it to MongoDB, get a public slug, and track views from your dashboard."
          />
        )}
      </AnimatePresence>
      {showConfetti && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle,rgba(168,85,247,.28),transparent_38%)]"
          animate={reduceMotion ? { opacity: 0.35 } : { opacity: [0.15, 0.55, 0], scale: [0.95, 1.05, 1.12] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.4, ease: 'easeOut' }}
        />
      )}
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-[#c084fc]">Preview studio</p>
            <h1 className="gradient-text mt-2 font-display text-5xl font-black">Tune, export, and share.</h1>
            <p className="mt-2 text-white/50">Quality score: <span className="font-bold text-[#c084fc]">{quality.score}/100</span>. {quality.suggestions[0] || 'Ready for a confident launch.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={copyCode} className="btn-primary rounded-full px-4 py-3 font-bold"><Copy className="mr-2 inline h-4 w-4" />Copy HTML</motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={downloadHtml} className="rounded-full border border-white/[0.08] px-4 py-3 font-bold text-white"><Download className="mr-2 inline h-4 w-4" />Download</motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={copyJson} className="rounded-full border border-white/[0.08] px-4 py-3 font-bold text-white"><FileJson className="mr-2 inline h-4 w-4" />Copy JSON</motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={saveCurrent} disabled={isSaving} className="btn-primary rounded-full px-4 py-3 font-bold disabled:opacity-50"><Save className="mr-2 inline h-4 w-4" />Save to MongoDB</motion.button>
          </div>
        </div>

        {livePortfolio && (
          <motion.section
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-[#a855f7]/30 bg-[#a855f7]/12 p-5 shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-xl"
          >
            <p className="text-sm font-bold text-[#c4b5fd]">🎉 Portfolio Live!</p>
            <a href={liveUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all font-display text-3xl font-black text-white hover:text-[#c4b5fd]">
              {liveUrl}
            </a>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => window.open(`/p/${livePortfolio.slug}`, '_blank')} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-3 font-bold">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> View Live
              </button>
              <button type="button" onClick={() => openShareWindow(`https://linkedin.com/shareArticle?url=${encodeURIComponent(liveUrl)}&title=${encodeURIComponent(`Excited to share my new portfolio built with Lumina AI.\n${liveUrl}`)}`)} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold text-white hover:bg-white/[0.06]">
                <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
              </button>
              <button type="button" onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(liveUrl)}&text=${encodeURIComponent(`Just built my AI-powered portfolio with @LuminaAI ✨\nCheck it out: ${liveUrl}\n#portfolio #design #builtwithAI`)}`)} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold text-white hover:bg-white/[0.06]">
                <Twitter className="h-4 w-4" aria-hidden="true" /> Twitter/X
              </button>
              <button type="button" onClick={copyLiveUrl} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold text-white hover:bg-white/[0.06]">
                <Copy className="h-4 w-4" aria-hidden="true" /> Copy
              </button>
            </div>
          </motion.section>
        )}

        <div className="grid gap-5 lg:grid-cols-[310px_1fr]">
          <motion.aside whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="h-fit space-y-5 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-white">Plan</h2>
                <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-[#c4b5fd]">{activePlan.name}</span>
              </div>
              <p className="text-sm leading-6 text-white/50">{activePlan.watermark ? 'Free exports include a tasteful Lumina Studio watermark.' : 'No watermark. Ready for serious sharing.'}</p>
              {activePlan.watermark && (
                <button onClick={() => updatePortfolio({ plan: 'pro' })} className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-bold">
                  <WandSparkles className="h-4 w-4" /> Upgrade to Pro preview
                </button>
              )}
            </div>

            <div>
              <h2 className="mb-3 font-bold text-white">Template</h2>
              <div className="grid gap-2">
                {templates.map((item) => <button key={item.id} onClick={() => updatePortfolio({ layout: item.id, template: item.id })} className={`rounded-full px-4 py-3 text-left capitalize ${portfolio.layout === item.id ? 'btn-primary' : 'bg-[rgba(255,255,255,0.05)] text-white/50'}`}>{item.name}</button>)}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-bold text-white">Palette</h2>
              <div className="grid gap-2">
                {palettes.map((item) => <button key={item.name} onClick={() => updatePortfolio({ colorPalette: item })} className="flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-2 text-white/80"><span className="h-5 w-5 rounded-full" style={{ background: item.primary }} />{item.name}</button>)}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-bold text-white">Device</h2>
              <div className="flex gap-2">
                {[[Smartphone, 'mobile'], [Tablet, 'tablet'], [Monitor, 'desktop']].map(([Icon, item]) => <button key={item} onClick={() => setDevice(item)} className={`rounded-full p-3 ${device === item ? 'btn-primary' : 'bg-[rgba(255,255,255,0.05)] text-white'}`} aria-label={item}><Icon className="h-4 w-4" /></button>)}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-bold text-white">Regenerate</h2>
              <div className="grid grid-cols-2 gap-2">
                {['bio', 'tagline', 'projects', 'palette'].map((field) => <button disabled={isGenerating} key={field} onClick={() => regenerate(field)} className="rounded-full border border-white/[0.08] px-3 py-2 text-sm font-bold capitalize text-white disabled:opacity-50"><RefreshCw className="mr-1 inline h-3.5 w-3.5" />{field}</button>)}
              </div>
            </div>

            {portfolio.slug && (
              <div className="rounded-2xl border border-white/[0.08] bg-[#a855f7]/15 p-4">
                <p className="flex items-center gap-2 font-bold text-[#c084fc]"><Check className="h-4 w-4" /> Shareable link ready</p>
                <Link className="mt-3 inline-flex text-sm text-[#c084fc] underline" to={`/p/${portfolio.slug}`}>Open /p/{portfolio.slug}</Link>
              </div>
            )}
          </motion.aside>

          <section className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4">
            <div className="mx-auto transition-all duration-300" style={{ width: widths[device], maxWidth: '100%' }}>
              <GeneratedPortfolio portfolio={portfolio} />
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <motion.div whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5">
            <BarChart3 className="mb-3 h-5 w-5 text-[#60a5fa]" />
            <p className="text-2xl font-black">{portfolio.views || 0}</p>
            <p className="text-sm text-white/50">Tracked views</p>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5">
            <Code2 className="mb-3 h-5 w-5 text-[#60a5fa]" />
            <p className="text-2xl font-black">{portfolio.exports || 0}</p>
            <p className="text-sm text-white/50">Tracked exports</p>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5">
            <WandSparkles className="mb-3 h-5 w-5 text-[#60a5fa]" />
            <p className="text-2xl font-black">{portfolio.generationMetadata?.model || 'gemini-1.5-flash'}</p>
            <p className="text-sm text-white/50">Generation model</p>
          </motion.div>
        </section>
      </motion.div>
    </main>
  );
};

export default PreviewPage;
