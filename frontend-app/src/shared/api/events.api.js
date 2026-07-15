import { EVENTS_API_URL } from './config'
import { request } from './http'

/**
 * Lista eventos. Query: name, date, location, page, limit
 */
export function listEvents(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, value)
    }
  })
  const qs = query.toString()
  return request(EVENTS_API_URL, `/events${qs ? `?${qs}` : ''}`)
}

export function getEventById(id) {
  return request(EVENTS_API_URL, `/events/${id}`)
}

export function createEvent(payload) {
  return request(EVENTS_API_URL, '/events', {
    method: 'POST',
    body: payload,
  })
}

export function updateEvent(id, payload) {
  return request(EVENTS_API_URL, `/events/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteEvent(id) {
  return request(EVENTS_API_URL, `/events/${id}`, {
    method: 'DELETE',
  })
}
