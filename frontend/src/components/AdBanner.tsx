import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

interface Ad {
  id: string
  mediaUrl: string
  linkUrl: string
}

interface Props {
  position: 'LANDING_TOP' | 'LISTING_SIDEBAR' | 'CHAT_BOTTOM' | 'PROFILE_SIDEBAR'
  country?: string
  city?: string
}

export function AdBanner({ position, country, city }: Props) {
  const { data } = useQuery({
    queryKey: ['ads', position, country, city],
    queryFn: async () => {
      const res = await api.get<Ad[]>('/ads', { params: { position, country, city } })
      return res.data
    }
  })

  if (!data || data.length === 0) return null

  // For sidebar, show all ads stacked. For other positions, show first ad
  const adsToShow = position === 'LISTING_SIDEBAR' ? data : [data[0]]

  const handleClick = async (ad: Ad) => {
    try {
      await api.post(`/ads/${ad.id}/click`, { country, city })
    } catch {
      // ignore
    }
    window.open(ad.linkUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {adsToShow.map((ad) => (
        <div 
          key={ad.id} 
          className="card mb-4 text-sm text-muted" 
          onClick={() => handleClick(ad)} 
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src={ad.mediaUrl} 
            alt="Ad" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              borderRadius: '8px',
              display: 'block'
            }} 
          />
        </div>
      ))}
    </>
  )
}
