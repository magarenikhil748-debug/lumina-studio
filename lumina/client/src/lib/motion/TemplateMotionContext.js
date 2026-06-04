import { createContext, useContext } from 'react';

export const TemplateMotionContext = createContext({
  activeTemplate: 'glass',
  activeSection: null,
  scrollProgress: null,
  sectionProgress: null,
  parallaxY: {}
});

export const useTemplateMotion = () => useContext(TemplateMotionContext);
