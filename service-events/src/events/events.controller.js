const eventsService = require('./events.service');
const { buildCreateEventInput, buildUpdateEventInput } = require('./event-request.model');

/**
 * Controlador HTTP del recurso Evento.
 * Única responsabilidad: traducir peticiones/respuestas HTTP hacia la
 * capa de servicio. No contiene lógica de negocio ni acceso a datos.
 */

function sendSuccess(res, statusCode, message, data) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

async function getEvents(req, res) {
  const { name, date, location, page, limit } = req.query;
  const { events, pagination } = await eventsService.listEvents({ name, date, location, page, limit });

  return sendSuccess(res, 200, 'Eventos obtenidos correctamente', { events, pagination });
}

async function getEventById(req, res) {
  const event = await eventsService.getEventById(req.params.id);
  return sendSuccess(res, 200, 'Evento obtenido correctamente', { event });
}

async function createEvent(req, res) {
  const eventInput = buildCreateEventInput(req.body);
  const event = await eventsService.createEvent(eventInput);
  return sendSuccess(res, 201, 'Evento creado correctamente', { event });
}

async function updateEvent(req, res) {
  const eventInput = buildUpdateEventInput(req.body);
  const event = await eventsService.updateEvent(req.params.id, eventInput);
  return sendSuccess(res, 200, 'Evento actualizado correctamente', { event });
}

async function deleteEvent(req, res) {
  await eventsService.deleteEvent(req.params.id);
  return sendSuccess(res, 200, 'Evento eliminado correctamente', null);
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
