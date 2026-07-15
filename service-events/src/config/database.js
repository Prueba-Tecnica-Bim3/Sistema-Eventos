const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

async function connect() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  // Use mongoose defaults for options (modern drivers don't accept keepAlive here)
  await mongoose.connect(MONGO_URI);
}

module.exports = { connect };
