import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../Layouts/AuthLayout'
import MainLayout from '../Layouts/MainLayout'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import EventsListPage from '../../features/dashboard/pages/EventsListPage'
import CreateEventPage from '../../features/dashboard/pages/CreateEventPage'
import EventDetailPage from '../../features/dashboard/pages/EventDetailPage'
import SummaryPage from '../../features/dashboard/pages/SummaryPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/eventos" element={<EventsListPage />} />
          <Route path="/eventos/nuevo" element={<CreateEventPage />} />
          <Route path="/eventos/:id" element={<EventDetailPage />} />
          <Route path="/resumen" element={<SummaryPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
