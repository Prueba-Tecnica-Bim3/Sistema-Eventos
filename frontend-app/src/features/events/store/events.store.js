/**
 * Estado local de la feature events.
 * Las páginas usan hooks en features/events/hooks; este módulo
 * centraliza helpers de estado si se necesitan más adelante.
 */
export const initialEventsListState = {
  events: [],
  loading: true,
  error: '',
  search: '',
}
