import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import TemplateWorldScene from './TemplateWorldScene';
import { getPreviewWorld } from './previewWorlds';

const TemplatePreview = ({
  template,
  selected = false,
  locked = false,
  onClick,
  onPreviewStart,
  onPreviewEnd
}) => {
  const reduceMotion = useReducedMotion();
  const world = getPreviewWorld(template.id);
  const accent = world.colors.secondary || template.colors[1];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onPreviewStart?.(template.id)}
      onMouseLeave={() => onPreviewEnd?.(template.id)}
      onFocus={() => onPreviewStart?.(template.id)}
      onBlur={() => onPreviewEnd?.(template.id)}
      whileHover={reduceMotion ? undefined : { y: -6, scale: selected ? 1.03 : 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={`group relative min-w-[242px] snap-start overflow-hidden rounded-[22px] border p-3 text-left transition ${
        selected ? 'border-[#c4b5fd] bg-[#a855f7]/15 shadow-[0_0_38px_rgba(168,85,247,0.28)]' : 'border-white/[0.08] bg-white/[0.045] hover:border-white/[0.18]'
      }`}
      style={{
        boxShadow: selected ? `0 0 36px ${accent}38, 0 18px 56px rgba(0,0,0,0.34)` : undefined
      }}
      aria-label={`${locked ? 'Locked ' : ''}${template.name} template`}
    >
      <div className="relative h-32 overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#0a0a0f]">
        <TemplateWorldScene templateId={template.id} />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: `linear-gradient(0deg, ${world.colors.bg}f2, transparent)` }}
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/[0.12] bg-black/25 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur-lg">
          {world.badge}
        </span>
        <span
          className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] text-white backdrop-blur-lg transition group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
            {world.category}
          </p>
          <h3 className="mt-1 font-black text-white">{world.shortLabel}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/[0.54]">{world.valueLine}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${template.tier === 'studio' ? 'bg-amber-300/[0.14] text-amber-100' : 'bg-[#a855f7]/[0.18] text-[#d8b4fe]'}`}>
          {world.pricingTierHint.replace(' World', '')}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[11px] font-semibold text-white/[0.72]">{world.purpose}</p>
        </div>
        <div className="flex flex-shrink-0 gap-1.5">
        {template.colors.map((color) => (
          <motion.span
            key={color}
            className="h-4 w-4 rounded-full border border-white/20"
            style={{ background: color }}
            animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: template.colors.indexOf(color) * 0.18 }}
          />
        ))}
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 grid place-items-center bg-[#050508]/72 backdrop-blur-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.08] px-4 py-2 text-sm font-black text-white">
            <Lock className="h-4 w-4" /> Upgrade
          </span>
        </div>
      )}
      {selected && (
        <motion.span layoutId="selected-template-dot" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[#0a0a0f]">
          <Sparkles className="h-4 w-4" />
        </motion.span>
      )}
    </motion.button>
  );
};

TemplatePreview.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tier: PropTypes.string.isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  selected: PropTypes.bool,
  locked: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onPreviewStart: PropTypes.func,
  onPreviewEnd: PropTypes.func
};

export default TemplatePreview;
