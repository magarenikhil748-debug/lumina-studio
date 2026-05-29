import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';
import WatermarkBadge from './WatermarkBadge';
import { isFreePortfolio } from './templateData';

const fallbackPalette = {
  primary: '#a855f7',
  secondary: '#3b82f6',
  accent: '#ec4899',
  bg: '#0a0a0f',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.58)'
};

const ensureMeta = (name, attribute, value) => {
  if (typeof document === 'undefined' || !value) return;
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
};

const TemplateBase = ({ portfolio, children, fontFamily = 'Inter, system-ui, sans-serif', className = '' }) => {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const palette = portfolio.colorPalette || fallbackPalette;

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const el = containerRef.current;
    el.style.setProperty('--color-primary', palette.primary || fallbackPalette.primary);
    el.style.setProperty('--color-secondary', palette.secondary || fallbackPalette.secondary);
    el.style.setProperty('--color-accent', palette.accent || fallbackPalette.accent);
    el.style.setProperty('--color-bg', palette.bg || fallbackPalette.bg);
    el.style.setProperty('--color-text', palette.text || fallbackPalette.text);
    el.style.setProperty('--color-muted', palette.muted || fallbackPalette.muted);

    const title = [portfolio.name, portfolio.title].filter(Boolean).join(' - ');
    if (title) document.title = `${title} | Lumina`;
    ensureMeta('description', 'name', (portfolio.tagline || portfolio.selectedBio || '').slice(0, 160));
    ensureMeta('og:title', 'property', title);
    ensureMeta('og:description', 'property', portfolio.tagline || portfolio.selectedBio || '');

    if (!document.getElementById('lumina-template-print-styles')) {
      const printStyle = document.createElement('style');
      printStyle.id = 'lumina-template-print-styles';
      printStyle.textContent = `
        @media print {
          .lumina-no-print { display: none !important; }
          .lumina-template { background: white !important; color: black !important; }
          .lumina-template * { animation: none !important; transition: none !important; box-shadow: none !important; text-shadow: none !important; }
          .lumina-template a { color: black !important; text-decoration: underline !important; }
        }
      `;
      document.head.appendChild(printStyle);
    }

    return () => {
      document.getElementById('lumina-template-print-styles')?.remove();
    };
  }, [palette, portfolio]);

  return (
    <div
      ref={containerRef}
      className={`lumina-template min-h-screen ${className}`}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      style={{ fontFamily }}
    >
      {children}
      {isFreePortfolio(portfolio) && <WatermarkBadge />}
    </div>
  );
};

TemplateBase.propTypes = {
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    tagline: PropTypes.string,
    selectedBio: PropTypes.string,
    plan: PropTypes.string,
    tier: PropTypes.string,
    colorPalette: PropTypes.shape({
      primary: PropTypes.string,
      secondary: PropTypes.string,
      accent: PropTypes.string,
      bg: PropTypes.string,
      text: PropTypes.string,
      muted: PropTypes.string
    })
  }).isRequired,
  children: PropTypes.node.isRequired,
  fontFamily: PropTypes.string,
  className: PropTypes.string
};

export default TemplateBase;
