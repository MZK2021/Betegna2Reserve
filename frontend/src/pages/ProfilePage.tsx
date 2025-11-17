import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'

interface UserProfile {
  id: string
  name: string
  email: string
  languages?: string[]
  occupation?: string
  cityCurrent?: string
  preferences?: {
    preferredGender?: string
    preferredReligion?: string
    budgetMin?: number
    budgetMax?: number
  }
  ratingAvg?: number
  ratingCount?: number
}

export function ProfilePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<UserProfile>('/users/me')
      return res.data
    }
  })

  const mutation = useMutation({
    mutationFn: async (payload: Partial<UserProfile>) => {
      const res = await api.put<UserProfile>('/users/me', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setSuccessMessage('Profile saved successfully!')
      setErrorMessage(null)
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to save profile. Please try again.'
      setErrorMessage(errorMsg)
      setSuccessMessage(null)
      // Clear error message after 7 seconds
      setTimeout(() => setErrorMessage(null), 7000)
    }
  })

  if (isLoading || !data) return <div className="card">Loading...</div>

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload: Partial<UserProfile> = {
      name: String(formData.get('name') || data.name),
      occupation: String(formData.get('occupation') || ''),
      cityCurrent: String(formData.get('cityCurrent') || '')
    }
    mutation.mutate(payload)
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 className="mb-4">{t('profile.title')}</h2>
      
      {successMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: '#D1FAE5',
          color: '#065F46',
          borderRadius: '8px',
          border: '1px solid #10B981',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          borderRadius: '8px',
          border: '1px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✕</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>{t('auth.name')}</label>
          <input 
            name="name" 
            defaultValue={data.name}
            onChange={() => {
              // Clear messages when user starts editing
              if (successMessage) setSuccessMessage(null)
              if (errorMessage) setErrorMessage(null)
            }}
          />
        </div>
        <div className="form-field">
          <label>{t('profile.occupation')}</label>
          <input 
            name="occupation" 
            defaultValue={data.occupation}
            onChange={() => {
              if (successMessage) setSuccessMessage(null)
              if (errorMessage) setErrorMessage(null)
            }}
          />
        </div>
        <div className="form-field">
          <label>{t('profile.cityCurrent')}</label>
          <input 
            name="cityCurrent" 
            defaultValue={data.cityCurrent}
            onChange={() => {
              if (successMessage) setSuccessMessage(null)
              if (errorMessage) setErrorMessage(null)
            }}
          />
        </div>
        <button 
          className="btn-primary mt-4" 
          type="submit" 
          disabled={mutation.isPending}
          style={{ width: '100%' }}
        >
          {mutation.isPending ? 'Saving...' : t('profile.save')}
        </button>
      </form>
      {data.ratingAvg && (
        <div className="mt-4 text-sm">
          {t('profile.rating')}: {data.ratingAvg.toFixed(1)} ({data.ratingCount ?? 0} reviews)
        </div>
      )}
    </div>
  )
}
