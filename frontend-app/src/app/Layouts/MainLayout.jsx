import { Outlet } from 'react-router-dom'
import Sidebar from '../../shared/components/Sidebar'
import './MainLayout.css'

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
