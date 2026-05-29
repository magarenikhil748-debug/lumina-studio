import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import ProjectCard from '../shared/ProjectCard';
import SkillTag from '../shared/SkillTag';
import { clampProjects, clampSkills, getBio, getPhotoUrl } from '../shared/templateData';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 28,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
};

const Glass = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08, delayChildren: reduceMotion ? 0 : 0.18 } }
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Inter', sans-serif" className="bg-[#0f0c29] text-white">
      <main className="relative min-h-screen overflow-hidden bg-[#0f0c29] px-5 py-16 text-white sm:px-8 lg:px-16">
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : {
            background: [
              'radial-gradient(ellipse at 0% 0%, rgba(168,85,247,0.4) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.2) 0%, transparent 70%)',
              'radial-gradient(ellipse at 100% 0%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(236,72,153,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.2) 0%, transparent 70%)',
              'radial-gradient(ellipse at 50% 100%, rgba(236,72,153,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.2) 0%, transparent 70%)',
              'radial-gradient(ellipse at 0% 0%, rgba(168,85,247,0.4) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.2) 0%, transparent 70%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="fixed inset-0 z-0"
        />
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            aria-hidden="true"
            animate={reduceMotion ? undefined : { y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 8 + index * 2, repeat: Infinity, ease: 'easeInOut', delay: index * 1.5 }}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: [300, 200, 250, 180, 220][index],
              height: [300, 200, 250, 180, 220][index],
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              left: ['10%', '70%', '40%', '20%', '80%'][index],
              top: ['20%', '10%', '60%', '80%', '50%'][index],
              zIndex: 0
            }}
          />
        ))}

        <motion.section
          className="relative z-10 mx-auto grid min-h-[84vh] max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <p className="font-black uppercase tracking-[0.34em] text-[#d8b4fe]">Glass portfolio system</p>
            <h1 className="mt-6 text-[clamp(3.4rem,9vw,9rem)] font-black leading-[0.86] tracking-tight">{portfolio.name}</h1>
            <p className="mt-6 max-w-3xl text-2xl font-bold leading-9 text-white/82">{portfolio.tagline}</p>
            <p className="mt-6 max-w-3xl leading-8 text-white/58">{getBio(portfolio)}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-white/[0.12] bg-white/[0.07] text-white backdrop-blur-xl" />
          </motion.div>

          <motion.div variants={itemVariants} className="relative mx-auto">
            <motion.div
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, var(--color-primary), var(--color-secondary), var(--color-accent), var(--color-primary))' }}
            />
            <motion.div whileHover={reduceMotion ? undefined : { scale: 1.04, boxShadow: '0 0 70px rgba(168,85,247,0.42)' }} className="relative rounded-full p-4" style={glassStyle}>
              <img
                src={getPhotoUrl(portfolio)}
                alt={portfolio.name || 'Profile'}
                width="420"
                height="420"
                loading="lazy"
                className="h-[min(72vw,420px)] w-[min(72vw,420px)] rounded-full object-cover"
              />
              <div className="pointer-events-none absolute left-10 top-10 h-28 w-28 rounded-full bg-white/20 blur-xl" />
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          className="relative z-10 mx-auto mt-16 max-w-7xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-[clamp(2.5rem,7vw,7rem)] font-black leading-none">Capabilities</motion.h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {skills.map((skill, index) => <SkillTag key={skill.name} skill={skill} index={index} variant="glass" />)}
          </div>
        </motion.section>

        <motion.section
          className="relative z-10 mx-auto mt-20 max-w-7xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-[clamp(2.5rem,7vw,7rem)] font-black leading-none">Selected work</motion.h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} variant="glass" />)}
          </div>
        </motion.section>
      </main>
    </TemplateBase>
  );
});

Glass.displayName = 'Glass';

Glass.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Glass;
