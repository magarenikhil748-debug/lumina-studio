import winston from 'winston';

const baseLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const detail = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] ${level}: ${message}${detail}`;
    })
  ),
  transports: [new winston.transports.Console()]
});

const shouldLog = () => process.env.NODE_ENV === 'development';

const logger = {
  debug: (message, meta) => {
    if (shouldLog()) baseLogger.debug(message, meta);
  },
  info: (message, meta) => {
    if (shouldLog()) baseLogger.info(message, meta);
  },
  warn: (message, meta) => {
    if (shouldLog()) baseLogger.warn(message, meta);
  },
  error: (message, meta) => {
    if (shouldLog()) baseLogger.error(message, meta);
  }
};

export default logger;
