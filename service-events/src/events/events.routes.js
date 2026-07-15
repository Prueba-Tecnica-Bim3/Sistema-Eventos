const eventsController = require('./events.controller');
const {
  validateEventId,
  validateCreateEvent,
  validateUpdateEvent,
  validateListEvents,
} = require('./events.validators');
const { handleValidationErrors } = require('../../middlewares/validate-request.middleware');
const { catchAsync } = require('../../middlewares/async-handler.middleware');
const { verifyToken } = require('../../middlewares/auth.middleware');

/**
 * Definición de endpoints del recurso Evento.
 * Única responsabilidad: declarar el mapeo método/ruta -> middlewares -> controlador.
 * No crea el router, no contiene lógica de negocio y no accede al modelo.
 *
 * @param {import('express').Router} router - Instancia de Router ya configurada.
 */
function registerEventsRoutes(router) {
  router.get(
    '/',
    verifyToken,
    validateListEvents,
    handleValidationErrors,
    catchAsync(eventsController.getEvents)
  );

  router.get(
    '/:id',
    verifyToken,
    validateEventId,
    handleValidationErrors,
    catchAsync(eventsController.getEventById)
  );

  router.post(
    '/',
    verifyToken,
    validateCreateEvent,
    handleValidationErrors,
    catchAsync(eventsController.createEvent)
  );

  router.put(
    '/:id',
    verifyToken,
    validateUpdateEvent,
    handleValidationErrors,
    catchAsync(eventsController.updateEvent)
  );

  router.delete(
    '/:id',
    verifyToken,
    validateEventId,
    handleValidationErrors,
    catchAsync(eventsController.deleteEvent)
  );

  return router;
}

module.exports = registerEventsRoutes;
