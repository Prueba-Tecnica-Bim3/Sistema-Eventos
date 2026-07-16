import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import {
  CalendarIcon,
  PlusIcon,
  ChartIcon,
  CheckCircleIcon,
  FullCircleIcon,
} from './icons'
import './Sidebar.css'

const navItems = [
  { to: '/eventos', label: 'Eventos', icon: CalendarIcon, end: true },
  { to: '/eventos/nuevo', label: 'Crear evento', icon: PlusIcon },
  { to: '/eventos/disponibles', label: 'Disponibles', icon: CheckCircleIcon },
  { to: '/eventos/completos', label: 'Cupo completo', icon: FullCircleIcon },
  { to: '/resumen', label: 'Resumen', icon: ChartIcon },
]

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate()
  const displayName = user?.name?.trim() || user?.email || 'Usuario'

  const handleLogout = () => {
    onLogout?.()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo size={28} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
          >
            <Icon width={18} height={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{displayName}</span>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
