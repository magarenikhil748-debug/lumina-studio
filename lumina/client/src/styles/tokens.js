export const colors = {
  bg: {
    base: '#07070f',
    surface: '#0d0d1a',
    elevated: '#12121f',
    overlay: '#1a1a2e',
    hover: 'rgba(255,255,255,0.03)'
  },
  glass: {
    subtle: 'rgba(255,255,255,0.02)',
    light: 'rgba(255,255,255,0.04)',
    medium: 'rgba(255,255,255,0.06)',
    strong: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.07)',
    borderHover: 'rgba(255,255,255,0.15)',
    borderActive: 'rgba(168,85,247,0.4)'
  },
  brand: {
    purple: '#a855f7',
    purpleLight: '#c084fc',
    purpleDark: '#7c3aed',
    purpleGlow: 'rgba(168,85,247,0.15)',
    purpleGlowStrong: 'rgba(168,85,247,0.35)',
    blue: '#3b82f6',
    blueGlow: 'rgba(59,130,246,0.15)',
    pink: '#ec4899',
    pinkGlow: 'rgba(236,72,153,0.15)'
  },
  semantic: {
    success: '#22c55e',
    successGlow: 'rgba(34,197,94,0.15)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245,158,11,0.15)',
    error: '#ef4444',
    errorGlow: 'rgba(239,68,68,0.15)',
    info: '#3b82f6'
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.65)',
    muted: 'rgba(255,255,255,0.35)',
    faint: 'rgba(255,255,255,0.15)',
    inverse: '#07070f'
  },
  tier: {
    free: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' },
    starter: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' },
    pro: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
    studio: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
  }
};

export const blur = {
  sm: 'blur(8px)',
  md: 'blur(16px)',
  lg: 'blur(24px)',
  xl: 'blur(40px)',
  xxl: 'blur(60px)'
};

export const radius = {
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '28px',
  full: '999px'
};

export const shadow = {
  sm: '0 2px 8px rgba(0,0,0,0.3)',
  md: '0 4px 16px rgba(0,0,0,0.4)',
  lg: '0 8px 32px rgba(0,0,0,0.5)',
  xl: '0 16px 64px rgba(0,0,0,0.6)',
  glow: {
    purple: '0 0 30px rgba(168,85,247,0.2), 0 0 60px rgba(168,85,247,0.1)',
    purpleStrong: '0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.2)',
    blue: '0 0 30px rgba(59,130,246,0.2)',
    pink: '0 0 30px rgba(236,72,153,0.2)'
  }
};

export const spacing = {
  navHeight: '64px',
  sectionV: '80px',
  cardPad: '24px',
  innerPad: '16px',
  gap: '16px',
  gapLg: '24px'
};

export const typography = {
  fonts: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Inter', -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  },
  sizes: {
    xs: 'clamp(10px, 1.2vw, 12px)',
    sm: 'clamp(12px, 1.4vw, 14px)',
    base: 'clamp(14px, 1.6vw, 16px)',
    md: 'clamp(16px, 1.8vw, 18px)',
    lg: 'clamp(18px, 2vw, 20px)',
    xl: 'clamp(20px, 2.5vw, 24px)',
    '2xl': 'clamp(24px, 3vw, 32px)',
    '3xl': 'clamp(32px, 4vw, 48px)',
    '4xl': 'clamp(48px, 6vw, 72px)',
    '5xl': 'clamp(64px, 8vw, 96px)'
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
};

export const animation = {
  spring: {
    gentle: { type: 'spring', stiffness: 200, damping: 25 },
    snappy: { type: 'spring', stiffness: 350, damping: 30 },
    bouncy: { type: 'spring', stiffness: 400, damping: 20 },
    slow: { type: 'spring', stiffness: 100, damping: 20 }
  },
  ease: {
    smooth: [0.22, 1, 0.36, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1]
  },
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    slow: 0.5,
    slower: 0.7
  },
  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.12
  }
};

export const glassCard = {
  background: colors.glass.light,
  backdropFilter: blur.lg,
  WebkitBackdropFilter: blur.lg,
  border: `1px solid ${colors.glass.border}`,
  borderRadius: radius.lg,
  boxShadow: shadow.md
};

export const glassCardHover = {
  background: colors.glass.medium,
  border: `1px solid ${colors.glass.borderHover}`,
  boxShadow: `${shadow.lg}, ${shadow.glow.purple}`
};

export const gradientText = {
  background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #3b82f6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
};
