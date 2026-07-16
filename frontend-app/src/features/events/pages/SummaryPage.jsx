import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import { getEventStatus } from '../../../shared/utils/events'
import { useOccupancySummary } from '../useEvents'
import './SummaryPage.css'

export default function SummaryPage() {
  const { rows, loading, error, stats } = useOccupancySummary()

  return (
    <div>
      <div className="page-header">
        <h1>Resumen de ocupación</h1>
        <p>Disponibilidad de cupos en tiempo real para todos los eventos.</p>
      </div>

      {error && <p className="summary-error">{error}</p>}

      {loading ? (
        <p className="summary-loading">Cargando resumen…</p>
      ) : (
        <>
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
                {rows.map((event) => (
                  <tr key={event.id}>
                    <td className="summary-table-name">{event.name}</td>
                    <td>{event.dateLabel}</td>
                    <td>
                      <ProgressBar
                        value={event.registered}
                        max={event.capacity}
                        className="summary-table-progress"
                      />
                    </td>
                    <td>
                      {event.registered}/{event.capacity}
                    </td>
                    <td>
                      <StatusBadge status={getEventStatus(event)} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="summary-table-empty">
                      No hay eventos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
