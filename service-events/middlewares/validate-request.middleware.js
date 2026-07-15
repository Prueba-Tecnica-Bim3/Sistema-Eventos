const { validationResult } = require('express-validator');
const { AppError } = require('./error-handler.middleware');

/**
 * Middleware que centraliza el resultado de las validaciones de express-validator.
 * Debe ejecutarse siempre después de las cadenas de validación definidas
 * en cada `*.validators.js`. Única responsabilidad: traducir errores de
 * validación en una respuesta 400 consistente.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return next(new AppError('Error de validación', 400, formattedErrors));
  }

  return next();
}

module.exports = { handleValidationErrors };
