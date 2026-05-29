import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import ProjectCard from '../shared/ProjectCard';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const GlitchText = ({ text }) => {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      window.setTimeout(() => setGlitching(false), 200);
    };
    const interval = window.setInterval(trigger, 3200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <h1 className="text-[clamp(3.5rem,10vw,10rem)] font-black uppercase leading-[0.82] tracking-tight text-white" style={{ textShadow: glitching ? '3px 0 #ff00ff, -3px 0 #00ffff' : '0 0 30px rgba(255,0,255,0.5)' }}>
        {text}
      </h1>
      {glitching && (
        <>
          <h1 className="absolute left-0 top-0 text-[clamp(3.5rem,10vw,10rem)] font-black uppercase leading-[0.82] tracking-tight text-[#ff00ff] opacity-70" style={{ clipPath: 'inset(20% 0 60% 0)', transform: 'translateX(-3px)' }}>{text}</h1>
          <h1 className="absolute left-0 top-0 text-[clamp(3.5rem,10vw,10rem)] font-black uppercase leading-[0.82] tracking-tight text-[#00ffff] opacity-70" style={{ clipPath: 'inset(60% 0 20% 0)', transform: 'translateX(3px)' }}>{text}</h1>
        </>
      )}
    </div>
  );
};

GlitchText.propTypes = {
  text: PropTypes.string.isRequired
};

const NeonHeading = ({ children }) => (
  <motion.h2
    className="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase leading-none text-white"
    animate={{
      textShadow: [
        '0 0 10px #ff00ff, 0 0 20px #ff00ff',
        '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
        '0 0 10px #ff00ff, 0 0 20px #ff00ff'
      ]
    }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    {children}
  </motion.h2>
);

NeonHeading.propTypes = {
  children: PropTypes.node.isRequired
};

const Neon = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills).slice(0, 12);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Space Grotesk', Inter, sans-serif" className="bg-[#0d0d0d] text-white">
      <motion.main
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 1, 0.82, 1] }}
        transition={{ duration: 0.7 }}
        className="relative min-h-screen overflow-hidden bg-[#0d0d0d] px-5 py-16 text-white sm:px-8 lg:px-16"
      >
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:100%_5px]" />
        <section className="relative z-10 mx-auto grid min-h-[86vh] max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="font-mono text-sm font-black uppercase tracking-[0.34em] text-[#00ffff]">System online</p>
            <GlitchText text={portfolio.name || 'Lumina'} />
            <p className="mt-6 max-w-3xl text-2xl font-bold leading-9 text-[#f5d0fe]">{portfolio.tagline}</p>
            <p className="mt-6 max-w-3xl leading-8 text-white/58">{getBio(portfolio)}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-[#00ffff]/35 bg-[#00ffff]/8 text-white shadow-[0_0_18px_rgba(0,255,255,0.16)]" />
          </div>
          <div className="relative h-[440px] overflow-hidden rounded-[40px] border border-[#ff00ff]/35 bg-[#120012]">
            <div
              className="absolute inset-x-[-20%] bottom-[-20%] h-[70%]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,0,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.28) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                transform: 'perspective(500px) rotateX(45deg)',
                transformOrigin: 'bottom'
              }}
            />
            <motion.div animate={reduceMotion ? undefined : { y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute left-8 top-8 rounded-3xl border border-[#00ffff]/30 bg-black/40 p-6 shadow-[0_0_40px_rgba(0,255,255,0.2)] backdrop-blur-xl">
              <p className="font-mono text-xs text-[#00ffff]">ACCESS.GRANTED</p>
              <p className="mt-3 text-3xl font-black">{portfolio.title}</p>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 mx-auto mt-16 max-w-7xl">
          <NeonHeading>Circuit skills</NeonHeading>
          <div className="relative mt-10 min-h-[260px] rounded-[36px] border border-[#00ffff]/20 bg-white/[0.035] p-6">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {skills.slice(0, -1).map((skill, index) => (
                <motion.path
                  key={`${skill.name}-${index}`}
                  d={`M ${12 + (index % 6) * 15}% ${24 + Math.floor(index / 6) * 42}% L ${12 + ((index + 1) % 6) * 15}% ${24 + Math.floor((index + 1) / 6) * 42}%`}
                  stroke="rgba(0,255,255,0.45)"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, pathOffset: 1 }}
                  whileInView={{ pathLength: 1, pathOffset: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: reduceMotion ? 0 : 1.2, delay: index * 0.06 }}
                />
              ))}
            </svg>
            {skills.map((skill, index) => (
              <motion.span
                key={skill.name}
                className="absolute rounded-full border border-[#ff00ff]/45 bg-[#ff00ff]/12 px-4 py-2 text-sm font-black text-white shadow-[0_0_22px_rgba(255,0,255,0.25)]"
                style={{ left: `${12 + (index % 6) * 15}%`, top: `${24 + Math.floor(index / 6) * 42}%`, transform: 'translate(-50%, -50%)' }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 36px rgba(255,0,255,0.55)' }}
              >
                {skill.name}
              </motion.span>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto mt-20 max-w-7xl">
          <NeonHeading>Holograms</NeonHeading>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} variant="neon" />)}
          </div>
        </section>
      </motion.main>
    </TemplateBase>
  );
});

Neon.displayName = 'Neon';

Neon.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    tagline: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Neon;
