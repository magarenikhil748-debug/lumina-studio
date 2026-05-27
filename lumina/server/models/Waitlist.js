import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
  role: { type: String, trim: true, maxlength: 80 },
  source: { type: String, default: 'landing' }
}, { timestamps: true });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
