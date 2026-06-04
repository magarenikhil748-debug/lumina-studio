import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import PhysicsSurface from '../../lib/motion/PhysicsSurface';
import Reveal from '../../lib/motion/Reveal';
import { useTemplateMotion } from '../../lib/motion/TemplateMotionContext';
import TemplateBase from '../shared/TemplateBase';
import AnimatedSection from '../shared/AnimatedSection';
import ContactRow from '../shared/ContactRow';
import GenerativeAvatar from '../shared/GenerativeAvatar';
import MagneticButton from '../shared/MagneticButton';
import NoiseTexture from '../shared/NoiseTexture';
import ProjectCard from '../shared/ProjectCard';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const SplitName = ({ name }) => {
  const reduceMotion = useReducedMotion();
  const letters = name.split('');
  return (
    <motion.h1
      className="text-[clamp(4rem,13vw,15rem)] font-black uppercase leading-[0.76] tracking-tighter text-[#111]"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.035 } } }}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <span key={`${letter}-${index}`} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={{
              hidden: reduceMotion ? { opacity: 1, y: 0 } : { y: '100%', opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
};

const EditorialBio = ({ text }) => {
  const first = String(text || '').charAt(0);
  const rest = String(text || '').slice(1);
  return (
    <p className="font-serif text-[clamp(2rem,5vw,5.8rem)] leading-[1.02]">
      <motion.span
        initial={{ scale: 0.5, rotate: -5, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="float-left mr-3 mt-2 text-[2.2em] leading-[0.7] text-[var(--color-accent)]"
      >
        {first}
      </motion.span>
      {rest}
    </p>
  );
};

EditorialBio.propTypes = {
  text: PropTypes.string
};

SplitName.propTypes = {
  name: PropTypes.string.isRequired
};

const Runway = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const { parallaxY, sectionProgress } = useTemplateMotion();
  const photoY = parallaxY['.runway-editorial-image'];
  const x = useTransform(sectionProgress, [0, 1], ['0%', '-58%']);
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Space Grotesk', Inter, sans-serif" className="bg-[#faf7f0] text-[#111]">
      <main className="overflow-hidden bg-[#faf7f0] text-[#111]">
        <NoiseTexture opacity={0.022} blendMode="multiply" />
        <section id="runway-hero" className="relative grid min-h-screen min-w-0 grid-cols-[minmax(0,1fr)] gap-8 px-5 py-16 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-16">
          <Reveal variant="slideLeft" className="min-w-0 self-end">
            <p className="mb-5 font-black uppercase tracking-[0.32em] text-[var(--color-accent)]">Portfolio editorial</p>
            <SplitName name={portfolio.name || 'Lumina'} />
            <p className="mt-8 max-w-3xl text-2xl font-black leading-9">{portfolio.tagline}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-black/10 bg-white/70 text-[#111]" />
          </Reveal>
          <motion.div style={{ y: reduceMotion ? 0 : photoY }} className="runway-editorial-image relative self-center justify-self-center">
            <div className="absolute -inset-8 bg-[var(--color-accent)]" />
            {portfolio.photoUrl ? (
              <img
                src={portfolio.photoUrl}
                alt={portfolio.name || 'Profile'}
                width="520"
                height="640"
                loading="lazy"
                className="relative h-[min(70vh,640px)] w-[min(78vw,520px)] object-cover grayscale"
              />
            ) : (
              <div className="relative grid h-[min(70vh,640px)] w-[min(78vw,520px)] place-items-center overflow-hidden bg-[#111]">
                <GenerativeAvatar name={portfolio.name} size="82%" />
              </div>
            )}
          </motion.div>
        </section>

        <AnimatedSection id="runway-about" className="relative min-h-screen px-5 py-20 sm:px-10 lg:px-16">
          <motion.div
            className="absolute inset-x-0 top-0 h-full bg-[var(--color-primary)]"
            initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <Reveal variant="rotateIn" className="relative mx-auto max-w-5xl bg-[#faf7f0] p-8 transition-colors hover:text-[var(--color-accent)]">
            <p className="text-sm font-black uppercase tracking-[0.32em]">About</p>
            <div className="mt-6"><EditorialBio text={getBio(portfolio)} /></div>
          </Reveal>
        </AnimatedSection>

        <section id="runway-work" className="relative min-h-[160vh] py-16 md:min-h-[300vh]">
          <div className="sticky top-0 overflow-hidden px-5 py-16 sm:px-10 lg:px-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-none">Work</h2>
              <MagneticButton
                href={portfolio.email ? `mailto:${portfolio.email}` : '#contact'}
                className="inline-flex rounded-full bg-[#111] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white"
              >
                Start a conversation
              </MagneticButton>
            </div>
            <motion.div style={{ x: reduceMotion ? 0 : x }} className="flex flex-col gap-6 md:w-max md:flex-row md:gap-8">
              {projects.map((project, index) => (
                <PhysicsSurface key={project.title} type="tilt" intensity={0.12} className="overflow-hidden md:w-[440px]">
                  <motion.div whileHover={reduceMotion ? undefined : { scale: 1.025 }} transition={{ duration: 0.35 }}>
                    <ProjectCard project={project} index={index} variant="runway" />
                  </motion.div>
                </PhysicsSurface>
              ))}
            </motion.div>
          </div>
        </section>

        <AnimatedSection id="runway-practice" className="min-h-[70vh] px-5 pb-24 sm:px-10 lg:px-16">
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-none">Practice</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <motion.span
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-lg font-black"
              >
                {skill.name}
              </motion.span>
            ))}
          </div>
        </AnimatedSection>
      </main>
    </TemplateBase>
  );
});

Runway.displayName = 'Runway';

Runway.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    email: PropTypes.string,
    photoUrl: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Runway;
