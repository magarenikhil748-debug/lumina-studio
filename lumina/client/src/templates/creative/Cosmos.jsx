import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import TemplateBase from '../shared/TemplateBase';
import ContactRow from '../shared/ContactRow';
import CursorGlow from '../shared/CursorGlow';
import NoiseTexture from '../shared/NoiseTexture';
import ProjectCard from '../shared/ProjectCard';
import { clampProjects, clampSkills, getBio } from '../shared/templateData';

const Cosmos = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(!document.hidden);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { scrollY } = useScroll();
  const layer1 = useTransform(scrollY, [0, 1000], [0, -50]);
  const layer2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const layer3 = useTransform(scrollY, [0, 1000], [0, -200]);
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
        <CursorGlow color="rgba(236,72,153,0.14)" size={460} blur={82} />
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

        <section className="relative z-10 mx-auto grid min-h-[82vh] max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <motion.div style={{ y: reduceMotion ? 0 : layer1 }}>
            <p className="font-black uppercase tracking-[0.34em] text-[#f0abfc]">Deep space portfolio</p>
            <h1 className="mt-6 text-[clamp(3.5rem,10vw,10rem)] font-black leading-[0.84] tracking-tight">
              {portfolio.name}
            </h1>
            <p className="mt-6 max-w-3xl text-2xl font-bold leading-9 text-white/78">{portfolio.tagline}</p>
            <p className="mt-6 max-w-3xl leading-8 text-white/55">{getBio(portfolio)}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-white/10 bg-white/[0.06] text-white" />
          </motion.div>
          <motion.div style={{ y: reduceMotion ? 0 : layer2 }} className="cosmos-constellation relative min-h-[360px] rounded-full border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_90px_rgba(168,85,247,0.18)] backdrop-blur-xl">
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
                style={{ left: `${skill.x}%`, top: `${skill.y}%`, transform: 'translate(-50%, -50%)' }}
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
        </section>

        <motion.section style={{ y: reduceMotion ? 0 : layer3 }} className="relative z-10 mx-auto mt-16 max-w-7xl">
          <h2 className="text-[clamp(2.5rem,7vw,7rem)] font-black leading-none">Orbiting work</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                animate={!visible || reduceMotion ? undefined : { y: [0, -15, 0], rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ProjectCard project={project} index={index} variant="cosmos" className="rounded-[40px]" />
              </motion.div>
            ))}
          </div>
        </motion.section>
        <style>{`
          @media (max-width: 767px) {
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
