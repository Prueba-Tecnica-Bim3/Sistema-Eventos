/**
 * Error de aplicación controlado (operacional).
 * Permite lanzar errores desde cualquier capa con un código HTTP definido,
 * sin necesidad de repetir bloques try/catch en cada controlador.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para rutas no registradas.
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Middleware centralizado de manejo de errores.
 * Traduce errores de Mongoose y errores de aplicación a respuestas HTTP
 * consistentes, sin exponer detalles internos ni stack traces al cliente.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details = err.details || null;

  // Identificador de Mongo con formato inválido (ej. ObjectId mal formado)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Identificador inválido: ${err.value}`;
    details = null;
  }

  // Errores de validación generados directamente por Mongoose
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Error de validación de datos';
    details = Object.values(err.errors).map((validationError) => validationError.message);
  }

  // Violación de índice único (registros duplicados)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un evento registrado con esos datos';
    details = err.keyValue || null;
  }

  // Cualquier error no controlado se registra en el servidor y se oculta al cliente
  if (!err.isOperational && statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
    message = 'Error interno del servidor';
    details = null;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: details,
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
