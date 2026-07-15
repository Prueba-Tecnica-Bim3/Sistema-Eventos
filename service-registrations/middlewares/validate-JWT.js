const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
      error: 'Unauthorized',
      details: [],
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: [process.env.JWT_ALGORITHM || 'HS256'],
    });

    req.user = payload;
    req.token = token;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalido o expirado',
      error: error.message,
      details: [],
    });
  }
};

module.exports = validateJWT;
