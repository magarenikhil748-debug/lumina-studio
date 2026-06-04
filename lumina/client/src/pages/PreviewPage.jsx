import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Code2,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  Monitor,
  Palette,
  RefreshCw,
  Save,
  Smartphone,
  Tablet
} from 'lucide-react';
import AuthPromptModal from '../components/AuthPromptModal';
import Navbar from '../components/Navbar';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useGemini } from '../hooks/useGemini';
import usePlan from '../hooks/usePlan';
import { usePortfolio } from '../hooks/usePortfolio';
import { TEMPLATES, canUseTemplate } from '../templates';
import TemplateRenderer from '../templates/TemplateRenderer';
import { resolveTemplateId } from '../templates/shared/templateData';
import { buildStandaloneHtml, calculateQuality, samplePortfolio } from '../utils/helpers';
import { trackPortfolioExport } from '../utils/api';
import { getPublicBaseUrl } from '../utils/publicUrl';

const publicBaseUrl = getPublicBaseUrl();

const DEVICES = [
  { id: 'mobile', label: 'Mobile', width: '375px', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', width: '768px', icon: Tablet },
  { id: 'desktop', label: 'Desktop', width: '100%', icon: Monitor }
];

const PALETTES = [
  { id: 'obsidian', name: 'Obsidian', color: '#a855f7', primary: '#a855f7', secondary: '#7c3aed', accent: '#ec4899', bg: '#07070f', text: '#ffffff' },
  { id: 'graphite', name: 'Graphite', color: '#94a3b8', primary: '#94a3b8', secondary: '#64748b', accent: '#e2e8f0', bg: '#0f172a', text: '#f8fafc' },
  { id: 'aurora', name: 'Aurora', color: '#c084fc', primary: '#c084fc', secondary: '#a855f7', accent: '#f0abfc', bg: '#0f0c29', text: '#ffffff' },
  { id: 'atelier', name: 'Atelier', color: '#f59e0b', primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', bg: '#0c0a00', text: '#ffffff' },
  { id: 'oceanic', name: 'Oceanic', color: '#06b6d4', primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9', bg: '#030d12', text: '#ffffff' }
];

const REGEN_SECTIONS = [
  { id: 'bio', label: 'Bio' },
  { id: 'tagline', label: 'Tagline' },
  { id: 'projects', label: 'Projects' },
  { id: 'palette', label: 'Palette' }
];

const normalizeInitialPortfolio = (portfolio) => ({
  ...portfolio,
  templateId: resolveTemplateId(portfolio, portfolio.templateId),
  template: resolveTemplateId(portfolio, portfolio.templateId)
});

const normalizePlan = (value) => {
  if (!value || value === 'free') return 'starter';
  return value;
};

function PanelLabel({ children, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
      {icon ? <span style={{ color: 'rgba(255,255,255,0.3)', display: 'flex' }}>{icon}</span> : null}
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)'
        }}
      >
        {children}
      </span>
    </div>
  );
}

PanelLabel.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.node
};

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
  const [regeneratingField, setRegeneratingField] = useState('');
  const [upgradeRequest, setUpgradeRequest] = useState(null);
  const quality = useMemo(() => calculateQuality(portfolio), [portfolio]);
  const currentTemplate = resolveTemplateId(portfolio, portfolio.templateId);
  const currentPlan = normalizePlan(planState.plan);
  const selectedPalette = PALETTES.find((item) => item.name === portfolio.colorPalette?.name)?.id || 'obsidian';
  const selectedDevice = DEVICES.find((item) => item.id === device) || DEVICES[2];
  const canPdfExport = Boolean(planState.canAccess?.('pdfExport'));
  const templates = useMemo(() => Object.values(TEMPLATES), []);

  const updatePortfolio = (patch) => setPortfolio((current) => ({ ...current, ...patch }));

  const canAccessTemplate = (template) => template.id === 'glass' || canUseTemplate(template, currentPlan);

  const handleTemplate = (template) => {
    if (!canAccessTemplate(template)) {
      setUpgradeRequest({ feature: 'template', requiredTier: template.tier === 'studio' ? 'studio' : 'pro' });
      return;
    }
    updatePortfolio({ templateId: template.id, template: template.id });
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(buildStandaloneHtml(portfolio));
    if (portfolio.slug) await trackPortfolioExport(portfolio.slug).catch(() => null);
    toast.success('Standalone HTML copied');
  };

  const downloadPdf = () => {
    if (!canPdfExport) {
      setUpgradeRequest({ feature: 'pdfExport', requiredTier: 'pro' });
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
      <UpgradeModal
        isOpen={Boolean(upgradeRequest)}
        onClose={() => setUpgradeRequest(null)}
        feature={upgradeRequest?.feature || 'template'}
        requiredTier={upgradeRequest?.requiredTier || 'pro'}
      />
      {showConfetti && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle,rgba(168,85,247,.28),transparent_38%)]"
          animate={reduceMotion ? { opacity: 0.35 } : { opacity: [0.15, 0.55, 0], scale: [0.95, 1.05, 1.12] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.4, ease: 'easeOut' }}
        />
      )}

      <div
        className="preview-split"
        style={{
          display: 'grid',
          gridTemplateColumns: '272px minmax(0, 1fr)',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <aside
          className="preview-panel quiet-scrollbar"
          style={{
            width: '272px',
            minWidth: '272px',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: '64px',
            alignSelf: 'start',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'rgba(7,7,15,0.85)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(168,85,247,0.2) transparent'
          }}
        >
          <div>
            <PanelLabel>Quality Score</PanelLabel>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{quality.score}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/100</span>
              </div>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                {Array.from({ length: 10 }, (_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '999px',
                      background: index < Math.floor(quality.score / 10)
                        ? quality.score >= 80 ? '#22c55e' : quality.score >= 60 ? '#f59e0b' : '#ef4444'
                        : 'rgba(255,255,255,0.08)',
                      transformOrigin: 'bottom'
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, margin: 0 }}>
                {quality.suggestions[0] || 'Ready for a confident launch.'}
              </p>
            </div>
          </div>

          <div>
            <PanelLabel icon={<Layers size={10} />}>Template</PanelLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {templates.map((template) => {
                const isLocked = !canAccessTemplate(template);
                const isSelected = currentTemplate === template.id;
                return (
                  <motion.button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplate(template)}
                    whileHover={{ scale: isLocked ? 1 : 1.04 }}
                    whileTap={{ scale: isLocked ? 1 : 0.97 }}
                    aria-label={`${isLocked ? 'Locked ' : ''}${template.name} template`}
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      border: isSelected ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? '0 0 16px rgba(168,85,247,0.3)' : 'none',
                      position: 'relative',
                      transition: 'border 0.2s ease, box-shadow 0.2s ease',
                      padding: 0,
                      background: 'transparent',
                      minWidth: 0
                    }}
                  >
                    <div
                      style={{
                        height: '52px',
                        background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]}, ${template.colors[2]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                    <div
                      style={{
                        padding: '5px 3px',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: isSelected ? '#c084fc' : 'rgba(255,255,255,0.5)',
                        textAlign: 'center',
                        letterSpacing: '0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {template.name}
                    </div>
                    {isLocked && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.54)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                        <Lock size={13} color="rgba(255,255,255,0.65)" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <PanelLabel icon={<Palette size={10} />}>Palette</PanelLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {PALETTES.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => updatePortfolio({ colorPalette: item })}
                  whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: selectedPalette === item.id ? 'rgba(168,85,247,0.12)' : 'transparent',
                    border: selectedPalette === item.id ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.color, boxShadow: selectedPalette === item.id ? `0 0 8px ${item.color}80` : 'none', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: selectedPalette === item.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{item.name}</span>
                  </span>
                  {selectedPalette === item.id ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <Check size={12} color="#a855f7" />
                    </motion.span>
                  ) : null}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <PanelLabel icon={<Monitor size={10} />}>Device</PanelLabel>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
              {DEVICES.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setDevice(item.id)}
                  whileTap={{ scale: 0.95 }}
                  title={item.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '7px',
                    background: device === item.id ? 'rgba(168,85,247,0.2)' : 'transparent',
                    border: device === item.id ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                    color: device === item.id ? '#a855f7' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <item.icon size={15} />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <PanelLabel icon={<RefreshCw size={10} />}>Regenerate</PanelLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {REGEN_SECTIONS.map((section) => (
                <motion.button
                  key={section.id}
                  type="button"
                  onClick={() => regenerate(section.id)}
                  disabled={isGenerating}
                  whileHover={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '999px',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isGenerating ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <motion.span
                    animate={regeneratingField === section.id ? { rotate: 360 } : {}}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'flex' }}
                  >
                    <RefreshCw size={11} />
                  </motion.span>
                  {section.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <PanelLabel icon={<FileText size={10} />}>Export</PanelLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <motion.button
                type="button"
                onClick={copyCode}
                whileHover={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
                style={exportButtonStyle}
              >
                <Code2 size={14} color="rgba(255,255,255,0.5)" />
                <span>
                  <span style={exportTitleStyle}>Copy HTML</span>
                  <span style={exportDescriptionStyle}>Standalone file</span>
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={downloadPdf}
                whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.98 }}
                style={{ ...exportButtonStyle, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: canPdfExport ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)' }}
              >
                <FileText size={14} color={canPdfExport ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'} />
                <span style={{ flex: 1 }}>
                  <span style={exportTitleStyle}>Download PDF</span>
                  <span style={exportDescriptionStyle}>{canPdfExport ? 'Print-ready export' : 'Pro feature'}</span>
                </span>
                {!canPdfExport ? <Lock size={11} color="rgba(255,255,255,0.2)" /> : null}
              </motion.button>

              <motion.button
                type="button"
                onClick={saveCurrent}
                disabled={isSaving}
                whileHover={{ boxShadow: '0 0 24px rgba(168,85,247,0.5)', scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 0 20px rgba(168,85,247,0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSaving ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                ) : (
                  <>
                    <Save size={14} />
                    Save Portfolio
                  </>
                )}
              </motion.button>
            </div>
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
          <div style={{ maxWidth: '1120px', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c084fc' }}>Preview Studio</p>
              <h1 style={{ marginTop: '5px', fontSize: '22px', fontWeight: 800, color: '#fff' }}>{portfolio.name || 'Your portfolio'}</h1>
            </div>
            {livePortfolio ? (
              <Link to={`/p/${livePortfolio.slug}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '13px', fontWeight: 700 }}>
                Open live portfolio <ExternalLink size={13} />
              </Link>
            ) : null}
          </div>

          {liveUrl ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1120px', margin: '0 auto 18px', padding: '12px 14px', border: '1px solid rgba(168,85,247,0.24)', borderRadius: '12px', background: 'rgba(168,85,247,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              Saved at {liveUrl}
            </motion.div>
          ) : null}

          <motion.div
            layout
            animate={{ width: selectedDevice.width }}
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
    </main>
  );
}

const exportButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '10px',
  color: 'rgba(255,255,255,0.75)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
  textAlign: 'left'
};

const exportTitleStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.8)'
};

const exportDescriptionStyle = {
  display: 'block',
  fontSize: '10px',
  color: 'rgba(255,255,255,0.3)',
  marginTop: '1px'
};
