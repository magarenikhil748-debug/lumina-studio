import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { getTechList } from './templateData';

const cardStyles = {
  terminal: 'border-[#00ff41]/20 bg-[#050508]/88 text-[#d7ffe1]',
  blueprint: 'border-[#4a90d9]/35 bg-[#0d1b2a]/76 text-[#d9edff]',
  runway: 'border-black/10 bg-white text-[#111111]',
  canvas: 'border-[#2d2d2d]/10 bg-white text-[#2d2d2d]',
  studio: 'border-black/10 bg-[#fffaf0] text-[#1c1c1e]',
  cosmos: 'border-white/10 bg-white/[0.07] text-white',
  neon: 'border-[#ff00ff]/35 bg-[#111]/84 text-white',
  glass: 'border-white/[0.12] bg-white/[0.07] text-white',
  minimalcode: 'border-zinc-200 bg-white text-zinc-950'
};

const ProjectCard = ({ project, index = 0, variant = 'glass', className = '' }) => {
  const reduceMotion = useReducedMotion();
  const tech = getTechList(project.techStack);
  const isTerminal = variant === 'terminal';
  const isNeon = variant === 'neon';

  return (
    <motion.article
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -6, rotateX: isNeon ? 3 : 0, rotateY: isNeon ? -3 : 0 }}
      className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl ${cardStyles[variant] || cardStyles.glass} ${className}`}
      style={{
        boxShadow: isNeon ? '0 0 32px rgba(255,0,255,0.14)' : undefined,
        transformStyle: 'preserve-3d'
      }}
    >
      {isTerminal && (
        <div className="mb-5 flex items-center gap-2 border-b border-[#00ff41]/10 pb-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 truncate text-xs text-[#00ff41]/55">{project.title}.sh</span>
        </div>
      )}
      {isNeon && <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:100%_6px]" />}
      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.24em] opacity-55">
          {isTerminal ? '$ cat description.txt' : `Project ${String(index + 1).padStart(2, '0')}`}
        </p>
        <h3 className="mt-3 text-2xl font-black tracking-tight">{project.title}</h3>
        <p className="mt-4 text-sm leading-7 opacity-70">{project.description}</p>
        {tech.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tech.map((item) => (
              <span key={item} className="rounded-full border border-current/12 bg-current/5 px-3 py-1 text-xs font-black opacity-85">
                {item}
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current/15 px-4 py-2 text-sm font-black hover:bg-current/10">
              <ExternalLink className="h-4 w-4" /> Live
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current/15 px-4 py-2 text-sm font-black hover:bg-current/10">
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    techStack: PropTypes.string,
    liveUrl: PropTypes.string,
    githubUrl: PropTypes.string
  }).isRequired,
  index: PropTypes.number,
  variant: PropTypes.string,
  className: PropTypes.string
};

export default ProjectCard;
