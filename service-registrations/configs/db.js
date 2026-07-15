const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI no esta definido en las variables de entorno');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado correctamente');
  } catch {
    console.error('No fue posible conectar a MongoDB. Deteniendo el servidor.');
    process.exit(1);
  }
};

module.exports = connectDB;
