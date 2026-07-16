import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { PlusIcon, SearchIcon } from '../../../shared/components/icons'
import { useEventsList } from '../useEvents'
import './EventsListPage.css'

export default function EventsListPage() {
  const navigate = useNavigate()
  const {
    search,
    setSearch,
    events,
    loading,
    error,
    deletingId,
    deleteEvent,
  } = useEventsList()

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
          placeholder="Buscar por nombre, lugar o fecha (YYYY-MM-DD)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="events-feedback events-feedback-error">{error}</p>}

      {loading ? (
        <p className="events-empty">Cargando eventos…</p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(item) => navigate(`/eventos/${item.id}/editar`)}
              onDelete={deleteEvent}
              deleting={deletingId === event.id}
            />
          ))}
          {events.length === 0 && (
            <p className="events-empty">
              {search.trim()
                ? 'No se encontraron eventos que coincidan con tu búsqueda.'
                : 'Aún no hay eventos. Crea el primero con “Nuevo evento”.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
