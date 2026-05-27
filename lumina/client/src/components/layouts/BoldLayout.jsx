import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { ContactRow, MadeWithLumina, PrintStyles, ProjectActions, bioFor, paletteStyle, portfolioShape, techPills } from './layoutShared';

const sectionTitleClass = 'text-xs font-black uppercase tracking-[0.28em]';

const BoldLayout = ({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const palette = portfolio.colorPalette;
  const bio = bioFor(portfolio);

  return (
    <div style={paletteStyle(palette)} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PrintStyles />
      <main>
        <section className="relative overflow-hidden px-5 py-16 sm:py-24" style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})` }}>
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <motion.div initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}>
              {portfolio.photoUrl && <img src={portfolio.photoUrl} alt={`${portfolio.name} profile`} width="128" height="128" loading="lazy" className="mb-8 h-32 w-32 rounded-3xl border border-white/25 object-cover" />}
              <p className="text-sm font-black uppercase tracking-[0.28em] text-white/70">{portfolio.title}</p>
              <h1 className="mt-5 font-display text-[clamp(3rem,8vw,8.5rem)] font-black leading-[0.86] text-white">{portfolio.name}</h1>
            </motion.div>
            <motion.div initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.55, delay: 0.08 }} className="rounded-3xl border border-white/20 bg-black/20 p-6 text-white backdrop-blur-md">
              <p className="text-3xl font-black leading-tight text-white/92">{portfolio.tagline}</p>
              <p className="mt-5 text-lg leading-8 text-white/76">{bio}</p>
              <div className="mt-6"><ContactRow portfolio={portfolio} subtle /></div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[30%_1fr]">
          <aside className="space-y-8">
            <div>
              <h2 className={sectionTitleClass} style={{ color: 'var(--color-secondary)' }}>Skills</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {(portfolio.skills || []).map((skill) => (
                  <span key={`${skill.name}-${skill.category}`} className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ background: 'color-mix(in srgb, var(--color-primary) 72%, black)' }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className={sectionTitleClass} style={{ color: 'var(--color-secondary)' }}>Contact</h2>
              <div className="mt-5"><ContactRow portfolio={portfolio} /></div>
            </div>
          </aside>

          <div>
            <h2 className={sectionTitleClass} style={{ color: 'var(--color-secondary)' }}>Projects</h2>
            <div className="mt-5 grid gap-5">
              {(portfolio.projects || []).map((project) => (
                <motion.article
                  key={project.title}
                  whileHover={reduceMotion ? undefined : { y: -6, boxShadow: `0 24px 80px ${palette.primary}22` }}
                  className="rounded-2xl border border-white/[0.08] border-t-4 bg-black/25 p-6"
                  style={{ borderTopColor: 'var(--color-accent)' }}
                >
                  <h3 className="text-3xl font-black">{project.title}</h3>
                  <p className="mt-4 max-w-3xl leading-8 opacity-80">{project.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {techPills(project.techStack).map((tech) => (
                      <span key={tech} className="rounded-full border px-3 py-1 text-xs font-black" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 16%, transparent)' }}>{tech}</span>
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

BoldLayout.propTypes = {
  portfolio: PropTypes.shape(portfolioShape).isRequired
};

export default memo(BoldLayout);
