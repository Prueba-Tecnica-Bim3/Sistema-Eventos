const axios = require('axios');

const eventsApi = axios.create({
  baseURL: process.env.EVENTS_SERVICE_URL,
  timeout: 5000,
});

const unwrap = (responseData) => (responseData && responseData.data !== undefined
  ? responseData.data
  : responseData);

/**
 * Extrae el array de eventos desde la respuesta de Service Events.
 * Contrato: { success, message, data: { events, pagination } }
 */
const extractEventsList = (responseData) => {
  const data = unwrap(responseData);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.data?.events)) return data.data.events;
  return [];
};

/**
 * Extrae un evento individual desde la respuesta de Service Events.
 * Contrato: { success, message, data: { event } }
 */
const extractEvent = (responseData) => {
  const data = unwrap(responseData);

  if (!data) return null;
  if (data.event) return data.event;
  if (data._id || data.id || data.nombre || data.name) return data;
  return null;
};

const getEvents = async (token) => {
  const response = await eventsApi.get('/events', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return extractEventsList(response.data);
};

const getEventById = async (eventId, token) => {
  const response = await eventsApi.get(`/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return extractEvent(response.data);
};

module.exports = {
  getEvents,
  getEventById,
};
