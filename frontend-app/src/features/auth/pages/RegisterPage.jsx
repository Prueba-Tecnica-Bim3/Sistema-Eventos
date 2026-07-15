import { Link } from 'react-router-dom'
import Logo from '../../../shared/components/Logo'
import './AuthPages.css'

export default function RegisterPage() {
  return (
    <>
      <Logo size={40} withTagline className="auth-logo" />

      <div className="auth-heading">
        <h1>Crea tu cuenta</h1>
        <p>Regístrate para empezar a organizar tus eventos.</p>
      </div>

      <form className="auth-form">
        <div className="field">
          <label htmlFor="name">Nombre completo</label>
          <input id="name" type="text" className="input" placeholder="Ej. Ana Martínez" />
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" className="input" placeholder="tu@correo.com" />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" className="input" placeholder="••••••••" />
        </div>

        <div className="field">
          <label htmlFor="confirm-password">Confirmar contraseña</label>
          <input id="confirm-password" type="password" className="input" placeholder="••••••••" />
        </div>

        <button type="submit" className="btn btn-primary btn-block auth-submit">
          Crear cuenta
        </button>
      </form>

      <p className="auth-footer">
        ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </>
  )
}
