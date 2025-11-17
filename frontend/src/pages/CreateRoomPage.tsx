import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export function CreateRoomPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    country: 'UAE',
    city: 'Dubai',
    area: '',
    exactAddress: '', // Private field
    roomType: 'PRIVATE',
    bedsTotal: '1',
    bedsAvailable: '1',
    availableFrom: '', // ISO date string
    priceMonthly: '',
    depositAmount: '',
    shortStayAllowed: false,
    minStayMonths: '1',
    description: '',
    photos: [] as string[],
    amenities: [] as string[],
    utilitiesIncluded: {
      electricity: false,
      water: false,
      internet: false,
      gas: false,
    },
    rules: {
      smoking: 'NO',
      alcohol: 'Not allowed',
      visitors: 'Allowed',
      quietHours: '10 PM - 6 AM',
    },
    preferences: {
      preferredGender: 'ANY' as 'MALE' | 'FEMALE' | 'ANY',
      preferredReligion: 'ANY' as 'ORTHODOX' | 'MUSLIM' | 'PROTESTANT' | 'ANY',
      preferredOccupation: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/rooms', data)
      return res.data
    },
    onSuccess: () => {
      navigate('/my-rooms')
    },
    onError: (error: any) => {
      console.error('Room creation error:', error)
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    const payload = {
      title: formData.title || undefined,
      country: formData.country,
      city: formData.city,
      area: formData.area,
      exactAddress: formData.exactAddress || undefined,
      roomType: formData.roomType,
      bedsTotal: Number(formData.bedsTotal),
      bedsAvailable: Number(formData.bedsAvailable),
      availableFrom: formData.availableFrom || undefined,
      priceMonthly: Number(formData.priceMonthly),
      depositAmount: formData.depositAmount ? Number(formData.depositAmount) : undefined,
      shortStayAllowed: formData.shortStayAllowed,
      minStayMonths: Number(formData.minStayMonths),
      description: formData.description,
      amenities: formData.amenities.filter((a) => a),
      photos: formData.photos.filter((p) => p && p.length > 0),
      utilitiesIncluded: formData.utilitiesIncluded,
      rules: {
        smoking: formData.rules.smoking,
        alcohol: formData.rules.alcohol,
        visitors: formData.rules.visitors,
        quietHours: formData.rules.quietHours,
      },
      preferences: {
        preferredGender: formData.preferences.preferredGender,
        preferredReligion: formData.preferences.preferredReligion,
        preferredOccupation: formData.preferences.preferredOccupation || undefined,
      },
    }

    console.log('Submitting room:', payload)
    mutation.mutate(payload)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPhotos: string[] = []
    const maxPhotos = 3
    const remainingSlots = maxPhotos - formData.photos.length

    if (remainingSlots <= 0) {
      alert(`You can only upload up to ${maxPhotos} images.`)
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, base64String],
          }))
        }
        reader.readAsDataURL(file)
      } else {
        alert(`${file.name} is not an image file.`)
      }
    })

    // Reset input
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  // Helper function to get default city for a country
  const getDefaultCity = (country: string): string => {
    const cityMap: Record<string, string> = {
      'UAE': 'Dubai',
      'KSA': 'Riyadh',
      'QATAR': 'Doha',
      'OMAN': 'Muscat',
      'BAHRAIN': 'Manama',
      'KUWAIT': 'Kuwait City',
      'LEBANON': 'Beirut',
      'YEMEN': "Sana'a",
      'EGYPT': 'Cairo',
    }
    return cityMap[country] || 'Dubai'
  }

  const handleCountryChange = (country: string) => {
    const defaultCity = getDefaultCity(country)
    setFormData({ ...formData, country, city: defaultCity })
  }

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Please log in to create a room listing</h2>
        <p className="text-sm text-muted mt-4">You need to be logged in to create room listings.</p>
        <div className="flex gap-2 mt-4" style={{ justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 className="mb-4" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--deep-royal-blue)' }}>
        {t('createRoom.title')}
      </h2>
      <form onSubmit={handleSubmit} className="card">
        {/* Section 1: Listing Basics */}
        <div className="form-section">
          <h3 className="form-section-title">📝 Listing Basics</h3>
          <div className="form-field">
            <label>Listing Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Clean private room in Deira near Metro"
              maxLength={100}
            />
            <small className="text-muted">A catchy title helps your listing stand out</small>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="form-section">
          <h3 className="form-section-title">📍 Location</h3>
          <div className="form-field">
            <label>{t('filters.country')} *</label>
          <select
            value={formData.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            required
          >
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
          <label>{t('filters.city')} *</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          >
            {formData.country === 'UAE' && (
              <>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
              </>
            )}
            {formData.country === 'KSA' && (
              <>
                <option value="Riyadh">Riyadh</option>
                <option value="Jeddah">Jeddah</option>
                <option value="Dammam">Dammam</option>
              </>
            )}
            {formData.country === 'QATAR' && <option value="Doha">Doha</option>}
            {formData.country === 'OMAN' && <option value="Muscat">Muscat</option>}
            {formData.country === 'BAHRAIN' && <option value="Manama">Manama</option>}
            {formData.country === 'KUWAIT' && <option value="Kuwait City">Kuwait City</option>}
            {formData.country === 'LEBANON' && <option value="Beirut">Beirut</option>}
            {formData.country === 'YEMEN' && <option value="Sana'a">Sana'a</option>}
            {formData.country === 'EGYPT' && (
              <>
                <option value="Cairo">Cairo</option>
                <option value="Alexandria">Alexandria</option>
              </>
            )}
          </select>
        </div>

        <div className="form-field">
          <label>Area/Neighborhood *</label>
          <input
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
            placeholder="e.g., Downtown, Marina"
          />
        </div>

        <div className="form-field">
          <label>Exact Address (Private)</label>
          <input
            value={formData.exactAddress}
            onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
            placeholder="Full address - only visible to you and matched tenants"
          />
          <small className="text-muted">This will not be shown publicly, only to matched tenants</small>
        </div>
        </div>

        {/* Section 3: Room Details */}
        <div className="form-section">
          <h3 className="form-section-title">🛏️ Room Details</h3>
          <div className="form-field">
            <label>Room Type *</label>
          <select
            value={formData.roomType}
            onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
            required
          >
            <option value="PRIVATE">Private Room</option>
            <option value="SHARED">Shared Room</option>
            <option value="BED_SPACE">Bed Space</option>
          </select>
        </div>

        <div className="form-field">
          <label>Total Beds *</label>
          <input
            type="number"
            min="1"
            value={formData.bedsTotal}
            onChange={(e) => setFormData({ ...formData, bedsTotal: e.target.value })}
            required
          />
        </div>

        <div className="form-field">
          <label>Beds Available *</label>
          <input
            type="number"
            min="0"
            value={formData.bedsAvailable}
            onChange={(e) => setFormData({ ...formData, bedsAvailable: e.target.value })}
            required
          />
        </div>

        <div className="form-field">
          <label>Available From *</label>
          <input
            type="date"
            value={formData.availableFrom}
            onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <small className="text-muted">When will this room be available for move-in?</small>
        </div>
        </div>

        {/* Section 4: Price & Stay */}
        <div className="form-section">
          <h3 className="form-section-title">💰 Price & Stay</h3>
          <div className="form-field">
            <label>Monthly Rent (AED) *</label>
          <input
            type="number"
            min="0"
            value={formData.priceMonthly}
            onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
            required
          />
        </div>

        <div className="form-field">
          <label>Deposit Amount (AED)</label>
          <input
            type="number"
            min="0"
            value={formData.depositAmount}
            onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
          />
        </div>

        <div className="form-field">
          <label>
            <input
              type="checkbox"
              checked={formData.shortStayAllowed}
              onChange={(e) => setFormData({ ...formData, shortStayAllowed: e.target.checked })}
            />{' '}
            Short stay allowed
          </label>
        </div>

        <div className="form-field">
          <label>Minimum Stay (months)</label>
          <input
            type="number"
            min="0"
            value={formData.minStayMonths}
            onChange={(e) => setFormData({ ...formData, minStayMonths: e.target.value })}
          />
        </div>
        </div>

        {/* Section 5: Roommate Preferences */}
        <div className="form-section">
          <h3 className="form-section-title">👥 Roommate Preferences</h3>
          <div className="form-field">
            <label>Preferred Gender *</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { value: 'ANY', label: 'Either' },
                { value: 'FEMALE', label: 'Female only' },
                { value: 'MALE', label: 'Male only' },
              ].map((option) => (
                <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="preferredGender"
                    value={option.value}
                    checked={formData.preferences.preferredGender === option.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, preferredGender: e.target.value as 'MALE' | 'FEMALE' | 'ANY' }
                    })}
                    required
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Religion Preference</label>
            <select
              value={formData.preferences.preferredReligion}
              onChange={(e) => setFormData({
                ...formData,
                preferences: { ...formData.preferences, preferredReligion: e.target.value as 'ORTHODOX' | 'MUSLIM' | 'PROTESTANT' | 'ANY' }
              })}
            >
              <option value="ANY">Any</option>
              <option value="ORTHODOX">Orthodox</option>
              <option value="MUSLIM">Muslim</option>
              <option value="PROTESTANT">Protestant</option>
            </select>
          </div>

          <div className="form-field">
            <label>Smoking Rules *</label>
            <select
              value={formData.rules.smoking}
              onChange={(e) => setFormData({
                ...formData,
                rules: { ...formData.rules, smoking: e.target.value }
              })}
              required
            >
              <option value="NO">No smoking</option>
              <option value="OUTSIDE_ONLY">Smoking outside only</option>
              <option value="ALLOWED">Smoking allowed</option>
            </select>
          </div>

          <div className="form-field">
            <label>Visitors Rules</label>
            <select
              value={formData.rules.visitors}
              onChange={(e) => setFormData({
                ...formData,
                rules: { ...formData.rules, visitors: e.target.value }
              })}
            >
              <option value="Allowed">Visitors allowed</option>
              <option value="Limited">Limited visitors</option>
              <option value="Not allowed">No visitors</option>
              <option value="Women only">Women-only visitors</option>
            </select>
          </div>
        </div>

        {/* Section 6: Amenities & Utilities */}
        <div className="form-section">
          <h3 className="form-section-title">✨ Amenities & Utilities</h3>
          <div className="form-field">
            <label>Amenities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Wi-Fi', 'AC', 'Laundry', 'Parking', 'Furnished'].map((amenity) => (
                <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

        <div className="form-field">
          <label>Utilities Included</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['electricity', 'water', 'internet', 'gas'].map((util) => (
              <label key={util} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={formData.utilitiesIncluded[util as keyof typeof formData.utilitiesIncluded]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      utilitiesIncluded: {
                        ...formData.utilitiesIncluded,
                        [util]: e.target.checked,
                      },
                    })
                  }
                />
                {util.charAt(0).toUpperCase() + util.slice(1)}
              </label>
            ))}
          </div>
        </div>
        </div>

        {/* Section 7: Photos & Description */}
        <div className="form-section">
          <h3 className="form-section-title">📷 Photos & Description</h3>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe your room, location, nearby amenities..."
            />
          </div>

          <div className="form-field">
            <label>Room Photos</label>
            <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
              Upload up to 3 images of your room (minimum 1 recommended)
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                id="photo-upload"
                style={{ display: 'none' }}
                disabled={formData.photos.length >= 3}
              />
              <label htmlFor="photo-upload">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('photo-upload')?.click()
                  }}
                  disabled={formData.photos.length >= 3}
                  style={{ 
                    cursor: formData.photos.length >= 3 ? 'not-allowed' : 'pointer',
                    width: '100%',
                    padding: '0.875rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {formData.photos.length >= 3 
                    ? '📷 Maximum 3 images reached' 
                    : `📷 Upload Images (${formData.photos.length}/3)`}
                </button>
              </label>
            </div>

            {formData.photos.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '1rem',
                marginTop: '1rem'
              }} className="photo-grid">
                {formData.photos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={photo}
                      alt={`Room photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="btn-secondary"
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {mutation.isError && (
          <div className="text-sm" style={{ color: '#b91c1c', marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
            <strong>Error creating room:</strong>
            <div style={{ marginTop: '0.25rem' }}>
              {mutation.error?.response?.data?.error || mutation.error?.message || 'Please check all required fields and try again.'}
            </div>
            {mutation.error?.response?.data?.details && (
              <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem', overflow: 'auto' }}>
                {JSON.stringify(mutation.error.response.data.details, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Room Listing'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/my-rooms')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

