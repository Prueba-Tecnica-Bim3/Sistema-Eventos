require('dotenv').config();

const app = require('./configs/app');
const connectDB = require('./configs/db');

const PORT = process.env.PORT || 3002;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`service-registrations listening on port ${PORT}`);
  });
};

start();
