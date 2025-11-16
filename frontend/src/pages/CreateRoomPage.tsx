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
    country: 'UAE',
    city: 'Dubai',
    area: '',
    roomType: 'PRIVATE',
    bedsTotal: '1',
    bedsAvailable: '1',
    priceMonthly: '',
    depositAmount: '',
    shortStayAllowed: false,
    minStayMonths: '1',
    description: '',
    amenities: [] as string[],
    utilitiesIncluded: {
      electricity: false,
      water: false,
      internet: false,
      gas: false,
    },
    rules: {
      smoking: 'Not allowed',
      alcohol: 'Not allowed',
      visitors: 'Allowed',
      quietHours: '10 PM - 6 AM',
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
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    const payload = {
      ...formData,
      bedsTotal: Number(formData.bedsTotal),
      bedsAvailable: Number(formData.bedsAvailable),
      priceMonthly: Number(formData.priceMonthly),
      depositAmount: formData.depositAmount ? Number(formData.depositAmount) : undefined,
      minStayMonths: Number(formData.minStayMonths),
      amenities: formData.amenities.filter((a) => a),
    }

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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 className="mb-4">{t('createRoom.title')}</h2>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-field">
          <label>{t('filters.country')} *</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value, city: '' })}
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

        {mutation.isError && (
          <div className="text-sm" style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>
            Error creating room. Please try again.
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

