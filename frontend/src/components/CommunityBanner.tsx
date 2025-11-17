import { useNavigate } from 'react-router-dom'
import './CommunityBanner.css'

interface BannerItem {
  text: string
  service: string
}

const bannerItems: BannerItem[] = [
  { text: 'you need VISA → TURKEY, EUROPE?', service: 'visa' },
  { text: 'Do you need CAR LYFT?', service: 'car' },
  { text: 'Do you need BUSINESS CONNECTION?', service: 'business' },
  { text: 'Do you Need INJERA, BERBERE, SHERO?', service: 'grocery' }
]

export function CommunityBanner() {
  const navigate = useNavigate()

  const handleClick = (item: BannerItem) => {
    navigate(`/help?service=${item.service}`)
  }

  return (
    <div className="community-banner">
      {bannerItems.map((item, index) => (
        <div 
          key={index}
          className="community-banner-item"
          onClick={() => handleClick(item)}
        >
          <span className="community-banner-text">{item.text}</span>
        </div>
      ))}
    </div>
  )
}

