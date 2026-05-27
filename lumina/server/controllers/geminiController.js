import { getGeminiModel, getGeminiModelName } from '../utils/geminiClient.js';
import { ensureHex, strip } from '../utils/validation.js';

const fallbackPalette = { primary: '#a78bfa', secondary: '#2dd4bf', accent: '#fb7185', bg: '#08080d', text: '#f8fafc' };

const fallbackGeneration = (input, fallbackReason = 'Gemini unavailable') => {
  const name = input.name || 'Creative professional';
  const title = input.title || 'Portfolio builder';
  const projectDescriptions = (input.projects?.length ? input.projects : [{ title: 'Featured project', description: 'A focused project with measurable outcomes.' }])
    .map((project) => `${strip(project.title)} is a polished case study showing ${strip(project.description || 'clear thinking, execution, and measurable product impact')}.`);

  return {
    bio: {
      version1: `${name} is a ${title} who turns ideas into polished digital experiences with clear strategy, strong execution, and memorable presentation.`,
      version2: `${name} builds thoughtful work for ${input.audience || 'modern teams'}, combining craft, clarity, and measurable outcomes across every project.`,
      version3: `${name} brings a ${input.tone || 'Professional'} approach to portfolio-worthy work, translating complex problems into elegant, useful experiences.`
    },
    projectDescriptions,
    tagline: 'AI portfolios that get you noticed.',
    layoutSuggestion: input.template || 'premium',
    colorPalette: fallbackPalette,
    skillsHeadline: 'Core strengths',
    metadata: {
      model: 'fallback',
      generatedAt: new Date().toISOString(),
      tone: input.tone || 'Professional',
      audience: input.audience || 'Recruiters',
      fallback: true,
      fallbackReason
    }
  };
};

const parseJsonWithRepair = (text = '') => {
  const trimmed = text.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw error;
  }
};

const validateGeneration = (payload, input) => {
  const bio = payload?.bio || {};
  const colorPalette = payload?.colorPalette || {};
  const layoutSuggestion = ['minimal', 'bold', 'creative', 'editorial', 'premium'].includes(payload?.layoutSuggestion)
    ? payload.layoutSuggestion
    : input.template || 'premium';

  return {
    bio: {
      version1: strip(bio.version1 || fallbackGeneration(input).bio.version1),
      version2: strip(bio.version2 || fallbackGeneration(input).bio.version2),
      version3: strip(bio.version3 || fallbackGeneration(input).bio.version3)
    },
    projectDescriptions: Array.isArray(payload?.projectDescriptions)
      ? payload.projectDescriptions.map(strip).slice(0, Math.max(input.projects.length, 1))
      : fallbackGeneration(input).projectDescriptions,
    tagline: strip(payload?.tagline || 'AI portfolios that get you noticed.'),
    layoutSuggestion,
    colorPalette: {
      primary: ensureHex(colorPalette.primary, fallbackPalette.primary),
      secondary: ensureHex(colorPalette.secondary, fallbackPalette.secondary),
      accent: ensureHex(colorPalette.accent, fallbackPalette.accent),
      bg: ensureHex(colorPalette.bg, fallbackPalette.bg),
      text: ensureHex(colorPalette.text, fallbackPalette.text)
    },
    skillsHeadline: strip(payload?.skillsHeadline || 'Core strengths'),
    metadata: {
      model: getGeminiModelName(),
      generatedAt: new Date().toISOString(),
      tone: input.tone,
      audience: input.audience,
      fallback: false
    }
  };
};

const withTimeout = async (promise, ms = 25000) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

export const generateWithGemini = async (req, res, next) => {
  try {
    const input = {
      name: strip(req.body.name),
      title: strip(req.body.title),
      location: strip(req.body.location),
      bioNotes: strip(req.body.bioNotes || req.body.bio),
      tone: strip(req.body.tone || 'Professional'),
      audience: strip(req.body.audience || 'Recruiters'),
      template: strip(req.body.template || req.body.layout || 'premium'),
      regenerate: strip(req.body.regenerate || ''),
      skills: Array.isArray(req.body.skills) ? req.body.skills.map((skill) => ({ name: strip(skill.name), category: strip(skill.category) })) : [],
      projects: Array.isArray(req.body.projects) ? req.body.projects.slice(0, 5).map((project) => ({
        title: strip(project.title),
        description: strip(project.description),
        techStack: strip(project.techStack)
      })) : []
    };

    if (!input.name || !input.title) {
      res.status(400);
      throw new Error('Name and title are required for AI generation');
    }

    const prompt = `Return ONLY valid JSON. Do not include markdown, comments, or prose.
Product: Lumina Studio, an AI portfolio builder.
Target users: designers, developers, freelancers, students, creators.
Core promise: generate a polished portfolio in minutes using AI.
Requested regeneration focus: ${input.regenerate || 'full portfolio direction'}.
Tone: ${input.tone}.
Audience: ${input.audience}.
Preferred template: ${input.template}.
Input:
${JSON.stringify(input)}
Required JSON schema:
{
  "bio": { "version1": "string", "version2": "string", "version3": "string" },
  "projectDescriptions": ["string for each project, same order"],
  "tagline": "short portfolio tagline",
  "layoutSuggestion": "minimal | bold | creative | editorial | premium",
  "colorPalette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "bg": "#hex", "text": "#hex" },
  "skillsHeadline": "short skills section headline"
}
Rules: keep copy specific, outcome-driven, credible, and concise.`;

    try {
      const model = getGeminiModel();
      const result = await withTimeout(model.generateContent(prompt));
      const text = result.response.text();
      const parsed = validateGeneration(parseJsonWithRepair(text), input);
      res.json({ success: true, data: parsed });
    } catch (error) {
      res.json({ success: true, data: fallbackGeneration(input, error.message) });
    }
  } catch (error) {
    next(error);
  }
};
