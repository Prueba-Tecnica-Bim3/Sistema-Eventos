import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Rutas de auth: si ya hay sesión, redirige al dashboard. */
export default function GuestRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/eventos" replace />
  }

  return <Outlet />
}
