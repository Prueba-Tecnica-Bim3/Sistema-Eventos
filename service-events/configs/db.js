const mongoose = require('mongoose');
const env = require('./env');

/**
 * Establece la conexión con MongoDB mediante Mongoose.
 * Única responsabilidad: gestionar la conexión a la base de datos.
 */
async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log('[db] Conexión a MongoDB establecida correctamente.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[db] Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
