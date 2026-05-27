import rateLimit from 'express-rate-limit';

const jsonHandler = (message, extras = {}) => (req, res) => {
  res.status(429).json({ success: false, error: message, message, ...extras });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many authentication attempts. Please wait and try again.')
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.user?.tier === 'pro',
  handler: jsonHandler('Too many AI requests. Please wait a minute and try again.')
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many requests. Please slow down and try again.')
});

export const apiLimiter = generalLimiter;
