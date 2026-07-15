const jwt = require('jsonwebtoken');
const env = require('../configs/env');
const { AppError } = require('./error-handler.middleware');

/**
 * Middleware de autenticación.
 * Única responsabilidad: verificar el JWT emitido por el AuthService.
 * Este servicio NO genera ni gestiona tokens, únicamente valida su
 * autenticidad y vigencia utilizando el secreto compartido (JWT_SECRET),
 * así como el issuer (JWT_ISSUER) y audience (JWT_AUDIENCE) que deben
 * coincidir con los configurados en el AuthService.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token de autenticación no proporcionado', 401));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
      algorithms: [env.jwtAlgorithm],
    });

    req.user = payload;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('El token ha expirado', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token de autenticación inválido', 401));
    }
    return next(new AppError('Error de autenticación', 401));
  }
}

module.exports = { verifyToken };