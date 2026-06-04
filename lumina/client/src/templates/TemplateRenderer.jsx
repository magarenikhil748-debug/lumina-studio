import PropTypes from 'prop-types';
import { Suspense, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import CursorRenderer from '../lib/motion/CursorRenderer';
import { TemplateMotionContext } from '../lib/motion/TemplateMotionContext';
import useScrollCinema from '../lib/motion/useScrollCinema';
import { getTemplate } from './index';
import { resolveTemplateId } from './shared/templateData';

export { useTemplateMotion } from '../lib/motion/TemplateMotionContext';

const CURSOR_CONFIGS = {
  glass: { type: 'default', color: '#ffffff', trailLength: 6, magneticStrength: 0.3, springConfig: { stiffness: 520, damping: 34, mass: 0.42 } },
  terminal: { type: 'caret', color: '#00ff41', trailLength: 0, magneticStrength: 0, springConfig: { stiffness: 700, damping: 42, mass: 0.32 } },
  blueprint: { type: 'crosshair', color: '#4a90d9', trailLength: 0, magneticStrength: 0.12, springConfig: { stiffness: 650, damping: 38, mass: 0.36 } },
  studio: { type: 'film', color: '#ffffff', trailLength: 2, magneticStrength: 0.18, springConfig: { stiffness: 360, damping: 30, mass: 0.6 } },
  neon: { type: 'neon', color: '#00f5ff', trailLength: 16, magneticStrength: 0.35, springConfig: { stiffness: 620, damping: 34, mass: 0.34 } },
  minimalcode: { type: 'ink', color: '#18120c', trailLength: 3, magneticStrength: 0.16, springConfig: { stiffness: 400, damping: 32, mass: 0.54 } },
  runway: { type: 'default', color: '#111111', trailLength: 3, magneticStrength: 0.22, springConfig: { stiffness: 460, damping: 34, mass: 0.48 } },
  cosmos: { type: 'orbital', color: '#d8b4fe', trailLength: 5, magneticStrength: 0.28, springConfig: { stiffness: 300, damping: 28, mass: 0.66 } },
  canvas: { type: 'ink', color: '#b45309', trailLength: 4, magneticStrength: 0.14, springConfig: { stiffness: 340, damping: 30, mass: 0.62 } }
};

const CINEMA_CONFIGS = {
  glass: { sections: ['glass-hero', 'glass-capabilities', 'selected-work', 'glass-contact'], snapBehavior: 'soft', parallaxLayers: [{ selector: '.glass-experience-avatar', speed: 0.3, direction: 'vertical' }] },
  terminal: { sections: ['terminal-hero', 'terminal-skills', 'terminal-projects'], snapBehavior: 'hard', parallaxLayers: [] },
  blueprint: { sections: ['blueprint-profile', 'blueprint-architecture', 'blueprint-schematics'], snapBehavior: 'none', parallaxLayers: [] },
  studio: { sections: ['profile', 'capabilities', 'work'], snapBehavior: 'soft', parallaxLayers: [{ selector: '.studio-midground', speed: 0.25, direction: 'vertical' }] },
  neon: { sections: ['neon-hero', 'neon-skills', 'neon-projects'], snapBehavior: 'soft', parallaxLayers: [] },
  minimalcode: { sections: ['minimal-hero', 'minimal-about', 'minimal-skills', 'minimal-commits'], snapBehavior: 'none', parallaxLayers: [] },
  runway: { sections: ['runway-hero', 'runway-about', 'runway-work', 'runway-practice'], snapBehavior: 'none', parallaxLayers: [{ selector: '.runway-editorial-image', speed: 0.18, direction: 'vertical' }] },
  cosmos: { sections: ['cosmos-hero', 'cosmos-work'], snapBehavior: 'hard', parallaxLayers: [{ selector: '.cosmos-constellation', speed: 0.22, direction: 'vertical' }] },
  canvas: { sections: ['canvas-hero', 'canvas-materials', 'canvas-work'], snapBehavior: 'none', parallaxLayers: [] }
};

const PAGE_ENTER = {
  glass: { opacity: 0, scale: 0.97 },
  terminal: { opacity: 0, x: -12 },
  blueprint: { opacity: 0, scale: 1.08, rotate: -1 },
  studio: { opacity: 0 },
  neon: { opacity: 0, x: 14 },
  minimalcode: { opacity: 0, scale: 0.985 },
  runway: { opacity: 0, x: -24 },
  cosmos: { opacity: 0, scale: 0.92 },
  canvas: { opacity: 0, y: 18 }
};

const TemplateRenderer = ({ portfolio, templateId }) => {
  const reduceMotion = useReducedMotion();
  const resolvedId = resolveTemplateId(portfolio, templateId);
  const template = getTemplate(resolvedId);
  const TemplateComponent = template.component;
  const cinemaConfig = CINEMA_CONFIGS[resolvedId] || CINEMA_CONFIGS.glass;
  const cinema = useScrollCinema(cinemaConfig);
  const contextValue = useMemo(() => ({
    activeTemplate: resolvedId,
    activeSection: cinema.activeSection,
    scrollProgress: cinema.scrollProgress,
    sectionProgress: cinema.sectionProgress,
    parallaxY: cinema.parallaxY
  }), [cinema.activeSection, cinema.parallaxY, cinema.scrollProgress, cinema.sectionProgress, resolvedId]);

  return (
    <TemplateMotionContext.Provider value={contextValue}>
      <CursorRenderer key={`cursor-${resolvedId}`} config={CURSOR_CONFIGS[resolvedId] || CURSOR_CONFIGS.glass} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedId}
          data-template={resolvedId}
          initial={reduceMotion ? false : PAGE_ENTER[resolvedId]}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeInOut' }}
        >
          <Suspense fallback={<LoadingScreen message={`Loading ${template.name} experience...`} />}>
            <TemplateComponent portfolio={portfolio} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </TemplateMotionContext.Provider>
  );
};

TemplateRenderer.propTypes = {
  portfolio: PropTypes.shape({
    templateId: PropTypes.string,
    template: PropTypes.string,
    layout: PropTypes.string
  }).isRequired,
  templateId: PropTypes.string
};

export default TemplateRenderer;
