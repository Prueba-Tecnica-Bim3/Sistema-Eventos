import { Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { CalendarIcon, PinIcon } from '../../../shared/components/icons'
import { getEventStatus } from '../../../shared/utils/events'
import { useOccupancyList } from '../useEvents'
import './OccupancyListPage.css'

/**
 * Lista de eventos por ocupación.
 * mode: 'available' | 'full'
 */
export default function OccupancyListPage({ mode = 'available' }) {
  const { events, loading, error, isAvailable, title, subtitle } = useOccupancyList(mode)

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
