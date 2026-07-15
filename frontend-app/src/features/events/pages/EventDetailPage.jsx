import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { ArrowLeftIcon, CalendarIcon, PinIcon, AlertIcon } from '../../../shared/components/icons'
import { getEventStatus } from '../../../shared/utils/events'
import { useEventDetail } from '../useEvents'
import './EventDetailPage.css'

export default function EventDetailPage() {
  const { id } = useParams()
  const {
    event,
    attendees,
    loading,
    error,
    formError,
    formSuccess,
    attendeeName,
    setAttendeeName,
    attendeeEmail,
    setAttendeeEmail,
    submitting,
    cancellingId,
    registerAttendee,
    cancelAttendee,
  } = useEventDetail(id)

  if (loading) {
    return (
      <div>
        <Link to="/eventos" className="back-link">
          <ArrowLeftIcon width={16} height={16} />
          Volver a eventos
        </Link>
        <p className="detail-loading">Cargando evento…</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div>
        <Link to="/eventos" className="back-link">
          <ArrowLeftIcon width={16} height={16} />
          Volver a eventos
        </Link>
        <p className="detail-error">{error || 'Evento no encontrado.'}</p>
      </div>
    )
  }

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
        <div className="detail-header-actions">
          <Link to={`/eventos/${event.id}/editar`} className="btn btn-outline">
            Editar
          </Link>
          <StatusBadge status={status} labels={{ complete: 'Cupo completo', available: 'Cupo disponible' }} />
        </div>
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
          <p className="detail-description">
            {event.description || 'Sin descripción.'}
          </p>

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
            {attendees.map((attendee) => (
              <div key={attendee.id} className="detail-attendee-row">
                <div className="detail-attendee-avatar">
                  {(attendee.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="detail-attendee-info">
                  <span className="detail-attendee-name">{attendee.name}</span>
                  <span className="detail-attendee-email">{attendee.email}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => cancelAttendee(attendee)}
                  disabled={cancellingId === attendee.id}
                >
                  {cancellingId === attendee.id ? 'Cancelando…' : 'Cancelar'}
                </button>
              </div>
            ))}
            {attendees.length === 0 && (
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
            <form className="detail-register-form" onSubmit={registerAttendee}>
              <div className="field">
                <label htmlFor="attendee-name">Nombre completo</label>
                <input
                  id="attendee-name"
                  type="text"
                  className="input"
                  placeholder="Ej. Ana Martínez"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="field">
                <label htmlFor="attendee-email">Correo electrónico</label>
                <input
                  id="attendee-email"
                  type="email"
                  className="input"
                  placeholder="correo@ejemplo.com"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Registrando…' : 'Registrar'}
              </button>
            </form>
          )}

          {formError && <p className="detail-form-error">{formError}</p>}
          {formSuccess && <p className="detail-form-success">{formSuccess}</p>}
        </div>
      </div>
    </div>
  )
}
