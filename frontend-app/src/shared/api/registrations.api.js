import { REGISTRATIONS_API_URL } from './config'
import { request } from './http'

export function createRegistration({ eventId, attendeeName, attendeeEmail }) {
  return request(REGISTRATIONS_API_URL, '/registrations', {
    method: 'POST',
    body: { eventId, attendeeName, attendeeEmail },
  })
}

export function cancelRegistration(id) {
  return request(REGISTRATIONS_API_URL, `/registrations/${id}`, {
    method: 'DELETE',
  })
}

export function listAttendees(eventId, status = 'confirmed') {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(REGISTRATIONS_API_URL, `/events/${eventId}/attendees${qs}`)
}

export function getOccupancySummary() {
  return request(REGISTRATIONS_API_URL, '/summary')
}

export function getAvailableEvents() {
  return request(REGISTRATIONS_API_URL, '/events/available')
}

export function getFullEvents() {
  return request(REGISTRATIONS_API_URL, '/events/full')
}
