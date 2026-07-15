import { useState } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { PlusIcon, SearchIcon } from '../../../shared/icons'
import { events } from '../../../shared/data/mockEvents'
import './EventsListPage.css'

export default function EventsListPage() {
  const [search, setSearch] = useState('')

  const filtered = events.filter((event) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      event.name.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      event.dateLabel.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <div className="page-header">
        <h1>Eventos</h1>
        <p>Administra la información y disponibilidad de cupos de cada evento.</p>
      </div>

      <Link to="/eventos/nuevo" className="btn btn-primary events-new-btn">
        <PlusIcon width={16} height={16} />
        Nuevo evento
      </Link>

      <div className="input-icon events-search">
        <SearchIcon width={17} height={17} />
        <input
          type="text"
          className="input"
          placeholder="Buscar por nombre, fecha o lugar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="events-list">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {filtered.length === 0 && (
          <p className="events-empty">No se encontraron eventos que coincidan con tu búsqueda.</p>
        )}
      </div>
    </div>
  )
}
