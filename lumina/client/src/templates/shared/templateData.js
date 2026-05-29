export const templateIds = ['terminal', 'minimalcode', 'blueprint', 'runway', 'canvas', 'studio', 'cosmos', 'neon', 'glass'];

export const getBio = (portfolio = {}) => (
  portfolio.selectedBio
  || portfolio.bio
  || portfolio.bioVersions?.[0]
  || portfolio.tagline
  || ''
);

export const getInitials = (name = 'Lumina') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'L';

export const getPhotoUrl = (portfolio = {}) => (
  portfolio.photoUrl
  || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(portfolio.name || 'Lumina')}`
);

export const getTechList = (techStack = '') => String(techStack)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export const isFreePortfolio = (portfolio = {}) => (
  (portfolio.plan || portfolio.tier || 'free') === 'free'
);

export const clampProjects = (projects = []) => Array.isArray(projects) ? projects.filter(Boolean) : [];

export const clampSkills = (skills = []) => Array.isArray(skills) ? skills.filter((skill) => skill?.name) : [];

export const randomFromString = (value = '', min = 70, max = 98) => {
  const seed = String(value).split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return min + (seed % (max - min + 1));
};

export const resolveTemplateId = (portfolio = {}, templateId) => {
  const candidate = String(templateId || portfolio.templateId || portfolio.template || '').toLowerCase();
  return templateIds.includes(candidate) ? candidate : 'glass';
};
