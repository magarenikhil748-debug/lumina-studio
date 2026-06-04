import { memo } from 'react';
import PropTypes from 'prop-types';

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.9'/%3E%3C/svg%3E\")";

const NoiseTexture = memo(({
  opacity = 0.035,
  position = 'fixed',
  zIndex = 2,
  blendMode = 'soft-light',
  className = ''
}) => (
  <div
    aria-hidden="true"
    className={className}
    style={{
      position,
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: NOISE,
      backgroundRepeat: 'repeat',
      backgroundSize: '180px 180px',
      mixBlendMode: blendMode,
      opacity,
      zIndex
    }}
  />
));

NoiseTexture.displayName = 'NoiseTexture';

NoiseTexture.propTypes = {
  blendMode: PropTypes.string,
  className: PropTypes.string,
  opacity: PropTypes.number,
  position: PropTypes.oneOf(['absolute', 'fixed']),
  zIndex: PropTypes.number
};

export default NoiseTexture;
