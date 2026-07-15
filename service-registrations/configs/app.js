const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const helmetConfiguration = require('./helmet-configuration');
const corsConfiguration = require('./cors-configuration');
const swaggerSpec = require('./swagger');
const handleErrors = require('../middlewares/handle-errors');
const registrationsRouter = require('../src/registrations/registrations.router');
const occupancyRouter = require('../src/occupancy/occupancy.router');

const app = express();

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmetConfiguration);
app.use(cors(corsConfiguration));
app.use(express.json());
app.use(rateLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'service-registrations',
    status: 'ok',
  });
});

app.use(registrationsRouter);
app.use(occupancyRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
    error: 'NotFound',
    details: [],
  });
});

app.use(handleErrors);

module.exports = app;
