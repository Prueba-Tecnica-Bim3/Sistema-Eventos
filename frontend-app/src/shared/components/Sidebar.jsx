import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { CalendarIcon, PlusIcon, ChartIcon } from '../icons'
import './Sidebar.css'

const navItems = [
  { to: '/eventos', label: 'Eventos', icon: CalendarIcon, end: true },
  { to: '/eventos/nuevo', label: 'Crear evento', icon: PlusIcon },
  { to: '/resumen', label: 'Resumen', icon: ChartIcon },
]

export default function Sidebar({ user = { name: 'spongebob' } }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
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
        <div className="sidebar-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user.name}</span>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
