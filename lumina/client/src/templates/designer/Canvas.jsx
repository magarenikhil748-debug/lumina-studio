import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import PhysicsSurface from '../../lib/motion/PhysicsSurface';
import Reveal from '../../lib/motion/Reveal';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import NoiseTexture from '../shared/NoiseTexture';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const splashColors = ['#e63946', '#457b9d', '#2a9d8f', '#e9c46a'];

const DrawnDivider = () => {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 600 18" preserveAspectRatio="none" className="my-12 h-4 w-full text-[#b45309]/35" aria-hidden="true">
      <motion.path
        d="M2 10 C110 1 210 16 310 8 C410 0 500 14 598 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0.1 : 1.1, ease: 'easeInOut' }}
      />
    </svg>
  );
};

const Signature = ({ name, reduceMotion }) => (
  <svg viewBox="0 0 720 130" className="mt-7 h-auto w-full max-w-3xl overflow-visible" aria-label={`${name} signature`}>
    <motion.text
      x="4"
      y="92"
      fill="transparent"
      stroke="#2d2d2d"
      strokeWidth="1.5"
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 92,
        fontStyle: 'italic',
        strokeDasharray: 900,
        willChange: 'stroke-dashoffset, opacity'
      }}
      initial={reduceMotion ? { strokeDashoffset: 0, opacity: 1 } : { strokeDashoffset: 900, opacity: 0 }}
      animate={{ strokeDashoffset: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 2.1, ease: 'easeInOut' }}
    >
      {name}
    </motion.text>
  </svg>
);

Signature.propTypes = {
  name: PropTypes.string,
  reduceMotion: PropTypes.bool.isRequired
};

const Canvas = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const [splashes, setSplashes] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);

  const handleMouseMove = useCallback((event) => {
    if (reduceMotion || window.innerWidth < 768) return;
    const splash = {
      id: `${Date.now()}-${Math.random()}`,
      x: event.clientX,
      y: event.clientY,
      color: splashColors[Math.floor(Math.random() * splashColors.length)],
      size: Math.random() * 12 + 6
    };
    setSplashes((current) => [...current.slice(-20), splash]);
  }, [reduceMotion]);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Inter', sans-serif" className="bg-[#fffef7] text-[#2d2d2d]">
      <main className="min-h-screen bg-[#fffef7] px-5 py-16 text-[#2d2d2d] sm:px-8 lg:px-16" onMouseMove={handleMouseMove}>
        <NoiseTexture opacity={0.025} blendMode="multiply" />
        <AnimatePresence>
          {splashes.map((splash) => (
            <motion.div
              key={splash.id}
              initial={{ opacity: 0.75, scale: 1 }}
              animate={{ opacity: 0, scale: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'fixed',
                left: splash.x,
                top: splash.y,
                width: splash.size,
                height: splash.size,
                borderRadius: '50%',
                background: splash.color,
                pointerEvents: 'none',
                zIndex: 9998,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </AnimatePresence>

        <section id="canvas-hero" className="mx-auto min-h-screen max-w-7xl">
          <Reveal variant="fadeUp">
          <p className="font-black uppercase tracking-[0.32em] text-[var(--color-accent)]">Open studio</p>
          <Signature name={portfolio.name} reduceMotion={Boolean(reduceMotion)} />
          <p className="mt-8 max-w-3xl text-2xl font-bold leading-9">{portfolio.tagline}</p>
          <p className="mt-8 max-w-4xl text-xl leading-9 text-[#2d2d2d]/65">{getBio(portfolio)}</p>
          <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-[#2d2d2d]/10 bg-white text-[#2d2d2d] shadow-sm" />
          </Reveal>
        </section>

        <DrawnDivider />
        <section id="canvas-materials" className="mx-auto min-h-[70vh] max-w-7xl">
          <h2 className="font-serif text-[clamp(2.5rem,6vw,6rem)] font-black">Materials</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <motion.span
                key={skill.name}
                initial="rest"
                whileHover={reduceMotion ? undefined : 'hover'}
                variants={{
                  rest: { y: 0, rotate: 0 },
                  hover: { y: -3, rotate: index % 2 ? 1 : -1 }
                }}
                className={`group relative rounded-full border border-[#2d2d2d]/10 bg-white px-5 py-3 ${['text-xl font-black', 'text-lg font-bold', 'text-base', 'text-sm'][index % 4]}`}
              >
                {skill.name}
                <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="absolute -bottom-1 h-2 text-[#b45309]" style={{ left: 16, right: 16, width: 'calc(100% - 32px)' }} aria-hidden="true">
                  <motion.path
                    d="M2 5 C25 1 70 8 98 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    variants={{ rest: { pathLength: 0 }, hover: { pathLength: 1 } }}
                    transition={{ duration: 0.35 }}
                  />
                </svg>
              </motion.span>
            ))}
          </div>
        </section>

        <DrawnDivider />
        <section id="canvas-work" className="mx-auto min-h-screen max-w-7xl">
          <h2 className="font-serif text-[clamp(2.5rem,6vw,6rem)] font-black">Selected work</h2>
          <div className="mt-8 gap-6 md:columns-2 xl:columns-3">
            {projects.map((project, index) => (
              <PhysicsSurface key={project.title} type="ripple" intensity={0.1} className="mb-6 break-inside-avoid">
                <motion.button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="block w-full rounded-[32px] border border-[#2d2d2d]/10 bg-white p-6 text-left shadow-sm"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 1.1, ease: 'easeInOut' }}
                  whileHover={reduceMotion ? undefined : { y: -6, rotate: index % 2 ? 1 : -1, boxShadow: '0 24px 60px rgba(120,75,30,0.18)', zIndex: 10 }}
                >
                <div className="mb-5 h-36 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,var(--color-accent),transparent_35%),radial-gradient(circle_at_70%_70%,var(--color-secondary),transparent_38%),var(--color-primary)] opacity-90" />
                <h3 className="text-2xl font-black">{project.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#2d2d2d]/65">{project.description}</p>
                </motion.button>
              </PhysicsSurface>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[32px] bg-[#fffef7] p-8 text-[#2d2d2d]"
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" onClick={() => setSelectedProject(null)} className="float-right rounded-full border border-black/10 p-2" aria-label="Close project lightbox">
                  <X className="h-5 w-5" />
                </button>
                <p className="font-black uppercase tracking-[0.28em] text-[var(--color-accent)]">Project study</p>
                <h3 className="mt-4 font-serif text-5xl font-black">{selectedProject.title}</h3>
                <p className="mt-6 text-lg leading-9 text-[#2d2d2d]/70">{selectedProject.description}</p>
                <p className="mt-8 font-mono text-sm text-[#2d2d2d]/55">{selectedProject.techStack}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </TemplateBase>
  );
});

Canvas.displayName = 'Canvas';

Canvas.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Canvas;
