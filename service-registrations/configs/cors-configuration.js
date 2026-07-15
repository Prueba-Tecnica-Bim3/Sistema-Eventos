const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

const corsConfiguration = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsConfiguration;
