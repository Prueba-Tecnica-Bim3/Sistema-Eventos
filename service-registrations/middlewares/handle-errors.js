const handleErrors = (err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.originalUrl} - ${err.message}`);

  if (err.isAxiosError) {
    if (!err.response) {
      return res.status(503).json({
        success: false,
        message: 'Service Events no esta disponible en este momento',
        error: 'ServiceUnavailable',
        details: [],
      });
    }

    return res.status(err.response.status).json({
      success: false,
      message: 'Error al consultar Service Events',
      error: err.response.data?.message || err.response.statusText || 'ExternalServiceError',
      details: [],
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    return res.status(400).json({
      success: false,
      message: 'Error de validacion de datos',
      error: 'ValidationError',
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Identificador invalido',
      error: 'CastError',
      details: [{ field: err.path, message: `Valor invalido para ${err.path}` }],
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
      error: 'DuplicateKeyError',
      details: [],
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    error: statusCode === 500 ? 'InternalServerError' : err.name || 'Error',
    details: err.details || [],
  });
};

module.exports = handleErrors;
