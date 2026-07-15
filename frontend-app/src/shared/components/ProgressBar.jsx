export default function ProgressBar({ value, max, className = '' }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className={`progress-track ${className}`}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
