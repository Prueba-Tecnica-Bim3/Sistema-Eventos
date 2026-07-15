import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../../../shared/icons'
import './CreateEventPage.css'

export default function CreateEventPage() {
  const navigate = useNavigate()

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

      <form className="card create-event-form">
        <div className="field">
          <label htmlFor="event-name">Nombre del evento *</label>
          <input id="event-name" type="text" className="input" placeholder="Ej. Conferencia de Tecnología" />
        </div>

        <div className="create-event-row">
          <div className="field">
            <label htmlFor="event-date">Fecha *</label>
            <input id="event-date" type="date" className="input" />
          </div>
          <div className="field">
            <label htmlFor="event-capacity">Capacidad *</label>
            <input id="event-capacity" type="number" min="1" className="input" placeholder="100" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="event-location">Lugar *</label>
          <input id="event-location" type="text" className="input" placeholder="Ej. Centro de Convenciones" />
        </div>

        <div className="field">
          <label htmlFor="event-description">Descripción</label>
          <textarea id="event-description" className="textarea" placeholder="Detalles del evento..." />
        </div>

        <div className="create-event-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/eventos')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar evento
          </button>
        </div>
      </form>
    </div>
  )
}
