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
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>{t('auth.name')}</label>
          <input name="name" defaultValue={data.name} />
        </div>
        <div className="form-field">
          <label>{t('profile.occupation')}</label>
          <input name="occupation" defaultValue={data.occupation} />
        </div>
        <div className="form-field">
          <label>{t('profile.cityCurrent')}</label>
          <input name="cityCurrent" defaultValue={data.cityCurrent} />
        </div>
        <button className="btn-primary mt-4" type="submit" disabled={mutation.isPending}>
          {t('profile.save')}
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
