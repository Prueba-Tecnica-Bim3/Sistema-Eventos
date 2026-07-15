const Registration = require('./registrations.model');
const { REGISTRATION_STATUS } = require('./registrations.model');
const eventsClient = require('../clients/events.client');
const occupancyService = require('../occupancy/occupancy.service');

const appError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const normalizeEvent = (event) => ({
  id: String(event.id ?? event._id ?? event.eventId),
  name: event.name ?? event.title ?? 'Evento sin nombre',
  capacity: Number(event.capacity ?? event.maxCapacity ?? event.maxAttendees ?? 0),
});

const fetchEventOrFail = async (eventId, token) => {
  try {
    const event = await eventsClient.getEventById(eventId, token);

    if (!event) {
      throw appError(404, 'El evento solicitado no existe');
    }

    return normalizeEvent(event);
  } catch (error) {
    if (error.isAxiosError && error.response?.status === 404) {
      throw appError(404, 'El evento solicitado no existe');
    }

    throw error;
  }
};

const registerAttendee = async ({
  eventId, attendeeName, attendeeEmail, registeredBy, token,
}) => {
  const event = await fetchEventOrFail(eventId, token);

  const confirmedCount = await occupancyService.countConfirmedByEvent(event.id);
  const occupancyBefore = occupancyService.calculateOccupancy(event.capacity, confirmedCount);

  if (occupancyBefore.available <= 0) {
    throw appError(409, 'El evento ha alcanzado su cupo maximo');
  }

  const existingRegistration = await Registration.findOne({
    eventId: event.id,
    attendeeEmail: attendeeEmail.toLowerCase(),
    status: REGISTRATION_STATUS.CONFIRMED,
  });

  if (existingRegistration) {
    throw appError(409, 'El asistente ya se encuentra inscrito en este evento');
  }

  const registration = await Registration.create({
    eventId: event.id,
    attendeeName,
    attendeeEmail,
    registeredBy,
    status: REGISTRATION_STATUS.CONFIRMED,
  });

  const occupancy = {
    eventId: event.id,
    name: event.name,
    ...occupancyService.calculateOccupancy(event.capacity, confirmedCount + 1),
  };

  return { registration, occupancy };
};

const cancelRegistration = async (registrationId) => {
  const registration = await Registration.findById(registrationId);

  if (!registration) {
    throw appError(404, 'Inscripcion no encontrada');
  }

  if (registration.status === REGISTRATION_STATUS.CANCELLED) {
    throw appError(409, 'La inscripcion ya se encuentra cancelada');
  }

  registration.status = REGISTRATION_STATUS.CANCELLED;
  registration.cancelledAt = new Date();
  await registration.save();

  return registration;
};

const getAttendeesByEvent = async (eventId, status = REGISTRATION_STATUS.CONFIRMED) => {
  const filter = { eventId: String(eventId) };

  if (status !== 'all') {
    filter.status = status;
  }

  return Registration.find(filter).sort({ createdAt: 1 });
};

const countRegistrations = (eventId, status = REGISTRATION_STATUS.CONFIRMED) => {
  const filter = { eventId: String(eventId) };

  if (status !== 'all') {
    filter.status = status;
  }

  return Registration.countDocuments(filter);
};

module.exports = {
  registerAttendee,
  cancelRegistration,
  getAttendeesByEvent,
  countRegistrations,
};
