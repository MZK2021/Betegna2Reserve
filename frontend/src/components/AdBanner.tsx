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

  const ad = data?.[0]
  if (!ad) return null

  const handleClick = async () => {
    try {
      await api.post(`/ads/${ad.id}/click`, { country, city })
    } catch {
      // ignore
    }
    window.open(ad.linkUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="card mb-4 text-sm text-muted" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <img src={ad.mediaUrl} alt="Ad" className="full-width" />
    </div>
  )
}
