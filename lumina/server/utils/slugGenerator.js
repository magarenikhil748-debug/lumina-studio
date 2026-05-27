/**
 * Generates a readable portfolio slug with a short random suffix.
 * @param {string} name - Portfolio owner or portfolio name.
 * @returns {string} URL-safe slug.
 */
export const generateSlug = (name = 'portfolio') => {
  const base = String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30)
    .replace(/-$/g, '') || 'portfolio';
  const suffix = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 6).padEnd(4, '0');
  return `${base}-${suffix}`;
};

/**
 * Resolves slug collisions by appending an incremented numeric suffix.
 * @param {string} slug - Desired slug.
 * @param {import('mongoose').Model} Portfolio - Portfolio mongoose model.
 * @returns {Promise<string>} Unique slug.
 */
export const ensureUniqueSlug = async (slug, Portfolio) => {
  let candidate = slug;
  let index = 1;

  while (await Portfolio.exists({ slug: candidate })) {
    const suffix = `-${index}`;
    candidate = `${slug.slice(0, Math.max(1, 50 - suffix.length))}${suffix}`;
    index += 1;
  }

  return candidate;
};
