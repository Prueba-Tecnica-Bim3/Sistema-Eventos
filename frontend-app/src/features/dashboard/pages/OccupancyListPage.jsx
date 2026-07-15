import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { CalendarIcon, PinIcon } from '../../../shared/icons'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import {
  formatEventDate,
  getEventStatus,
  mergeEventsWithOccupancy,
} from '../../../shared/utils/events'
import './OccupancyListPage.css'

/**
 * Lista de eventos por ocupación.
 * mode: 'available' | 'full'
 */
export default function OccupancyListPage({ mode = 'available' }) {
  const isAvailable = mode === 'available'
  const title = isAvailable ? 'Eventos con cupos disponibles' : 'Eventos con cupo completo'
  const subtitle = isAvailable
    ? 'Eventos que todavía tienen lugares libres para inscribir asistentes.'
    : 'Eventos que alcanzaron su capacidad máxima.'

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [occupancyRes, eventsRes] = await Promise.all([
        isAvailable
          ? registrationsApi.getAvailableEvents()
          : registrationsApi.getFullEvents(),
        eventsApi.listEvents({ limit: 100 }).catch(() => null),
      ])

      const occupancyList = occupancyRes?.data?.events ?? []
      const rawEvents = eventsRes?.data?.events ?? []

      if (rawEvents.length > 0) {
        const occupancyIds = new Set(
          occupancyList.map((item) => String(item.eventId ?? item.id)),
        )
        const filteredRaw = rawEvents.filter((event) =>
          occupancyIds.has(String(event.id ?? event._id)),
        )
        setEvents(mergeEventsWithOccupancy(filteredRaw, occupancyList))
      } else {
        setEvents(
          occupancyList.map((item) => ({
            id: String(item.eventId ?? item.id),
            name: item.name ?? 'Sin nombre',
            dateLabel: item.date ? formatEventDate(item.date) : '—',
            location: item.location ?? '',
            capacity: item.capacity ?? 0,
            registered: item.registered ?? 0,
            isFull: item.isFull ?? !isAvailable,
          })),
        )
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar la lista de eventos.',
      )
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [isAvailable])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {error && <p className="occupancy-feedback occupancy-feedback-error">{error}</p>}

      {loading ? (
        <p className="occupancy-empty">Cargando eventos…</p>
      ) : (
        <div className="occupancy-list">
          {events.map((event) => {
            const status = getEventStatus(event)
            const available = Math.max(event.capacity - event.registered, 0)
            return (
              <div key={event.id} className="card occupancy-card">
                <div className="occupancy-card-header">
                  <Link to={`/eventos/${event.id}`} className="occupancy-card-title">
                    {event.name}
                  </Link>
                  <StatusBadge status={status} />
                </div>

                <div className="occupancy-card-meta">
                  <span>
                    <CalendarIcon width={15} height={15} />
                    {event.dateLabel}
                  </span>
                  {event.location ? (
                    <span>
                      <PinIcon width={15} height={15} />
                      {event.location}
                    </span>
                  ) : null}
                </div>

                <div className="occupancy-card-progress">
                  <div className="occupancy-card-progress-labels">
                    <span>
                      {event.registered} / {event.capacity} inscritos
                    </span>
                    <span>{available} cupos libres</span>
                  </div>
                  <ProgressBar value={event.registered} max={event.capacity} />
                </div>

                <Link to={`/eventos/${event.id}`} className="btn btn-outline btn-block">
                  Ver detalle
                </Link>
              </div>
            )
          })}

          {events.length === 0 && (
            <p className="occupancy-empty">
              {isAvailable
                ? 'No hay eventos con cupos disponibles en este momento.'
                : 'No hay eventos con cupo completo en este momento.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
