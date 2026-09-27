import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { user, loading, loginWithGoogle } = useAuth()
  const [error, setError] = useState('')

  if (!loading && user) return <Navigate to="/" replace />

  const handleLogin = async () => {
    setError('')
    try {
      await loginWithGoogle()
    } catch (e) {
      setError('No se pudo iniciar sesión. Probá de nuevo.')
    }
  }

  return (
    <div className="login-screen">
      <h1>Finanzas<span style={{ color: 'var(--accent)' }}>.</span></h1>
      <p>Ingresos, gastos, cuentas y metas de ahorro, sincronizados en tu cuenta.</p>
      <button className="google-btn" onClick={handleLogin}>Continuar con Google</button>
      {error && <p style={{ color: 'var(--negative)' }}>{error}</p>}
    </div>
  )
}
