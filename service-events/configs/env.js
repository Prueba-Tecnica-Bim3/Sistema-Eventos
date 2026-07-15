require('dotenv').config();

/**
 * Configuración centralizada de variables de entorno.
 * Única responsabilidad: exponer los valores de entorno ya normalizados
 * para que el resto del servicio no acceda directamente a `process.env`.
 *
 * Las variables JWT_ISSUER y JWT_AUDIENCE deben coincidir con las
 * configuradas en el AuthService para validar correctamente los tokens.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eventos',
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: process.env.JWT_ISSUER || 'sistema-eventos-auth',
  jwtAudience: process.env.JWT_AUDIENCE || 'sistema-eventos-services',
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
};

if (!env.jwtSecret) {
  // eslint-disable-next-line no-console
  console.warn(
    '[config] JWT_SECRET no está definido. Configúralo en el archivo .env para validar tokens del AuthService.'
  );
}

module.exports = env;