import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'

interface AnalyticsSummary {
  usersPerCity: Record<string, number>
  listingsPerCity: Record<string, number>
  eventsCount: number
}

export function AdminPage() {
  const { t } = useTranslation()

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get<AnalyticsSummary>('/admin/analytics/summary')
      return res.data
    }
  })

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      return res.data as any[]
    }
  })

  const { data: rooms } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const res = await api.get('/admin/rooms')
      return res.data as any[]
    }
  })

  return (
    <div className="grid gap-4">
      <div className="card">
        <h2 className="mb-2">{t('admin.title')}</h2>
        <p className="text-sm text-muted">
          {t('admin.analytics')} • {analytics?.eventsCount ?? 0} events
        </p>
      </div>

      <div className="card">
        <h3 className="mb-2">{t('admin.users')}</h3>
        <div className="text-sm">
          {users?.slice(0, 5).map((u) => (
            <div key={u.id}>
              {u.name} – {u.email}
            </div>
          )) || 'No users yet'}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-2">{t('admin.rooms')}</h3>
        <div className="text-sm">
          {rooms?.slice(0, 5).map((r) => (
            <div key={r.id}>
              {r.city}, {r.area} – {r.priceMonthly} AED
            </div>
          )) || 'No listings yet'}
        </div>
      </div>
    </div>
  )
}
