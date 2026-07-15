const DATE_FORMATTER = new Intl.DateTimeFormat('es-GT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/**
 * Formatea una fecha ISO o Date a etiqueta legible (ej. "22 jul 2026").
 */
export function formatEventDate(value) {
  if (!value) return 'Sin fecha'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return DATE_FORMATTER.format(date)
}

/**
 * Normaliza un documento de evento del API (campos en español) al shape de la UI.
 */
export function mapEventFromApi(raw, occupancy = null) {
  if (!raw) return null

  const id = String(raw.id ?? raw._id ?? '')
  const capacity = Number(raw.capacidad ?? raw.capacity ?? occupancy?.capacity ?? 0)
  const registered = Number(
    occupancy?.registered ?? raw.registered ?? raw.inscritos ?? 0,
  )

  return {
    id,
    name: raw.nombre ?? raw.name ?? 'Sin nombre',
    date: raw.fecha ?? raw.date ?? null,
    dateLabel: formatEventDate(raw.fecha ?? raw.date),
    location: raw.lugar ?? raw.location ?? '',
    capacity,
    registered,
    description: raw.descripcion ?? raw.description ?? '',
    category: raw.categoria ?? raw.category ?? null,
    image: raw.imagen ?? raw.image ?? null,
    status: raw.estado ?? raw.status ?? 'activo',
    isFull: occupancy?.isFull ?? (registered >= capacity && capacity > 0),
  }
}

export function getEventStatus(event) {
  if (!event) return 'disponible'
  const capacity = Number(event.capacity ?? 0)
  const registered = Number(event.registered ?? 0)
  if (event.isFull || (capacity > 0 && registered >= capacity)) return 'completo'
  return 'disponible'
}

/**
 * Une la lista de eventos con el mapa de ocupación (por eventId).
 */
export function mergeEventsWithOccupancy(events = [], occupancyEvents = []) {
  const byId = new Map(
    occupancyEvents.map((item) => [String(item.eventId ?? item.id), item]),
  )
  return events.map((event) => {
    const id = String(event.id ?? event._id ?? '')
    return mapEventFromApi(event, byId.get(id) ?? null)
  })
}
