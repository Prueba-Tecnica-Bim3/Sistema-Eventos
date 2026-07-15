import { AUTH_API_URL } from './config'
import { request } from './http'

export function login(email, password) {
  return request(AUTH_API_URL, '/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

export function register(name, email, password) {
  return request(AUTH_API_URL, '/api/v1/auth/register', {
    method: 'POST',
    auth: false,
    body: { name, email, password },
  })
}

export function getProfile() {
  return request(AUTH_API_URL, '/api/v1/auth/profile')
}
