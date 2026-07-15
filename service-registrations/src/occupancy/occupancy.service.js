const Registration = require('../registrations/registrations.model');
const eventsClient = require('../clients/events.client');
const { REGISTRATION_STATUS } = require('../registrations/registrations.model');

const normalizeEvent = (event) => ({
  id: String(event.id ?? event._id ?? event.eventId),
  name: event.name ?? event.nombre ?? event.title ?? 'Evento sin nombre',
  capacity: Number(
    event.capacity ?? event.capacidad ?? event.maxCapacity ?? event.maxAttendees ?? 0,
  ),
  date: event.fecha ?? event.date ?? null,
  location: event.lugar ?? event.location ?? '',
});

const countConfirmedByEvent = (eventId) => Registration.countDocuments({
  eventId: String(eventId),
  status: REGISTRATION_STATUS.CONFIRMED,
});

const calculateOccupancy = (capacity, registered) => {
  const safeCapacity = Math.max(0, Number(capacity) || 0);
  const safeRegistered = Math.max(0, Number(registered) || 0);
  const available = Math.max(0, safeCapacity - safeRegistered);
  const percentage = safeCapacity > 0
    ? Math.round((safeRegistered / safeCapacity) * 100)
    : 0;

  return {
    capacity: safeCapacity,
    registered: safeRegistered,
    available,
    percentage,
    isFull: available === 0 && safeCapacity > 0,
  };
};

const buildEventOccupancy = async (rawEvent) => {
  const event = normalizeEvent(rawEvent);
  const registered = await countConfirmedByEvent(event.id);

  return {
    eventId: event.id,
    name: event.name,
    date: event.date,
    location: event.location,
    ...calculateOccupancy(event.capacity, registered),
  };
};

const getAllEventsOccupancy = async (token) => {
  const events = await eventsClient.getEvents(token);
  const list = Array.isArray(events) ? events : [];

  return Promise.all(list.map((event) => buildEventOccupancy(event)));
};

const getAvailableEvents = async (token) => {
  const occupancies = await getAllEventsOccupancy(token);
  return occupancies.filter((occupancy) => !occupancy.isFull);
};

const getFullEvents = async (token) => {
  const occupancies = await getAllEventsOccupancy(token);
  return occupancies.filter((occupancy) => occupancy.isFull);
};

const getSummary = async (token) => {
  const occupancies = await getAllEventsOccupancy(token);

  const totals = occupancies.reduce(
    (acc, occupancy) => ({
      totalCapacity: acc.totalCapacity + occupancy.capacity,
      totalRegistered: acc.totalRegistered + occupancy.registered,
      totalAvailable: acc.totalAvailable + occupancy.available,
    }),
    { totalCapacity: 0, totalRegistered: 0, totalAvailable: 0 },
  );

  const overallPercentage = totals.totalCapacity > 0
    ? Math.round((totals.totalRegistered / totals.totalCapacity) * 100)
    : 0;

  return {
    totalEvents: occupancies.length,
    fullEvents: occupancies.filter((occupancy) => occupancy.isFull).length,
    availableEvents: occupancies.filter((occupancy) => !occupancy.isFull).length,
    ...totals,
    overallPercentage,
    events: occupancies,
  };
};

module.exports = {
  calculateOccupancy,
  countConfirmedByEvent,
  buildEventOccupancy,
  getAvailableEvents,
  getFullEvents,
  getSummary,
};
