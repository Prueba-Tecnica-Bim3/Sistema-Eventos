const EventModel = require('./events.model');
const { AppError } = require('../../middlewares/error-handler.middleware');

/**
 * Capa de lógica de negocio del dominio Evento.
 * Única responsabilidad: aplicar las reglas del negocio y coordinar
 * el acceso al modelo de persistencia. No debe conocer detalles de HTTP.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Construye el filtro de búsqueda de Mongo a partir de los query params
 * soportados: name, date, location.
 */
function buildSearchFilter({ name, date, location } = {}) {
  const filter = {};

  if (name) {
    filter.nombre = { $regex: name, $options: 'i' };
  }

  if (location) {
    filter.lugar = { $regex: location, $options: 'i' };
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.fecha = { $gte: startOfDay, $lte: endOfDay };
  }

  return filter;
}

/**
 * Lista eventos aplicando filtros opcionales de búsqueda y paginación.
 */
async function listEvents(queryParams = {}) {
  const { name, date, location, page, limit } = queryParams;

  const filter = buildSearchFilter({ name, date, location });
  const currentPage = page || DEFAULT_PAGE;
  const pageSize = limit || DEFAULT_LIMIT;

  const [events, total] = await Promise.all([
    EventModel.find(filter)
      .sort({ fecha: 1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize),
    EventModel.countDocuments(filter),
  ]);

  return {
    events,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  };
}

/**
 * Obtiene un evento por su ID. Lanza 404 si no existe.
 */
async function getEventById(id) {
  const event = await EventModel.findById(id);

  if (!event) {
    throw new AppError('Evento no encontrado', 404);
  }

  return event;
}

/**
 * Registra un nuevo evento.
 */
async function createEvent(eventData) {
  const event = await EventModel.create(eventData);
  return event;
}

/**
 * Actualiza un evento existente aplicando las reglas de negocio.
 */
async function updateEvent(id, eventData) {
  const event = await EventModel.findByIdAndUpdate(id, eventData, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  if (!event) {
    throw new AppError('Evento no encontrado', 404);
  }

  return event;
}

/**
 * Elimina un evento por su ID.
 */
async function deleteEvent(id) {
  const event = await EventModel.findByIdAndDelete(id);

  if (!event) {
    throw new AppError('Evento no encontrado', 404);
  }

  return event;
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
