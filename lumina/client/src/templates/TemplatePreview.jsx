import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

const TemplatePreview = ({ template, selected = false, locked = false, onClick }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -6, scale: selected ? 1.03 : 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={`group relative min-w-[220px] snap-start overflow-hidden rounded-3xl border p-4 text-left transition ${
        selected ? 'border-[#c4b5fd] bg-[#a855f7]/15 shadow-[0_0_36px_rgba(168,85,247,0.26)]' : 'border-white/[0.08] bg-white/[0.045] hover:border-white/[0.16]'
      }`}
      aria-label={`${locked ? 'Locked ' : ''}${template.name} template`}
    >
      <div className="relative h-28 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? undefined : {
            background: [
              `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`,
              `linear-gradient(135deg, ${template.colors[1]}, ${template.colors[2]})`,
              `linear-gradient(135deg, ${template.colors[2]}, ${template.colors[0]})`
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:28px_28px] opacity-35" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-2 w-2/3 rounded-full bg-white/80" />
          <div className="mt-2 h-2 w-1/2 rounded-full bg-white/35" />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{template.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/48">{template.description}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${template.tier === 'studio' ? 'bg-amber-300/14 text-amber-100' : 'bg-[#a855f7]/18 text-[#d8b4fe]'}`}>
          {template.tier}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        {template.colors.map((color) => (
          <motion.span
            key={color}
            className="h-5 w-5 rounded-full border border-white/20"
            style={{ background: color }}
            animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: template.colors.indexOf(color) * 0.18 }}
          />
        ))}
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
  onClick: PropTypes.func.isRequired
};

export default TemplatePreview;
