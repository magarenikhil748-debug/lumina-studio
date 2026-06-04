import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ExternalLink, Github, Layers3, Sparkles } from 'lucide-react';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import PhysicsSurface from '../../lib/motion/PhysicsSurface';
import { useTemplateMotion } from '../../lib/motion/TemplateMotionContext';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import GenerativeAvatar from '../shared/GenerativeAvatar';
import MagneticButton from '../shared/MagneticButton';
import NoiseTexture from '../shared/NoiseTexture';
import ParallaxLayer from '../shared/ParallaxLayer';
import ScrollReveal from '../shared/ScrollReveal';
import { clampProjects, clampSkills, getBio, getTechList } from '../shared/templateData';

const glassStyle = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.28), inset 0 1px rgba(255,255,255,0.12)'
};

const CATEGORY_STYLES = {
  design: { color: '#f9a8d4', glow: 'rgba(236,72,153,0.25)' },
  frontend: { color: '#93c5fd', glow: 'rgba(59,130,246,0.25)' },
  backend: { color: '#86efac', glow: 'rgba(34,197,94,0.22)' },
  data: { color: '#fde68a', glow: 'rgba(245,158,11,0.22)' },
  craft: { color: '#d8b4fe', glow: 'rgba(168,85,247,0.25)' }
};

const getSkillCategory = (skill) => {
  if (skill.category && CATEGORY_STYLES[skill.category]) return skill.category;
  const name = String(skill.name || '').toLowerCase();
  if (/figma|design|brand|ux|ui|visual|motion/.test(name)) return 'design';
  if (/react|vue|css|html|javascript|typescript|frontend/.test(name)) return 'frontend';
  if (/node|api|express|mongo|sql|backend|python/.test(name)) return 'backend';
  if (/data|analytics|research|strategy/.test(name)) return 'data';
  return 'craft';
};

const GlassName = ({ name, reduceMotion }) => (
  <motion.h1
    variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.03 } } }}
    initial="hidden"
    animate="visible"
    className="mt-7 max-w-5xl text-[clamp(3rem,7.4vw,7.6rem)] font-black leading-[0.88] tracking-tight"
  >
    {String(name || 'Lumina').split('').map((letter, index) => (
      <motion.span
        key={`${letter}-${index}`}
        variants={{
          hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
        }}
        style={{ display: 'inline-block', willChange: 'transform, opacity' }}
      >
        {letter === ' ' ? '\u00a0' : letter}
      </motion.span>
    ))}
  </motion.h1>
);

GlassName.propTypes = {
  name: PropTypes.string,
  reduceMotion: PropTypes.bool.isRequired
};

const SectionHeader = ({ index, eyebrow, title, copy }) => (
  <ScrollReveal className="grid gap-5 border-t border-white/10 pt-6 md:grid-cols-[140px_1fr]">
    <div className="flex items-center gap-3 self-start text-xs font-black uppercase tracking-[0.24em] text-white/38">
      <span className="text-[#d8b4fe]">{index}</span>
      <span>{eyebrow}</span>
    </div>
    <div>
      <h2 className="max-w-3xl text-[clamp(32px,4vw,48px)] font-black leading-[1.02] tracking-tight text-white">
        {title}
      </h2>
      {copy ? <p className="mt-4 max-w-2xl text-sm leading-7 text-white/48">{copy}</p> : null}
    </div>
  </ScrollReveal>
);

SectionHeader.propTypes = {
  copy: PropTypes.string,
  eyebrow: PropTypes.string.isRequired,
  index: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

const Glass = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const { parallaxY, scrollProgress } = useTemplateMotion();
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);
  const heroY = useTransform(scrollProgress, [0, 0.24], [0, 120]);
  const heroOpacity = useTransform(scrollProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollProgress, [0, 0.24], [1, 0.96]);
  const avatarY = parallaxY['.glass-experience-avatar'];

  const categories = useMemo(() => skills.reduce((result, skill) => {
    const category = getSkillCategory(skill);
    result[category] = (result[category] || 0) + 1;
    return result;
  }, {}), [skills]);

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Inter', sans-serif" className="bg-[#080716] text-white">
      <main className="relative min-h-screen overflow-hidden bg-[#080716] text-white">
        {/* Depth 01: animated aurora atmosphere */}
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : {
            backgroundPosition: ['0% 0%', '100% 70%', '0% 0%'],
            filter: ['hue-rotate(0deg)', 'hue-rotate(22deg)', 'hue-rotate(0deg)']
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: [
              'radial-gradient(ellipse at 16% 8%, rgba(168,85,247,0.33), transparent 38%)',
              'radial-gradient(ellipse at 84% 22%, rgba(59,130,246,0.25), transparent 34%)',
              'radial-gradient(ellipse at 58% 88%, rgba(236,72,153,0.2), transparent 36%)',
              'linear-gradient(155deg, #080716 0%, #0d0a24 46%, #070713 100%)'
            ].join(','),
            backgroundSize: '145% 145%'
          }}
        />

        {/* Depth 02: technical glass grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1] opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'linear-gradient(to bottom, black, transparent 78%)'
          }}
        />

        {/* Depth 03: architectural rails */}
        <ParallaxLayer
          distance={95}
          className="pointer-events-none absolute -right-[16vw] top-[12vh] z-[2] h-[72vh] w-[48vw] rotate-[13deg] rounded-[36px] border border-white/10 bg-white/[0.025] shadow-[0_0_120px_rgba(59,130,246,0.12)] backdrop-blur-sm"
        >
          <div className="absolute inset-[12%] rounded-[24px] border border-white/[0.07]" />
          <div className="absolute bottom-[16%] left-[-18%] h-px w-[92%] bg-gradient-to-r from-transparent via-[#a855f7]/60 to-transparent" />
        </ParallaxLayer>
        <ParallaxLayer
          distance={-62}
          className="pointer-events-none absolute -left-[22vw] top-[92vh] z-[2] h-[54vh] w-[52vw] -rotate-[18deg] rounded-[40px] border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm"
        >
          <div className="absolute right-[12%] top-[-30%] h-[140%] w-px bg-gradient-to-b from-transparent via-[#ec4899]/60 to-transparent" />
        </ParallaxLayer>

        <NoiseTexture opacity={0.045} zIndex={4} />

        {/* Depth 04: hero content */}
        <section
          id="glass-hero"
          className="glass-experience-hero relative z-10 mx-auto min-h-screen max-w-[1440px]"
          style={{
            display: 'grid',
            alignItems: 'center',
            gap: 'clamp(34px, 7vw, 110px)',
            padding: 'clamp(88px, 11vw, 150px) clamp(20px, 8vw, 120px)'
          }}
        >
          <motion.div
            className="glass-experience-copy"
            style={{
              y: reduceMotion ? 0 : heroY,
              opacity: reduceMotion ? 1 : heroOpacity,
              scale: reduceMotion ? 1 : heroScale
            }}
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#d8b4fe] backdrop-blur-xl"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Living portfolio
            </motion.div>
            <GlassName name={portfolio.name} reduceMotion={Boolean(reduceMotion)} />
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.2 }}
              className="mt-7 max-w-3xl text-[clamp(1.15rem,2vw,1.7rem)] font-bold leading-[1.4] text-white/78"
            >
              {portfolio.tagline}
            </motion.p>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.3 }}
              className="mt-6 max-w-2xl text-sm leading-7 text-white/48"
            >
              {getBio(portfolio)}
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.42 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <MagneticButton
                href={portfolio.email ? `mailto:${portfolio.email}` : '#selected-work'}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#0b0919] shadow-[0_14px_44px_rgba(255,255,255,0.16)]"
              >
                Start a conversation <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
              <ContactRow portfolio={portfolio} linkClassName="border border-white/[0.12] bg-white/[0.055] text-white backdrop-blur-xl" />
            </motion.div>
          </motion.div>

          <motion.div
            className="glass-experience-avatar relative justify-self-center"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.86, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              y: reduceMotion ? 0 : avatarY,
              width: 'clamp(176px, 25vw, 330px)',
              aspectRatio: '1'
            }}
          >
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-5 rounded-full"
              style={{
                background: 'conic-gradient(from 10deg, transparent 0 22%, rgba(192,132,252,0.75) 31%, transparent 42% 64%, rgba(59,130,246,0.7) 73%, transparent 84%)',
                filter: 'blur(1px)',
                maskImage: 'radial-gradient(circle, transparent 64%, black 65%)'
              }}
            />
            <div className="absolute inset-0 rounded-full bg-[#0a0818]/60 p-[5px] shadow-[0_34px_110px_rgba(168,85,247,0.32)] backdrop-blur-2xl">
              <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20 bg-white/[0.05]">
                {portfolio.photoUrl ? (
                  <img
                    src={portfolio.photoUrl}
                    alt={portfolio.name || 'Profile'}
                    width="330"
                    height="330"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <GenerativeAvatar name={portfolio.name} size="100%" />
                )}
                <div className="pointer-events-none absolute inset-x-[18%] top-[7%] h-[22%] rounded-full bg-white/18 blur-2xl" />
              </div>
            </div>
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-8 flex items-center gap-2 rounded-xl border border-white/12 bg-[#100d24]/70 px-4 py-3 text-xs font-bold text-white/70 shadow-2xl backdrop-blur-2xl"
            >
              <Layers3 className="h-4 w-4 text-[#c084fc]" />
              Multidisciplinary
            </motion.div>
          </motion.div>
        </section>

        {/* Depth 05: foreground edge panes */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[6vw] top-[92vh] z-20 h-24 w-px bg-gradient-to-b from-[#c084fc]/80 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[7vw] top-[120vh] z-20 h-px w-[18vw] bg-gradient-to-l from-[#60a5fa]/70 to-transparent" />

        <section id="glass-capabilities" className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-10 lg:px-16">
          <SectionHeader
            index="01"
            eyebrow="Capabilities"
            title="A practice built across disciplines."
            copy={`${skills.length} capabilities arranged as a connected system, not a flat list.`}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
            <ScrollReveal
              direction="right"
              className="rounded-[20px] p-6"
              style={glassStyle}
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/36">Capability map</p>
              <div className="mt-8 space-y-4">
                {Object.entries(categories).map(([category, count], index) => {
                  const categoryStyle = CATEGORY_STYLES[category];
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-xs font-bold capitalize text-white/56">
                        <span>{category}</span>
                        <span>{String(count).padStart(2, '0')}</span>
                      </div>
                      <div className="mt-2 h-px overflow-hidden bg-white/[0.07]">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: reduceMotion ? 0 : 0.7, delay: index * 0.08 }}
                          style={{
                            height: '100%',
                            transformOrigin: 'left',
                            background: `linear-gradient(90deg, ${categoryStyle.color}, transparent)`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.08} className="flex content-start flex-wrap gap-3">
              {skills.map((skill, index) => {
                const category = getSkillCategory(skill);
                const categoryStyle = CATEGORY_STYLES[category];
                return (
                  <MagneticButton
                    key={skill.name}
                    strength={0.13}
                    data-magnetic="true"
                    data-cursor-variant="hover"
                    aria-label={`${skill.name}, ${category} capability`}
                    className="rounded-full px-4 py-2 text-sm font-bold"
                    style={{
                      ...glassStyle,
                      color: categoryStyle.color,
                      borderColor: `${categoryStyle.color}35`,
                      boxShadow: `0 8px 28px rgba(0,0,0,0.2), 0 0 22px ${categoryStyle.glow}`,
                      cursor: 'default'
                    }}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.035 }}
                    whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                    whileFocus={reduceMotion ? undefined : {
                      scale: 1.05,
                      boxShadow: `0 0 34px ${categoryStyle.glow}`
                    }}
                  >
                    {skill.name}
                  </MagneticButton>
                );
              })}
            </ScrollReveal>
          </div>
        </section>

        <section id="selected-work" className="relative z-10 mx-auto max-w-7xl px-5 pb-28 pt-16 sm:px-10 lg:px-16">
          <SectionHeader
            index="02"
            eyebrow="Selected work"
            title="Projects with their own atmosphere."
            copy="Each project is presented as a distinct chapter while staying inside one visual world."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {projects.map((project, index) => {
              const tech = getTechList(project.techStack);
              return (
                <ScrollReveal key={project.title} delay={index * 0.07} direction={index % 2 ? 'left' : 'right'}>
                  <PhysicsSurface type="tilt" intensity={0.28}>
                    <motion.article
                      data-magnetic="true"
                      data-cursor-variant="hover"
                      whileHover={reduceMotion ? undefined : { y: -7, borderColor: 'rgba(192,132,252,0.35)' }}
                      className="group relative overflow-hidden rounded-[24px] p-1"
                      style={glassStyle}
                    >
                    <div
                      className="relative min-h-[210px] overflow-hidden rounded-[20px] border border-white/[0.08] p-6"
                      style={{
                        background: `radial-gradient(circle at ${index % 2 ? '80%' : '20%'} 20%, ${index % 2 ? 'rgba(59,130,246,0.3)' : 'rgba(168,85,247,0.3)'}, transparent 46%), linear-gradient(145deg, rgba(255,255,255,0.06), rgba(7,7,18,0.5))`
                      }}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-white/38">
                          Project {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[clamp(3.8rem,8vw,7rem)] font-black leading-none text-white/[0.055]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="relative -mt-4 max-w-md text-[clamp(1.6rem,3vw,2.5rem)] font-black leading-[1.05] tracking-tight">
                        {project.title}
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-sm leading-7 text-white/58">{project.description}</p>
                      {tech.length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {tech.map((item) => (
                            <span key={item} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-black text-white/58">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {project.liveUrl ? (
                          <MagneticButton
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-xs font-black text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Live
                          </MagneticButton>
                        ) : null}
                        {project.githubUrl ? (
                          <MagneticButton
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-xs font-black text-white"
                          >
                            <Github className="h-3.5 w-3.5" /> GitHub
                          </MagneticButton>
                        ) : null}
                      </div>
                    </div>
                    </motion.article>
                  </PhysicsSurface>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <ScrollReveal id="glass-contact" className="relative z-10 mx-auto max-w-7xl px-5 pb-28 sm:px-10 lg:px-16">
          <div className="grid gap-8 rounded-[28px] p-7 md:grid-cols-[1fr_auto] md:items-end md:p-10" style={glassStyle}>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d8b4fe]">Next chapter</p>
              <h2 className="mt-4 max-w-2xl text-[clamp(32px,4vw,48px)] font-black leading-[1.02] tracking-tight">
                Let&apos;s make the work impossible to ignore.
              </h2>
            </div>
            <MagneticButton
              href={portfolio.email ? `mailto:${portfolio.email}` : '#'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-[#090817]"
            >
              Get in touch <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </ScrollReveal>

        <style>{`
          .glass-experience-hero {
            grid-template-areas: "copy avatar";
            grid-template-columns: minmax(0, 1fr) auto;
          }
          .glass-experience-copy { grid-area: copy; }
          .glass-experience-avatar { grid-area: avatar; }
          .glass-experience-copy {
            min-width: 0;
            max-width: 100%;
          }
          .glass-experience-copy a {
            max-width: 100%;
          }
          .glass-experience-copy a span {
            min-width: 0;
            overflow-wrap: anywhere;
          }
          @media (max-width: 760px) {
            .glass-experience-hero {
              grid-template-areas: "avatar" "copy";
              grid-template-columns: minmax(0, 1fr);
              align-content: center;
              max-width: 100vw;
              overflow: hidden;
            }
            .glass-experience-avatar { margin-bottom: 12px; }
            .glass-experience-copy {
              width: calc(100vw - 40px);
              overflow: hidden;
            }
          }
        `}</style>
      </main>
    </TemplateBase>
  );
});

Glass.displayName = 'Glass';

Glass.propTypes = {
  portfolio: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
    tagline: PropTypes.string,
    photoUrl: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Glass;
