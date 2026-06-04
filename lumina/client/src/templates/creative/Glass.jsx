import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import TemplateBase from '../shared/TemplateBase';
import AnimatedSection from '../shared/AnimatedSection';
import ContactRow from '../shared/ContactRow';
import { clampProjects, clampSkills, getBio, getInitials, getTechList } from '../shared/templateData';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
};

const skillVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
};

function BioWords({ text, reduceMotion }) {
  return (
    <p className="mt-6 max-w-3xl leading-8 text-white/58">
      {String(text || '').split(/\s+/).filter(Boolean).map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 7 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.018, 0.7), duration: 0.28 }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

BioWords.propTypes = {
  reduceMotion: PropTypes.bool.isRequired,
  text: PropTypes.string
};

const Glass = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);
  const initials = getInitials(portfolio.name);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Inter', sans-serif" className="bg-[#0f0c29] text-white">
      <main className="relative min-h-screen overflow-hidden bg-[#0f0c29] text-white">
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

        <section
          className="glass-hero relative z-10 mx-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 'clamp(32px, 5vw, 80px)',
            alignItems: 'center',
            minHeight: '100vh',
            maxWidth: '1440px',
            padding: 'clamp(80px, 10vw, 120px) clamp(24px, 8vw, 120px)'
          }}
        >
          <AnimatedSection direction="left">
            <p className="font-black uppercase tracking-[0.34em] text-[#d8b4fe]">Glass portfolio system</p>
            <h1 className="mt-6 text-[clamp(3.2rem,8vw,8rem)] font-black leading-[0.88] tracking-tight">{portfolio.name}</h1>
            <p className="mt-6 max-w-3xl text-[clamp(1.2rem,2.2vw,1.75rem)] font-bold leading-[1.35] text-white/82">{portfolio.tagline}</p>
            <BioWords text={getBio(portfolio)} reduceMotion={Boolean(reduceMotion)} />
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-white/[0.12] bg-white/[0.07] text-white backdrop-blur-xl" />
          </AnimatedSection>

          <motion.div
            className="glass-avatar"
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduceMotion ? undefined : { scale: 1.04, filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.34))' }}
            style={{
              width: 'clamp(160px, 22vw, 260px)',
              height: 'clamp(160px, 22vw, 260px)',
              borderRadius: '50%',
              position: 'relative',
              flexShrink: 0
            }}
          >
            <motion.div
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: '-3px',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #3b82f6, #a855f7)',
                padding: '3px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '3px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 42px rgba(255,255,255,0.05), 0 18px 60px rgba(0,0,0,0.35)'
              }}
            >
              {portfolio.photoUrl ? (
                <img
                  src={portfolio.photoUrl}
                  alt={portfolio.name || 'Profile'}
                  width="260"
                  height="260"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 'clamp(32px, 5vw, 64px)',
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    background: 'linear-gradient(135deg, #c084fc, #a855f7, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0'
                  }}
                >
                  {initials}
                </span>
              )}
              <div className="pointer-events-none absolute left-[18%] top-[14%] h-[28%] w-[28%] rounded-full bg-white/18 blur-xl" />
            </div>
          </motion.div>
        </section>

        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-12 sm:px-10 lg:px-16" direction="up">
          <h2 className="text-[clamp(2.5rem,7vw,6.5rem)] font-black leading-none">Capabilities</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <motion.span
                key={skill.name}
                custom={index}
                variants={skillVariants}
                initial={reduceMotion ? 'visible' : 'hidden'}
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={reduceMotion ? undefined : {
                  y: -3,
                  scale: 1.05,
                  background: 'rgba(168,85,247,0.2)',
                  boxShadow: '0 0 20px rgba(168,85,247,0.3), inset 0 0 10px rgba(168,85,247,0.1)'
                }}
                style={{
                  ...glassStyle,
                  borderRadius: '999px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                {skill.name}
              </motion.span>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-10 lg:px-16" direction="up">
          <h2 className="text-[clamp(2.5rem,7vw,6.5rem)] font-black leading-none">Selected work</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {projects.map((project, index) => (
              <motion.article
                key={project.title}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : {
                  y: -6,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(168,85,247,0.15)',
                  borderColor: 'rgba(168,85,247,0.3)'
                }}
                style={{ ...glassStyle, padding: '24px', transition: 'border-color 0.2s ease' }}
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">Project {String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight">{project.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{project.description}</p>
                {getTechList(project.techStack).length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {getTechList(project.techStack).map((item) => (
                      <span key={item} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-black text-white/80">{item}</span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-black hover:bg-white/10">
                      <ExternalLink className="h-4 w-4" /> Live
                    </a>
                  ) : null}
                  {project.githubUrl ? (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-black hover:bg-white/10">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  ) : null}
                </div>
              </motion.article>
            ))}
          </div>
        </AnimatedSection>
      </main>
    </TemplateBase>
  );
});

Glass.displayName = 'Glass';

Glass.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    photoUrl: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Glass;
