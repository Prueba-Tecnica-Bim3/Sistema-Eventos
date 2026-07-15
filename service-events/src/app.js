const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { CORS_ORIGIN } = require('./config/env');
const eventsRouter = require('./events/events.router');
// Use the top-level middleware folder to keep a single source of truth
const { errorHandler, notFoundHandler } = require('../middlewares/error-handler.middleware');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan('dev'));

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use('/events', eventsRouter);

  app.get('/health', (req, res) =>
    res.json({ success: true, service: 'service-events', status: 'ok' })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
