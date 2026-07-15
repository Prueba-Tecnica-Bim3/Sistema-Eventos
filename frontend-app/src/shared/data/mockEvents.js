export const events = [
  {
    id: '1',
    name: 'Taller de Scrum Avanzado',
    dateLabel: '22 jul 2026',
    location: 'Sala Innovación, Zona 10',
    capacity: 30,
    registered: 30,
    description:
      'Taller práctico de metodologías ágiles orientado a equipos de desarrollo de software.',
    attendees: [{ id: 'a1', name: 'Luis Cifuentes', email: 'luis.cifuentes@correo.com' }],
  },
  {
    id: '2',
    name: 'Networking Empresarial',
    dateLabel: '5 sep 2026',
    location: 'Hotel Real InterContinental',
    capacity: 120,
    registered: 45,
    description:
      'Espacio de conexión entre profesionales y empresas para generar nuevas oportunidades de negocio.',
    attendees: [
      { id: 'a1', name: 'Ana Martínez', email: 'ana.martinez@correo.com' },
      { id: 'a2', name: 'Carlos Ruiz', email: 'carlos.ruiz@correo.com' },
    ],
  },
  {
    id: '3',
    name: 'Hackathon Universitario',
    dateLabel: '30 ago 2026',
    location: 'Campus Central, Edificio T',
    capacity: 80,
    registered: 80,
    description:
      'Competencia de desarrollo de software de 24 horas para equipos de estudiantes universitarios.',
    attendees: [{ id: 'a1', name: 'María López', email: 'maria.lopez@correo.com' }],
  },
  {
    id: '4',
    name: 'Seminario de Ciberseguridad',
    dateLabel: '10 oct 2026',
    location: 'Auditorio Tecnológico',
    capacity: 60,
    registered: 12,
    description:
      'Conferencia sobre las últimas tendencias y buenas prácticas en seguridad informática.',
    attendees: [{ id: 'a1', name: 'Jorge Pérez', email: 'jorge.perez@correo.com' }],
  },
]

export function getEventStatus(event) {
  return event.registered >= event.capacity ? 'completo' : 'disponible'
}

export function getSummary(list = events) {
  const totalRegistered = list.reduce((sum, e) => sum + e.registered, 0)
  const totalAvailable = list.reduce((sum, e) => sum + Math.max(e.capacity - e.registered, 0), 0)
  const totalComplete = list.filter((e) => getEventStatus(e) === 'completo').length
  return {
    totalEvents: list.length,
    totalRegistered,
    totalAvailable,
    totalComplete,
  }
}
