import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import PhysicsSurface from '../../lib/motion/PhysicsSurface';
import Reveal from '../../lib/motion/Reveal';
import { useTemplateMotion } from '../../lib/motion/TemplateMotionContext';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import NoiseTexture from '../shared/NoiseTexture';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const SpatialProjectCard = ({ project, index, reduceMotion }) => (
  <Reveal variant="scaleIn">
    <div className="spatial-card min-h-[300px] [perspective:1100px]" data-cursor-variant="hover">
      <div className="spatial-card-inner relative min-h-[300px] w-full transition-transform duration-500 [transform-style:preserve-3d]">
        <div
          className="absolute inset-0 grid place-items-center rounded-[44px] border border-white/12 p-8 text-center shadow-[0_0_80px_rgba(168,85,247,0.18)] [backface-visibility:hidden]"
          style={{ background: `radial-gradient(circle at 30% 25%, ${index % 2 ? '#3b82f6' : '#a855f7'}55, transparent 46%), rgba(255,255,255,0.045)` }}
        >
          <span className="text-xs font-black uppercase tracking-[0.28em] text-white/42">Orbit {String(index + 1).padStart(2, '0')}</span>
          <h3 className="mt-5 text-3xl font-black">{project.title}</h3>
        </div>
        <div className="absolute inset-0 grid place-items-center rounded-[44px] border border-[#f0abfc]/25 bg-[#100629]/90 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <p className="text-sm leading-7 text-white/64">{project.description}</p>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#f0abfc]">{project.techStack}</p>
          </div>
        </div>
      </div>
    </div>
    {reduceMotion ? <style>{`.spatial-card:hover .spatial-card-inner { transform: none; }`}</style> : null}
  </Reveal>
);

SpatialProjectCard.propTypes = {
  index: PropTypes.number.isRequired,
  project: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    techStack: PropTypes.string
  }).isRequired,
  reduceMotion: PropTypes.bool.isRequired
};

const Cosmos = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const { scrollProgress } = useTemplateMotion();
  const [visible, setVisible] = useState(!document.hidden);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const layer1 = useTransform(scrollProgress, [0, 1], [0, -50]);
  const layer2 = useTransform(scrollProgress, [0, 1], [0, -100]);
  const layer3 = useTransform(scrollProgress, [0, 1], [0, -200]);
  const projects = clampProjects(portfolio.projects);
  const skills = clampSkills(portfolio.skills).slice(0, 8);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const stars = useMemo(() => Array.from({ length: isMobile ? 75 : 150 }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2
  })), [isMobile]);

  const nodes = skills.map((skill, index) => ({
    ...skill,
    x: 12 + (index % 4) * 25,
    y: 24 + Math.floor(index / 4) * 50
  }));

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'Space Grotesk', Inter, sans-serif" className="bg-[#03001c] text-white">
      <main className="relative min-h-screen overflow-hidden bg-[#03001c] px-5 py-16 text-white sm:px-8 lg:px-16">
        <NoiseTexture opacity={0.04} blendMode="screen" />
        <div className="pointer-events-none fixed inset-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              animate={!visible || reduceMotion ? undefined : { opacity: [1, 0.2, 1] }}
              transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                borderRadius: '50%',
                background: 'white',
                opacity: 0.8,
                willChange: 'opacity'
              }}
            />
          ))}
        </div>
        {[0, 120, 240].map((startDeg, index) => (
          <motion.div
            key={startDeg}
            aria-hidden="true"
            animate={!visible || reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 20 + index * 5, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none fixed left-1/2 top-1/2 h-[600px] w-[600px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${['rgba(168,85,247,0.15)', 'rgba(59,130,246,0.15)', 'rgba(236,72,153,0.1)'][index]}, transparent 65%)`,
              transformOrigin: 'center center',
              translate: '-50% -50%',
              rotate: `${startDeg}deg`
            }}
          />
        ))}

        <section id="cosmos-hero" className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <motion.div style={{ y: reduceMotion ? 0 : layer1 }}>
            <Reveal variant="scaleIn">
            <p className="font-black uppercase tracking-[0.34em] text-[#f0abfc]">Deep space portfolio</p>
            <h1 className="mt-6 text-[clamp(3.5rem,10vw,10rem)] font-black leading-[0.84] tracking-tight">
              {portfolio.name}
            </h1>
            <p className="mt-6 max-w-3xl text-2xl font-bold leading-9 text-white/78">{portfolio.tagline}</p>
            <p className="mt-6 max-w-3xl leading-8 text-white/55">{getBio(portfolio)}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-white/10 bg-white/[0.06] text-white" />
            </Reveal>
          </motion.div>
          <PhysicsSurface type="tilt" intensity={0.22}>
          <motion.div style={{ y: reduceMotion ? 0 : layer2, transformStyle: 'preserve-3d' }} className="cosmos-constellation relative min-h-[420px] rounded-full border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_90px_rgba(168,85,247,0.18)] backdrop-blur-xl">
            {[
              { className: 'left-[14%] top-[18%] h-16 w-16 border-[#a855f7]/50', rotate: [0, 360, 180] },
              { className: 'right-[12%] top-[22%] h-20 w-20 rounded-full border-[#3b82f6]/50', rotate: [0, -360, -180] },
              { className: 'bottom-[14%] left-[42%] h-14 w-14 rotate-45 border-[#ec4899]/50', rotate: [45, 405, 225] }
            ].map((shape, index) => (
              <motion.div
                key={index}
                animate={reduceMotion ? undefined : { rotateX: shape.rotate, rotateY: shape.rotate.slice().reverse() }}
                transition={{ duration: 12 + index * 4, repeat: Infinity, ease: 'linear' }}
                className={`spatial-shape pointer-events-none absolute border ${shape.className}`}
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
              />
            ))}
            <svg className="cosmos-constellation-lines absolute inset-0 h-full w-full" aria-hidden="true">
              {nodes.slice(0, -1).map((node, index) => {
                const next = nodes[index + 1];
                return (
                  <motion.path
                    key={`${node.name}-${next.name}`}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduceMotion ? 0 : 1.4, delay: index * 0.08 }}
                    d={`M ${node.x}% ${node.y}% L ${next.x}% ${next.y}%`}
                    stroke="rgba(255,255,255,0.28)"
                    fill="none"
                  />
                );
              })}
            </svg>
            {nodes.map((skill, index) => (
              <motion.span
                key={skill.name}
                className="cosmos-skill-node absolute max-w-[128px] rounded-full bg-white px-3 py-1 text-center text-xs font-black leading-tight text-[#03001c] shadow-[0_0_24px_rgba(255,255,255,0.45)]"
                style={{
                  left: `${skill.x}%`,
                  top: `${skill.y}%`,
                  transform: `translate(-50%, -50%) translateZ(${24 - index * 4}px)`,
                  filter: index > 5 ? 'blur(0.5px) saturate(0.7)' : 'none'
                }}
                whileHover={{ scale: 1.12, boxShadow: '0 0 34px rgba(236,72,153,0.55)' }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                {skill.name}
              </motion.span>
            ))}
          </motion.div>
          </PhysicsSurface>
        </section>

        <motion.section id="cosmos-work" style={{ y: reduceMotion ? 0 : layer3 }} className="relative z-10 mx-auto min-h-screen max-w-7xl pt-16">
          <h2 className="text-[clamp(2.5rem,7vw,7rem)] font-black leading-none">Orbiting work</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                animate={!visible || reduceMotion ? undefined : { y: [0, -15, 0], rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut' }}
              >
                <SpatialProjectCard project={project} index={index} reduceMotion={Boolean(reduceMotion)} />
              </motion.div>
            ))}
          </div>
        </motion.section>
        <style>{`
          @media (max-width: 767px) {
            .spatial-shape { display: none; }
            .cosmos-constellation {
              display: flex;
              min-height: 0;
              flex-wrap: wrap;
              align-content: center;
              justify-content: center;
              gap: 10px;
              border-radius: 28px;
            }
            .cosmos-constellation-lines { display: none; }
            .cosmos-skill-node {
              position: static !important;
              transform: none !important;
            }
          }
          @media (hover: hover) and (prefers-reduced-motion: no-preference) {
            .spatial-card:hover .spatial-card-inner { transform: rotateY(180deg); }
          }
        `}</style>
      </main>
    </TemplateBase>
  );
});

Cosmos.displayName = 'Cosmos';

Cosmos.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Cosmos;
