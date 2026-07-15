import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../Layouts/AuthLayout'
import MainLayout from '../Layouts/MainLayout'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import EventsListPage from '../../features/dashboard/pages/EventsListPage'
import CreateEventPage from '../../features/dashboard/pages/CreateEventPage'
import EditEventPage from '../../features/dashboard/pages/EditEventPage'
import EventDetailPage from '../../features/dashboard/pages/EventDetailPage'
import SummaryPage from '../../features/dashboard/pages/SummaryPage'
import OccupancyListPage from '../../features/dashboard/pages/OccupancyListPage'
import ProtectedRoute from '../../shared/auth/ProtectedRoute'
import GuestRoute from '../../shared/auth/GuestRoute'

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
