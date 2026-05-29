import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import TemplateBase from '../shared/TemplateBase';
import AnimatedSection from '../shared/AnimatedSection';
import ContactRow from '../shared/ContactRow';
import ProjectCard from '../shared/ProjectCard';
import { clampProjects, clampSkills, getBio, randomFromString } from '../shared/templateData';

const MatrixRain = ({ active }) => {
  const columns = useMemo(() => Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: `${index * 5 + 1}%`,
    chars: Array.from({ length: 24 }, () => '01#$<>'.charAt(Math.floor(Math.random() * 6))).join(''),
    duration: 12 + (index % 8),
    delay: index * 0.25
  })), []);

  if (!active) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden opacity-70">
      {columns.map((column) => (
        <motion.div
          key={column.id}
          className="absolute top-[-40%] w-4 whitespace-pre-wrap break-all font-mono text-[11px] leading-4 text-[#00ff41]/10"
          style={{ left: column.left, willChange: 'transform' }}
          animate={{ y: ['0vh', '150vh'] }}
          transition={{ duration: column.duration, delay: column.delay, repeat: Infinity, ease: 'linear' }}
        >
          {column.chars.repeat(8)}
        </motion.div>
      ))}
    </div>
  );
};

MatrixRain.propTypes = {
  active: PropTypes.bool.isRequired
};

const Terminal = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const [displayedName, setDisplayedName] = useState(reduceMotion ? portfolio.name : '');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const skills = clampSkills(portfolio.skills);
  const projects = clampProjects(portfolio.projects);
  const bio = getBio(portfolio);

  useEffect(() => {
    const onVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayedName(portfolio.name || '');
      return undefined;
    }
    let index = 0;
    const typing = window.setInterval(() => {
      if (index <= (portfolio.name || '').length) {
        setDisplayedName((portfolio.name || '').slice(0, index));
        index += 1;
      } else {
        window.clearInterval(typing);
      }
    }, 80);
    const cursor = window.setInterval(() => setCursorVisible((value) => !value), 500);
    return () => {
      window.clearInterval(typing);
      window.clearInterval(cursor);
    };
  }, [portfolio.name, reduceMotion]);

  const promptLines = [
    '$ whoami',
    `> ${portfolio.name}`,
    '$ cat role.txt',
    `> ${portfolio.title}`,
    '$ cat location.txt',
    `> ${portfolio.location || 'Remote'}`,
    '$ ./load_story.sh',
    `> ${bio}`,
    '$ ./load_skills.sh',
    '> Loading skills... [############] 100%'
  ];

  return (
    <TemplateBase portfolio={portfolio} fontFamily="'JetBrains Mono', monospace" className="bg-[#0a0a0f] text-[#d7ffe1]">
      <style>{`
        @keyframes terminalScan { from { background-position: 0 0; } to { background-position: 0 18px; } }
        .terminal-scanline:after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(to bottom, rgba(0,255,65,0.03) 0 1px, transparent 1px 4px);
          animation: terminalScan 2.8s linear infinite;
          z-index: 2;
        }
      `}</style>
      <main className="terminal-scanline relative min-h-screen overflow-hidden bg-[#0a0a0f] px-5 py-16 text-[#d7ffe1] sm:px-8 lg:px-14">
        <MatrixRain active={!reduceMotion && isVisible} />
        <section className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-black text-[#00ff41]/75">lumina@portfolio:~$ initialize</motion.p>
            <h1 className="mt-6 break-words text-[clamp(3rem,9vw,8rem)] font-black leading-[0.9] tracking-tight text-[#00ff41]">
              {displayedName}
              <span className={cursorVisible ? 'opacity-100' : 'opacity-0'}>_</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d7ffe1]/70">{portfolio.tagline}</p>
            <ContactRow portfolio={portfolio} className="mt-8" linkClassName="border border-[#00ff41]/20 bg-[#00ff41]/5 text-[#00ff41]" />
          </div>
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-[#00ff41]/20 bg-[#050508]/88 p-5 shadow-[0_0_60px_rgba(0,255,65,0.1)]"
          >
            <div className="mb-4 flex gap-2 border-b border-[#00ff41]/10 pb-4">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="space-y-2 text-sm leading-7">
              {promptLines.map((line, index) => (
                <motion.p
                  key={`${line}-${index}`}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.3, duration: 0.28 }}
                  className={line.startsWith('$') ? 'text-[#00ff41]' : 'text-[#d7ffe1]/72'}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </section>

        <AnimatedSection className="relative z-10 mx-auto mt-24 max-w-7xl">
          <p className="text-[#00ff41]">$ cat skills.log</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {skills.map((skill, index) => {
              const percentage = randomFromString(skill.name, 70, 98);
              return (
                <div key={skill.name} className="rounded-2xl border border-[#00ff41]/16 bg-[#00ff41]/5 p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate text-[#d7ffe1]">{skill.name.padEnd(14, ' ')}</span>
                    <span className="text-[#00ff41]/70">{percentage}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#00ff41]/10">
                    <motion.div
                      className="h-full bg-[#00ff41]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 1.5, delay: index * 0.06 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative z-10 mx-auto mt-24 max-w-7xl">
          <p className="text-[#00ff41]">$ ls ./projects</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} variant="terminal" />)}
          </div>
        </AnimatedSection>
      </main>
    </TemplateBase>
  );
});

Terminal.displayName = 'Terminal';

Terminal.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    location: PropTypes.string,
    tagline: PropTypes.string,
    selectedBio: PropTypes.string,
    bio: PropTypes.string,
    bioVersions: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.array,
    projects: PropTypes.array,
    colorPalette: PropTypes.object
  }).isRequired
};

export default Terminal;
