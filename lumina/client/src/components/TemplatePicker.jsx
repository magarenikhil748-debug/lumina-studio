import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Boxes, Check, Lock } from 'lucide-react';
import usePlan from '../hooks/usePlan';
import UpgradeModal from './UpgradeModal';
import TemplatePreview from '../templates/TemplatePreview';
import TemplateWorldScene from '../templates/TemplateWorldScene';
import { TEMPLATES, canUseTemplate } from '../templates';
import { getPreviewWorld } from '../templates/previewWorlds';

const normalizePlan = (planState) => {
  const plan = planState?.plan || planState?.tier || 'starter';
  if (plan === 'free') return 'starter';
  return plan;
};

const TemplatePicker = ({ selectedTemplate, onSelect, compact = false, onPreviewStart, onPreviewEnd }) => {
  const reduceMotion = useReducedMotion();
  const planState = usePlan();
  const currentPlan = normalizePlan(planState);
  const [lockedTemplate, setLockedTemplate] = useState(null);
  const templates = useMemo(() => Object.values(TEMPLATES), []);

  const handleSelect = (template) => {
    if (!canUseTemplate(template, currentPlan)) {
      setLockedTemplate(template);
      return;
    }
    onSelect(template.id);
  };

  if (compact) {
    return (
      <section>
        <motion.div
          className="quiet-scrollbar flex snap-x gap-3 overflow-x-auto pb-2"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {templates.map((template) => {
            const locked = !canUseTemplate(template, currentPlan);
            const selected = selectedTemplate === template.id;
            const world = getPreviewWorld(template.id);
            return (
              <motion.button
                key={template.id}
                type="button"
                onClick={() => handleSelect(template)}
                onMouseEnter={() => onPreviewStart?.(template.id)}
                onMouseLeave={() => onPreviewEnd?.(template.id)}
                onFocus={() => onPreviewStart?.(template.id)}
                onBlur={() => onPreviewEnd?.(template.id)}
                whileHover={reduceMotion ? undefined : { y: -3, scale: selected ? 1.04 : 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                style={{
                  position: 'relative',
                  minWidth: '86px',
                  width: '86px',
                  height: '112px',
                  borderRadius: '15px',
                  border: selected ? '1px solid rgba(192,132,252,0.85)' : '1px solid rgba(255,255,255,0.08)',
                  background: selected ? 'rgba(168,85,247,0.14)' : 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: '6px',
                  scrollSnapAlign: 'start',
                  boxShadow: selected ? '0 0 24px rgba(168,85,247,0.24)' : 'none'
                }}
                aria-label={`${locked ? 'Locked ' : ''}${template.name} template`}
              >
                <span
                  style={{
                    display: 'block',
                    height: '58px',
                    borderRadius: '10px',
                    opacity: locked ? 0.45 : 1,
                    overflow: 'hidden'
                  }}
                >
                  <TemplateWorldScene templateId={template.id} compact />
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    fontSize: '9px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: selected ? '#fff' : 'rgba(255,255,255,0.62)',
                    textAlign: 'left'
                  }}
                >
                  {world.shortLabel}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: '3px',
                    fontSize: '8px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: world.colors.secondary
                  }}
                >
                  {template.tier}
                </span>
                {selected && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#7c3aed',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <Check size={11} />
                  </span>
                )}
                {locked && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(5,5,8,0.56)',
                      backdropFilter: 'blur(2px)',
                      color: '#fff'
                    }}
                  >
                    <Lock size={14} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
        <UpgradeModal
          isOpen={Boolean(lockedTemplate)}
          onClose={() => setLockedTemplate(null)}
          feature="template"
          requiredTier={lockedTemplate?.tier === 'studio' ? 'studio' : 'pro'}
        />
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-5 text-white backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-[#c4b5fd]">
            <Boxes className="h-4 w-4" /> Template engine
          </p>
          <h2 className="mt-2 font-display text-3xl font-black">Choose the motion system.</h2>
        </div>
        <span className="w-fit rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/56">
          {currentPlan} access
        </span>
      </div>
      <motion.div
        className="flex snap-x gap-4 overflow-x-auto pb-2"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <AnimatePresence initial={false}>
          {templates.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              selected={selectedTemplate === template.id}
              locked={!canUseTemplate(template, currentPlan)}
              onClick={() => handleSelect(template)}
              onPreviewStart={onPreviewStart}
              onPreviewEnd={onPreviewEnd}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      <UpgradeModal
        isOpen={Boolean(lockedTemplate)}
        onClose={() => setLockedTemplate(null)}
        feature="template"
        requiredTier={lockedTemplate?.tier === 'studio' ? 'studio' : 'pro'}
      />
    </section>
  );
};

TemplatePicker.propTypes = {
  compact: PropTypes.bool,
  selectedTemplate: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onPreviewStart: PropTypes.func,
  onPreviewEnd: PropTypes.func
};

export default TemplatePicker;
