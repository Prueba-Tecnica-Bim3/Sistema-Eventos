import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../../shared/components/Logo'
import './AuthPages.css'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/eventos')
  }

  return (
    <>
      <Logo size={40} withTagline className="auth-logo" />

      <div className="auth-heading">
        <h1>Bienvenido de nuevo</h1>
        <p>Inicia sesión para administrar tus eventos.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" className="input" placeholder="tu@correo.com" />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" className="input" placeholder="••••••••" />
        </div>

        <button type="submit" className="btn btn-primary btn-block auth-submit">
          Iniciar sesión
        </button>
      </form>

      <p className="auth-footer">
        ¿No tienes una cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
    </>
  )
}
