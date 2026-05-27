import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

const ProjectCard = ({ project, palette }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      layout
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
      className="rounded-2xl border p-5 backdrop-blur-xl"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
    >
      <h3 className="font-display text-xl font-bold" style={{ color: palette.primary }}>{project.title}</h3>
      <p className="mt-3 text-sm leading-6 opacity-80">{project.description}</p>
      <p className="mt-4 text-xs font-semibold uppercase" style={{ color: palette.secondary }}>{project.techStack}</p>
      <div className="mt-5 flex gap-3">
        {project.liveUrl && <a href={project.liveUrl} className="inline-flex items-center gap-1 rounded-full text-sm" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Live</a>}
        {project.githubUrl && <a href={project.githubUrl} className="inline-flex items-center gap-1 rounded-full text-sm" target="_blank" rel="noreferrer"><Github className="h-4 w-4" /> Code</a>}
      </div>
    </motion.article>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    techStack: PropTypes.string,
    liveUrl: PropTypes.string,
    githubUrl: PropTypes.string
  }).isRequired,
  palette: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string
  }).isRequired
};

export default ProjectCard;
