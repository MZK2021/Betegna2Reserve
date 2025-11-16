import { FormEvent, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h2 className="mb-4">{t('auth.loginTitle')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>{t('auth.email')}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="form-field">
          <label>{t('auth.password')}</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        {error && (
          <div className="text-sm" style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>
            {error}
          </div>
        )}
        <button className="btn-primary full-width" type="submit" disabled={loading}>
          {loading ? '...' : t('auth.submit')}
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        {t('auth.noAccount')}{' '}
        <Link to="/signup" style={{ textDecoration: 'underline' }}>
          {t('nav.signup')}
        </Link>
      </p>
    </div>
  )
}
