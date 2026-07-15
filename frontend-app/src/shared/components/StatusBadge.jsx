export default function StatusBadge({ status, labels = { complete: 'Completo', available: 'Disponible' } }) {
  const isComplete = status === 'completo'
  return (
    <span className={`badge ${isComplete ? 'badge-warning' : 'badge-success'}`}>
      {isComplete ? labels.complete : labels.available}
    </span>
  )
}
