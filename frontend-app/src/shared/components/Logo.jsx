import './Logo.css'

function LogoMark({ size }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size }}>
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
        <rect x="4" y="4" width="16" height="16" rx="4" />
      </svg>
    </span>
  )
}

export default function Logo({ size = 32, withTagline = false, className = '' }) {
  return (
    <div className={`logo ${className}`}>
      <div className="logo-row">
        <LogoMark size={size} />
        <span className="logo-text" style={{ fontSize: size * 0.5 }}>
          Planning plus
        </span>
      </div>
      {withTagline && <p className="logo-tagline">Organiza. Inscribe. Controla.</p>}
    </div>
  )
}
