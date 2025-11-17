import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Footer.css'

export function Footer() {
  const { t, i18n } = useTranslation()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              {t('appName')}
            </Link>
            <p className="footer-tagline">{t('tagline')}</p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/rooms">🏠 {t('nav.rooms')}</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/help">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="social-icon">📘</a>
              <a href="#" aria-label="Twitter" className="social-icon">🐦</a>
              <a href="#" aria-label="Instagram" className="social-icon">📷</a>
              <a href="#" aria-label="WhatsApp" className="social-icon">💬</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Language</h4>
            <select
              className="footer-lang-select"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">{t('lang.en')}</option>
              <option value="am">{t('lang.am')}</option>
              <option value="om">{t('lang.om')}</option>
              <option value="ti">{t('lang.ti')}</option>
            </select>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Betegna. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

