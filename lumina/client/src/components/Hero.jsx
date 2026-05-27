import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { motion, useAnimationControls, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BadgeCheck, Blocks, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const insightRows = [
  ['Voice', 'Confident and human'],
  ['Layout', 'Creative system'],
  ['Palette', 'Violet / cobalt / rose']
];

const heroParticles = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 94 + 3}%`,
  top: `${Math.random() * 78 + 10}%`,
  size: 2 + Math.random() * 4,
  driftX: Math.random() * 70 - 35,
  driftY: Math.random() * 70 - 35,
  duration: 10 + Math.random() * 8,
  delay: Math.random() * 2
}));

const particleVariants = {
  rest: { opacity: 0, x: 0, y: 0 },
  drift: (particle) => ({
    x: [0, particle.driftX, particle.driftX * -0.45, 0],
    y: [0, particle.driftY, particle.driftY * 0.6, 0],
    opacity: [0.12, 0.52, 0.18, 0.12],
    transition: {
      duration: particle.duration,
      delay: particle.delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
};

const Hero = ({ onPointerMove }) => {
  const reduceMotion = useReducedMotion();
  const particleControls = useAnimationControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 22 });
  const springY = useSpring(y, { stiffness: 320, damping: 22 });
  const translateX = useTransform(springX, [-160, 160], [-12, 12]);
  const translateY = useTransform(springY, [-160, 160], [-12, 12]);

  useEffect(() => {
    if (reduceMotion) {
      particleControls.set('rest');
      return undefined;
    }
    particleControls.start('drift');
    return () => particleControls.stop();
  }, [particleControls, reduceMotion]);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
    onPointerMove(event);
  };

  return (
    <section onPointerMove={handleMove} className="relative isolate flex min-h-[92vh] items-center overflow-hidden px-4 pb-14 pt-28">
      <motion.div
        aria-hidden="true"
        className="surface-grid absolute inset-x-0 bottom-0 top-24 opacity-20"
        animate={reduceMotion ? { y: 0 } : { y: [0, -18, 0] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute right-[5%] top-[18%] h-[42rem] w-[42rem] rotate-12 rounded-[4rem] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] backdrop-blur-[2px]"
          animate={reduceMotion ? { rotate: 10, y: 0 } : { rotate: [10, 14, 10], y: [0, -14, 0] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {heroParticles.map((particle) => (
          <motion.span
            key={particle.id}
            custom={particle}
            variants={particleVariants}
            initial="rest"
            animate={particleControls}
            className="absolute rounded-full bg-white/50 shadow-[0_0_18px_rgba(168,85,247,0.45)]"
            style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          />
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_0.88fr] lg:items-center">
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl">
            <BadgeCheck className="h-4 w-4 text-[#c4b5fd]" aria-hidden="true" />
            Lumina Studio
          </div>
          <h1 className="max-w-3xl text-[clamp(2.75rem,6vw,5.35rem)] font-black leading-[0.96] text-white">
            Portfolios that feel unmistakably yours.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold text-[#dbeafe]">
            Bring your work, voice, and goals. Lumina shapes them into a portfolio people want to spend time with.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/50">
            Use guided prompts, refined templates, responsive previews, analytics, and export-ready HTML without losing the story that makes the work yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {['Guided copy', 'Live preview', 'HTML export'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
                <BadgeCheck className="h-4 w-4 text-[#93c5fd]" aria-hidden="true" /> {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex -space-x-3" aria-hidden="true">
              {['#a855f7', '#3b82f6', '#ec4899', '#ffffff'].map((color) => <span key={color} className="h-9 w-9 rounded-full border-2 border-[#0a0a0f]" style={{ background: color }} />)}
            </div>
            <p className="text-sm font-semibold text-white/50"><span className="accent-soft">5-star</span> loved by portfolio builders</p>
          </div>
          <motion.div
            style={reduceMotion ? undefined : { x: translateX, y: translateY }}
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="mt-10 inline-flex"
          >
            <Link to="/build" className="focus-ring btn-primary group inline-flex items-center gap-3 rounded-full px-6 py-4 font-bold">
              Build My Portfolio
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 hidden min-h-[560px] lg:block"
        >
          <motion.div
            className="absolute inset-x-4 top-8 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_0_40px_rgba(168,85,247,0.22)] backdrop-blur-xl"
            animate={reduceMotion ? { y: 0 } : { y: [0, -10, 0] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ec4899]" />
                <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                <span className="h-3 w-3 rounded-full bg-[#a855f7]" />
              </div>
              <span className="rounded-full bg-[#a855f7]/15 px-3 py-1 text-xs font-bold text-[#c4b5fd]">Studio pass</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl">
              <div className="mb-6 flex items-start gap-4">
                <div className="brand-mark h-14 w-14 rounded-2xl"><span>L</span></div>
                <div>
                  <p className="text-sm text-white/50">Portfolio direction</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">Creative systems designer</h2>
                </div>
              </div>
              <div className="space-y-3">
                {insightRows.map(([label, value], index) => (
                  <motion.div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-4 py-3"
                    initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 0.35 + index * 0.12 }}
                  >
                    <span className="text-sm text-white/50">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute bottom-14 left-0 w-72 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_0_40px_rgba(59,130,246,0.22)] backdrop-blur-xl"
            animate={reduceMotion ? { x: 0, y: 0 } : { x: [0, 10, 0], y: [0, 8, 0] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
          >
            <div className="mb-4 flex items-center gap-3">
              <Blocks className="h-5 w-5 text-[#93c5fd]" aria-hidden="true" />
              <p className="font-bold">Layout intelligence</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Minimal', 'Bold', 'Creative'].map((item) => (
                <span key={item} className={`rounded-full px-3 py-2 text-center text-xs font-bold ${item === 'Creative' ? 'btn-primary' : 'bg-[rgba(255,255,255,0.05)] text-white/50'}`}>{item}</span>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="absolute bottom-0 right-3 w-64 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_0_40px_rgba(236,72,153,0.2)] backdrop-blur-xl"
            animate={reduceMotion ? { x: 0, y: 0 } : { x: [0, -8, 0], y: [0, -8, 0] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
          >
            <div className="mb-4 flex items-center gap-3">
              <MousePointer2 className="h-5 w-5 text-violet-300" aria-hidden="true" />
              <p className="font-bold">Theme switcher</p>
            </div>
            <div className="flex gap-2">
              {['#a855f7', '#3b82f6', '#ec4899'].map((color) => <span key={color} className="h-9 flex-1 rounded-full" style={{ background: color }} />)}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

Hero.propTypes = { onPointerMove: PropTypes.func.isRequired };

export default Hero;
