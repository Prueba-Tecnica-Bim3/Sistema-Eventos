import { useCallback, useEffect, useState } from 'react'
import StatusBadge from '../../../shared/components/StatusBadge'
import ProgressBar from '../../../shared/components/ProgressBar'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import { formatEventDate, getEventStatus, mergeEventsWithOccupancy } from '../../../shared/utils/events'
import './SummaryPage.css'

export default function SummaryPage() {
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, eventsRes] = await Promise.all([
        registrationsApi.getOccupancySummary(),
        eventsApi.listEvents({ limit: 100 }).catch(() => null),
      ])

      const data = summaryRes?.data ?? null
      setSummary(data)

      const occupancyEvents = data?.events ?? []
      const rawEvents = eventsRes?.data?.events ?? []

      if (rawEvents.length > 0) {
        setRows(mergeEventsWithOccupancy(rawEvents, occupancyEvents))
      } else {
        setRows(
          occupancyEvents.map((item) => ({
            id: String(item.eventId ?? item.id),
            name: item.name ?? 'Sin nombre',
            dateLabel: item.date ? formatEventDate(item.date) : '—',
            capacity: item.capacity ?? 0,
            registered: item.registered ?? 0,
            isFull: item.isFull,
          })),
        )
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el resumen de ocupación.',
      )
      setSummary(null)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const stats = [
    { label: 'Eventos totales', value: summary?.totalEvents ?? 0, tone: '' },
    { label: 'Inscritos totales', value: summary?.totalRegistered ?? 0, tone: 'stat-primary' },
    { label: 'Cupos disponibles', value: summary?.totalAvailable ?? 0, tone: 'stat-success' },
    { label: 'Eventos completos', value: summary?.fullEvents ?? 0, tone: 'stat-warning' },
  ]

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
