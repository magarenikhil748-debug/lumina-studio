import logger from '../utils/logger.js';

const mongoErrorNames = new Set([
  'CastError',
  'MongoServerError',
  'MongoNetworkError',
  'MongoServerSelectionError',
  'MongooseServerSelectionError',
  'ValidationError'
]);

const isMongoError = (error) => mongoErrorNames.has(error?.name) || error?.code === 11000;

const safeErrorResponse = (error, fallbackStatus) => {
  if (error?.clientError || error?.clientMessage) {
    return {
      statusCode: error.statusCode || fallbackStatus,
      error: error.clientError || error.message || 'Request could not be completed',
      message: error.clientMessage || error.message || 'Request could not be completed'
    };
  }

  if (error?.code === 11000) {
    return { statusCode: 409, error: 'A record with this value already exists', message: 'A record with this value already exists' };
  }

  if (error?.name === 'CastError') {
    return { statusCode: 400, error: 'Invalid identifier supplied', message: 'Invalid identifier supplied' };
  }

  if (error?.name === 'ValidationError') {
    return { statusCode: 400, error: 'Submitted data is invalid', message: 'Submitted data is invalid' };
  }

  if (['MongoNetworkError', 'MongoServerSelectionError', 'MongooseServerSelectionError'].includes(error?.name)) {
    return { statusCode: 503, error: 'Database temporarily unavailable', message: 'Database temporarily unavailable' };
  }

  if (error?.statusCode && error.statusCode < 500 && !isMongoError(error)) {
    return { statusCode: error.statusCode, error: error.message || 'Request could not be completed', message: error.message || 'Request could not be completed' };
  }

  if (fallbackStatus < 500 && !isMongoError(error)) {
    return { statusCode: fallbackStatus, error: error.message || 'Request could not be completed', message: error.message || 'Request could not be completed' };
  }

  return { statusCode: 500, error: 'Something went wrong. Please try again.', message: 'Something went wrong. Please try again.' };
};

export const notFound = (req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  const fallbackStatus = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const { statusCode, error, message } = safeErrorResponse(err, fallbackStatus);

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: err.name,
    errorMessage: err.message
  });

  res.status(statusCode).json({
    success: false,
    error,
    message
  });
};
