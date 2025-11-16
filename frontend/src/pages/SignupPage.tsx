import { FormEvent, useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export function SignupPage() {
  const { t } = useTranslation()
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'TENANT' | 'OWNER' | 'BOTH'>('TENANT')

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'OWNER' || roleParam === 'TENANT' || roleParam === 'BOTH') {
      setRole(roleParam)
    }
  }, [searchParams])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signup({ name, email, password, role })
      // Redirect based on role
      if (role === 'OWNER' || role === 'BOTH') {
        navigate('/my-rooms')
      } else {
        navigate('/rooms')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h2 className="mb-4">{t('auth.signupTitle')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>{t('auth.name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
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
        <div className="form-field">
          <label>{t('auth.role')}</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'TENANT' | 'OWNER' | 'BOTH')}
          >
            <option value="TENANT">{t('auth.tenant')}</option>
            <option value="OWNER">{t('auth.owner')}</option>
            <option value="BOTH">{t('auth.both')}</option>
          </select>
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
        {t('auth.haveAccount')}{' '}
        <Link to="/login" style={{ textDecoration: 'underline' }}>
          {t('nav.login')}
        </Link>
      </p>
    </div>
  )
}
