import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { PlusIcon, SearchIcon } from '../../../shared/icons'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import { mergeEventsWithOccupancy } from '../../../shared/utils/events'
import './EventsListPage.css'

export default function EventsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadEvents = useCallback(async (term = '') => {
    setLoading(true)
    setError('')
    try {
      const trimmed = term.trim()
      const query = { limit: 100 }

      if (trimmed) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          query.date = trimmed
        } else {
          query.name = trimmed
        }
      }

      const [eventsRes, summaryRes] = await Promise.all([
        eventsApi.listEvents(query),
        registrationsApi.getOccupancySummary().catch(() => null),
      ])

      let rawEvents = eventsRes?.data?.events ?? []

      // Si no hubo resultados por nombre, intentar por lugar
      if (trimmed && rawEvents.length === 0 && !query.date) {
        const byLocation = await eventsApi.listEvents({ location: trimmed, limit: 100 })
        rawEvents = byLocation?.data?.events ?? []
      }

      const occupancyList = summaryRes?.data?.events ?? []
      setEvents(mergeEventsWithOccupancy(rawEvents, occupancyList))
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los eventos.',
      )
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial + búsqueda con debounce (una sola fuente)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents(search)
    }, search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [search, loadEvents])

  const handleDelete = async (event) => {
    const ok = window.confirm(`¿Eliminar el evento "${event.name}"? Esta acción no se puede deshacer.`)
    if (!ok) return

    setDeletingId(event.id)
    setError('')
    try {
      await eventsApi.deleteEvent(event.id)
      setEvents((prev) => prev.filter((item) => item.id !== event.id))
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo eliminar el evento.',
      )
    } finally {
      setDeletingId(null)
    }
  }

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
              onDelete={handleDelete}
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
