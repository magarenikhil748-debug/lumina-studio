import { useEffect, useRef } from 'react';
import { useAnimationControls, useReducedMotion } from 'framer-motion';

const smooth = [0.22, 1, 0.36, 1];

export const REVEAL_VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: smooth } }
  },
  slideLeft: {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.72, ease: smooth } }
  },
  slideRight: {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.72, ease: smooth } }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: smooth } }
  },
  rotateIn: {
    hidden: { opacity: 0, rotateX: 90, transformPerspective: 900 },
    visible: { opacity: 1, rotateX: 0, transition: { duration: 0.8, ease: smooth } }
  },
  glitchIn: {
    hidden: { opacity: 0, x: 0 },
    visible: {
      opacity: [0, 1, 0.55, 1, 0.8, 1],
      x: [0, -12, 9, -4, 2, 0],
      filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(-80deg)', 'hue-rotate(0deg)'],
      transition: { duration: 0.42, times: [0, 0.18, 0.35, 0.55, 0.72, 1] }
    }
  },
  inkDrop: {
    hidden: { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
    visible: { opacity: 1, clipPath: 'circle(75% at 50% 50%)', transition: { duration: 0.85, ease: smooth } }
  },
  filmGrain: {
    hidden: { opacity: 0 },
    visible: { opacity: [0, 0.75, 0.2, 0.9, 0.55, 1], transition: { duration: 0.7, ease: 'linear' } }
  },
  bruteSlam: {
    hidden: { opacity: 0, scale: 1.3, rotate: -2 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.24, ease: [0.2, 0.9, 0.2, 1] } }
  },
  typeReveal: {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  }
};

export const TYPE_CHARACTER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } }
};

export function useRevealOnScroll(variant = 'fadeUp', options = {}) {
  const {
    once = true,
    threshold = 0.18,
    rootMargin = '0px 0px -8% 0px'
  } = options;
  const ref = useRef(null);
  const controls = useAnimationControls();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (reduceMotion) {
      controls.set({ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, filter: 'none', clipPath: 'none' });
      return undefined;
    }

    controls.set('hidden');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        controls.start('visible');
        if (once) observer.unobserve(element);
      } else if (!once) {
        controls.start('hidden');
      }
    }, { threshold, rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [controls, once, reduceMotion, rootMargin, threshold, variant]);

  return { ref, controls, variants: REVEAL_VARIANTS[variant] || REVEAL_VARIANTS.fadeUp };
}
