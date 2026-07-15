import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { ArrowLeftIcon, CalendarIcon, PinIcon, AlertIcon } from '../../../shared/icons'
import { events, getEventStatus } from '../../../shared/data/mockEvents'
import './EventDetailPage.css'

export default function EventDetailPage() {
  const { id } = useParams()
  const event = events.find((e) => e.id === id) ?? events[0]
  const status = getEventStatus(event)
  const isFull = status === 'completo'

  return (
    <div>
      <Link to="/eventos" className="back-link">
        <ArrowLeftIcon width={16} height={16} />
        Volver a eventos
      </Link>

      <div className="detail-header">
        <h1>{event.name}</h1>
        <StatusBadge status={status} labels={{ complete: 'Cupo completo', available: 'Cupo disponible' }} />
      </div>

      <p className="detail-subtitle">
        <CalendarIcon width={15} height={15} />
        {event.dateLabel}
        <span className="detail-dot">·</span>
        <PinIcon width={15} height={15} />
        {event.location}
      </p>

      <div className="detail-grid">
        <div className="card detail-main">
          <h2>Descripción</h2>
          <p className="detail-description">{event.description}</p>

          <div className="detail-occupation">
            <div className="detail-occupation-labels">
              <span>Ocupación</span>
              <span>
                {event.registered} / {event.capacity}
              </span>
            </div>
            <ProgressBar value={event.registered} max={event.capacity} />
          </div>

          <h2 className="detail-attendees-title">Asistentes inscritos</h2>
          <div className="detail-attendees">
            {event.attendees.map((attendee) => (
              <div key={attendee.id} className="detail-attendee-row">
                <div className="detail-attendee-avatar">{attendee.name.charAt(0).toUpperCase()}</div>
                <div className="detail-attendee-info">
                  <span className="detail-attendee-name">{attendee.name}</span>
                  <span className="detail-attendee-email">{attendee.email}</span>
                </div>
                <button type="button" className="btn btn-danger-outline">
                  Cancelar
                </button>
              </div>
            ))}
            {event.attendees.length === 0 && (
              <p className="detail-attendees-empty">Todavía no hay asistentes inscritos.</p>
            )}
          </div>
        </div>

        <div className="card detail-side">
          <h2>Registrar asistente</h2>

          {isFull ? (
            <div className="detail-full-notice">
              <AlertIcon width={18} height={18} />
              <p>Este evento alcanzó su capacidad máxima. Cancela una inscripción para liberar un cupo.</p>
            </div>
          ) : (
            <form className="detail-register-form">
              <div className="field">
                <label htmlFor="attendee-name">Nombre completo</label>
                <input id="attendee-name" type="text" className="input" placeholder="Ej. Ana Martínez" />
              </div>
              <div className="field">
                <label htmlFor="attendee-email">Correo electrónico</label>
                <input id="attendee-email" type="email" className="input" placeholder="correo@ejemplo.com" />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Registrar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
