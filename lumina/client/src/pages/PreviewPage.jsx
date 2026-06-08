import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
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
  ShieldCheck,
  Sparkles,
  Smartphone,
  Tablet,
  Wand2
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
import TemplateWorldScene from '../templates/TemplateWorldScene';
import { getPreviewWorld, previewTheaterSamplePortfolio } from '../templates/previewWorlds';
import { resolveTemplateId } from '../templates/shared/templateData';
import { buildStandaloneHtml, calculateQuality } from '../utils/helpers';
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
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

function WorldSelectorButton({
  template,
  world,
  selected,
  previewing,
  locked,
  onSelect,
  onPreviewStart,
  onPreviewEnd
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreviewStart}
      onBlur={onPreviewEnd}
      whileHover={reduceMotion ? undefined : { y: locked ? 0 : -2 }}
      whileTap={reduceMotion ? undefined : { scale: locked ? 1 : 0.98 }}
      aria-label={`${locked ? 'Locked ' : ''}${world.label}`}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '64px minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderRadius: '14px',
        border: selected
          ? '1px solid rgba(192,132,252,0.82)'
          : previewing
            ? `1px solid ${world.colors.secondary}70`
            : '1px solid rgba(255,255,255,0.08)',
        background: selected
          ? 'rgba(168,85,247,0.14)'
          : previewing
            ? 'rgba(255,255,255,0.065)'
            : 'rgba(255,255,255,0.035)',
        boxShadow: selected ? '0 0 22px rgba(168,85,247,0.24)' : 'none',
        color: '#fff',
        cursor: locked ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease'
      }}
    >
      <span
        style={{
          height: '58px',
          borderRadius: '11px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: locked ? 0.5 : 1
        }}
      >
        <TemplateWorldScene templateId={template.id} compact />
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: world.colors.secondary
          }}
        >
          {world.pricingTierHint}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: '3px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {world.shortLabel}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: '3px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.42)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {world.category}
        </span>
      </span>
      <span
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: locked ? 'rgba(255,255,255,0.04)' : selected ? '#fff' : 'rgba(255,255,255,0.06)',
          color: locked ? 'rgba(255,255,255,0.35)' : selected ? '#7c3aed' : 'rgba(255,255,255,0.55)',
          flexShrink: 0
        }}
      >
        {locked ? <Lock size={12} /> : selected ? <Check size={13} /> : <ArrowRight size={12} />}
      </span>
    </motion.button>
  );
}

WorldSelectorButton.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  world: PropTypes.shape({
    label: PropTypes.string.isRequired,
    shortLabel: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    pricingTierHint: PropTypes.string.isRequired,
    colors: PropTypes.shape({
      secondary: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  previewing: PropTypes.bool.isRequired,
  locked: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onPreviewStart: PropTypes.func.isRequired,
  onPreviewEnd: PropTypes.func.isRequired
};

export default function PreviewPage() {
  const reduceMotion = useReducedMotion();
  const { state } = useLocation();
  const base = state?.portfolio || previewTheaterSamplePortfolio;
  const { isAuthenticated } = useAuth();
  const planState = usePlan();
  const { save, isSaving } = usePortfolio();
  const { generate, isGenerating } = useGemini();
  const [portfolio, setPortfolio] = useState(() => normalizeInitialPortfolio(base));
  const [device, setDevice] = useState('desktop');
  const [previewTemplate, setPreviewTemplate] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [livePortfolio, setLivePortfolio] = useState(null);
  const [regeneratingField, setRegeneratingField] = useState('');
  const [upgradeRequest, setUpgradeRequest] = useState(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 160, damping: 26, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 160, damping: 26, mass: 0.6 });
  const stageX = useTransform(springX, [-0.5, 0.5], reduceMotion ? ['0px', '0px'] : ['-12px', '12px']);
  const stageY = useTransform(springY, [-0.5, 0.5], reduceMotion ? ['0px', '0px'] : ['-10px', '10px']);
  const frameRotateY = useTransform(springX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-2, 2]);
  const frameRotateX = useTransform(springY, [-0.5, 0.5], reduceMotion ? [0, 0] : [1.5, -1.5]);
  const quality = useMemo(() => calculateQuality(portfolio), [portfolio]);
  const currentTemplate = resolveTemplateId(portfolio, portfolio.templateId);
  const activeTemplate = previewTemplate || currentTemplate;
  const activeWorld = getPreviewWorld(activeTemplate);
  const currentWorld = getPreviewWorld(currentTemplate);
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
    setPreviewTemplate('');
  };

  const previewWorld = (templateId) => setPreviewTemplate(templateId);

  const clearPreviewWorld = (templateId) => {
    setPreviewTemplate((current) => (current === templateId ? '' : current));
  };

  const handleTheaterPointerMove = (event) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTheaterPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
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
  const activeTemplateConfig = TEMPLATES[activeTemplate] || TEMPLATES.glass;
  const activeTemplateLocked = !canAccessTemplate(activeTemplateConfig);
  const activeTemplateIsPreview = activeTemplate !== currentTemplate;

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
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {templates.map((template) => {
                const isLocked = !canAccessTemplate(template);
                const isSelected = currentTemplate === template.id;
                const isPreviewing = activeTemplate === template.id && !isSelected;
                const world = getPreviewWorld(template.id);
                return (
                  <WorldSelectorButton
                    key={template.id}
                    template={template}
                    world={world}
                    selected={isSelected}
                    previewing={isPreviewing}
                    locked={isLocked}
                    onSelect={() => handleTemplate(template)}
                    onPreviewStart={() => previewWorld(template.id)}
                    onPreviewEnd={() => clearPreviewWorld(template.id)}
                  />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {
                  icon: Code2,
                  label: 'Copy HTML',
                  sub: 'Standalone',
                  locked: false,
                  onClick: copyCode
                },
                {
                  icon: FileText,
                  label: 'Download PDF',
                  sub: 'Pro',
                  locked: !canPdfExport,
                  onClick: downloadPdf
                }
              ].map((item) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  whileHover={{ background: item.locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)' }}
                  whileTap={{ scale: item.locked ? 1 : 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '9px',
                    cursor: item.locked ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <item.icon size={13} color={item.locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)'} />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: item.locked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)',
                      flex: 1,
                      textAlign: 'left'
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: item.locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
                      fontWeight: 500
                    }}
                  >
                    {item.sub}
                  </span>
                  {item.locked ? <Lock size={10} color="rgba(255,255,255,0.2)" /> : null}
                </motion.button>
              ))}

              <motion.button
                type="button"
                onClick={saveCurrent}
                disabled={isSaving}
                whileHover={{ boxShadow: '0 0 20px rgba(168,85,247,0.45)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  border: 'none',
                  borderRadius: '9px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 0 16px rgba(168,85,247,0.25)',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {isSaving ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                ) : (
                  <>
                    <Save size={13} />
                    Save Portfolio
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </aside>

        <section
          className="preview-theater-stage-area"
          style={{
            minWidth: 0,
            padding: '24px',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        >
          <div className="preview-theater-topbar" style={{ maxWidth: '1240px', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase', color: activeWorld.colors.secondary }}>Preview Theater</p>
              <h1 style={{ marginTop: '5px', fontSize: '22px', fontWeight: 850, color: '#fff' }}>{portfolio.name || 'Your portfolio'} in {activeWorld.shortLabel}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 11px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.045)', color: 'rgba(255,255,255,0.66)', fontSize: '12px', fontWeight: 700 }}>
                <Sparkles size={13} color={activeWorld.colors.secondary} />
                Selected: {currentWorld.shortLabel}
              </span>
              {livePortfolio ? (
                <Link to={`/p/${livePortfolio.slug}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: activeWorld.colors.secondary, fontSize: '13px', fontWeight: 800 }}>
                  Open live portfolio <ExternalLink size={13} />
                </Link>
              ) : null}
            </div>
          </div>

          {liveUrl ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1240px', margin: '0 auto 18px', padding: '12px 14px', border: `1px solid ${activeWorld.colors.secondary}45`, borderRadius: '12px', background: `${activeWorld.colors.secondary}14`, color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              Saved at {liveUrl}
            </motion.div>
          ) : null}

          <motion.div
            className="preview-theater-shell"
            onPointerMove={handleTheaterPointerMove}
            onPointerLeave={resetTheaterPointer}
            animate={{
              backgroundColor: activeWorld.colors.bg
            }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeInOut' }}
            style={{
              position: 'relative',
              maxWidth: '1240px',
              margin: '0 auto',
              minHeight: 'calc(100vh - 156px)',
              display: 'grid',
              gridTemplateColumns: 'minmax(320px, 0.9fr) minmax(520px, 1.1fr)',
              gap: '24px',
              alignItems: 'center',
              padding: '24px',
              overflow: 'hidden',
              borderRadius: '28px',
              border: '1px solid rgba(255,255,255,0.09)',
              background:
                `radial-gradient(circle at 18% 12%, ${activeWorld.colors.secondary}30, transparent 30%),
                radial-gradient(circle at 92% 18%, ${activeWorld.colors.accent}24, transparent 28%),
                radial-gradient(circle at 64% 102%, ${activeWorld.colors.primary}1c, transparent 38%),
                ${activeWorld.colors.bg}`,
              boxShadow: '0 28px 100px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08)'
            }}
          >
            <motion.div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-12%',
                opacity: 0.24,
                x: stageX,
                y: stageY,
                filter: 'blur(26px)',
                pointerEvents: 'none'
              }}
            >
              <TemplateWorldScene templateId={activeTemplate} compact={reduceMotion} />
            </motion.div>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '42px 42px', opacity: 0.42, pointerEvents: 'none' }} />

            <motion.div
              className="preview-theater-copy"
              key={`copy-${activeTemplate}`}
              initial={false}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative',
                zIndex: 3,
                minWidth: 0,
                padding: '20px',
                borderRadius: '22px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.18)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                color: activeWorld.colors.text
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 11px', borderRadius: '999px', border: `1px solid ${activeWorld.colors.secondary}55`, background: `${activeWorld.colors.secondary}1a`, color: activeWorld.colors.primary, fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  <Wand2 size={13} />
                  {activeWorld.badge}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 11px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.055)', color: activeWorld.colors.muted, fontSize: '11px', fontWeight: 800 }}>
                  {activeTemplateIsPreview ? 'Previewing before selection' : 'Active template'}
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 58px)', lineHeight: 0.96, fontWeight: 900, letterSpacing: '0', color: activeWorld.colors.text, maxWidth: '680px' }}>
                {activeWorld.headline}
              </h2>
              <p style={{ marginTop: '18px', maxWidth: '580px', fontSize: 'clamp(14px, 1.5vw, 17px)', lineHeight: 1.65, color: activeWorld.colors.muted }}>
                {activeWorld.subheadline}
              </p>
              <div style={{ marginTop: '20px', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.055)', color: activeWorld.colors.primary, fontSize: '12px', fontWeight: 800 }}>
                {activeWorld.valueLine}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
                {activeWorld.proof.map((item) => (
                  <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(0,0,0,0.18)', color: activeWorld.colors.muted, fontSize: '11px', fontWeight: 800 }}>
                    <ShieldCheck size={12} color={activeWorld.colors.secondary} />
                    {item}
                  </span>
                ))}
              </div>
              <div className="preview-theater-cta-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
                <motion.button
                  type="button"
                  onClick={() => {
                    if (activeTemplateIsPreview) {
                      handleTemplate(activeTemplateConfig);
                      return;
                    }
                    saveCurrent();
                  }}
                  disabled={isSaving}
                  whileHover={reduceMotion ? undefined : { scale: 1.03, boxShadow: `0 0 28px ${activeWorld.colors.secondary}70` }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: '44px',
                    padding: '11px 18px',
                    border: 'none',
                    borderRadius: '999px',
                    background: activeTemplateLocked
                      ? 'rgba(255,255,255,0.08)'
                      : `linear-gradient(135deg, ${activeWorld.colors.secondary}, ${activeWorld.colors.accent})`,
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: activeTemplateLocked ? 'none' : `0 0 22px ${activeWorld.colors.secondary}4d`
                  }}
                >
                  {activeTemplateLocked ? <Lock size={14} /> : <Wand2 size={14} />}
                  {activeTemplateIsPreview ? activeWorld.previewCta : activeWorld.cta}
                </motion.button>
                <Link to="/build" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', padding: '11px 16px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.055)', color: activeWorld.colors.primary, fontSize: '13px', fontWeight: 850 }}>
                  {activeWorld.secondaryCta}
                  <ArrowRight size={14} />
                </Link>
              </div>
              <p style={{ marginTop: '13px', maxWidth: '520px', color: activeWorld.colors.muted, fontSize: '12px', lineHeight: 1.55 }}>
                {activeWorld.microcopy}
              </p>
            </motion.div>

            <motion.div
              className="preview-device-frame-wrap"
              style={{
                position: 'relative',
                zIndex: 1,
                justifySelf: 'end',
                width: '100%',
                maxWidth: '1000px',
                minWidth: 0,
                x: stageX,
                y: stageY,
                rotateX: frameRotateX,
                rotateY: frameRotateY,
                transformPerspective: 1200,
                transformStyle: 'preserve-3d'
              }}
            >
              <motion.div
                layout
                animate={{ width: selectedDevice.width }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  maxWidth: '100%',
                  margin: '0 auto',
                  borderRadius: '22px',
                  border: `1px solid ${activeWorld.colors.secondary}45`,
                  background: 'rgba(255,255,255,0.055)',
                  boxShadow: `0 20px 80px rgba(0,0,0,0.52), 0 0 46px ${activeWorld.colors.secondary}22`,
                  overflow: 'hidden'
                }}
              >
                <div style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(7,7,15,0.86)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fb7185' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
                  <div style={{ marginLeft: '8px', flex: 1, height: '24px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 12px', color: 'rgba(255,255,255,0.34)', fontSize: '12px', minWidth: 0 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      lumina.studio/{portfolio.slug || activeWorld.shortLabel.toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="quiet-scrollbar preview-device-frame-scroll" style={{ height: 'min(70vh, 760px)', minHeight: '560px', overflow: 'auto', background: '#06060c' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTemplate}
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                      transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
                    >
                      <TemplateRenderer portfolio={portfolio} templateId={activeTemplate} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
