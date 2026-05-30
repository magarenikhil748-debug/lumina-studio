import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

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
      <motion.div
        animate={reduceMotion ? {} : {
          boxShadow: [
            '0 0 20px rgba(168,85,247,0.3)',
            '0 0 60px rgba(168,85,247,0.6)',
            '0 0 20px rgba(168,85,247,0.3)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 700,
          color: '#fff',
          position: 'relative',
          zIndex: 2
        }}
      >
        L
      </motion.div>

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
