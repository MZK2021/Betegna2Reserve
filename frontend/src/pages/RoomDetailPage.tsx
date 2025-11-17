import { useState } from 'react'
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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

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

  const photos = room.photos || []
  const nextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)
  }
  const prevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="layout-two-cols">
      <div>
        {/* Image Carousel */}
        {photos.length > 0 ? (
          <div className="room-carousel mb-4">
            <div className="room-carousel-main">
              <img
                src={photos[selectedPhotoIndex]}
                alt={`Room photo ${selectedPhotoIndex + 1}`}
                className="room-carousel-image"
              />
              {photos.length > 1 && (
                <>
                  <button
                    className="room-carousel-btn room-carousel-btn-prev"
                    onClick={prevPhoto}
                    aria-label="Previous photo"
                  >
                    ‹
                  </button>
                  <button
                    className="room-carousel-btn room-carousel-btn-next"
                    onClick={nextPhoto}
                    aria-label="Next photo"
                  >
                    ›
                  </button>
                  <div className="room-carousel-indicator">
                    {selectedPhotoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="room-carousel-thumbnails">
                {photos.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`room-carousel-thumbnail ${idx === selectedPhotoIndex ? 'active' : ''}`}
                    onClick={() => setSelectedPhotoIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="room-carousel-placeholder mb-4">
            <div className="room-carousel-placeholder-icon">🏠</div>
            <p>No photos available</p>
          </div>
        )}

        <div className="card mb-4">
          <div className="room-detail-header">
            <div>
              <h1 className="room-card-title">
                🏠 {room.city}, {room.area}
              </h1>
              <div className="room-card-meta">
                📍 {room.country} • {room.roomType || 'Room'}
              </div>
            </div>
            <div className="room-card-price">
              {room.priceMonthly} AED <span className="text-sm text-muted">{t('rooms.perMonth')}</span>
            </div>
          </div>
          
          {room.shortStayAllowed && (
            <div className="room-badge-shortstay">
              ✅ Short Stay Allowed
            </div>
          )}
          
          <p className="mt-4" style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--gray-700)' }}>
            {room.description || 'No description available.'}
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="mb-3">✨ {t('roomDetail.amenities')}</h3>
          {room.amenities && room.amenities.length > 0 ? (
            <div className="amenities-grid">
              {room.amenities.map((amenity, idx) => (
                <div key={idx} className="amenity-item">
                  <span className="amenity-icon">
                    {amenity === 'Wi-Fi' ? '📶' : 
                     amenity === 'AC' ? '❄️' : 
                     amenity === 'Laundry' ? '🧺' : 
                     amenity === 'Parking' ? '🅿️' : 
                     amenity === 'Furnished' ? '🛋️' : '✓'}
                  </span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted">No amenities listed</div>
          )}
        </div>

        <div className="card mb-4">
          <h3 className="mb-3">📋 {t('roomDetail.houseRules')}</h3>
          {room.rules ? (
            <div className="rules-list">
              {room.rules.smoking && (
                <div className="rule-item">
                  <span className="rule-icon">
                    {room.rules.smoking === 'Not allowed' ? '🚭' : room.rules.smoking === 'Outside only' ? '🚬' : '✅'}
                  </span>
                  <div>
                    <strong>Smoking:</strong> {room.rules.smoking}
                  </div>
                </div>
              )}
              {room.rules.alcohol && (
                <div className="rule-item">
                  <span className="rule-icon">🍷</span>
                  <div>
                    <strong>Alcohol:</strong> {room.rules.alcohol}
                  </div>
                </div>
              )}
              {room.rules.visitors && (
                <div className="rule-item">
                  <span className="rule-icon">👥</span>
                  <div>
                    <strong>Visitors:</strong> {room.rules.visitors}
                  </div>
                </div>
              )}
              {room.rules.quietHours && (
                <div className="rule-item">
                  <span className="rule-icon">🔇</span>
                  <div>
                    <strong>Quiet Hours:</strong> {room.rules.quietHours}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted">No rules listed</div>
          )}
        </div>

        {/* Map Placeholder */}
        <div className="card mb-4">
          <h3 className="mb-3">📍 Location</h3>
          <div className="map-placeholder">
            <div className="map-placeholder-content">
              <div className="map-placeholder-icon">🗺️</div>
              <p>{room.area}, {room.city}, {room.country}</p>
              <button className="btn-secondary" style={{ marginTop: '1rem' }}>
                View on Map
              </button>
            </div>
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
        {/* Owner Card */}
        <div className="card mb-4 owner-card">
          <h3 className="mb-3">👤 {t('roomDetail.host')}</h3>
          {room.owner ? (
            <div className="owner-info">
              <div className="owner-avatar">
                {room.owner.name.charAt(0).toUpperCase()}
              </div>
              <div className="owner-details">
                <div className="owner-name">{room.owner.name}</div>
                {room.owner.ratingAvg && (
                  <div className="owner-rating">
                    ⭐ {room.owner.ratingAvg.toFixed(1)} 
                    <span className="text-muted"> ({room.owner.ratingCount ?? 0} reviews)</span>
                  </div>
                )}
                <div className="owner-status">
                  <span className="status-dot"></span>
                  Active Host
                </div>
              </div>
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
                💬 {t('roomDetail.chatWithHost')}
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted">Host information not available</div>
          )}
        </div>

        {/* Booking/Contact Panel */}
        <div className="card mb-4 booking-panel">
          <h3 className="mb-3">📅 Availability</h3>
          <div className="availability-info">
            <div className="availability-item">
              <strong>Beds Available:</strong> {room.bedsAvailable || 0} / {room.bedsTotal || 0}
            </div>
            {room.minStayMonths && (
              <div className="availability-item">
                <strong>Minimum Stay:</strong> {room.minStayMonths} month(s)
              </div>
            )}
          </div>
          <button
            className="btn-primary full-width mt-3"
            disabled={!user}
            onClick={() => {
              if (!user) {
                navigate('/login')
              } else if (room.owner) {
                chatMutation.mutate()
              }
            }}
          >
            {user ? '💬 Contact Owner' : '🔐 Login to Contact'}
          </button>
        </div>

        <AdBanner position="PROFILE_SIDEBAR" country={room.country} city={room.city} />
      </div>
    </div>
  )
}
