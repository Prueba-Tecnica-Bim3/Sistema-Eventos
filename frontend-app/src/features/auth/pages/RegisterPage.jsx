import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../../shared/components/Logo'
import { useAuth } from '../useAuth'
import { ApiError } from '../../../shared/api/http'
import './AuthPages.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    const passwordRules = [
      { ok: /[A-Z]/.test(password), msg: 'una mayúscula' },
      { ok: /[a-z]/.test(password), msg: 'una minúscula' },
      { ok: /[0-9]/.test(password), msg: 'un número' },
      { ok: /[^a-zA-Z0-9]/.test(password), msg: 'un carácter especial' },
    ]
    const missing = passwordRules.filter((r) => !r.ok).map((r) => r.msg)
    if (missing.length > 0) {
      setError(`La contraseña debe contener: ${missing.join(', ')}.`)
      return
    }

    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/eventos', { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo crear la cuenta. Intenta de nuevo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Logo size={40} withTagline className="auth-logo" />

      <div className="auth-heading">
        <h1>Crea tu cuenta</h1>
        <p>Regístrate para empezar a organizar tus eventos.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="Ej. Ana Martínez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="confirm-password">Confirmar contraseña</label>
          <input
            id="confirm-password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-footer">
        ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </>
  )
}
