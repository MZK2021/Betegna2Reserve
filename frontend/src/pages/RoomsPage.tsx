import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { AdBanner } from '../components/AdBanner'

interface Room {
  id: string
  country: string
  city: string
  area: string
  priceMonthly: number
  shortStayAllowed: boolean
  ratingAvg?: number
  ratingCount?: number
  roomType?: string
  photos?: string[]
  amenities?: string[]
  preferences?: {
    preferredGender?: string
    preferredReligion?: string
  }
  rules?: {
    smoking?: string
  }
}

interface RoomsResponse {
  items: Room[]
  total: number
  page: number
  pageSize: number
}

const getDefaultCity = (country: string): string => {
  const defaults: Record<string, string> = {
    'UAE': 'Dubai',
    'KSA': 'Riyadh',
    'QATAR': 'Doha',
    'OMAN': 'Muscat',
    'BAHRAIN': 'Manama',
    'KUWAIT': 'Kuwait City',
    'LEBANON': 'Beirut',
    'YEMEN': "Sana'a",
    'EGYPT': 'Cairo'
  }
  return defaults[country] || 'Dubai'
}

export function RoomsPage() {
  const { t } = useTranslation()
  const [country, setCountry] = useState('UAE')
  const [city, setCity] = useState('Dubai')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setCity(getDefaultCity(newCountry))
    setPage(1)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', { country, city, minPrice, maxPrice, page }],
    queryFn: async () => {
      const res = await api.get<RoomsResponse>('/rooms', {
        params: {
          country,
          ...(city && { city }),
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page,
          pageSize: 9
        }
      })
      return res.data
    },
    enabled: !!country
  })

  const resetFilters = () => {
    setCountry('UAE')
    setCity('Dubai')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
  }

  return (
    <div className="layout-two-cols">
      <div>
        <div className="search-filters">
          <h2 className="mb-4">{t('filters.title')}</h2>
          <div className="form-field">
            <label>{t('filters.country')}</label>
            <select value={country} onChange={(e) => handleCountryChange(e.target.value)}>
              <option value="UAE">UAE</option>
              <option value="KSA">KSA</option>
              <option value="QATAR">Qatar</option>
              <option value="OMAN">Oman</option>
              <option value="BAHRAIN">Bahrain</option>
              <option value="KUWAIT">Kuwait</option>
              <option value="LEBANON">Lebanon</option>
              <option value="YEMEN">Yemen</option>
              <option value="EGYPT">Egypt</option>
            </select>
          </div>
          <div className="form-field">
            <label>{t('filters.city')}</label>
            <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
              {country === 'UAE' && (
                <>
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                </>
              )}
              {country === 'KSA' && (
                <>
                  <option value="Riyadh">Riyadh</option>
                  <option value="Jeddah">Jeddah</option>
                  <option value="Dammam">Dammam</option>
                </>
              )}
              {country === 'QATAR' && (
                <>
                  <option value="Doha">Doha</option>
                </>
              )}
              {country === 'OMAN' && (
                <>
                  <option value="Muscat">Muscat</option>
                </>
              )}
              {country === 'BAHRAIN' && (
                <>
                  <option value="Manama">Manama</option>
                </>
              )}
              {country === 'KUWAIT' && (
                <>
                  <option value="Kuwait City">Kuwait City</option>
                </>
              )}
              {country === 'LEBANON' && (
                <>
                  <option value="Beirut">Beirut</option>
                </>
              )}
              {country === 'YEMEN' && (
                <>
                  <option value="Sana'a">Sana'a</option>
                </>
              )}
              {country === 'EGYPT' && (
                <>
                  <option value="Cairo">Cairo</option>
                  <option value="Alexandria">Alexandria</option>
                </>
              )}
              {!city && <option value="">Select a city</option>}
            </select>
          </div>
          <div className="form-field">
            <label>{t('filters.minPrice')}</label>
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
              min={0}
            />
          </div>
          <div className="form-field">
            <label>{t('filters.maxPrice')}</label>
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
              min={0}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" type="button" onClick={() => setPage(1)}>
              {t('filters.apply')}
            </button>
            <button className="btn-secondary" type="button" onClick={resetFilters}>
              {t('filters.reset')}
            </button>
          </div>
        </div>
        {isLoading && <div>{'Loading rooms...'}</div>}
        {!isLoading && data && data.items.length === 0 && (
          <div className="card">{t('rooms.noResults')}</div>
        )}
        {!isLoading && data && data.items.length > 0 && (
          <div>
            <h2 className="mb-4">
              {t('rooms.title')} ({data.total} {data.total === 1 ? 'room' : 'rooms'})
            </h2>
            <div className="rooms-grid">
              {data.items.map((room) => (
                <Link key={room.id} to={`/rooms/${room.id}`} className="room-card">
                  {room.photos && room.photos.length > 0 && (
                    <div className="room-card-image">
                      <img src={room.photos[0]} alt={room.city} />
                      {room.shortStayAllowed && (
                        <div className="room-card-badge">Short Stay</div>
                      )}
                    </div>
                  )}
                  {!room.photos || room.photos.length === 0 && (
                    <div className="room-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="room-card-content">
                    <div className="room-card-title">
                      🏠 {room.city}, {room.area}
                    </div>
                    <div className="room-card-meta">
                      📍 {room.country} • {room.roomType || 'Room'}
                    </div>
                    
                    {/* Preference Icons */}
                    <div className="room-card-preferences">
                      {room.preferences?.preferredGender && room.preferences.preferredGender !== 'Any' && (
                        <span className="preference-icon" title={`Preferred: ${room.preferences.preferredGender}`}>
                          {room.preferences.preferredGender === 'Female' ? '👩' : room.preferences.preferredGender === 'Male' ? '👨' : '👥'}
                        </span>
                      )}
                      {room.preferences?.preferredReligion && room.preferences.preferredReligion !== 'Any' && (
                        <span className="preference-icon" title={`Religion: ${room.preferences.preferredReligion}`}>
                          🕌
                        </span>
                      )}
                      {room.rules?.smoking && (
                        <span className="preference-icon" title={`Smoking: ${room.rules.smoking}`}>
                          {room.rules.smoking === 'Not allowed' ? '🚭' : room.rules.smoking === 'Outside only' ? '🚬' : '✅'}
                        </span>
                      )}
                    </div>
                    
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="room-card-amenities">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="amenity-tag">{amenity}</span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="amenity-tag">+{room.amenities.length - 3}</span>
                        )}
                      </div>
                    )}
                    {room.ratingAvg && (
                      <div className="room-card-rating">
                        ⭐ {room.ratingAvg.toFixed(1)} <span style={{ color: 'var(--gray-600)', fontWeight: 'normal' }}>
                          {room.ratingCount !== undefined && room.ratingCount !== null && room.ratingCount > 0 ? `(${room.ratingCount} reviews)` : '(No reviews)'}
                        </span>
                      </div>
                    )}
                    <div className="room-card-footer">
                      <div className="room-card-price">
                        {room.priceMonthly} AED <span className="text-sm text-muted">{t('rooms.perMonth')}</span>
                      </div>
                      <button 
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/rooms/${room.id}`
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pagination">
              <button
                className="btn-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span className="text-sm text-muted" style={{ padding: '0 1rem' }}>
                Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
              </span>
              <button
                className="btn-secondary"
                disabled={data.page * data.pageSize >= data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        <AdBanner position="LISTING_SIDEBAR" country={country} city={city} />
      </div>
    </div>
  )
}
