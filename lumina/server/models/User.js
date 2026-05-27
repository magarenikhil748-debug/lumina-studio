import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const nextMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const avatarForName = (name = 'Lumina User') => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;

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
  stripeCustomerId: { type: String, default: null },
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
