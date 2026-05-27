const urlFields = new Set(['linkedin', 'github', 'photoUrl', 'liveUrl', 'githubUrl']);

export const strip = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

export const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isValidName = (value = '') => /^[A-Za-z][A-Za-z\s-]{1,99}$/.test(strip(value));

export const isStrongPassword = (value = '') => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(String(value));

export const isValidUrl = (value = '') => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (error) {
    return false;
  }
};

export const slugify = (value = 'portfolio') => strip(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 72) || 'portfolio';

export const ensureHex = (value, fallback) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || '') ? value : fallback;

export const randomSuffix = (length = 4) => Math.random().toString(36).slice(2, 2 + length);

export const cleanObject = (body = {}) => Object.entries(body).reduce((acc, [key, value]) => {
  acc[key] = typeof value === 'string' && urlFields.has(key) ? strip(value) : value;
  return acc;
}, {});
