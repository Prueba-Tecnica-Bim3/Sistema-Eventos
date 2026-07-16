import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../../../shared/components/icons'
import * as eventsApi from '../../../shared/api/events.api'
import { ApiError } from '../../../shared/api/http'
import './CreateEventPage.css'

export default function CreateEventPage() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [lugar, setLugar] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        nombre: nombre.trim(),
        fecha: new Date(fecha).toISOString(),
        lugar: lugar.trim(),
        capacidad: Number(capacidad),
        descripcion: descripcion.trim(),
      }

      const response = await eventsApi.createEvent(payload)
      const created = response?.data?.event
      const id = created?._id ?? created?.id

      if (id) {
        navigate(`/eventos/${id}`, { replace: true })
      } else {
        navigate('/eventos', { replace: true })
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo crear el evento.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link to="/eventos" className="back-link">
        <ArrowLeftIcon width={16} height={16} />
        Volver a eventos
      </Link>

      <div className="page-header">
        <h1>Crear evento</h1>
        <p>Completa la información para crear el evento.</p>
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
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        {error && <p className="create-event-error">{error}</p>}

        <div className="create-event-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/eventos')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
