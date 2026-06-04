import { useEffect, useMemo, useState } from 'react';
import { motionValue, useMotionValue, useReducedMotion } from 'framer-motion';

const clamp = (value) => Math.max(0, Math.min(1, value));

export default function useScrollCinema(config = {}) {
  const {
    sections = [],
    parallaxLayers = [],
    snapBehavior = 'none'
  } = config;
  const reduceMotion = useReducedMotion();
  const scrollProgress = useMotionValue(0);
  const sectionProgress = useMotionValue(0);
  const [activeSection, setActiveSection] = useState(sections[0] || null);
  const layerKey = JSON.stringify(parallaxLayers);
  const parallaxY = useMemo(() => parallaxLayers.reduce((values, layer) => {
    values[layer.selector] = motionValue(0);
    return values;
  }, {}), [layerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!elements.length) return undefined;

    const previousSnap = document.documentElement.style.scrollSnapType;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    if (snapBehavior === 'hard') document.documentElement.style.scrollSnapType = 'y mandatory';
    if (snapBehavior === 'soft') document.documentElement.style.scrollSnapType = 'y proximity';
    document.documentElement.style.scrollBehavior = 'smooth';

    const previousAlignments = elements.map((element) => element.style.scrollSnapAlign);
    if (snapBehavior !== 'none') {
      elements.forEach((element) => {
        element.style.scrollSnapAlign = 'start';
      });
    }

    const ratios = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => ratios.set(entry.target.id, entry.intersectionRatio));
      const active = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0];
      if (!active) return;

      const element = document.getElementById(active[0]);
      if (!element) return;
      setActiveSection(active[0]);

      const rect = element.getBoundingClientRect();
      const scrollableSection = Math.max(1, rect.height - window.innerHeight);
      const currentSectionProgress = clamp(-rect.top / scrollableSection);
      sectionProgress.set(currentSectionProgress);

      const totalScrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const inferredScroll = element.offsetTop - rect.top;
      scrollProgress.set(clamp(inferredScroll / totalScrollable));

      if (!reduceMotion) {
        parallaxLayers.forEach((layer) => {
          const target = document.querySelector(layer.selector);
          if (!target || !parallaxY[layer.selector]) return;
          const targetRect = target.getBoundingClientRect();
          const viewportOffset = targetRect.top + targetRect.height / 2 - window.innerHeight / 2;
          const mobileScale = window.innerWidth < 768 ? 0.4 : 1;
          parallaxY[layer.selector].set(-viewportOffset * layer.speed * mobileScale);
        });
      }
    }, {
      threshold: Array.from({ length: 21 }, (_, index) => index / 20),
      rootMargin: '-8% 0px -8% 0px'
    });

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.style.scrollSnapType = previousSnap;
      document.documentElement.style.scrollBehavior = previousBehavior;
      elements.forEach((element, index) => {
        element.style.scrollSnapAlign = previousAlignments[index];
      });
    };
  }, [parallaxLayers, parallaxY, reduceMotion, scrollProgress, sectionProgress, sections, snapBehavior]);

  return { scrollProgress, sectionProgress, activeSection, parallaxY };
}
