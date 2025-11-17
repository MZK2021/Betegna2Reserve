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
    <div style={{ maxWidth: 480, margin: '3rem auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--gray-900)' }}>{t('auth.signupTitle')}</h2>
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
          <div className="text-sm" style={{ 
            color: 'var(--error)', 
            marginBottom: '0.75rem', 
            padding: '0.75rem',
            backgroundColor: '#FEE2E2',
            borderRadius: '8px',
            border: '1px solid #FECACA'
          }}>
            {error}
          </div>
        )}
        <button className="btn-primary full-width" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Creating account...' : t('auth.submit')}
        </button>
      </form>
      <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
        {t('auth.haveAccount')}{' '}
        <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          {t('nav.login')}
        </Link>
      </p>
      </div>
    </div>
  )
}
