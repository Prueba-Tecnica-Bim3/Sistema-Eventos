/**
 * API pública de la feature auth (useAuth).
 * Incluye store, hook y guards de ruta.
 */
export { AuthProvider, useAuth } from '../hooks/useAuth'
export { default as ProtectedRoute } from './ProtectedRoute'
export { default as GuestRoute } from './GuestRoute'
