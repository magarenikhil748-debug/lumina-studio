import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import TemplateBase from '../shared/TemplateBase';
import AnimatedSection from '../shared/AnimatedSection';
import ContactRow from '../shared/ContactRow';
import CursorGlow from '../shared/CursorGlow';
import NoiseTexture from '../shared/NoiseTexture';
import ProjectCard from '../shared/ProjectCard';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const Compass = () => (
  <motion.svg
    viewBox="0 0 120 120"
    className="h-28 w-28 text-[#4a90d9]"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
    aria-hidden="true"
  >
    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    <path d="M60 10 L72 60 L60 110 L48 60 Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10 60 H110 M60 10 V110" stroke="currentColor" strokeWidth="1" opacity="0.35" />
    <circle cx="60" cy="60" r="5" fill="currentColor" />
  </motion.svg>
);

const Blueprint = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const skills = clampSkills(portfolio.skills).slice(0, 10);
  const projects = clampProjects(portfolio.projects);
  const nodes = skills.map((skill, index) => ({
    ...skill,
    x: 12 + (index % 5) * 19,
    y: 20 + Math.floor(index / 5) * 34
  }));

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Space Grotesk', Inter, sans-serif" className="bg-[#0d1b2a] text-[#d9edff]">
      <main
        className="min-h-screen overflow-hidden px-5 py-16 text-[#d9edff] sm:px-8 lg:px-16"
        style={{
          backgroundColor: '#0d1b2a',
          backgroundImage: 'linear-gradient(rgba(74,144,217,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      >
        <CursorGlow color="rgba(74,144,217,0.14)" size={390} blur={62} />
        <NoiseTexture opacity={0.035} blendMode="screen" />
        <section className="mx-auto grid min-h-[82vh] max-w-7xl gap-10 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="font-mono text-sm font-black uppercase tracking-[0.34em] text-[#78b9ff]">Spec 00 - Profile</p>
            <h1 className="mt-6 text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.88] tracking-tight text-white">
              {portfolio.name}
            </h1>
            <p className="mt-6 max-w-2xl text-2xl font-bold text-[#b8ddff]">{portfolio.title}</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#d9edff]/70">{getBio(portfolio)}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-[#4a90d9]/40 bg-[#4a90d9]/10 text-[#d9edff]" />
          </div>
          <div className="grid place-items-center rounded-full border border-dashed border-[#4a90d9]/40 bg-[#4a90d9]/5 p-12">
            <Compass />
          </div>
        </section>

        <AnimatedSection className="mx-auto mt-10 max-w-7xl">
          <p className="font-mono text-sm font-black uppercase tracking-[0.34em] text-[#78b9ff]">Spec 01 - System Architecture</p>
          <div className="relative mt-8 min-h-[320px] rounded-3xl border border-dashed border-[#4a90d9]/35 bg-[#0d1b2a]/82 p-6">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {nodes.slice(0, -1).map((node, index) => {
                const next = nodes[index + 1];
                return (
                  <motion.path
                    key={`${node.name}-${next.name}`}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduceMotion ? 0 : 1.3, delay: index * 0.08, ease: 'easeInOut' }}
                    d={`M ${node.x}% ${node.y}% L ${next.x}% ${next.y}%`}
                    stroke="rgba(74,144,217,0.62)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                );
              })}
            </svg>
            {nodes.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.07 }}
                whileHover={{ y: -4, boxShadow: '0 0 24px rgba(74,144,217,0.28)' }}
                className="absolute rounded-xl border border-[#4a90d9]/45 bg-[#10243a] px-4 py-3 text-sm font-black uppercase tracking-[0.12em]"
                style={{ left: `${skill.x}%`, top: `${skill.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {skill.name}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-20 max-w-7xl">
          <p className="font-mono text-sm font-black uppercase tracking-[0.34em] text-[#78b9ff]">Spec 02 - Project Schematics</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={index}
                variant="blueprint"
                className="border-dashed before:absolute before:left-4 before:top-4 before:h-5 before:w-5 before:border-l before:border-t before:border-[#4a90d9]/70 after:absolute after:bottom-4 after:right-4 after:h-5 after:w-5 after:border-b after:border-r after:border-[#4a90d9]/70"
              />
            ))}
          </div>
        </AnimatedSection>
      </main>
    </TemplateBase>
  );
});

Blueprint.displayName = 'Blueprint';

Blueprint.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Blueprint;
