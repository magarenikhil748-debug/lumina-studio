import { motion, useReducedMotion } from 'framer-motion';

const orbs = [
  { id: 'purple', className: 'left-[-10%] top-[-8%] h-[28rem] w-[28rem] bg-[#a855f7]/35', rotate: [0, 18, -8, 0], scale: [1, 1.12, 0.98, 1], duration: 18 },
  { id: 'blue', className: 'right-[-12%] top-[22%] h-[30rem] w-[30rem] bg-[#3b82f6]/30', rotate: [0, -16, 10, 0], scale: [0.98, 1.1, 1, 0.98], duration: 21 },
  { id: 'pink', className: 'bottom-[-18%] left-[34%] h-[32rem] w-[32rem] bg-[#ec4899]/28', rotate: [0, 14, -14, 0], scale: [1, 0.94, 1.08, 1], duration: 24 }
];

const AnimatedBackground = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0f] mesh-bg">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          animate={reduceMotion ? { opacity: 0.28 } : { rotate: orb.rotate, scale: orb.scale, opacity: [0.24, 0.48, 0.32, 0.24] }}
          transition={reduceMotion ? { duration: 0 } : { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
