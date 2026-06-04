import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import PhysicsSurface from '../../lib/motion/PhysicsSurface';
import Reveal from '../../lib/motion/Reveal';
import TemplateBase from '../shared/TemplateBase';
import AnimatedSection from '../shared/AnimatedSection';
import ContactRow from '../shared/ContactRow';
import NoiseTexture from '../shared/NoiseTexture';
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

const TypedLine = ({ line, delay, reduceMotion, onKey }) => {
  const [displayed, setDisplayed] = useState(reduceMotion ? line : '');

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(line);
      return undefined;
    }
    let interval;
    const timeout = window.setTimeout(() => {
      let index = 0;
      const speed = window.innerWidth < 768 ? 12 : 24;
      interval = window.setInterval(() => {
        index += 1;
        setDisplayed(line.slice(0, index));
        onKey();
        if (index >= line.length) window.clearInterval(interval);
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [delay, line, onKey, reduceMotion]);

  return (
    <p className={line.startsWith('$') ? 'text-[#00ff41]' : 'text-[#d7ffe1]/72'}>
      {displayed}
      {displayed.length < line.length ? <span className="text-[#00ff41]">_</span> : null}
    </p>
  );
};

TypedLine.propTypes = {
  delay: PropTypes.number.isRequired,
  line: PropTypes.string.isRequired,
  onKey: PropTypes.func.isRequired,
  reduceMotion: PropTypes.bool.isRequired
};

const Terminal = memo(({ portfolio }) => {
  const reduceMotion = useReducedMotion();
  const audioContextRef = useRef(null);
  const [displayedName, setDisplayedName] = useState(reduceMotion ? portfolio.name : '');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const skills = clampSkills(portfolio.skills);
  const projects = clampProjects(portfolio.projects);
  const bio = getBio(portfolio);

  useEffect(() => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return undefined;
    const activateAudio = () => {
      if (!audioContextRef.current) audioContextRef.current = new window.AudioContext();
      audioContextRef.current.resume?.();
    };
    window.addEventListener('pointerdown', activateAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', activateAudio);
      audioContextRef.current?.close?.();
    };
  }, [reduceMotion]);

  const playKeyClick = useCallback(() => {
    const context = audioContextRef.current;
    if (!context || context.state !== 'running' || reduceMotion || window.innerWidth < 768) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = 1050 + Math.random() * 180;
    gain.gain.setValueAtTime(0.008, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.018);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.02);
  }, [reduceMotion]);

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
        @keyframes terminalFlicker {
          0%, 100% { opacity: 1; transform: translateX(0); }
          35% { opacity: .65; transform: translateX(2px); }
          70% { opacity: .9; transform: translateX(-1px); }
        }
        .terminal-project-card:hover { animation: terminalFlicker .18s steps(2) 2; }
      `}</style>
      <main className="terminal-scanline relative min-h-screen overflow-hidden bg-[#0a0a0f] px-5 py-16 text-[#d7ffe1] sm:px-8 lg:px-14">
        <MatrixRain active={!reduceMotion && isVisible} />
        <NoiseTexture opacity={0.03} blendMode="screen" />
        {['0x7F', 'SYS', '01', 'OK'].map((value, index) => (
          <motion.span
            key={value}
            aria-hidden="true"
            animate={reduceMotion ? undefined : { opacity: [0.04, 0.28, 0.04] }}
            transition={{ duration: 2.4 + index * 0.7, repeat: Infinity, delay: index * 0.55 }}
            className="pointer-events-none fixed z-[3] font-mono text-xs text-[#00ff41]"
            style={{ left: index % 2 ? 'auto' : 18, right: index % 2 ? 18 : 'auto', top: index < 2 ? 18 : 'auto', bottom: index >= 2 ? 18 : 'auto' }}
          >
            {value}
          </motion.span>
        ))}
        <section id="terminal-hero" className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
                <TypedLine
                  key={`${line}-${index}`}
                  line={line}
                  delay={index * 190}
                  reduceMotion={Boolean(reduceMotion)}
                  onKey={playKeyClick}
                />
              ))}
            </div>
          </motion.div>
        </section>

        <AnimatedSection className="relative z-10 mx-auto mt-24 max-w-7xl" id="terminal-skills">
          <Reveal variant="glitchIn"><p className="text-[#00ff41]">$ cat skills.log</p></Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {skills.map((skill, index) => {
              const percentage = randomFromString(skill.name, 70, 98);
              return (
                <div key={skill.name} className="rounded-2xl border border-[#00ff41]/16 bg-[#00ff41]/5 p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate text-[#d7ffe1]">{skill.name.padEnd(14, ' ')}</span>
                    <span className="text-[#00ff41]/70">
                      [{'\u2588'.repeat(Math.round(percentage / 10))}{'\u2591'.repeat(10 - Math.round(percentage / 10))}] {percentage}%
                    </span>
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

        <AnimatedSection className="relative z-10 mx-auto mt-24 max-w-7xl" id="terminal-projects">
          <Reveal variant="glitchIn"><p className="text-[#00ff41]">$ ls ./projects</p></Reveal>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {projects.map((project, index) => (
              <PhysicsSurface key={project.title} type="shatter" intensity={0.18} className="terminal-project-card">
                <ProjectCard project={project} index={index} variant="terminal" />
              </PhysicsSurface>
            ))}
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
