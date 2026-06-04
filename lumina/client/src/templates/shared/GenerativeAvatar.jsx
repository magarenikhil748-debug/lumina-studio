import { memo, useId, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const PALETTES = [
  ['#c084fc', '#7c3aed', '#3b82f6', '#ec4899'],
  ['#22d3ee', '#2563eb', '#a855f7', '#f472b6'],
  ['#fbbf24', '#f97316', '#ec4899', '#7c3aed'],
  ['#34d399', '#06b6d4', '#3b82f6', '#a855f7']
];

const hashString = (value = '') => String(value).split('').reduce(
  (hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0,
  0
);

const seededValue = (seed, index, min, max) => {
  const value = Math.abs(Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453) % 1;
  return min + value * (max - min);
};

const GenerativeAvatar = memo(({
  name = 'Lumina',
  size = 240,
  className = '',
  style = {},
  animate = true
}) => {
  const reduceMotion = useReducedMotion();
  const reactId = useId().replace(/:/g, '');
  const seed = useMemo(() => hashString(name || 'Lumina'), [name]);
  const palette = PALETTES[Math.abs(seed) % PALETTES.length];
  const clipId = `avatar-clip-${reactId}`;
  const glowId = `avatar-glow-${reactId}`;
  const gradientId = `avatar-gradient-${reactId}`;
  const shapes = useMemo(() => Array.from({ length: 7 }, (_, index) => ({
    cx: seededValue(seed, index * 3, 16, 84),
    cy: seededValue(seed, index * 3 + 1, 14, 86),
    radius: seededValue(seed, index * 3 + 2, 12, 34),
    rotation: seededValue(seed, index * 5, -35, 35),
    color: palette[index % palette.length],
    opacity: seededValue(seed, index * 7, 0.24, 0.72)
  })), [palette, seed]);

  return (
    <motion.svg
      aria-label={`${name} generative portrait`}
      role="img"
      viewBox="0 0 100 100"
      className={className}
      initial={false}
      animate={animate && !reduceMotion ? { rotate: [0, 0.8, 0] } : undefined}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'block',
        width: size,
        height: size,
        overflow: 'hidden',
        ...style
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="49" />
        </clipPath>
        <radialGradient id={glowId} cx="30%" cy="24%" r="85%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="42%" stopColor={palette[0]} stopOpacity="0.14" />
          <stop offset="100%" stopColor="#070712" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={gradientId} x1="5%" y1="5%" x2="95%" y2="95%">
          <stop offset="0%" stopColor={palette[1]} />
          <stop offset="48%" stopColor={palette[2]} />
          <stop offset="100%" stopColor={palette[3]} />
        </linearGradient>
        <filter id={`blur-${reactId}`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect width="100" height="100" fill="#080811" />
        <rect width="100" height="100" fill={`url(#${gradientId})`} opacity="0.3" />
        {shapes.map((shape, index) => (
          <motion.ellipse
            key={`${shape.cx}-${shape.cy}`}
            cx={shape.cx}
            cy={shape.cy}
            rx={shape.radius}
            ry={shape.radius * seededValue(seed, index + 40, 0.46, 1.18)}
            fill={shape.color}
            opacity={shape.opacity}
            filter={`url(#blur-${reactId})`}
            transform={`rotate(${shape.rotation} ${shape.cx} ${shape.cy})`}
            animate={animate && !reduceMotion ? {
              cx: [shape.cx, shape.cx + seededValue(seed, index + 70, -4, 4), shape.cx],
              cy: [shape.cy, shape.cy + seededValue(seed, index + 80, -4, 4), shape.cy]
            } : undefined}
            transition={{ duration: 8 + index, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <circle cx="50" cy="50" r="50" fill={`url(#${glowId})`} />
        <path
          d="M-8 72 C18 52 38 91 62 62 C76 46 88 48 108 27"
          fill="none"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="0.65"
        />
        <path
          d="M-4 78 C20 58 42 96 67 68 C79 55 91 55 104 39"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="6"
        />
        <g opacity="0.24">
          {Array.from({ length: 7 }, (_, index) => (
            <line
              key={index}
              x1={10 + index * 14}
              y1="0"
              x2={-8 + index * 14}
              y2="100"
              stroke="#ffffff"
              strokeWidth="0.28"
            />
          ))}
        </g>
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
    </motion.svg>
  );
});

GenerativeAvatar.displayName = 'GenerativeAvatar';

GenerativeAvatar.propTypes = {
  animate: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: PropTypes.object
};

export default GenerativeAvatar;
