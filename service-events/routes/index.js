const eventsRouter = require('../src/events/events.router');
const { notFoundHandler } = require('../middlewares/error-handler.middleware');

/**
 * Punto de montaje de rutas del servicio.
 * Única responsabilidad: agrupar los routers de cada módulo
 * bajo un path base y registrar el middleware de rutas no encontradas.
 *
 * @param {import('express').Application} app - Instancia de Express.
 */
function mountRoutes(app) {
  // Rutas del módulo Eventos bajo /events
  app.use('/events', eventsRouter);

  // Middleware para rutas no registradas (debe ir al final)
  app.use(notFoundHandler);
}

module.exports = mountRoutes;