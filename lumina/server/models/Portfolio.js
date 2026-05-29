import mongoose from 'mongoose';
import { generateSlug } from '../utils/slugGenerator.js';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, enum: ['Frontend', 'Backend', 'Design', 'DevOps', 'Other'], default: 'Other' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 1400 },
  techStack: { type: String, trim: true, maxlength: 240 },
  liveUrl: { type: String, trim: true, maxlength: 500 },
  githubUrl: { type: String, trim: true, maxlength: 500 }
}, { _id: false });

const colorPaletteSchema = new mongoose.Schema({
  primary: { type: String, required: true },
  secondary: { type: String, required: true },
  accent: { type: String, required: true },
  bg: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const generationMetadataSchema = new mongoose.Schema({
  model: { type: String, default: 'gemini-2.5-flash' },
  generatedAt: { type: Date, default: Date.now },
  tone: { type: String, default: 'Professional' },
  audience: { type: String, default: 'Recruiters' },
  fallback: { type: Boolean, default: false }
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ownerName: { type: String, trim: true, maxlength: 100 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  location: { type: String, trim: true, maxlength: 140 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  linkedin: { type: String, trim: true, maxlength: 500 },
  github: { type: String, trim: true, maxlength: 500 },
  photoUrl: { type: String, trim: true, maxlength: 500 },
  bioVersions: [{ type: String, trim: true, maxlength: 1800 }],
  selectedBio: { type: String, required: true, trim: true, maxlength: 1800 },
  tagline: { type: String, required: true, trim: true, maxlength: 180 },
  skills: [skillSchema],
  skillsHeadline: { type: String, trim: true, maxlength: 140 },
  projects: [projectSchema],
  layout: { type: String, enum: ['minimal', 'bold', 'creative', 'editorial', 'premium'], default: 'premium' },
  template: { type: String, default: 'premium' },
  templateId: {
    type: String,
    enum: ['terminal', 'minimalcode', 'blueprint', 'runway', 'canvas', 'studio', 'cosmos', 'neon', 'glass'],
    default: 'glass'
  },
  colorPalette: { type: colorPaletteSchema, required: true },
  plan: { type: String, enum: ['free', 'pro', 'studio'], default: 'free' },
  slug: { type: String, unique: true, sparse: true, index: true },
  isPublic: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  exportCount: { type: Number, default: 0 },
  exports: { type: Number, default: 0 },
  qualityScore: { type: Number, default: 0, min: 0, max: 100 },
  generationMetadata: generationMetadataSchema
}, { timestamps: true });

portfolioSchema.pre('validate', function createSlug(next) {
  if (!this.slug) this.slug = generateSlug(this.name);
  next();
});

portfolioSchema.statics.findBySlug = function findBySlug(slug) {
  return this.findOne({ slug, isPublic: true }).populate('ownerId', 'name avatar tier');
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
