import winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize({ all: isDev }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] ${level}: ${message} ${metaStr}`;
      })
    )
  })
];

if (isDev) {
  try {
    const fs = await import('node:fs');
    fs.mkdirSync('./logs', { recursive: true });
    transports.push(
      new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './logs/combined.log' })
    );
  } catch (error) {
    process.stderr.write(`Could not create log files: ${error.message}\n`);
  }
}

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false
});

export default logger;
