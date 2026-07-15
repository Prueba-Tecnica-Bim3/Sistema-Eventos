import { useCallback, useEffect, useState } from 'react'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import { mergeEventsWithOccupancy } from '../../../shared/utils/events'
import { useDebouncedValue } from '../../../shared/hooks'

export function useEventsList() {
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const debouncedSearch = useDebouncedValue(search, 350)

  const loadEvents = useCallback(async (term = '') => {
    setLoading(true)
    setError('')
    try {
      const trimmed = term.trim()
      const query = { limit: 100 }

      if (trimmed) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          query.date = trimmed
        } else {
          query.name = trimmed
        }
      }

      const [eventsRes, summaryRes] = await Promise.all([
        eventsApi.listEvents(query),
        registrationsApi.getOccupancySummary().catch(() => null),
      ])

      let rawEvents = eventsRes?.data?.events ?? []

      if (trimmed && rawEvents.length === 0 && !query.date) {
        const byLocation = await eventsApi.listEvents({ location: trimmed, limit: 100 })
        rawEvents = byLocation?.data?.events ?? []
      }

      const occupancyList = summaryRes?.data?.events ?? []
      setEvents(mergeEventsWithOccupancy(rawEvents, occupancyList))
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los eventos.',
      )
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents(debouncedSearch)
  }, [debouncedSearch, loadEvents])

  const deleteEvent = useCallback(async (event) => {
    const ok = window.confirm(
      `¿Eliminar el evento "${event.name}"? Esta acción no se puede deshacer.`,
    )
    if (!ok) return false

    setDeletingId(event.id)
    setError('')
    try {
      await eventsApi.deleteEvent(event.id)
      setEvents((prev) => prev.filter((item) => item.id !== event.id))
      return true
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo eliminar el evento.',
      )
      return false
    } finally {
      setDeletingId(null)
    }
  }, [])

  return {
    search,
    setSearch,
    events,
    loading,
    error,
    deletingId,
    deleteEvent,
    reload: () => loadEvents(debouncedSearch),
  }
}
