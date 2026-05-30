import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Laptop,
  Lock,
  Palette,
  RefreshCw,
  Save,
  Smartphone,
  Tablet
} from 'lucide-react';
import AuthPromptModal from '../components/AuthPromptModal';
import Navbar from '../components/Navbar';
import TemplatePicker from '../components/TemplatePicker';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SectionLabel from '../components/ui/SectionLabel';
import { useAuth } from '../context/AuthContext';
import { useGemini } from '../hooks/useGemini';
import usePlan from '../hooks/usePlan';
import { usePortfolio } from '../hooks/usePortfolio';
import TemplateRenderer from '../templates/TemplateRenderer';
import { resolveTemplateId } from '../templates/shared/templateData';
import { buildStandaloneHtml, calculateQuality, palettes, samplePortfolio } from '../utils/helpers';
import { trackPortfolioExport } from '../utils/api';
import { getPublicBaseUrl } from '../utils/publicUrl';

const widths = { mobile: 375, tablet: 768, desktop: 1120 };
const publicBaseUrl = getPublicBaseUrl();

const normalizeInitialPortfolio = (portfolio) => ({
  ...portfolio,
  templateId: resolveTemplateId(portfolio, portfolio.templateId),
  template: resolveTemplateId(portfolio, portfolio.templateId)
});

export default function PreviewPage() {
  const reduceMotion = useReducedMotion();
  const { state } = useLocation();
  const base = state?.portfolio || samplePortfolio;
  const { isAuthenticated } = useAuth();
  const planState = usePlan();
  const { save, isSaving } = usePortfolio();
  const { generate, isGenerating } = useGemini();
  const [portfolio, setPortfolio] = useState(() => normalizeInitialPortfolio(base));
  const [device, setDevice] = useState('desktop');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [livePortfolio, setLivePortfolio] = useState(null);
  const [expandedScore, setExpandedScore] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState('');
  const quality = useMemo(() => calculateQuality(portfolio), [portfolio]);
  const currentTemplate = resolveTemplateId(portfolio, portfolio.templateId);
  const canPdfExport = planState.canAccess?.('pdfExport');
  const previewWidth = device === 'desktop' ? 'min(100%, 1120px)' : `${widths[device]}px`;

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

  const downloadPdf = () => {
    if (!canPdfExport) {
      toast.error('PDF export is a Pro feature');
      return;
    }
    window.print();
  };

  const saveCurrent = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const saved = await save({ ...portfolio, templateId: currentTemplate, template: currentTemplate, qualityScore: quality.score });
    if (saved) {
      setPortfolio(normalizeInitialPortfolio(saved));
      setLivePortfolio(saved);
      setShowConfetti(true);
      confetti({ particleCount: 140, spread: 70, colors: ['#a855f7', '#3b82f6', '#ec4899'] });
      window.setTimeout(() => setShowConfetti(false), 1400);
    }
  };

  const regenerate = async (field) => {
    try {
      setRegeneratingField(field);
      const result = await generate({ ...portfolio, regenerate: field });
      if (!result) return;
      const patch = {
        bioVersions: [result.bio?.version1, result.bio?.version2, result.bio?.version3].filter(Boolean),
        selectedBio: result.bio?.version1 || portfolio.selectedBio,
        tagline: result.tagline || portfolio.tagline,
        projects: (portfolio.projects || []).map((project, index) => ({ ...project, description: result.projectDescriptions?.[index] || project.description })),
        layout: result.layoutSuggestion || portfolio.layout,
        templateId: currentTemplate,
        template: currentTemplate,
        colorPalette: result.colorPalette || portfolio.colorPalette,
        skillsHeadline: result.skillsHeadline,
        generationMetadata: result.metadata
      };
      updatePortfolio(field === 'palette' ? { colorPalette: patch.colorPalette } : field === 'tagline' ? { tagline: patch.tagline } : field === 'projects' ? { projects: patch.projects } : patch);
    } finally {
      setRegeneratingField('');
    }
  };

  const liveUrl = livePortfolio?.slug ? `${publicBaseUrl}/p/${livePortfolio.slug}` : '';

  return (
    <main className="lumina-page" style={{ paddingTop: '64px' }}>
      <Navbar />
      <AnimatePresence>
        {showAuthPrompt && !isAuthenticated && (
          <AuthPromptModal
            onClose={() => setShowAuthPrompt(false)}
            title="Sign in to save your portfolio"
            copy="Your preview is ready. Sign in to save it, get a public slug, and track views from your dashboard."
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

      <section
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 30,
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '0 20px',
          background: 'rgba(7,7,15,0.72)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <strong style={{ color: '#fff', fontSize: '14px' }}>Preview Studio</strong>
          <span style={{ borderRadius: '999px', padding: '4px 9px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.24)', color: '#c084fc', fontSize: '12px', fontWeight: 750 }}>
            {quality.score}/100
          </span>
        </div>
        <div className="lumina-hide-mobile" style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={copyCode} leftIcon={<Copy size={13} />}>Copy HTML</Button>
          <Button variant="secondary" size="sm" onClick={downloadHtml} leftIcon={<Download size={13} />}>Download</Button>
          <Button size="sm" onClick={saveCurrent} loading={isSaving} leftIcon={<Save size={13} />}>Save</Button>
        </div>
      </section>

      {livePortfolio && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'relative',
            zIndex: 2,
            margin: '18px auto 0',
            maxWidth: '1180px',
            padding: '0 20px'
          }}
        >
          <Card hover={false} padding="16px 18px" style={{ borderColor: 'rgba(168,85,247,0.28)', background: 'rgba(168,85,247,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#c084fc' }}>Portfolio live</p>
                <a href={liveUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', fontWeight: 750, wordBreak: 'break-all' }}>{liveUrl}</a>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(liveUrl)} leftIcon={<Copy size={13} />}>Copy URL</Button>
            </div>
          </Card>
        </motion.section>
      )}

      <div className="preview-layout" style={{ position: 'relative', zIndex: 2 }}>
        <aside
          className="quiet-scrollbar"
          style={{
            position: 'sticky',
            top: '120px',
            alignSelf: 'start',
            height: 'calc(100vh - 120px)',
            overflowY: 'auto',
            padding: '20px',
            background: 'rgba(7,7,15,0.76)',
            backdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div style={{ display: 'grid', gap: '16px' }}>
            <Card hover={false} padding="16px">
              <button
                type="button"
                onClick={() => setExpandedScore((open) => !open)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px' }}>
                  <SectionLabel>Quality Score</SectionLabel>
                  <strong style={{ color: '#c084fc', fontSize: '18px' }}>{quality.score}/100</strong>
                </div>
                <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quality.score}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #a855f7, #3b82f6)', borderRadius: '999px' }}
                  />
                </div>
                <p style={{ marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
                  {quality.suggestions[0] || 'Everything important is covered.'}
                </p>
              </button>
              <AnimatePresence>
                {expandedScore && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        ['Bio', Boolean(portfolio.selectedBio || portfolio.bioNotes)],
                        ['Projects', (portfolio.projects || []).length >= 2],
                        ['Skills', (portfolio.skills || []).length >= 5],
                        ['Contact', Boolean(portfolio.email || portfolio.linkedin || portfolio.github)]
                      ].map(([label, ok]) => (
                        <span key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                          {label}
                          {ok ? <Check size={13} color="#22c55e" /> : <span style={{ color: '#f59e0b' }}>Improve</span>}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <Card hover={false} padding="16px">
              <div style={{ marginBottom: '12px' }}>
                <SectionLabel>Template</SectionLabel>
              </div>
              <TemplatePicker
                compact
                selectedTemplate={currentTemplate}
                onSelect={(templateId) => updatePortfolio({ templateId, template: templateId })}
              />
            </Card>

            <Card hover={false} padding="16px">
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Palette size={13} color="#a855f7" />
                <SectionLabel>Palette</SectionLabel>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {palettes.map((item) => {
                  const selected = portfolio.colorPalette?.name === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => updatePortfolio({ colorPalette: item })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        border: selected ? '1px solid rgba(168,85,247,0.34)' : '1px solid rgba(255,255,255,0.06)',
                        background: selected ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.035)',
                        borderRadius: '12px',
                        color: '#fff',
                        padding: '9px 10px',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', fontSize: '13px', color: 'rgba(255,255,255,0.72)' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.primary, boxShadow: `0 0 14px ${item.primary}66` }} />
                        {item.name}
                      </span>
                      {selected ? <Check size={13} color="#c084fc" /> : null}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card hover={false} padding="16px">
              <div style={{ marginBottom: '12px' }}><SectionLabel>Device</SectionLabel></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'desktop', icon: Laptop, label: 'Desktop' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDevice(item.id)}
                    title={item.label}
                    style={{
                      height: '38px',
                      borderRadius: '12px',
                      border: device === item.id ? '1px solid rgba(168,85,247,0.42)' : '1px solid rgba(255,255,255,0.07)',
                      background: device === item.id ? 'rgba(168,85,247,0.16)' : 'rgba(255,255,255,0.04)',
                      color: device === item.id ? '#c084fc' : 'rgba(255,255,255,0.58)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <item.icon size={16} />
                  </button>
                ))}
              </div>
            </Card>

            <Card hover={false} padding="16px">
              <div style={{ marginBottom: '12px' }}><SectionLabel>Regenerate</SectionLabel></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['bio', 'tagline', 'projects', 'palette'].map((field) => (
                  <Button
                    key={field}
                    variant="secondary"
                    size="sm"
                    loading={isGenerating && regeneratingField === field}
                    disabled={isGenerating}
                    onClick={() => regenerate(field)}
                    leftIcon={<RefreshCw size={12} />}
                  >
                    {field}
                  </Button>
                ))}
              </div>
            </Card>

            <Card hover={false} padding="16px">
              <div style={{ marginBottom: '12px' }}><SectionLabel>Export</SectionLabel></div>
              <div style={{ display: 'grid', gap: '9px' }}>
                <Button variant="secondary" fullWidth onClick={copyCode} leftIcon={<Code2 size={14} />}>Copy HTML</Button>
                <Button variant="secondary" fullWidth onClick={downloadHtml} leftIcon={<Download size={14} />}>Download HTML</Button>
                <Button variant={canPdfExport ? 'secondary' : 'outline'} fullWidth onClick={downloadPdf} leftIcon={canPdfExport ? <Download size={14} /> : <Lock size={14} />}>Download PDF</Button>
                <Button fullWidth loading={isSaving} onClick={saveCurrent} leftIcon={<Save size={14} />}>Save Portfolio</Button>
                <Button variant="ghost" fullWidth onClick={copyJson} leftIcon={<FileJson size={14} />}>Copy JSON</Button>
              </div>
            </Card>

            {portfolio.slug ? (
              <Card hover={false} padding="16px" style={{ borderColor: 'rgba(168,85,247,0.22)', background: 'rgba(168,85,247,0.1)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 750, fontSize: '13px' }}><Check size={14} /> Shareable link ready</p>
                <Link to={`/p/${portfolio.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#fff', fontSize: '13px' }}>
                  Open public page <ExternalLink size={12} />
                </Link>
              </Card>
            ) : null}
          </div>
        </aside>

        <section
          style={{
            minWidth: 0,
            padding: '24px',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        >
          <motion.div
            layout
            animate={{ width: previewWidth }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: '100%',
              margin: '0 auto',
              borderRadius: '22px',
              border: '1px solid rgba(255,255,255,0.09)',
              background: 'rgba(255,255,255,0.045)',
              boxShadow: '0 18px 70px rgba(0,0,0,0.44), 0 0 42px rgba(168,85,247,0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(7,7,15,0.84)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fb7185' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
              <div style={{ marginLeft: '8px', flex: 1, height: '24px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 12px', color: 'rgba(255,255,255,0.34)', fontSize: '12px' }}>
                lumina.studio/{portfolio.slug || 'preview'}
              </div>
            </div>
            <div className="quiet-scrollbar" style={{ height: 'calc(100vh - 190px)', minHeight: '620px', overflow: 'auto', background: '#06060c' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTemplate}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
                >
                  <TemplateRenderer portfolio={portfolio} templateId={currentTemplate} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .preview-layout aside {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
        }
      `}</style>
    </main>
  );
}
