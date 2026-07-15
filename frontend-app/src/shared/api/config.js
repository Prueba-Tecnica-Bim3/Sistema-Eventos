/** Variables de entorno / bases de los microservicios. */
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001'
export const EVENTS_API_URL = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3001'
export const REGISTRATIONS_API_URL =
  import.meta.env.VITE_REGISTRATIONS_API_URL || 'http://localhost:3002'
