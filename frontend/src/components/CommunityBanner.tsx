import { useNavigate } from 'react-router-dom'
import './CommunityBanner.css'

interface BannerItem {
  text: string
  service: string
  backgroundImage: string
}

const bannerItems: BannerItem[] = [
  { 
    text: 'You need VISA → TURKEY, EUROPE?', 
    service: 'visa',
    backgroundImage: '/images/banner-visa.jpg'
  },
  { 
    text: 'Do you need Lyft/Car?', 
    service: 'car',
    backgroundImage: '/images/Car%20Lyft.jpg'
  },
  { 
    text: 'Do you need Business Connection?', 
    service: 'business',
    backgroundImage: '/images/business.jpg'
  },
  { 
    text: 'Do you Need INJERA, BERBERE, SHERO?', 
    service: 'grocery',
    backgroundImage: '/images/injera.jpg'
  }
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
          style={{
            backgroundImage: `url(${item.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'var(--deep-royal-blue)' // Fallback if image doesn't load
          }}
          onClick={() => handleClick(item)}
        >
          <div className="community-banner-overlay"></div>
          <span className="community-banner-text">{item.text}</span>
        </div>
      ))}
    </div>
  )
}

