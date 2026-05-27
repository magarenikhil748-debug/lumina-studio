import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ContactRow, MadeWithLumina, PrintStyles, ProjectActions, bioFor, paletteStyle, portfolioShape, techPills } from './layoutShared';

const CreativeLayout = ({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const palette = portfolio.colorPalette;
  const bio = bioFor(portfolio);

  const sectionMotion = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div
      style={{
        ...paletteStyle(palette),
        background: `linear-gradient(135deg, ${palette.bg}, color-mix(in srgb, ${palette.primary} 14%, ${palette.bg}))`
      }}
      className="min-h-screen text-[var(--color-text)]"
    >
      <PrintStyles />
      <main className="mx-auto max-w-7xl px-5 py-14">
        <motion.header {...sectionMotion} className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="relative z-10 rounded-[2rem] border p-6 sm:p-10" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 12%, transparent)', background: 'color-mix(in srgb, var(--color-text) 5%, transparent)' }}>
            <p className="text-sm font-black uppercase tracking-[0.22em]" style={{ color: 'var(--color-secondary)' }}>{portfolio.title}</p>
            <h1 className="mt-5 font-display text-[clamp(3.25rem,9vw,8rem)] font-black leading-[0.88]">{portfolio.name}</h1>
            <p className="mt-6 max-w-2xl text-3xl font-black leading-tight" style={{ color: 'var(--color-accent)' }}>{portfolio.tagline}</p>
            <p className="mt-6 max-w-[62ch] text-lg leading-8 opacity-82">{bio}</p>
            <div className="mt-7"><ContactRow portfolio={portfolio} subtle /></div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2.5rem] border" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 12%, transparent)', background: `linear-gradient(145deg, ${palette.primary}66, ${palette.secondary}33)` }}>
            {portfolio.photoUrl ? (
              <img
                src={portfolio.photoUrl}
                alt={`${portfolio.name} profile`}
                width="520"
                height="620"
                loading="lazy"
                className="h-full min-h-[320px] w-full object-cover"
                style={{ clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 92%)' }}
              />
            ) : (
              <div className="grid h-full min-h-[320px] place-items-center font-display text-8xl font-black" style={{ color: 'color-mix(in srgb, var(--color-text) 70%, transparent)' }}>
                {portfolio.name?.slice(0, 1) || 'L'}
              </div>
            )}
          </div>
        </motion.header>

        <motion.section {...sectionMotion} className="py-12">
          <h2 className="font-display text-4xl font-black">{portfolio.skillsHeadline || 'Core strengths'}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {(portfolio.skills || []).map((skill, index) => (
              <span
                key={`${skill.name}-${skill.category}`}
                className="rounded-full border font-black"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-primary) 36%, transparent)',
                  padding: index % 3 === 0 ? '12px 20px' : '9px 15px',
                  fontSize: index % 3 === 0 ? '1rem' : '0.875rem',
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section {...sectionMotion}>
          <h2 className="mb-6 font-display text-4xl font-black">Selected work</h2>
          <div className="columns-1 gap-5 md:columns-2">
            {(portfolio.projects || []).map((project, index) => (
              <motion.article
                key={project.title}
                className="mb-5 break-inside-avoid rounded-[1.75rem] border p-6"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.05 }}
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-text) 12%, transparent)',
                  background: index % 2 === 0 ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'color-mix(in srgb, var(--color-secondary) 10%, transparent)'
                }}
              >
                <h3 className="text-2xl font-black">{project.title}</h3>
                <p className="mt-4 leading-8 opacity-80">{project.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {techPills(project.techStack).map((tech) => (
                    <span key={tech} className="rounded-full px-3 py-1 text-xs font-black" style={{ background: 'color-mix(in srgb, var(--color-text) 9%, transparent)' }}>{tech}</span>
                  ))}
                </div>
                <ProjectActions project={project} />
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
      <MadeWithLumina portfolio={portfolio} />
    </div>
  );
};

CreativeLayout.propTypes = {
  portfolio: PropTypes.shape(portfolioShape).isRequired
};

export default memo(CreativeLayout);
