import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import usePlan from '../hooks/usePlan';
import UpgradeModal from './UpgradeModal';
import TemplatePreview from '../templates/TemplatePreview';
import { TEMPLATES, canUseTemplate } from '../templates';

const normalizePlan = (planState) => {
  const plan = planState?.plan || planState?.tier || 'starter';
  if (plan === 'free') return 'starter';
  return plan;
};

const TemplatePicker = ({ selectedTemplate, onSelect }) => {
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
  selectedTemplate: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default TemplatePicker;
