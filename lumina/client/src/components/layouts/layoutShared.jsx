import PropTypes from 'prop-types';
import { ExternalLink, Github, Linkedin, Mail, MapPin } from 'lucide-react';

export const portfolioShape = {
  id: PropTypes.string,
  _id: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  location: PropTypes.string,
  email: PropTypes.string,
  linkedin: PropTypes.string,
  github: PropTypes.string,
  photoUrl: PropTypes.string,
  selectedBio: PropTypes.string,
  bioVersions: PropTypes.arrayOf(PropTypes.string),
  tagline: PropTypes.string,
  skillsHeadline: PropTypes.string,
  layout: PropTypes.string,
  plan: PropTypes.string,
  tier: PropTypes.string,
  colorPalette: PropTypes.object,
  skills: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string
  })),
  projects: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    techStack: PropTypes.string,
    liveUrl: PropTypes.string,
    githubUrl: PropTypes.string
  }))
};

export const paletteStyle = (palette) => ({
  '--color-primary': palette.primary,
  '--color-secondary': palette.secondary,
  '--color-accent': palette.accent,
  '--color-bg': palette.bg,
  '--color-text': palette.text,
  background: 'var(--color-bg)',
  color: 'var(--color-text)'
});

export const bioFor = (portfolio) => portfolio.selectedBio || portfolio.bioVersions?.[0] || '';

export const shouldShowWatermark = (portfolio) => {
  const plan = portfolio.plan || portfolio.tier || 'free';
  return plan === 'free';
};

export const techPills = (techStack = '') => String(techStack)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export const ContactRow = ({ portfolio, subtle = false }) => (
  <div className={`flex flex-wrap items-center gap-3 text-sm font-semibold ${subtle ? 'opacity-75' : ''}`}>
    {portfolio.location && (
      <span className="inline-flex items-center gap-2">
        <MapPin className="h-4 w-4" aria-hidden="true" /> {portfolio.location}
      </span>
    )}
    {portfolio.email && (
      <a className="inline-flex items-center gap-2 hover:opacity-80" href={`mailto:${portfolio.email}`}>
        <Mail className="h-4 w-4" aria-hidden="true" /> Email
      </a>
    )}
    {portfolio.linkedin && (
      <a className="inline-flex items-center gap-2 hover:opacity-80" href={portfolio.linkedin} target="_blank" rel="noreferrer">
        <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
      </a>
    )}
    {portfolio.github && (
      <a className="inline-flex items-center gap-2 hover:opacity-80" href={portfolio.github} target="_blank" rel="noreferrer">
        <Github className="h-4 w-4" aria-hidden="true" /> GitHub
      </a>
    )}
  </div>
);

ContactRow.propTypes = {
  portfolio: PropTypes.shape(portfolioShape).isRequired,
  subtle: PropTypes.bool
};

export const ProjectActions = ({ project }) => (
  <div className="mt-5 flex flex-wrap gap-2">
    {project.liveUrl && (
      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white" style={{ background: 'var(--color-primary)' }}>
        <ExternalLink className="h-4 w-4" aria-hidden="true" /> Live Demo
      </a>
    )}
    {project.githubUrl && (
      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 18%, transparent)' }}>
        <Github className="h-4 w-4" aria-hidden="true" /> GitHub
      </a>
    )}
  </div>
);

ProjectActions.propTypes = {
  project: PropTypes.shape({
    liveUrl: PropTypes.string,
    githubUrl: PropTypes.string
  }).isRequired
};

export const MadeWithLumina = ({ portfolio }) => shouldShowWatermark(portfolio) ? (
  <footer className="lumina-watermark mx-auto max-w-6xl px-5 pb-8 text-sm">
    <a href="https://lumina.so" className="inline-flex rounded-full border px-4 py-2 font-bold" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 14%, transparent)' }}>
      Made with Lumina
    </a>
  </footer>
) : null;

MadeWithLumina.propTypes = {
  portfolio: PropTypes.shape(portfolioShape).isRequired
};

export const PrintStyles = () => (
  <style>{`
    @media print {
      .portfolio-owner-toolbar, .share-modal, .analytics-drawer, .lumina-watermark { display: none !important; }
      body { background: #fff !important; color: #111 !important; }
      a { color: #111 !important; text-decoration: underline; }
      section, article { break-inside: avoid; box-shadow: none !important; }
    }
  `}</style>
);
