import { Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { CalendarIcon, PinIcon } from '../../../shared/icons'
import { getEventStatus } from '../../../shared/data/mockEvents'
import './EventCard.css'

export default function EventCard({ event, onEdit, onDelete }) {
  const status = getEventStatus(event)
  const available = Math.max(event.capacity - event.registered, 0)

  return (
    <div className="card event-card">
      <div className="event-card-header">
        <Link to={`/eventos/${event.id}`} className="event-card-title">
          {event.name}
        </Link>
        <StatusBadge status={status} />
      </div>

      <div className="event-card-meta">
        <span>
          <CalendarIcon width={15} height={15} />
          {event.dateLabel}
        </span>
        <span>
          <PinIcon width={15} height={15} />
          {event.location}
        </span>
      </div>

      <div className="event-card-progress">
        <div className="event-card-progress-labels">
          <span>
            {event.registered} / {event.capacity} inscritos
          </span>
          <span>{available} cupos</span>
        </div>
        <ProgressBar value={event.registered} max={event.capacity} />
      </div>

      <div className="event-card-actions">
        <button type="button" className="btn btn-outline btn-block" onClick={() => onEdit?.(event)}>
          Editar
        </button>
        <button
          type="button"
          className="btn btn-danger-outline btn-block"
          onClick={() => onDelete?.(event)}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
