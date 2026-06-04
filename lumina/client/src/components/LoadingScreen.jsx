import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import LuminaLogo from './LuminaLogo';

export default function LoadingScreen({ message = 'Loading...', detail = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#07070f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        zIndex: 9999
      }}
    >
      <div className="lumina-ambient" />
      <div className="lumina-noise" />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <LuminaLogo size={56} showGlow />
      </div>

      <div style={{ display: 'flex', gap: '6px', position: 'relative', zIndex: 2 }}>
        {[0, 1, 2].map((item) => (
          <motion.span
            key={item}
            animate={reduceMotion ? {} : { opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: item * 0.15 }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#a855f7'
            }}
          />
        ))}
      </div>

      {message && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.46)',
              fontWeight: 500,
              letterSpacing: '0'
            }}
          >
            {message}
          </p>
          {detail ? (
            <p style={{ marginTop: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>
              {detail}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

LoadingScreen.propTypes = {
  detail: PropTypes.string,
  message: PropTypes.string
};
