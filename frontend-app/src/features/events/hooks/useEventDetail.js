import { useCallback, useEffect, useState } from 'react'
import * as eventsApi from '../../../shared/api/events.api'
import * as registrationsApi from '../../../shared/api/registrations.api'
import { ApiError } from '../../../shared/api/http'
import { mapEventFromApi } from '../../../shared/utils/events'

function mapAttendee(raw) {
  return {
    id: String(raw.id ?? raw._id),
    name: raw.attendeeName ?? raw.name ?? '',
    email: raw.attendeeEmail ?? raw.email ?? '',
  }
}

export function useEventDetail(id) {
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

  const registerAttendee = useCallback(
    async (e) => {
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
    },
    [id, attendeeName, attendeeEmail, event, loadDetail],
  )

  const cancelAttendee = useCallback(
    async (attendee) => {
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
    },
    [attendees, event],
  )

  return {
    event,
    attendees,
    loading,
    error,
    formError,
    formSuccess,
    attendeeName,
    setAttendeeName,
    attendeeEmail,
    setAttendeeEmail,
    submitting,
    cancellingId,
    registerAttendee,
    cancelAttendee,
  }
}
