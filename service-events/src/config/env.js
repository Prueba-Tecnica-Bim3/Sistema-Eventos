const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const get = (key, fallback) => process.env[key] ?? fallback;

// Support both JWT_SECRET (preferred) and JWT_SECRET_KEY (existing .env cases)
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || '';
if (!JWT_SECRET) {
  console.warn('[config] JWT_SECRET no está definido. Configúralo en el archivo .env para validar tokens del AuthService.');
}

module.exports = {
  NODE_ENV: get('NODE_ENV', 'development'),
  PORT: Number(get('PORT', 3001)),
  MONGO_URI: get('MONGO_URI', 'mongodb://localhost:27017/service_events'),

  JWT_SECRET,
  JWT_ISSUER: get('JWT_ISSUER', ''),
  JWT_AUDIENCE: get('JWT_AUDIENCE', ''),
  JWT_ALGORITHM: get('JWT_ALGORITHM', 'HS256'),

  CORS_ORIGIN: get('CORS_ORIGIN', '*'),
};
