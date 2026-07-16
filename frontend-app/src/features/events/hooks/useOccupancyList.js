import { useCallback, useEffect, useState } from 'react'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import {
  formatEventDate,
  mergeEventsWithOccupancy,
} from '../../../shared/utils/events'

/**
 * Lista de eventos por ocupación.
 * @param {'available' | 'full'} mode
 */
export function useOccupancyList(mode = 'available') {
  const isAvailable = mode === 'available'
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [occupancyRes, eventsRes] = await Promise.all([
        isAvailable
          ? registrationsApi.getAvailableEvents()
          : registrationsApi.getFullEvents(),
        eventsApi.listEvents({ limit: 100 }).catch(() => null),
      ])

      const occupancyList = occupancyRes?.data?.events ?? []
      const rawEvents = eventsRes?.data?.events ?? []

      if (rawEvents.length > 0) {
        const occupancyIds = new Set(
          occupancyList.map((item) => String(item.eventId ?? item.id)),
        )
        const filteredRaw = rawEvents.filter((event) =>
          occupancyIds.has(String(event.id ?? event._id)),
        )
        setEvents(mergeEventsWithOccupancy(filteredRaw, occupancyList))
      } else {
        setEvents(
          occupancyList.map((item) => ({
            id: String(item.eventId ?? item.id),
            name: item.name ?? 'Sin nombre',
            dateLabel: item.date ? formatEventDate(item.date) : '—',
            location: item.location ?? '',
            capacity: item.capacity ?? 0,
            registered: item.registered ?? 0,
            isFull: item.isFull ?? !isAvailable,
          })),
        )
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar la lista de eventos.',
      )
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [isAvailable])

  useEffect(() => {
    load()
  }, [load])

  return {
    events,
    loading,
    error,
    isAvailable,
    title: isAvailable ? 'Eventos con cupos disponibles' : 'Eventos con cupo completo',
    subtitle: isAvailable
      ? 'Eventos que todavía tienen lugares libres para inscribir asistentes.'
      : 'Eventos que alcanzaron su capacidad máxima.',
  }
}
