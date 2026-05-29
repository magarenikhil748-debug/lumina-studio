import PropTypes from 'prop-types';
import { Suspense } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { getTemplate } from './index';
import { resolveTemplateId } from './shared/templateData';

const TemplateRenderer = ({ portfolio, templateId }) => {
  const template = getTemplate(resolveTemplateId(portfolio, templateId));
  const TemplateComponent = template.component;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <TemplateComponent portfolio={portfolio} />
    </Suspense>
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
