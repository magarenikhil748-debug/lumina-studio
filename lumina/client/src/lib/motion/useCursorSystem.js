import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const DEFAULT_SPRING = { stiffness: 520, damping: 34, mass: 0.42 };

const distanceToRect = (x, y, rect) => {
  const closestX = Math.max(rect.left, Math.min(x, rect.right));
  const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
  return Math.hypot(x - closestX, y - closestY);
};

export default function useCursorSystem(config = {}) {
  const {
    magneticStrength = 0.25,
    springConfig = DEFAULT_SPRING
  } = config;
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const cursorX = useSpring(rawX, springConfig);
  const cursorY = useSpring(rawY, springConfig);
  const [cursorVariant, setCursorVariant] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const magnetsRef = useRef([]);
  const frameRef = useRef(null);
  const pointRef = useRef({ x: -100, y: -100 });

  const refreshMagnets = useCallback(() => {
    magnetsRef.current = Array.from(document.querySelectorAll('[data-magnetic="true"]'));
  }, []);

  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(touch);
    if (touch || reduceMotion) return undefined;

    refreshMagnets();
    const mutationObserver = new MutationObserver(refreshMagnets);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const updatePosition = () => {
      const { x, y } = pointRef.current;
      let targetX = x;
      let targetY = y;
      let nearestDistance = 81;
      let nearestRect = null;

      magnetsRef.current.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const distance = distanceToRect(x, y, rect);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestRect = rect;
        }
      });

      if (nearestRect && magneticStrength > 0) {
        const centerX = nearestRect.left + nearestRect.width / 2;
        const centerY = nearestRect.top + nearestRect.height / 2;
        const pull = (1 - nearestDistance / 81) * magneticStrength;
        targetX += (centerX - x) * pull;
        targetY += (centerY - y) * pull;
      }

      rawX.set(targetX);
      rawY.set(targetY);
      frameRef.current = null;
    };

    const handlePointerMove = (event) => {
      pointRef.current = { x: event.clientX, y: event.clientY };
      setIsVisible(true);
      if (!frameRef.current) frameRef.current = requestAnimationFrame(updatePosition);
    };
    const handlePointerOver = (event) => {
      const variant = event.target.closest?.('[data-cursor-variant]')?.dataset.cursorVariant;
      if (variant) setCursorVariant(variant);
      else if (event.target.closest?.('a, button, [role="button"]')) setCursorVariant('hover');
    };
    const handlePointerOut = (event) => {
      if (!event.relatedTarget?.closest?.('[data-cursor-variant]')) setCursorVariant('default');
    };
    const handlePointerDown = () => setCursorVariant('pressed');
    const handlePointerUp = () => setCursorVariant('hover');
    const hide = () => setIsVisible(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', hide);

    return () => {
      mutationObserver.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', hide);
    };
  }, [magneticStrength, rawX, rawY, reduceMotion, refreshMagnets]);

  return {
    cursorX,
    cursorY,
    cursorVariant,
    setCursorVariant,
    isTouch,
    isVisible: isVisible && !isTouch && !reduceMotion
  };
}
