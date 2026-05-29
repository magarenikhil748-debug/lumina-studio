import { motion } from 'framer-motion';

const WatermarkBadge = () => (
  <motion.a
    href="https://lumina-studio-eta-liart.vercel.app"
    target="_blank"
    rel="noopener noreferrer"
    className="lumina-no-print"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7, duration: 0.35 }}
    whileHover={{ scale: 1.05 }}
    style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      background: 'rgba(168, 85, 247, 0.15)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: 999,
      padding: '8px 16px',
      color: '#d8b4fe',
      fontSize: 12,
      fontWeight: 800,
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      zIndex: 9999,
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
    }}
  >
    Made with Lumina
  </motion.a>
);

export default WatermarkBadge;
