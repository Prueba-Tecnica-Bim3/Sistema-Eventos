const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, JWT_ALGORITHM } = require('../config/env');
const { AppError } = require('./error-handler.middleware');

function verifyToken(req, res, next) {
  const auth = req.header('authorization') || req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return next(new AppError('Token ausente', 401, 'TOKEN_MISSING'));
  }

  const token = auth.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM || 'HS256'],
      issuer: JWT_ISSUER || undefined,
      audience: JWT_AUDIENCE || undefined,
    });

    // Attach minimal user info to request for downstream services
    req.user = {
      id: payload.sub || payload.userId || null,
      roles: payload.roles || [],
      raw: payload,
    };

    return next();
  } catch (err) {
    // Log error server-side for debugging (do not expose stack to clients)
    // eslint-disable-next-line no-console
    console.warn('[auth] jwt verify failed:', err && err.message);

    if (err && err.name === 'TokenExpiredError') {
      return next(new AppError('El token ha expirado', 401, 'TOKEN_EXPIRED'));
    }

    if (err && err.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401, 'TOKEN_INVALID'));
    }

    if (err && err.name === 'NotBeforeError') {
      return next(new AppError('Token no válido aún', 401, 'TOKEN_NOT_YET_VALID'));
    }

    return next(new AppError('Token inválido o expirado', 401, 'TOKEN_INVALID'));
  }
}

module.exports = { verifyToken };
