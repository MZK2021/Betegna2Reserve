import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CommunityBanner } from '../components/CommunityBanner'
import { useAuth } from '../hooks/useAuth'

export function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleHostClick = () => {
    if (user) {
      // If logged in, go to room management page
      navigate('/my-rooms')
    } else {
      // If not logged in, go to signup with owner role pre-selected
      navigate('/signup?role=OWNER')
    }
  }

  return (
    <div>
      <div className="hero">
        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title" lang="am">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/rooms')}>
              {t('hero.ctaSeek')}
            </button>
            <button className="btn-secondary" onClick={handleHostClick}>
              {t('hero.ctaHost')}
            </button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <CommunityBanner />
      </div>
    </div>
  )
}
