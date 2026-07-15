const axios = require('axios');

const eventsApi = axios.create({
  baseURL: process.env.EVENTS_SERVICE_URL,
  timeout: 5000,
});

const unwrap = (responseData) => (responseData && responseData.data !== undefined
  ? responseData.data
  : responseData);

const getEvents = async (token) => {
  const response = await eventsApi.get('/events', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrap(response.data);
};

const getEventById = async (eventId, token) => {
  const response = await eventsApi.get(`/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrap(response.data);
};

module.exports = {
  getEvents,
  getEventById,
};
