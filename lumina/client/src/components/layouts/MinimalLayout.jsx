import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ContactRow, MadeWithLumina, PrintStyles, ProjectActions, bioFor, paletteStyle, portfolioShape, techPills } from './layoutShared';

const MinimalLayout = ({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const palette = portfolio.colorPalette;
  const bio = bioFor(portfolio);

  return (
    <div style={paletteStyle(palette)} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PrintStyles />
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <motion.header
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="border-b pb-12"
          style={{ borderColor: 'color-mix(in srgb, var(--color-text) 14%, transparent)' }}
        >
          {portfolio.photoUrl && (
            <img src={portfolio.photoUrl} alt={`${portfolio.name} profile`} width="112" height="112" loading="lazy" className="mb-8 h-28 w-28 rounded-full object-cover" />
          )}
          <p className="text-sm font-black uppercase tracking-[0.22em]" style={{ color: 'var(--color-secondary)' }}>{portfolio.title}</p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.9]">{portfolio.name}</h1>
          <p className="mt-6 max-w-3xl text-2xl font-black leading-tight" style={{ color: 'var(--color-accent)' }}>{portfolio.tagline}</p>
          <p className="mt-8 max-w-[65ch] font-display text-2xl leading-[1.8] opacity-85">{bio}</p>
          <div className="mt-7"><ContactRow portfolio={portfolio} subtle /></div>
        </motion.header>

        <section className="grid gap-14 py-14">
          <div>
            <h2 className="mb-5 font-display text-3xl font-black">{portfolio.skillsHeadline || 'Core strengths'}</h2>
            <div className="flex flex-wrap gap-2">
              {(portfolio.skills || []).map((skill) => (
                <span key={`${skill.name}-${skill.category}`} className="rounded-full border px-4 py-2 text-sm font-bold" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 16%, transparent)' }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 font-display text-3xl font-black">Selected work</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {(portfolio.projects || []).map((project) => (
                <motion.article
                  key={project.title}
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                  className="rounded-2xl border p-6 transition"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-text) 14%, transparent)', background: 'color-mix(in srgb, var(--color-text) 4%, transparent)' }}
                >
                  <h3 className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>{project.title}</h3>
                  <p className="mt-4 leading-8 opacity-78">{project.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {techPills(project.techStack).map((tech) => (
                      <span key={tech} className="rounded-full px-3 py-1 text-xs font-black" style={{ background: 'color-mix(in srgb, var(--color-secondary) 18%, transparent)' }}>{tech}</span>
                    ))}
                  </div>
                  <ProjectActions project={project} />
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MadeWithLumina portfolio={portfolio} />
    </div>
  );
};

MinimalLayout.propTypes = {
  portfolio: PropTypes.shape(portfolioShape).isRequired
};

export default memo(MinimalLayout);
