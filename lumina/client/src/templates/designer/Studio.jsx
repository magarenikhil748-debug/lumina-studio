import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useInView, useReducedMotion, useTransform } from 'framer-motion';
import PhysicsSurface from '../../lib/motion/PhysicsSurface';
import Reveal from '../../lib/motion/Reveal';
import { useTemplateMotion } from '../../lib/motion/TemplateMotionContext';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import NoiseTexture from '../shared/NoiseTexture';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const CountUp = ({ end }) => {
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setCount(end);
      return undefined;
    }
    let frame;
    let start;
    const tick = (time) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / 1400, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, reduceMotion]);

  return <span>{count}</span>;
};

CountUp.propTypes = {
  end: PropTypes.number.isRequired
};

const FilmGrain = () => {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return undefined;
    const context = canvas.getContext('2d', { alpha: true });
    let frame;
    let visible = !document.hidden;
    const render = () => {
      if (visible) {
        const image = context.createImageData(canvas.width, canvas.height);
        for (let index = 0; index < image.data.length; index += 4) {
          const shade = Math.random() * 255;
          image.data[index] = shade;
          image.data[index + 1] = shade;
          image.data[index + 2] = shade;
          image.data[index + 3] = 28;
        }
        context.putImageData(image, 0, 0);
      }
      frame = requestAnimationFrame(render);
    };
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(render);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return <canvas ref={canvasRef} width="160" height="90" className="pointer-events-none fixed inset-0 z-30 h-full w-full opacity-[0.11] mix-blend-overlay" style={{ imageRendering: 'pixelated' }} aria-hidden="true" />;
};

const ParallaxSection = ({ children, speed = 0.5, className = '', id }) => {
  const reduceMotion = useReducedMotion();
  const { sectionProgress } = useTemplateMotion();
  const y = useTransform(sectionProgress, [0, 1], [-speed * 100, speed * 100]);

  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y: reduceMotion ? 0 : y }}>{children}</motion.div>
    </section>
  );
};

ParallaxSection.propTypes = {
  children: PropTypes.node.isRequired,
  speed: PropTypes.number,
  className: PropTypes.string,
  id: PropTypes.string
};

const RevealTitle = ({ children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden">
      <motion.h2
        initial={reduceMotion ? { opacity: 0 } : { opacity: 1, y: '110%' }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0.1 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.86] tracking-tight"
      >
        {children}
      </motion.h2>
    </div>
  );
};

RevealTitle.propTypes = {
  children: PropTypes.node.isRequired
};

const SectionWatcher = ({ id, setActive, children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-35% 0px -55% 0px' });
  useEffect(() => {
    if (inView) setActive(id);
  }, [id, inView, setActive]);
  return <div ref={ref}>{children}</div>;
};

SectionWatcher.propTypes = {
  id: PropTypes.string.isRequired,
  setActive: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

const Studio = memo(({ portfolio }) => {
  const [active, setActive] = useState('profile');
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills);
  const nav = [
    ['profile', 'Profile'],
    ['capabilities', 'Capabilities'],
    ['work', 'Work']
  ];

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Space Grotesk', Inter, sans-serif" className="bg-[#f5f5f0] text-[#1c1c1e]">
      <main className="relative bg-[#f5f5f0] text-[#1c1c1e]">
        <NoiseTexture opacity={0.025} blendMode="multiply" />
        <FilmGrain />
        <style>{`
          .studio-film-card::before,
          .studio-film-card::after {
            content: "";
            position: absolute;
            z-index: 3;
            left: 0;
            right: 0;
            height: 18px;
            background: #080808;
            transform: scaleY(0);
            transition: transform .22s ease;
          }
          .studio-film-card::before { top: 0; transform-origin: top; }
          .studio-film-card::after { bottom: 0; transform-origin: bottom; }
          .studio-film-card:hover::before,
          .studio-film-card:hover::after { transform: scaleY(1); }
        `}</style>
        <nav className="lumina-no-print fixed left-1/2 top-4 z-40 flex -translate-x-1/2 gap-2 rounded-full border border-black/10 bg-[#f5f5f0]/80 p-2 shadow-sm backdrop-blur-xl">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${active === id ? 'bg-[#1c1c1e] text-white' : 'text-[#1c1c1e]/45'}`}>
              {label}
            </a>
          ))}
        </nav>

        <SectionWatcher id="profile" setActive={setActive}>
          <ParallaxSection speed={0.2} className="studio-background grid min-h-screen place-items-center bg-[#080808] px-5 py-24 text-white sm:px-10 lg:px-16" id="profile">
            <Reveal variant="filmGrain" className="mx-auto max-w-7xl">
              <p className="font-black uppercase tracking-[0.34em] text-[var(--color-accent)]">Independent studio</p>
              <h1 className="mt-6 max-w-6xl text-[clamp(4rem,12vw,13rem)] font-black uppercase leading-[0.78] tracking-tighter">
                {portfolio.name}
              </h1>
              <p className="mt-8 max-w-3xl text-2xl font-bold leading-9">{portfolio.tagline}</p>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  ['Projects', projects.length],
                  ['Skills', skills.length],
                  ['Years', Math.max(1, Math.ceil(projects.length * 1.5))]
                ].map(([label, value]) => (
                  <div key={label} className="border-t-2 border-white/30 pt-5">
                    <p className="text-6xl font-black"><CountUp end={Number(value)} /></p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-white/48">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </ParallaxSection>
        </SectionWatcher>

        <SectionWatcher id="capabilities" setActive={setActive}>
          <ParallaxSection speed={0.25} className="min-h-screen px-5 py-24 sm:px-10 lg:px-16" id="capabilities">
            <div className="studio-midground mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <RevealTitle>Profile and capability</RevealTitle>
              <div>
                <p className="text-2xl leading-10 text-[#1c1c1e]/70">{getBio(portfolio)}</p>
                <div className="mt-10 flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <motion.span
                      key={skill.name}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em]"
                    >
                      {skill.name}
                    </motion.span>
                  ))}
                </div>
                <ContactRow portfolio={portfolio} className="mt-10" linkClassName="border border-black/10 bg-white text-[#1c1c1e]" />
              </div>
            </div>
          </ParallaxSection>
        </SectionWatcher>

        <SectionWatcher id="work" setActive={setActive}>
          <section id="work" className="px-5 py-24 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
              <RevealTitle>Award-style work</RevealTitle>
              <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
                {projects.map((project, index) => (
                  <PhysicsSurface key={project.title} type="ripple" intensity={0.2}>
                    <motion.article
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06, duration: 0.9 }}
                      className="studio-film-card group relative overflow-hidden py-10"
                    >
                    <span className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 text-[11rem] font-black leading-none text-[#1c1c1e]/5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="relative grid gap-6 lg:grid-cols-[0.3fr_0.7fr] lg:items-center">
                      <p className="font-black uppercase tracking-[0.28em] text-[var(--color-accent)]">Entry {String(index + 1).padStart(2, '0')}</p>
                      <div>
                        <h3 className="text-4xl font-black">{project.title}</h3>
                        <p className="mt-4 max-w-3xl leading-8 text-[#1c1c1e]/64">{project.description}</p>
                        <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#1c1c1e]/38">{project.techStack}</p>
                      </div>
                    </div>
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 w-full origin-left bg-[var(--color-accent)]"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 0.2 }}
                      whileHover={{ scaleX: 1 }}
                    />
                    </motion.article>
                  </PhysicsSurface>
                ))}
              </div>
            </div>
          </section>
        </SectionWatcher>
      </main>
    </TemplateBase>
  );
});

Studio.displayName = 'Studio';

Studio.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Studio;
