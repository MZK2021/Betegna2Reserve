import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import { AdBanner } from '../components/AdBanner'
import { useAuth } from '../hooks/useAuth'

interface RoomDetail {
  id: string
  country: string
  city: string
  area: string
  priceMonthly: number
  shortStayAllowed: boolean
  amenities?: string[]
  rules?: { smoking?: string; alcohol?: string; visitors?: string; quietHours?: string }
  description?: string
  photos?: string[]
  owner?: {
    id: string
    name: string
    ratingAvg?: number
    ratingCount?: number
  } | null
}

interface Feedback {
  id: string
  rating: number
  comment?: string
  createdAt: string
}

export function RoomDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: room } = useQuery({
    queryKey: ['room', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get<RoomDetail>(`/rooms/${id}`)
      return res.data
    }
  })

  const { data: feedback } = useQuery({
    queryKey: ['room-feedback', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get<Feedback[]>(`/feedback/rooms/${id}`)
      return res.data
    }
  })

  const chatMutation = useMutation({
    mutationFn: async () => {
      if (!room?.owner) return
      await api.post('/messages', {
        recipientId: room.owner.id,
        roomId: room.id,
        text: 'Hello, I am interested in this room.'
      })
    },
    onSuccess: () => {
      navigate('/chat')
    }
  })

  if (!room) return <div className="card">Loading...</div>

  return (
    <div className="layout-two-cols">
      <div>
        <div className="card mb-4">
          <h2 className="room-card-title">
            {room.city}, {room.area}
          </h2>
          <div className="room-card-price">
            {room.priceMonthly} AED <span className="text-sm text-muted">{t('rooms.perMonth')}</span>
          </div>
          <p className="mt-4 text-sm text-muted">{room.description}</p>
          {room.photos && room.photos.length > 0 && (
            <div className="mt-4" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {room.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Room photo ${idx + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '150px', 
                    borderRadius: '12px', 
                    objectFit: 'cover',
                    border: '1px solid var(--gray-200)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card mb-4">
          <h3 className="mb-2">{t('roomDetail.amenities')}</h3>
          <div className="text-sm">
            {room.amenities && room.amenities.length > 0
              ? room.amenities.join(' • ')
              : 'No amenities listed'}
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="mb-2">{t('roomDetail.houseRules')}</h3>
          <div className="text-sm">
            {room.rules ? (
              <>
                {room.rules.smoking && <div>Smoking: {room.rules.smoking}</div>}
                {room.rules.alcohol && <div>Alcohol: {room.rules.alcohol}</div>}
                {room.rules.visitors && <div>Visitors: {room.rules.visitors}</div>}
                {room.rules.quietHours && <div>Quiet hours: {room.rules.quietHours}</div>}
              </>
            ) : (
              'No rules listed'
            )}
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="mb-2">{t('roomDetail.feedback')}</h3>
          {!feedback || feedback.length === 0 ? (
            <div className="text-sm text-muted">No reviews yet</div>
          ) : (
            <div className="text-sm">
              {feedback.map((f) => (
                <div key={f.id} className="mb-2">
                  <div>⭐ {f.rating}</div>
                  {f.comment && <div>{f.comment}</div>}
                  <div className="text-muted">
                    {new Date(f.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="card mb-4">
          <h3 className="mb-2">{t('roomDetail.host')}</h3>
          {room.owner ? (
            <div className="text-sm">
              <div>{room.owner.name}</div>
              {room.owner.ratingAvg && (
                <div>
                  {t('rooms.rating', {
                    rating: room.owner.ratingAvg.toFixed(1),
                    count: room.owner.ratingCount ?? 0
                  })}
                </div>
              )}
              <button
                className="btn-primary full-width mt-4"
                disabled={!user || chatMutation.isPending}
                onClick={() => {
                  if (!user) {
                    navigate('/login')
                  } else {
                    chatMutation.mutate()
                  }
                }}
              >
                {t('roomDetail.chatWithHost')}
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted">Host information not available</div>
          )}
        </div>
        <AdBanner position="PROFILE_SIDEBAR" country={room.country} city={room.city} />
      </div>
    </div>
  )
}
