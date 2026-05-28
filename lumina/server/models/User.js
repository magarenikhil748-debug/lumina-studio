import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { getPlanLimits } from '../lib/stripe/plans.js';

const nextMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const avatarForName = (name = 'Lumina User') => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;

const planLimitsSchema = new mongoose.Schema({
  portfolioLimit: Number,
  aiGenerationsPerMonth: Number,
  basicTemplates: Number,
  animatedTemplates: Number,
  publicUrl: Boolean,
  watermark: Boolean,
  analyticsViewsOnly: Boolean,
  fullAnalytics: Boolean,
  unlimitedPortfolios: Boolean,
  unlimitedAiGenerations: Boolean,
  customDomainExport: Boolean,
  pdfExport: Boolean,
  priorityAiGeneration: Boolean,
  emailViewNotifications: Boolean,
  portfolioVersions: Number,
  vercelDeploy: Boolean,
  whiteLabel: Boolean,
  teamSeats: Number,
  linkedInResumeImport: Boolean,
  aiPortfolioScore: Boolean,
  careerCoaching: Boolean,
  passwordProtectedPortfolios: Boolean,
  customFontsUpload: Boolean,
  reactSourceExport: Boolean,
  prioritySupport: Boolean
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  googleId: { type: String, default: null, index: { sparse: true } },
  avatar: {
    type: String,
    default() {
      return avatarForName(this.name);
    }
  },
  tier: { type: String, enum: ['free', 'pro'], default: 'free' },
  stripeCustomerId: { type: String, default: null, index: true },
  stripeSubscriptionId: { type: String, default: null, index: true },
  plan: { type: String, enum: ['starter', 'pro', 'studio'], default: 'starter' },
  billingCycle: { type: String, enum: ['monthly', 'annual', null], default: null },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused', 'none'],
    default: 'none'
  },
  trialStartedAt: { type: Date, default: null },
  trialEndsAt: { type: Date, default: null },
  trialUsed: { type: Boolean, default: false },
  currentPeriodStart: { type: Date, default: null },
  currentPeriodEnd: { type: Date, default: null },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: { type: Date, default: null },
  gracePeriodEndsAt: { type: Date, default: null },
  inGracePeriod: { type: Boolean, default: false },
  planLimits: {
    type: planLimitsSchema,
    default: () => getPlanLimits('starter')
  },
  generationsUsedThisMonth: { type: Number, default: 0 },
  generationsResetAt: { type: Date, default: nextMonthStart }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: String(email).trim().toLowerCase() }).select('+password');
};

userSchema.index({ email: 1, googleId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
