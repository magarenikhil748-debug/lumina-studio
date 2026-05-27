import mongoose from 'mongoose';
import Waitlist from '../models/Waitlist.js';
import { isValidEmail, strip } from '../utils/validation.js';

const memoryWaitlist = new Map();
const usingDb = () => mongoose.connection.readyState === 1;

export const joinWaitlist = async (req, res, next) => {
  try {
    const email = strip(req.body.email).toLowerCase();
    const role = strip(req.body.role || 'creator');
    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error('A valid email is required');
    }
    if (usingDb()) {
      const entry = await Waitlist.findOneAndUpdate({ email }, { email, role, source: 'landing' }, { upsert: true, new: true });
      res.status(201).json({ success: true, data: entry });
      return;
    }
    const entry = { email, role, source: 'landing', createdAt: new Date().toISOString() };
    memoryWaitlist.set(email, entry);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};
