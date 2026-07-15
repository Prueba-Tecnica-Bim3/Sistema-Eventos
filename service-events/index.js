const createApp = require('./src/app');
const { PORT } = require('./src/config/env');
const db = require('./src/config/database');

async function start() {
  try {
    await db.connect();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`service-events listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
