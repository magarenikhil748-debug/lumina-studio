import { useCallback, useEffect, useRef } from 'react';
import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const createRipple = (element, event, color = 'rgba(255,255,255,0.34)') => {
  const rect = element.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '3'
  });
  const previousPosition = element.style.position;
  if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
  element.appendChild(canvas);

  const context = canvas.getContext('2d');
  context.scale(ratio, ratio);
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const maxRadius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
  const started = performance.now();

  const draw = (time) => {
    const progress = Math.min((time - started) / 520, 1);
    context.clearRect(0, 0, rect.width, rect.height);
    context.beginPath();
    context.arc(x, y, maxRadius * progress, 0, Math.PI * 2);
    context.fillStyle = color.replace(/[\d.]+\)$/, `${0.24 * (1 - progress)})`);
    context.fill();
    if (progress < 1) requestAnimationFrame(draw);
    else {
      canvas.remove();
      element.style.position = previousPosition;
    }
  };
  requestAnimationFrame(draw);
};

export default function usePhysicsInteraction(config = {}) {
  const {
    type = 'tilt',
    intensity = 0.5,
    resetDuration = 360
  } = config;
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawScaleX = useMotionValue(1);
  const rawScaleY = useMotionValue(1);
  const rawClipPath = useMotionValue('polygon(0 0, 100% 0, 100% 100%, 0 100%)');
  const spring = {
    stiffness: Math.max(120, 720 - resetDuration),
    damping: 28,
    mass: 0.5
  };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);
  const rotateX = useSpring(rawRotateX, spring);
  const rotateY = useSpring(rawRotateY, spring);
  const scaleX = useSpring(rawScaleX, spring);
  const scaleY = useSpring(rawScaleY, spring);

  const reset = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawScaleX.set(1);
    rawScaleY.set(1);
    rawClipPath.set('polygon(0 0, 100% 0, 100% 100%, 0 100%)');
  }, [rawClipPath, rawRotateX, rawRotateY, rawScaleX, rawScaleY, rawX, rawY]);

  const onPointerMove = useCallback((event) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

    if (type === 'tilt') {
      rawRotateX.set(normalizedY * -30 * intensity);
      rawRotateY.set(normalizedX * 30 * intensity);
    } else if (type === 'magnetic') {
      rawX.set(normalizedX * 24 * intensity);
      rawY.set(normalizedY * 24 * intensity);
    } else if (type === 'elastic') {
      rawScaleX.set(1 + Math.abs(normalizedX) * 0.18 * intensity);
      rawScaleY.set(1 - Math.abs(normalizedY) * 0.08 * intensity);
      rawX.set(normalizedX * 10 * intensity);
    }
  }, [intensity, rawRotateX, rawRotateY, rawScaleX, rawScaleY, rawX, rawY, reduceMotion, type]);

  const onHoverStart = useCallback(() => {
    if (reduceMotion || type !== 'shatter') return;
    rawClipPath.set('polygon(0 0, 49% 0, 54% 38%, 100% 30%, 100% 100%, 48% 100%, 44% 61%, 0 72%)');
    rawRotateY.set(2.5 * intensity);
  }, [intensity, rawClipPath, rawRotateY, reduceMotion, type]);

  const onClick = useCallback((event) => {
    if (reduceMotion || !ref.current) return;
    if (type === 'ripple' || window.matchMedia('(pointer: coarse)').matches) {
      createRipple(ref.current, event);
    }
  }, [reduceMotion, type]);

  useEffect(() => {
    if (reduceMotion || type !== 'tilt' || !window.matchMedia('(pointer: coarse)').matches) return undefined;
    const handleOrientation = (event) => {
      rawRotateX.set(Math.max(-8, Math.min(8, (event.beta || 0) * 0.12 * intensity)));
      rawRotateY.set(Math.max(-8, Math.min(8, (event.gamma || 0) * 0.18 * intensity)));
    };
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [intensity, rawRotateX, rawRotateY, reduceMotion, type]);

  return {
    ref,
    style: {
      x,
      y,
      rotateX,
      rotateY,
      scaleX,
      scaleY,
      clipPath: rawClipPath,
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      willChange: 'transform'
    },
    onHoverStart,
    onHoverEnd: reset,
    onPointerMove,
    onPointerLeave: reset,
    onClick
  };
}
