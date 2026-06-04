import { memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
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

SplitName.propTypes = {
  name: PropTypes.string.isRequired
};

const Runway = memo(({ portfolio }) => {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 520], [0, -80]);
  const { scrollYProgress } = useScroll({ target: sectionRef });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-58%']);
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Space Grotesk', Inter, sans-serif" className="bg-[#faf7f0] text-[#111]">
      <main className="overflow-hidden bg-[#faf7f0] text-[#111]">
        <NoiseTexture opacity={0.022} blendMode="multiply" />
        <section className="relative grid min-h-screen gap-8 px-5 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
          <div className="self-end">
            <p className="mb-5 font-black uppercase tracking-[0.32em] text-[var(--color-accent)]">Portfolio editorial</p>
            <SplitName name={portfolio.name || 'Lumina'} />
            <p className="mt-8 max-w-3xl text-2xl font-black leading-9">{portfolio.tagline}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-black/10 bg-white/70 text-[#111]" />
          </div>
          <motion.div style={{ y: reduceMotion ? 0 : photoY }} className="relative self-center justify-self-center">
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

        <AnimatedSection className="relative px-5 py-20 sm:px-10 lg:px-16">
          <motion.div
            className="absolute inset-x-0 top-0 h-full bg-[var(--color-primary)]"
            initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative mx-auto max-w-5xl bg-[#faf7f0] p-8">
            <p className="text-sm font-black uppercase tracking-[0.32em]">About</p>
            <p className="mt-6 font-serif text-[clamp(2rem,5vw,5.8rem)] leading-[1.02]">{getBio(portfolio)}</p>
          </div>
        </AnimatedSection>

        <section ref={sectionRef} className="relative min-h-[160vh] py-16 md:min-h-[300vh]">
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
                <ProjectCard key={project.title} project={project} index={index} variant="runway" className="md:w-[440px]" />
              ))}
            </motion.div>
          </div>
        </section>

        <AnimatedSection className="px-5 pb-24 sm:px-10 lg:px-16">
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
