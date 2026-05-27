/**
 * Returns the public site origin used for generated portfolio links.
 * Local development uses the current browser origin so previews stay clickable.
 *
 * @returns {string} Public origin without a trailing slash.
 */
export const getPublicBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_PUBLIC_SITE_URL || import.meta.env.VITE_PUBLIC_URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');
  if (import.meta.env.DEV && typeof window !== 'undefined') return window.location.origin.replace(/\/+$/, '');
  return 'https://lumina.so';
};

/**
 * Formats a public URL for compact UI labels.
 *
 * @param {string} url - Absolute public URL.
 * @returns {string} URL without the protocol prefix.
 */
export const formatPublicUrl = (url) => url.replace(/^https?:\/\//, '');
