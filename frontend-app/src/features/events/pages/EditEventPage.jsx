import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '../../../shared/components/icons'
import * as eventsApi from '../../../shared/api/events.api'
import { ApiError } from '../../../shared/api/http'
import './CreateEventPage.css'

function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function EditEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [lugar, setLugar] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadEvent = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await eventsApi.getEventById(id)
      const event = response?.data?.event
      if (!event) {
        throw new ApiError('Evento no encontrado', { status: 404 })
      }

      setNombre(event.nombre ?? event.name ?? '')
      setFecha(toDateInputValue(event.fecha ?? event.date))
      setCapacidad(String(event.capacidad ?? event.capacity ?? ''))
      setLugar(event.lugar ?? event.location ?? '')
      setDescripcion(event.descripcion ?? event.description ?? '')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el evento.',
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadEvent()
  }, [loadEvent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        nombre: nombre.trim(),
        fecha: new Date(fecha).toISOString(),
        lugar: lugar.trim(),
        capacidad: Number(capacidad),
        descripcion: descripcion.trim(),
      }

      await eventsApi.updateEvent(id, payload)
      navigate(`/eventos/${id}`, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo actualizar el evento.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Link to="/eventos" className="back-link">
          <ArrowLeftIcon width={16} height={16} />
          Volver a eventos
        </Link>
        <p className="create-event-muted">Cargando evento…</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/eventos/${id}`} className="back-link">
        <ArrowLeftIcon width={16} height={16} />
        Volver al detalle
      </Link>

      <div className="page-header">
        <h1>Editar evento</h1>
        <p>Actualiza la información del evento.</p>
      </div>

      <form className="card create-event-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="event-name">Nombre del evento *</label>
          <input
            id="event-name"
            type="text"
            className="input"
            placeholder="Ej. Conferencia de Tecnología"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            minLength={3}
            maxLength={150}
            disabled={saving}
          />
        </div>

        <div className="create-event-row">
          <div className="field">
            <label htmlFor="event-date">Fecha *</label>
            <input
              id="event-date"
              type="date"
              className="input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div className="field">
            <label htmlFor="event-capacity">Capacidad *</label>
            <input
              id="event-capacity"
              type="number"
              min="1"
              className="input"
              placeholder="100"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
              disabled={saving}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="event-location">Lugar *</label>
          <input
            id="event-location"
            type="text"
            className="input"
            placeholder="Ej. Centro de Convenciones"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            required
            minLength={3}
            maxLength={200}
            disabled={saving}
          />
        </div>

        <div className="field">
          <label htmlFor="event-description">Descripción</label>
          <textarea
            id="event-description"
            className="textarea"
            placeholder="Detalles del evento..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={1000}
            disabled={saving}
          />
        </div>

        {error && <p className="create-event-error">{error}</p>}

        <div className="create-event-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/eventos/${id}`)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
