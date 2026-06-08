import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { getPreviewWorld } from './previewWorlds';

const bars = [0.78, 0.55, 0.66];
const dots = [0, 1, 2, 3, 4, 5];

function GlassScene({ compact }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[12%] top-[18%] h-[42%] w-[58%] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
        animate={compact ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[14%] right-[12%] h-[34%] w-[46%] rounded-2xl border border-cyan-200/20 bg-cyan-200/10 backdrop-blur-xl"
        animate={compact ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(103,232,249,0.28),transparent_34%)]" />
    </div>
  );
}

function TerminalScene({ compact }) {
  return (
    <div className="absolute inset-0 bg-[#020805] p-4 font-mono text-[10px] text-[#00ff41]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.04)_1px,transparent_1px)] bg-[length:100%_5px]" />
      <p className="relative">$ whoami</p>
      <p className="relative mt-2 text-[#d7ffe1]">&gt; Maya Chen</p>
      <p className="relative mt-2">$ compile identity</p>
      <motion.span
        className="relative mt-3 inline-block h-3 w-2 bg-[#00ff41]"
        animate={compact ? undefined : { opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </div>
  );
}

function BrutalistScene() {
  return (
    <div className="absolute inset-0 bg-[#f4f1e8] p-3 text-[#0b0b0b]">
      <div className="absolute left-3 top-3 h-12 w-20 border-4 border-[#0b0b0b]" />
      <div className="absolute bottom-3 right-3 h-16 w-24 bg-[#0b0b0b]" />
      <div className="absolute left-5 top-20 text-3xl font-black uppercase leading-[0.78]">Maya<br />Chen</div>
      <div className="absolute bottom-8 left-5 h-2 w-24 bg-[#ef4444]" />
    </div>
  );
}

function CinematicScene({ compact }) {
  return (
    <div className="absolute inset-0 bg-[#080808] text-white">
      <div className="absolute inset-x-0 top-0 h-7 bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-7 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,107,53,0.22),transparent_42%)]" />
      <motion.div
        className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black uppercase tracking-[0.08em]"
        animate={compact ? undefined : { opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Maya Chen
      </motion.div>
      <div className="absolute bottom-10 left-5 h-px w-28 bg-white/50" />
    </div>
  );
}

function NeonScene({ compact }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07070a]">
      {Array.from({ length: compact ? 8 : 18 }, (_, index) => (
        <motion.span
          key={index}
          className="absolute h-12 w-px bg-[#00f5ff]/45"
          style={{ left: `${8 + index * 11}%`, top: '-20%' }}
          animate={compact ? undefined : { y: ['0%', '180%'], opacity: [0.1, 0.9, 0.1] }}
          transition={{ duration: 2.4 + (index % 4) * 0.4, repeat: Infinity, delay: index * 0.14, ease: 'linear' }}
        />
      ))}
      <div className="absolute left-5 top-8 rounded-lg border border-[#00f5ff]/50 px-3 py-2 text-xs font-black uppercase text-[#00f5ff] shadow-[0_0_24px_rgba(0,245,255,0.35)]">
        Neon signal
      </div>
      <div className="absolute bottom-5 right-5 h-16 w-24 rounded-xl border border-[#ff00ff]/50 bg-[#ff00ff]/10" />
    </div>
  );
}

function InkScene({ compact }) {
  return (
    <div className="absolute inset-0 bg-[#fbfaf4] p-5 text-[#18120c]">
      <div className="text-3xl font-black">Maya</div>
      <div className="mt-2 h-px w-28 bg-[#18120c]/70" />
      <motion.div
        className="absolute bottom-7 left-7 h-5 w-5 rounded-full bg-[#18120c]"
        animate={compact ? undefined : { scale: [0.4, 1.1, 0.4], opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute bottom-7 right-7 h-px w-24 bg-[#b45309]/50" />
    </div>
  );
}

function EditorialScene() {
  return (
    <div className="absolute inset-0 bg-[#faf7f0] p-4 text-[#111111]">
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff3366]">Feature 01</div>
      <div className="mt-4 grid grid-cols-[0.7fr_1fr] gap-3">
        <div className="text-5xl font-black leading-[0.78]">M<br />C</div>
        <div className="space-y-2">
          {bars.map((bar) => <div key={bar} className="h-2 bg-[#111111]" style={{ width: `${bar * 100}%` }} />)}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-xs font-black">PAGE 08</div>
    </div>
  );
}

function SpatialScene({ compact }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#03001c] [perspective:700px]">
      {dots.map((dot) => (
        <span key={dot} className="absolute h-1 w-1 rounded-full bg-white" style={{ left: `${12 + dot * 14}%`, top: `${18 + (dot % 3) * 22}%` }} />
      ))}
      <motion.div
        className="absolute left-[20%] top-[24%] h-20 w-28 rounded-2xl border border-white/15 bg-white/[0.08]"
        animate={compact ? undefined : { rotateY: [0, 18, 0], y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      />
      <motion.div
        className="absolute bottom-[18%] right-[16%] h-16 w-24 rounded-2xl border border-[#f107a3]/40 bg-[#7b2ff7]/18"
        animate={compact ? undefined : { rotateX: [0, 16, 0], y: [0, 10, 0] }}
        transition={{ duration: 5.7, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
    </div>
  );
}

function HandcraftedScene({ compact }) {
  return (
    <div className="absolute inset-0 bg-[#fff8ec] p-5 text-[#2d2d2d]">
      <svg viewBox="0 0 160 50" className="h-16 w-40">
        <motion.path
          d="M8 34 C24 6 42 42 58 20 C74 -2 86 48 108 19 C122 4 137 31 152 16"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2"
          initial={compact ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={compact ? { duration: 0 } : { duration: 2.4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute bottom-6 left-6 h-12 w-28 rotate-[-2deg] rounded-xl bg-white shadow-[0_14px_30px_rgba(120,75,30,0.14)]" />
      <div className="absolute bottom-10 left-10 h-px w-20 bg-[#b45309]" />
    </div>
  );
}

export default function TemplateWorldScene({ templateId, compact = false }) {
  const reduceMotion = useReducedMotion();
  const world = getPreviewWorld(templateId);
  const motionOff = compact || reduceMotion;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: world.colors.bg,
        color: world.colors.text
      }}
    >
      {world.scene === 'glass' && <GlassScene compact={motionOff} />}
      {world.scene === 'terminal' && <TerminalScene compact={motionOff} />}
      {world.scene === 'brutalist' && <BrutalistScene />}
      {world.scene === 'cinematic' && <CinematicScene compact={motionOff} />}
      {world.scene === 'neon' && <NeonScene compact={motionOff} />}
      {world.scene === 'ink' && <InkScene compact={motionOff} />}
      {world.scene === 'editorial' && <EditorialScene />}
      {world.scene === 'spatial' && <SpatialScene compact={motionOff} />}
      {world.scene === 'handcrafted' && <HandcraftedScene compact={motionOff} />}
      <div className="pointer-events-none absolute inset-0 border border-white/10" />
    </div>
  );
}

TemplateWorldScene.propTypes = {
  compact: PropTypes.bool,
  templateId: PropTypes.string.isRequired
};
