import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { events, getEventStatus, getSummary } from '../../../shared/data/mockEvents'
import './SummaryPage.css'

export default function SummaryPage() {
  const summary = getSummary(events)

  const stats = [
    { label: 'Eventos totales', value: summary.totalEvents, tone: '' },
    { label: 'Inscritos totales', value: summary.totalRegistered, tone: 'stat-primary' },
    { label: 'Cupos disponibles', value: summary.totalAvailable, tone: 'stat-success' },
    { label: 'Eventos completos', value: summary.totalComplete, tone: 'stat-warning' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Resumen de ocupación</h1>
        <p>Disponibilidad de cupos en tiempo real para todos los eventos.</p>
      </div>

      <div className="summary-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="card summary-stat">
            <span className="summary-stat-label">{stat.label}</span>
            <span className={`summary-stat-value ${stat.tone}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="card summary-table-wrap">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Fecha</th>
              <th>Ocupación</th>
              <th>Cupos</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="summary-table-name">{event.name}</td>
                <td>{event.dateLabel}</td>
                <td>
                  <ProgressBar value={event.registered} max={event.capacity} className="summary-table-progress" />
                </td>
                <td>
                  {event.registered}/{event.capacity}
                </td>
                <td>
                  <StatusBadge status={getEventStatus(event)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
