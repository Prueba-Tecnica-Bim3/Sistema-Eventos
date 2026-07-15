import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../Layouts/AuthLayout'
import MainLayout from '../Layouts/MainLayout'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import EventsListPage from '../../features/events/pages/EventsListPage'
import CreateEventPage from '../../features/events/pages/CreateEventPage'
import EditEventPage from '../../features/events/pages/EditEventPage'
import EventDetailPage from '../../features/events/pages/EventDetailPage'
import SummaryPage from '../../features/events/pages/SummaryPage'
import OccupancyListPage from '../../features/events/pages/OccupancyListPage'
import { ProtectedRoute, GuestRoute } from '../../features/auth/useAuth'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/eventos" element={<EventsListPage />} />
            <Route path="/eventos/nuevo" element={<CreateEventPage />} />
            <Route path="/eventos/disponibles" element={<OccupancyListPage mode="available" />} />
            <Route path="/eventos/completos" element={<OccupancyListPage mode="full" />} />
            <Route path="/eventos/:id/editar" element={<EditEventPage />} />
            <Route path="/eventos/:id" element={<EventDetailPage />} />
            <Route path="/resumen" element={<SummaryPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/eventos" replace />} />
        <Route path="*" element={<Navigate to="/eventos" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
