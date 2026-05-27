import { body, param, query } from 'express-validator';
import { strip } from '../utils/validation.js';

const namePattern = /^[A-Za-z][A-Za-z\s-]*$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const text = (field, label, max = 500) => body(field)
  .optional({ values: 'falsy' })
  .customSanitizer(strip)
  .isLength({ max })
  .withMessage(`${label} must be ${max} characters or fewer`);

const requiredText = (field, label, min = 1, max = 500) => body(field)
  .customSanitizer(strip)
  .isLength({ min, max })
  .withMessage(`${label} is required and must be ${max} characters or fewer`);

const optionalUrl = (field, label) => body(field)
  .optional({ values: 'falsy' })
  .customSanitizer(strip)
  .isURL({ protocols: ['http', 'https'], require_protocol: true })
  .withMessage(`${label} must be a valid http or https URL`)
  .isLength({ max: 500 })
  .withMessage(`${label} must be 500 characters or fewer`);

export const registerValidators = [
  body('name')
    .customSanitizer(strip)
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .matches(namePattern)
    .withMessage('Name can only include letters, spaces, and hyphens'),
  body('email')
    .customSanitizer((value) => strip(value).toLowerCase())
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password is required')
    .matches(passwordPattern)
    .withMessage('Password must be at least 8 characters and include uppercase, number, and special character')
];

export const loginValidators = [
  body('email')
    .customSanitizer((value) => strip(value).toLowerCase())
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required')
];

export const waitlistValidators = [
  body('email')
    .customSanitizer((value) => strip(value).toLowerCase())
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  text('role', 'Role', 80)
];

export const mongoIdParam = [
  param('id')
    .customSanitizer(strip)
    .isMongoId()
    .withMessage('A valid portfolio id is required')
];

export const slugParam = [
  param('slug')
    .customSanitizer(strip)
    .isLength({ min: 3, max: 50 })
    .withMessage('A valid portfolio slug is required')
    .matches(slugPattern)
    .withMessage('A valid portfolio slug is required')
];

export const analyticsDaysQuery = [
  query('days')
    .optional({ values: 'falsy' })
    .isInt({ min: 7, max: 90 })
    .withMessage('Days must be an integer between 7 and 90')
    .toInt()
];

export const geminiGenerateValidators = [
  requiredText('name', 'Name', 2, 100)
    .matches(namePattern)
    .withMessage('Name can only include letters, spaces, and hyphens'),
  requiredText('title', 'Title', 2, 140),
  text('location', 'Location', 140),
  text('bioNotes', 'Bio notes', 1600),
  text('bio', 'Bio', 1600),
  body('tone')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['Professional', 'Luxury', 'Minimal', 'Bold', 'Friendly'])
    .withMessage('Tone must be Professional, Luxury, Minimal, Bold, or Friendly'),
  body('audience')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['Recruiters', 'Clients', 'Agencies', 'Investors'])
    .withMessage('Audience must be Recruiters, Clients, Agencies, or Investors'),
  body('template')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['minimal', 'bold', 'creative', 'editorial', 'premium'])
    .withMessage('Template must be a supported Lumina layout'),
  body('layout')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['minimal', 'bold', 'creative', 'editorial', 'premium'])
    .withMessage('Layout must be a supported Lumina layout'),
  body('regenerate')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['bio', 'tagline', 'projects', 'palette', 'full'])
    .withMessage('Regeneration target is not supported'),
  body('skills')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Skills must be an array with 50 items or fewer'),
  text('skills.*.name', 'Skill name', 80),
  body('skills.*.category')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['Frontend', 'Backend', 'Design', 'DevOps', 'Other'])
    .withMessage('Skill category is not supported'),
  body('projects')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Projects must be an array with 5 items or fewer'),
  text('projects.*.title', 'Project title', 140),
  text('projects.*.description', 'Project description', 1400),
  text('projects.*.techStack', 'Project tech stack', 240)
];

export const portfolioValidators = [
  requiredText('name', 'Name', 2, 120)
    .matches(namePattern)
    .withMessage('Name can only include letters, spaces, and hyphens'),
  requiredText('title', 'Title', 2, 140),
  text('location', 'Location', 140),
  body('email')
    .customSanitizer((value) => strip(value).toLowerCase())
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  optionalUrl('linkedin', 'LinkedIn URL'),
  optionalUrl('github', 'GitHub URL'),
  optionalUrl('photoUrl', 'Profile photo URL'),
  body('bioVersions')
    .optional()
    .isArray({ max: 3 })
    .withMessage('Bio versions must be an array with 3 items or fewer'),
  text('bioVersions.*', 'Bio version', 1800),
  text('selectedBio', 'Selected bio', 1800),
  text('bio', 'Bio', 1800),
  body()
    .custom((value) => Boolean(strip(value.selectedBio || value.bio)))
    .withMessage('Selected bio is required'),
  requiredText('tagline', 'Tagline', 2, 180),
  body('skills')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Skills must be an array with 50 items or fewer'),
  text('skills.*.name', 'Skill name', 80),
  body('skills.*.category')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['Frontend', 'Backend', 'Design', 'DevOps', 'Other'])
    .withMessage('Skill category is not supported'),
  text('skillsHeadline', 'Skills headline', 140),
  body('projects')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Projects must be an array with 5 items or fewer'),
  text('projects.*.title', 'Project title', 140),
  text('projects.*.description', 'Project description', 1400),
  text('projects.*.techStack', 'Project tech stack', 240),
  optionalUrl('projects.*.liveUrl', 'Project live URL'),
  optionalUrl('projects.*.githubUrl', 'Project GitHub URL'),
  body('layout')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['minimal', 'bold', 'creative', 'editorial', 'premium'])
    .withMessage('Layout must be a supported Lumina layout'),
  body('template')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['minimal', 'bold', 'creative', 'editorial', 'premium'])
    .withMessage('Template must be a supported Lumina layout'),
  body('plan')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isIn(['free', 'pro', 'studio'])
    .withMessage('Plan must be free, pro, or studio'),
  body('slug')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .isLength({ min: 3, max: 50 })
    .withMessage('Slug must be 3-50 characters')
    .matches(slugPattern)
    .withMessage('Slug must be URL safe'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be true or false'),
  body('qualityScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Quality score must be between 0 and 100'),
  body('views')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Views must be a positive number'),
  body('exportCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Export count must be a positive number'),
  body('exports')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Exports must be a positive number'),
  body('colorPalette')
    .optional()
    .isObject()
    .withMessage('Color palette must be an object'),
  body('colorPalette.primary')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .matches(hexPattern)
    .withMessage('Primary color must be a hex value'),
  body('colorPalette.secondary')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .matches(hexPattern)
    .withMessage('Secondary color must be a hex value'),
  body('colorPalette.accent')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .matches(hexPattern)
    .withMessage('Accent color must be a hex value'),
  body('colorPalette.bg')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .matches(hexPattern)
    .withMessage('Background color must be a hex value'),
  body('colorPalette.text')
    .optional({ values: 'falsy' })
    .customSanitizer(strip)
    .matches(hexPattern)
    .withMessage('Text color must be a hex value'),
  body('generationMetadata')
    .optional()
    .isObject()
    .withMessage('Generation metadata must be an object'),
  text('generationMetadata.model', 'Generation model', 120),
  body('generationMetadata.generatedAt')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Generation timestamp must be a valid date'),
  text('generationMetadata.tone', 'Generation tone', 80),
  text('generationMetadata.audience', 'Generation audience', 80),
  body('generationMetadata.fallback')
    .optional()
    .isBoolean()
    .withMessage('Generation fallback must be true or false')
];
