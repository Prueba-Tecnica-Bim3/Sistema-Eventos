import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { ArrowLeftIcon, CalendarIcon, PinIcon, AlertIcon } from '../../../shared/icons'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import { getEventStatus, mapEventFromApi } from '../../../shared/utils/events'
import './EventDetailPage.css'

function mapAttendee(raw) {
  return {
    id: String(raw.id ?? raw._id),
    name: raw.attendeeName ?? raw.name ?? '',
    email: raw.attendeeEmail ?? raw.email ?? '',
  }
}

export default function EventDetailPage() {
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [eventRes, attendeesRes] = await Promise.all([
        eventsApi.getEventById(id),
        registrationsApi.listAttendees(id, 'confirmed').catch(() => null),
      ])

      const rawEvent = eventRes?.data?.event
      if (!rawEvent) {
        throw new ApiError('Evento no encontrado', { status: 404 })
      }

      const list = (attendeesRes?.data?.attendees ?? []).map(mapAttendee)
      const occupancy = {
        registered: list.length,
        capacity: Number(rawEvent.capacidad ?? rawEvent.capacity ?? 0),
        isFull:
          list.length >= Number(rawEvent.capacidad ?? rawEvent.capacity ?? 0) &&
          Number(rawEvent.capacidad ?? rawEvent.capacity ?? 0) > 0,
      }

      setEvent(mapEventFromApi(rawEvent, occupancy))
      setAttendees(list)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el evento.',
      )
      setEvent(null)
      setAttendees([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)

    try {
      const response = await registrationsApi.createRegistration({
        eventId: id,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
      })

      const registration = response?.data?.registration
      const occupancy = response?.data?.occupancy

      if (registration) {
        setAttendees((prev) => [...prev, mapAttendee(registration)])
      }

      if (event && occupancy) {
        setEvent({
          ...event,
          registered: occupancy.registered,
          capacity: occupancy.capacity ?? event.capacity,
          isFull: occupancy.isFull,
        })
      } else {
        await loadDetail()
      }

      setAttendeeName('')
      setAttendeeEmail('')
      setFormSuccess('Asistente registrado correctamente.')
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo registrar al asistente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (attendee) => {
    const ok = window.confirm(`¿Cancelar la inscripción de ${attendee.name}?`)
    if (!ok) return

    setCancellingId(attendee.id)
    setFormError('')
    setFormSuccess('')
    try {
      await registrationsApi.cancelRegistration(attendee.id)
      const nextAttendees = attendees.filter((item) => item.id !== attendee.id)
      setAttendees(nextAttendees)
      if (event) {
        const registered = nextAttendees.length
        setEvent({
          ...event,
          registered,
          isFull: registered >= event.capacity && event.capacity > 0,
        })
      }
      setFormSuccess('Inscripción cancelada.')
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cancelar la inscripción.',
      )
    } finally {
      setCancellingId(null)
    }
  }

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
                  onClick={() => handleCancel(attendee)}
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
            <form className="detail-register-form" onSubmit={handleRegister}>
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
