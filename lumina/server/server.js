process.on('uncaughtException', (err) => {
  process.stderr.write(`[FATAL] Uncaught Exception: ${err.message}\n`);
  process.stderr.write(`${err.stack || ''}\n`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  process.stderr.write(`[FATAL] Unhandled Rejection at: ${promise}\n`);
  process.stderr.write(`Reason: ${reason?.stack || reason}\n`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  process.stderr.write('[INFO] SIGTERM received, shutting down gracefully\n');
  process.exit(0);
});

process.on('SIGINT', () => {
  process.stderr.write('[INFO] SIGINT received, shutting down gracefully\n');
  process.exit(0);
});

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY'
];

const parseOrigins = (value) => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const buildConfig = () => {
  const config = {
    port: Number.parseInt(process.env.PORT || '', 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
    version: process.env.npm_package_version || '1.0.0'
  };

  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingEnvVars.length > 0) {
    process.stderr.write(`[FATAL] Missing required environment variables: ${missingEnvVars.join(', ')}\n`);
    process.exit(1);
  }

  return config;
};

async function startServer() {
  try {
    const { default: dotenv } = await import('dotenv');
    dotenv.config();

    const config = buildConfig();
    const clientOrigins = parseOrigins(config.clientUrl);
    const allowedOrigins = Array.from(new Set([
      ...clientOrigins,
      'http://localhost:5173',
      'http://localhost:3000'
    ]));

    const [
      { default: express },
      { default: cors },
      { default: helmet },
      { default: morgan },
      { default: cookieParser },
      { default: passport },
      { default: mongoose },
      { default: connectDB },
      { default: logger },
      { errorHandler, notFound },
      { generalLimiter }
    ] = await Promise.all([
      import('express'),
      import('cors'),
      import('helmet'),
      import('morgan'),
      import('cookie-parser'),
      import('passport'),
      import('mongoose'),
      import('./config/db.js'),
      import('./utils/logger.js'),
      import('./middleware/errorHandler.js'),
      import('./middleware/rateLimiter.js')
    ]);

    await connectDB();
    logger.info('MongoDB connected successfully');

    await import('./config/passport.js');

    const [
      { default: authRoutes },
      { default: geminiRoutes },
      { default: portfolioRoutes },
      { default: waitlistRoutes }
    ] = await Promise.all([
      import('./routes/authRoutes.js'),
      import('./routes/geminiRoutes.js'),
      import('./routes/portfolioRoutes.js'),
      import('./routes/waitlistRoutes.js')
    ]);

    const app = express();
    app.set('trust proxy', 1);

    const helmetDirectives = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'https://api.dicebear.com', 'https://api.qrserver.com'],
      connectSrc: ["'self'", ...clientOrigins],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"]
    };
    if (config.nodeEnv === 'production') helmetDirectives.upgradeInsecureRequests = [];

    app.use(helmet({
      contentSecurityPolicy: {
        directives: helmetDirectives
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'no-referrer' }
    }));

    const corsOptions = {
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        logger.warn('CORS blocked request from origin', { origin });
        return callback(Object.assign(new Error('Not allowed by CORS'), { statusCode: 403 }));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie']
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    app.use(generalLimiter);
    app.use(express.json({ limit: '750kb' }));
    app.use(express.urlencoded({ extended: true, limit: '750kb' }));
    app.use(cookieParser());
    app.use(passport.initialize());

    if (config.nodeEnv !== 'production') {
      app.use(morgan('dev', { stream: { write: (message) => logger.info(message.trim()) } }));
    }

    app.get('/api/health', async (req, res) => {
      const dbState = mongoose.connection.readyState;
      const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }[dbState] || 'unknown';

      res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? 'ok' : 'degraded',
        db: dbStatus,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: config.version
      });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/gemini', geminiRoutes);
    app.use('/api/portfolios', portfolioRoutes);
    app.use('/api/portfolio', portfolioRoutes);
    app.use('/api/waitlist', waitlistRoutes);
    app.use(notFound);
    app.use(errorHandler);

    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error('Server error', { error: err.message, stack: err.stack });
      }
      process.exit(1);
    });

    return server;
  } catch (err) {
    process.stderr.write(`[FATAL] Server failed to start: ${err.message}\n`);
    process.stderr.write(`${err.stack || ''}\n`);
    process.exit(1);
  }
}

startServer();
