import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { plans } from '../utils/helpers';

const layoutClasses = {
  minimal: 'grid gap-8',
  bold: 'grid gap-8 lg:grid-cols-[0.82fr_1.18fr]',
  creative: 'grid gap-8 lg:grid-cols-[1.1fr_0.9fr]',
  editorial: 'grid gap-10 lg:grid-cols-[0.95fr_1.05fr]',
  premium: 'grid gap-8 lg:grid-cols-[0.88fr_1.12fr]'
};

const GeneratedPortfolio = ({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const palette = portfolio.colorPalette;
  const showWatermark = plans[portfolio.plan || 'free']?.watermark;
  const bio = portfolio.selectedBio || portfolio.bioVersions?.[0] || portfolio.bio || portfolio.bioNotes;

  return (
    <motion.div
      layout={!reduceMotion}
      className="relative min-h-full overflow-hidden rounded-2xl border border-white/[0.08] p-6 shadow-[0_0_40px_rgba(168,85,247,0.18)] sm:p-8"
      style={{ background: palette.bg, color: palette.text }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 18% 12%, ${palette.primary}55, transparent 34%), radial-gradient(circle at 88% 80%, ${palette.secondary}44, transparent 36%)` }} />
      <div className="relative">
        <div className={layoutClasses[portfolio.layout] || layoutClasses.premium}>
          <motion.header layout={!reduceMotion} className="space-y-5">
            {portfolio.photoUrl && <img loading="lazy" width="96" height="96" className="h-24 w-24 rounded-full border-2 object-cover" style={{ borderColor: palette.primary }} src={portfolio.photoUrl} alt={`${portfolio.name} profile`} />}
            <p className="text-sm font-bold uppercase" style={{ color: palette.secondary }}>{portfolio.title}</p>
            <h1 className="gradient-text font-display text-5xl font-black leading-none sm:text-6xl">{portfolio.name}</h1>
            <p className="text-2xl font-bold" style={{ color: palette.accent }}>{portfolio.tagline}</p>
            <p className="leading-7 opacity-85">{bio}</p>
            <p className="text-sm opacity-70">{portfolio.location} - {portfolio.email}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {portfolio.linkedin && <a href={portfolio.linkedin} target="_blank" rel="noreferrer" style={{ color: palette.secondary }}>LinkedIn</a>}
              {portfolio.github && <a href={portfolio.github} target="_blank" rel="noreferrer" style={{ color: palette.secondary }}>GitHub</a>}
            </div>
          </motion.header>
          <motion.main layout={!reduceMotion} className="space-y-8">
            <section>
              <h2 className="mb-4 text-xl font-bold">{portfolio.skillsHeadline || 'Core strengths'}</h2>
              <div className="flex flex-wrap gap-2">
                {(portfolio.skills || []).map((skill) => (
                  <span key={`${skill.name}-${skill.category}`} className="rounded-full border px-3 py-2 text-sm" style={{ borderColor: `${palette.primary}66` }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-4 text-xl font-bold">Selected work</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(portfolio.projects || []).map((project) => <ProjectCard key={project.title} project={project} palette={palette} />)}
              </div>
            </section>
          </motion.main>
        </div>
      </div>
      {showWatermark && (
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-xs font-bold text-white backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5" /> Built with Lumina Studio
        </div>
      )}
    </motion.div>
  );
};

GeneratedPortfolio.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    location: PropTypes.string,
    email: PropTypes.string,
    linkedin: PropTypes.string,
    github: PropTypes.string,
    photoUrl: PropTypes.string,
    bio: PropTypes.string,
    bioNotes: PropTypes.string,
    bioVersions: PropTypes.arrayOf(PropTypes.string),
    selectedBio: PropTypes.string,
    tagline: PropTypes.string,
    skillsHeadline: PropTypes.string,
    layout: PropTypes.string,
    plan: PropTypes.string,
    colorPalette: PropTypes.shape({
      primary: PropTypes.string,
      secondary: PropTypes.string,
      accent: PropTypes.string,
      bg: PropTypes.string,
      text: PropTypes.string
    }),
    skills: PropTypes.arrayOf(PropTypes.object),
    projects: PropTypes.arrayOf(PropTypes.object)
  }).isRequired
};

export default GeneratedPortfolio;
