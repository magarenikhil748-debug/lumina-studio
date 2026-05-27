import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.path || error.param || 'request',
    message: error.msg
  }));

  res.status(400).json({
    success: false,
    error: 'Validation failed',
    message: errors[0]?.message || 'Submitted data is invalid',
    details: errors
  });
};
