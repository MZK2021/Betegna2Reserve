import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

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

type TabType = 'profile' | 'myRooms' | 'savedRooms' | 'settings'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<UserProfile>('/users/me')
      return res.data
    }
  })

  const { data: myRooms } = useQuery({
    queryKey: ['my-rooms'],
    queryFn: async () => {
      const res = await api.get<any[]>('/rooms/my-rooms')
      return res.data
    },
    enabled: activeTab === 'myRooms' && (user?.role === 'OWNER' || user?.role === 'BOTH')
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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card mb-4 profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {data.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{data.name}</h1>
            <div className="profile-meta">
              {data.cityCurrent && <span>📍 {data.cityCurrent}</span>}
              {data.occupation && <span>💼 {data.occupation}</span>}
            </div>
            {data.ratingAvg && (
              <div className="profile-rating-large">
                ⭐ {data.ratingAvg.toFixed(1)} <span className="text-muted">({(data.ratingCount ?? 0) > 0 ? `${data.ratingCount} reviews` : 'No reviews'})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        {(user?.role === 'OWNER' || user?.role === 'BOTH') && (
          <button
            className={`profile-tab ${activeTab === 'myRooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('myRooms')}
          >
            🛏️ My Rooms
          </button>
        )}
        <button
          className={`profile-tab ${activeTab === 'savedRooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('savedRooms')}
        >
          ⭐ Saved Rooms
        </button>
        <button
          className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'profile' && (
          <div>
            <h2 className="mb-4">👤 Profile Overview</h2>
            <div className="profile-overview">
              <div className="profile-info-item">
                <strong>📧 Email:</strong> {data.email}
              </div>
              {data.cityCurrent && (
                <div className="profile-info-item">
                  <strong>📍 Current City:</strong> {data.cityCurrent}
                </div>
              )}
              {data.occupation && (
                <div className="profile-info-item">
                  <strong>💼 Occupation:</strong> {data.occupation}
                </div>
              )}
              {data.languages && data.languages.length > 0 && (
                <div className="profile-info-item">
                  <strong>🌐 Languages:</strong>
                  <div className="languages-list" style={{ marginTop: '0.5rem' }}>
                    {data.languages.map((lang, idx) => (
                      <span key={idx} className="language-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.ratingAvg && (
                <div className="profile-info-item">
                  <strong>⭐ Rating:</strong> {data.ratingAvg.toFixed(1)} ({(data.ratingCount ?? 0) > 0 ? `${data.ratingCount} reviews` : 'No reviews'})
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'myRooms' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="mb-0">🛏️ My Rooms</h2>
              <Link to="/rooms/create" className="btn-primary">
                + Add New Room
              </Link>
            </div>
            {!myRooms || myRooms.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛏️</div>
                <h3>No rooms yet</h3>
                <p className="text-muted">Start by creating your first room listing</p>
                <Link to="/rooms/create" className="btn-primary mt-4">
                  Create Room Listing
                </Link>
              </div>
            ) : (
              <div className="rooms-grid">
                {myRooms.map((room: any) => (
                  <Link key={room.id} to={`/rooms/${room.id}`} className="room-card">
                    {room.photos && room.photos.length > 0 && (
                      <div className="room-card-image">
                        <img src={room.photos[0]} alt={room.city} />
                      </div>
                    )}
                    <div className="room-card-content">
                      <div className="room-card-title">
                        🏠 {room.city}, {room.area}
                      </div>
                      <div className="room-card-meta">
                        📍 {room.country} • {room.roomType}
                      </div>
                      <div className="room-card-price">
                        {room.priceMonthly} AED <span className="text-sm text-muted">/month</span>
                      </div>
                      <div className="room-card-footer" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--gray-200)' }}>
                        <Link
                          to={`/rooms/${room.id}/edit`}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          ✏️ Edit
                        </Link>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'savedRooms' && (
          <div>
            <h2 className="mb-4">⭐ Saved Rooms</h2>
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <h3>No saved rooms yet</h3>
              <p className="text-muted">Save rooms you're interested in for later</p>
              <Link to="/rooms" className="btn-primary mt-4">
                Browse Rooms
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="mb-4">⚙️ Settings</h2>
            
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
                <label>👤 {t('auth.name')}</label>
                <input 
                  name="name" 
                  defaultValue={data.name}
                  onChange={() => {
                    if (successMessage) setSuccessMessage(null)
                    if (errorMessage) setErrorMessage(null)
                  }}
                />
              </div>
              <div className="form-field">
                <label>💼 {t('profile.occupation')}</label>
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
                <label>📍 {t('profile.cityCurrent')}</label>
                <input 
                  name="cityCurrent" 
                  defaultValue={data.cityCurrent}
                  onChange={() => {
                    if (successMessage) setSuccessMessage(null)
                    if (errorMessage) setErrorMessage(null)
                  }}
                />
              </div>
              {data.languages && data.languages.length > 0 && (
                <div className="form-field">
                  <label>🌐 Languages</label>
                  <div className="languages-list">
                    {data.languages.map((lang, idx) => (
                      <span key={idx} className="language-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
              <button 
                className="btn-primary mt-4" 
                type="submit" 
                disabled={mutation.isPending}
                style={{ width: '100%' }}
              >
                {mutation.isPending ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
