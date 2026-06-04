import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import TemplateBase from '../shared/TemplateBase';
import AnimatedSection from '../shared/AnimatedSection';
import ContactRow from '../shared/ContactRow';
import NoiseTexture from '../shared/NoiseTexture';
import ProjectCard from '../shared/ProjectCard';
import { clampProjects, clampSkills, getBio, randomFromString } from '../shared/templateData';

const CountUp = ({ end, duration = 1.8 }) => {
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setCount(end);
      return undefined;
    }
    let startTime;
    let frame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, end, reduceMotion]);

  return <span>{count}</span>;
};

CountUp.propTypes = {
  end: PropTypes.number.isRequired,
  duration: PropTypes.number
};

const SectionTitle = ({ children }) => (
  <div className="mb-8">
    <h2 className="font-mono text-sm font-black uppercase tracking-[0.24em] text-zinc-500">{children}</h2>
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      style={{ transformOrigin: 'left', height: 2, background: 'var(--color-primary)' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mt-3 w-28"
    />
  </div>
);

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired
};

const MinimalCode = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'JetBrains Mono', monospace" className="bg-[#fbfbfd] text-zinc-950">
      <main className="relative min-h-screen bg-[#fbfbfd] px-5 py-16 text-zinc-950 sm:px-8 lg:px-16">
        <NoiseTexture opacity={0.018} blendMode="multiply" />
        <div className="lumina-no-print fixed left-5 top-24 z-20 hidden h-[70vh] w-px bg-zinc-200 lg:block">
          <motion.div className="h-full w-px origin-top bg-[var(--color-primary)]" style={{ scaleY: progress }} />
          <motion.div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--color-primary)]" style={{ y: progress }} />
        </div>

        <section className="mx-auto grid max-w-7xl gap-10 border-b border-zinc-200 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="font-mono text-sm font-black text-[var(--color-primary)]">export default portfolio;</p>
            <h1 className="mt-6 text-[clamp(3rem,8vw,8rem)] font-black leading-[0.9] tracking-tight">
              {portfolio.name}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-zinc-600">{portfolio.tagline}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-zinc-200 bg-white text-zinc-700 shadow-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['projects', projects.length],
              ['skills', skills.length],
              ['exports', portfolio.exports || portfolio.exportCount || 0]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-4xl font-black"><CountUp end={Number(value)} /></p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <AnimatedSection className="mx-auto mt-16 max-w-5xl">
          <SectionTitle>About</SectionTitle>
          <p className="max-w-4xl text-xl leading-10 text-zinc-700">{getBio(portfolio)}</p>
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-20 max-w-5xl">
          <SectionTitle>Skills</SectionTitle>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-400">┌─ capability map ──────────────────────────────────────┐</p>
            <div className="mt-5 space-y-4">
              {skills.map((skill, index) => {
                const percentage = randomFromString(skill.name, 74, 96);
                return (
                  <div key={skill.name} className="grid gap-3 sm:grid-cols-[160px_1fr_48px] sm:items-center">
                    <span className="text-sm font-bold">{skill.name}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: reduceMotion ? 0 : 1, delay: index * 0.05 }}
                        className="h-full rounded-full bg-[var(--color-primary)]"
                      />
                    </div>
                    <span className="text-sm text-zinc-500">{percentage}%</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm text-zinc-400">└────────────────────────────────────────────────────────┘</p>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-20 max-w-7xl">
          <SectionTitle>Commits</SectionTitle>
          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project, index) => (
              <div key={project.title} className="relative">
                <span className="absolute left-5 top-5 z-10 rounded-full bg-zinc-950 px-3 py-1 font-mono text-xs font-black text-white">
                  #{randomFromString(project.title, 4096, 65535).toString(16).slice(0, 4)}
                </span>
                <ProjectCard project={{ ...project, title: `Added ${project.title}` }} index={index} variant="minimalcode" className="pt-14 transition group-hover:border-l-[var(--color-primary)]" />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </main>
    </TemplateBase>
  );
});

MinimalCode.displayName = 'MinimalCode';

MinimalCode.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    selectedBio: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    exports: PropTypes.number,
    exportCount: PropTypes.number,
    colorPalette: PropTypes.object
  }).isRequired
};

export default MinimalCode;
