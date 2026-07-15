const { Router } = require('express');
const registerEventsRoutes = require('./events.routes');

/**
 * Configuración del Router del módulo Eventos.
 * Única responsabilidad: instanciar el router de Express del módulo
 * y delegar el registro de endpoints a `events.routes.js`.
 */
const eventsRouter = Router();

registerEventsRoutes(eventsRouter);

module.exports = eventsRouter;
