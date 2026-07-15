import { Outlet } from 'react-router-dom'
import Sidebar from '../../shared/components/Sidebar'
import { useAuth } from '../../shared/auth/AuthContext'
import './MainLayout.css'

export default function MainLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="main-layout">
      <Sidebar user={user} onLogout={logout} />
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
