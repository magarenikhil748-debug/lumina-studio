import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';

import Terminal from './developer/Terminal';
import MinimalCode from './developer/MinimalCode';
import Blueprint from './developer/Blueprint';
import Runway from './designer/Runway';
import Canvas from './designer/Canvas';
import Studio from './designer/Studio';
import Cosmos from './creative/Cosmos';
import Neon from './creative/Neon';
import Glass from './creative/Glass';

export const TEMPLATES = {
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    category: 'developer',
    description: 'Dark terminal system with typing, scanlines, and skill loaders.',
    tier: 'pro',
    component: Terminal,
    thumbnail: '/thumbnails/terminal.png',
    colors: ['#0a0a0f', '#00ff41', '#1a1a2e'],
    tags: ['dark', 'minimal', 'code']
  },
  minimalcode: {
    id: 'minimalcode',
    name: 'Minimal Code',
    category: 'developer',
    description: 'Clean documentation aesthetic with progress and commit cards.',
    tier: 'pro',
    component: MinimalCode,
    thumbnail: '/thumbnails/minimalcode.png',
    colors: ['#ffffff', '#18181b', '#6366f1'],
    tags: ['clean', 'minimal', 'light']
  },
  blueprint: {
    id: 'blueprint',
    name: 'Blueprint',
    category: 'developer',
    description: 'Technical schematic with grid, nodes, and measurement details.',
    tier: 'pro',
    component: Blueprint,
    thumbnail: '/thumbnails/blueprint.png',
    colors: ['#0d1b2a', '#1e3a5f', '#4a90d9'],
    tags: ['technical', 'dark', 'engineering']
  },
  runway: {
    id: 'runway',
    name: 'Runway',
    category: 'designer',
    description: 'Editorial magazine layout with letter reveals and horizontal work.',
    tier: 'pro',
    component: Runway,
    thumbnail: '/thumbnails/runway.png',
    colors: ['#fafafa', '#1a1a1a', '#ff3366'],
    tags: ['editorial', 'bold', 'magazine']
  },
  canvas: {
    id: 'canvas',
    name: 'Canvas',
    category: 'designer',
    description: 'Artist portfolio with masonry, lightbox, and tactile cursor trail.',
    tier: 'pro',
    component: Canvas,
    thumbnail: '/thumbnails/canvas.png',
    colors: ['#fffef7', '#2d2d2d', '#e63946'],
    tags: ['artistic', 'colorful', 'creative']
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    category: 'designer',
    description: 'Agency-grade sections with parallax, awards, and sticky navigation.',
    tier: 'pro',
    component: Studio,
    thumbnail: '/thumbnails/studio.png',
    colors: ['#f5f5f0', '#1c1c1e', '#ff6b35'],
    tags: ['agency', 'professional', 'bold']
  },
  cosmos: {
    id: 'cosmos',
    name: 'Cosmos',
    category: 'creative',
    description: 'Immersive star field with constellation skills and planet projects.',
    tier: 'studio',
    component: Cosmos,
    thumbnail: '/thumbnails/cosmos.png',
    colors: ['#03001c', '#7b2ff7', '#f107a3'],
    tags: ['space', 'dark', 'immersive']
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    category: 'creative',
    description: 'Cyberpunk interface with glitch typography and holographic cards.',
    tier: 'studio',
    component: Neon,
    thumbnail: '/thumbnails/neon.png',
    colors: ['#0d0d0d', '#ff00ff', '#00ffff'],
    tags: ['cyberpunk', 'neon', 'futuristic']
  },
  glass: {
    id: 'glass',
    name: 'Glass',
    category: 'creative',
    description: 'Premium glassmorphism with aurora motion and frosted content.',
    tier: 'studio',
    component: Glass,
    thumbnail: '/thumbnails/glass.png',
    colors: ['#0f0c29', '#a855f7', '#3b82f6'],
    tags: ['glass', 'minimal', 'elegant']
  }
};

export const FREE_TEMPLATES = ['minimal', 'bold', 'creative'];

export function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.glass;
}

export function getTemplatesByCategory(category) {
  return Object.values(TEMPLATES).filter((template) => template.category === category);
}

export function getTemplatesByTier(tier) {
  if (tier === 'studio') return Object.values(TEMPLATES);
  if (tier === 'pro') return Object.values(TEMPLATES).filter((template) => template.tier !== 'studio');
  return [];
}

export function canUseTemplate(template, tier = 'starter') {
  if (!template) return false;
  if (tier === 'studio') return true;
  if (tier === 'pro') return template.tier !== 'studio';
  return !['pro', 'studio'].includes(template.tier);
}
