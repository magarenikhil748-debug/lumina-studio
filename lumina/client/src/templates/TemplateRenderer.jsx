import PropTypes from 'prop-types';
import { Suspense } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import { getTemplate } from './index';
import { resolveTemplateId } from './shared/templateData';

const TemplateRenderer = ({ portfolio, templateId }) => {
  const reduceMotion = useReducedMotion();
  const resolvedId = resolveTemplateId(portfolio, templateId);
  const template = getTemplate(resolvedId);
  const TemplateComponent = template.component;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={resolvedId}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.992, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.992, filter: 'blur(8px)' }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<LoadingScreen message={`Loading ${template.name} experience...`} />}>
          <TemplateComponent portfolio={portfolio} />
        </Suspense>
      </motion.div>
    </AnimatePresence>
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
