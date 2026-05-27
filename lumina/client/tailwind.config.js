/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#0a0a0f',
        neon: '#a855f7',
        glass: 'rgba(255,255,255,0.05)',
        muted: 'rgba(255,255,255,0.5)'
      },
      boxShadow: {
        glow: '0 0 40px rgba(168,85,247,0.4)',
        cardGlow: '0 0 30px rgba(168,85,247,0.3)'
      }
    }
  },
  plugins: []
};
