import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

dotenv.config();
await import('./config/passport.js');

const app = express();
const port = process.env.PORT || 5000;
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'none'"],
      imgSrc: ["'self'", 'data:', 'https://api.qrserver.com'],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'no-referrer' }
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(Object.assign(new Error('CORS origin denied'), { statusCode: 403 }));
  },
  credentials: true
}));
app.use(generalLimiter);
app.use(express.json({ limit: '750kb' }));
app.use(express.urlencoded({ extended: true, limit: '750kb' }));
app.use(cookieParser());
app.use(passport.initialize());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: { write: (message) => logger.info(message.trim()) } }));
}

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  uptime: process.uptime()
}));
app.use('/api/auth', authRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    app.locals.dbConnected = await connectDB();
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Lumina API listening on port ${port}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

start();
