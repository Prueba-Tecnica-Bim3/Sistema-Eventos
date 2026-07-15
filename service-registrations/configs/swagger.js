const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Service Registrations API',
      version: '1.0.0',
      description:
        'Microservicio encargado de administrar las inscripciones y la ocupacion de los eventos (Sistema-Eventos).',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3002}`,
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '..', 'src', '**', '*.router.js').split(path.sep).join('/'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
