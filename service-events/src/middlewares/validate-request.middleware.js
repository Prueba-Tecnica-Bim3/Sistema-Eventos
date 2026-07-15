const { validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    error: 'VALIDATION_ERROR',
    details: errors.array().map((e) => ({ field: e.param, msg: e.msg })),
  });
}

module.exports = { handleValidationErrors };
