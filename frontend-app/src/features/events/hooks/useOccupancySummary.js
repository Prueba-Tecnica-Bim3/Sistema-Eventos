import { useCallback, useEffect, useState } from 'react'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import { formatEventDate, mergeEventsWithOccupancy } from '../../../shared/utils/events'

export function useOccupancySummary() {
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

  return { summary, rows, loading, error, stats, reload: loadSummary }
}
