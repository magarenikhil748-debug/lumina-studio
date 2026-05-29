export const plans = {
  free: {
    id: 'free',
    name: 'Free',
    price: '₹0',
    cadence: 'forever',
    badge: 'Start here',
    features: ['1 portfolio', 'Basic AI generation', 'Lumina watermark', 'Shareable preview'],
    watermark: true
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    cadence: 'month',
    badge: 'Most popular',
    features: ['Unlimited portfolios', 'Premium templates', 'No watermark', 'Export HTML'],
    watermark: false
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: '₹999',
    cadence: 'month',
    badge: 'For client work',
    features: ['Client portfolios', 'Custom branding', 'Priority AI generations', 'Analytics dashboard'],
    watermark: false
  }
};

export const palettes = [
  { name: 'Obsidian', primary: '#a78bfa', secondary: '#2dd4bf', accent: '#fb7185', bg: '#08080d', text: '#f8fafc' },
  { name: 'Graphite', primary: '#f8fafc', secondary: '#94a3b8', accent: '#a78bfa', bg: '#09090b', text: '#fafafa' },
  { name: 'Aurora', primary: '#a855f7', secondary: '#38bdf8', accent: '#ec4899', bg: '#0a0a0f', text: '#f8fafc' },
  { name: 'Atelier', primary: '#f59e0b', secondary: '#22c55e', accent: '#ef4444', bg: '#101014', text: '#fff7ed' },
  { name: 'Oceanic', primary: '#06b6d4', secondary: '#6366f1', accent: '#14b8a6', bg: '#07111f', text: '#e0f2fe' }
];

export const templates = [
  { id: 'minimal', name: 'Minimal', description: 'Sharp, recruiter-safe, low friction.' },
  { id: 'bold', name: 'Bold', description: 'High contrast for builders with strong proof.' },
  { id: 'creative', name: 'Creative', description: 'Expressive motion and visual hierarchy.' },
  { id: 'editorial', name: 'Editorial', description: 'Magazine-like storytelling for designers.' },
  { id: 'premium', name: 'Premium', description: 'Luxury SaaS styling for client-facing work.' }
];

export const defaultDraft = {
  name: '',
  title: '',
  location: '',
  email: '',
  linkedin: '',
  github: '',
  photoUrl: '',
  bioNotes: '',
  bioVersions: [],
  selectedBio: '',
  tagline: '',
  tone: 'Professional',
  audience: 'Recruiters',
  skills: [],
  projects: [],
  layout: 'minimal',
  template: 'premium',
  templateId: 'glass',
  colorPalette: palettes[0],
  plan: 'free',
  qualityScore: 0,
  suggestions: []
};

export const samplePortfolio = {
  ...defaultDraft,
  name: 'Maya Chen',
  title: 'Product Designer & Frontend Builder',
  location: 'Bengaluru, India',
  email: 'maya@lumina.studio',
  linkedin: 'https://linkedin.com/in/mayachen',
  github: 'https://github.com/mayachen',
  photoUrl: '',
  bioVersions: [
    'I design and build polished digital products that make complex workflows feel calm, fast, and memorable.'
  ],
  selectedBio: 'I design and build polished digital products that make complex workflows feel calm, fast, and memorable.',
  tagline: 'Interfaces with clarity, motion, and measurable outcomes.',
  skills: [
    { name: 'React', category: 'Frontend' },
    { name: 'Design Systems', category: 'Design' },
    { name: 'UX Strategy', category: 'Design' },
    { name: 'Node.js', category: 'Backend' }
  ],
  projects: [
    { title: 'Atlas CRM', description: 'A calm pipeline workspace for high-volume sales teams with AI-assisted follow-ups.', techStack: 'React, Node, MongoDB', liveUrl: 'https://example.com', githubUrl: 'https://github.com' },
    { title: 'Signal Labs', description: 'A portfolio analytics dashboard that helps freelancers understand what prospects actually view.', techStack: 'Vite, Tailwind, Express', liveUrl: 'https://example.com', githubUrl: 'https://github.com' }
  ],
  layout: 'premium',
  template: 'premium',
  templateId: 'glass',
  plan: 'pro',
  qualityScore: 94
};

/**
 * Removes markup-sensitive characters from user-entered text.
 * @param {string} value - Any raw value.
 * @returns {string} Sanitized plain text.
 */
export const sanitizeText = (value = '') => String(value).replace(/[<>]/g, '').trim();

/**
 * Produces a readable slug from a name or title.
 * @param {string} value - Source string.
 * @returns {string} URL-safe slug.
 */
export const createSlug = (value = 'portfolio') => sanitizeText(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 72) || 'portfolio';

/**
 * Produces a compact id for generated UI keys.
 * @returns {string} Random id.
 */
export const createId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

/**
 * Scores a portfolio draft and returns suggestions for improvement.
 * @param {object} portfolio - Portfolio draft.
 * @returns {{score: number, suggestions: string[]}} Score and actionable suggestions.
 */
export const calculateQuality = (portfolio) => {
  const checks = [
    { ok: Boolean(portfolio.name), points: 8, message: 'Add your full name for trust.' },
    { ok: Boolean(portfolio.title), points: 8, message: 'Add a clear role or positioning line.' },
    { ok: Boolean(portfolio.email), points: 8, message: 'Add an email so opportunities can reach you.' },
    { ok: Boolean(portfolio.selectedBio || portfolio.bioNotes), points: 14, message: 'Add a focused bio with outcomes.' },
    { ok: (portfolio.skills || []).length >= 5, points: 12, message: 'Add at least five relevant skills.' },
    { ok: (portfolio.projects || []).length >= 2, points: 14, message: 'Add two or more proof-heavy projects.' },
    { ok: (portfolio.projects || []).every((project) => project.description?.length > 80), points: 12, message: 'Give each project a stronger result-driven description.' },
    { ok: Boolean(portfolio.linkedin || portfolio.github), points: 8, message: 'Add LinkedIn or GitHub for credibility.' },
    { ok: Boolean(portfolio.tagline), points: 8, message: 'Generate or write a memorable tagline.' },
    { ok: Boolean(portfolio.colorPalette?.primary), points: 8, message: 'Choose a polished color palette.' }
  ];
  const score = Math.min(100, checks.reduce((total, check) => total + (check.ok ? check.points : 0), 0));
  const suggestions = checks.filter((check) => !check.ok).map((check) => check.message).slice(0, 4);
  return { score, suggestions };
};

/**
 * Builds standalone portfolio HTML for export or clipboard use.
 * @param {object} portfolio - Portfolio data and AI content.
 * @returns {string} Complete HTML document.
 */
export const buildStandaloneHtml = (portfolio) => {
  const palette = portfolio.colorPalette || palettes[0];
  const watermark = plans[portfolio.plan || 'free']?.watermark;
  const skills = (portfolio.skills || []).map((skill) => `<span>${sanitizeText(skill.name)}</span>`).join('');
  const projects = (portfolio.projects || []).map((project) => `
    <article>
      <h3>${sanitizeText(project.title)}</h3>
      <p>${sanitizeText(project.description)}</p>
      <small>${sanitizeText(project.techStack)}</small>
    </article>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="${sanitizeText(portfolio.tagline || portfolio.selectedBio)}" />
<meta property="og:title" content="${sanitizeText(portfolio.name)} - ${sanitizeText(portfolio.title)}" />
<meta property="og:description" content="${sanitizeText(portfolio.tagline)}" />
<title>${sanitizeText(portfolio.name)} Portfolio</title>
<style>
body{margin:0;font-family:Inter,Arial,sans-serif;background:${palette.bg};color:${palette.text};}
main{max-width:1080px;margin:auto;padding:64px 24px;}
header{min-height:62vh;display:grid;align-content:center;gap:18px;}
h1{font-size:clamp(3rem,8vw,7rem);line-height:.9;margin:0;color:${palette.primary};}
h2{font-size:clamp(2rem,5vw,4rem);margin:48px 0 16px;}
p{font-size:1.05rem;line-height:1.75;color:${palette.text}cc;}
.tagline{font-size:clamp(1.4rem,3vw,2.4rem);color:${palette.secondary};font-weight:800;}
.skills{display:flex;flex-wrap:wrap;gap:10px}.skills span{border:1px solid ${palette.primary}66;border-radius:999px;padding:8px 14px;}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}
article{border:1px solid ${palette.primary}44;background:rgba(255,255,255,.055);border-radius:18px;padding:22px;}
.watermark{position:fixed;right:18px;bottom:18px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 14px;background:rgba(0,0,0,.48);backdrop-filter:blur(16px);font-size:12px;}
a{color:${palette.accent};}
</style>
</head>
<body>
<main>
<header>
${portfolio.photoUrl ? `<img src="${sanitizeText(portfolio.photoUrl)}" alt="" width="112" height="112" loading="lazy" style="width:112px;height:112px;border-radius:999px;object-fit:cover" />` : ''}
<h1>${sanitizeText(portfolio.name)}</h1>
<p class="tagline">${sanitizeText(portfolio.tagline)}</p>
<p>${sanitizeText(portfolio.title)} - ${sanitizeText(portfolio.location)}</p>
</header>
<section><h2>About</h2><p>${sanitizeText(portfolio.selectedBio || portfolio.bio)}</p></section>
<section><h2>Skills</h2><div class="skills">${skills}</div></section>
<section><h2>Projects</h2><div class="grid">${projects}</div></section>
</main>
${watermark ? '<div class="watermark">Built with Lumina Studio</div>' : ''}
</body>
</html>`;
};
