export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001'
export const EVENTS_API_URL = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3001'
export const REGISTRATIONS_API_URL =
  import.meta.env.VITE_REGISTRATIONS_API_URL || 'http://localhost:3002'

export const TOKEN_STORAGE_KEY = 'se_access_token'
export const USER_STORAGE_KEY = 'se_user'
