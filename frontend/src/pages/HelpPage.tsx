import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './HelpPage.css'

const phoneNumber = '+971569187989'
const whatsappNumber = '971569187989' // WhatsApp format without + and spaces

const serviceInfo: Record<string, { 
  title: string
  description: string
  contact: string
  backgroundImage: string
}> = {
  visa: {
    title: 'VISA Services - Turkey & Europe',
    description: 'Need help with visa applications for Turkey or Europe? Our community partners can assist you with the visa process.',
    contact: `Call us: ${phoneNumber} | WhatsApp: ${phoneNumber}`,
    backgroundImage: '/images/banner-visa.jpg'
  },
  car: {
    title: 'Car & Lyft Services',
    description: 'Looking for car rental, ride-sharing, or transportation services? We can connect you with trusted drivers and car services in your area.',
    contact: `Call us: ${phoneNumber} | WhatsApp: ${phoneNumber}`,
    backgroundImage: '/images/Car%20Lyft.jpg'
  },
  business: {
    title: 'Business Connections',
    description: 'Need business networking, partnerships, or connections within the Ethiopian community? Let us help you connect with entrepreneurs and business owners.',
    contact: `Call us: ${phoneNumber} | WhatsApp: ${phoneNumber}`,
    backgroundImage: '/images/business.jpg'
  },
  grocery: {
    title: 'Ethiopian Grocery - Injera, Berbere, Shero',
    description: 'Looking for authentic Ethiopian ingredients? We can help you find Ethiopian grocery stores, restaurants, and suppliers for Injera, Berbere, Shero, and more.',
    contact: `Call us: ${phoneNumber} | WhatsApp: ${phoneNumber}`,
    backgroundImage: '/images/injera.jpg'
  }
}

export function HelpPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const service = searchParams.get('service') || 'general'
  const info = serviceInfo[service] || {
    title: 'How Can We Help?',
    description: 'Our community support team is here to assist you. Contact us for any services you need.',
    contact: `Call us: ${phoneNumber} | WhatsApp: ${phoneNumber}`,
    backgroundImage: '/images/business.jpg' // Default image
  }

  return (
    <div className="help-page-container">
      <div 
        className="help-page-card"
        style={{
          backgroundImage: `url(${info.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="help-page-overlay"></div>
        <div className="help-page-content">
          <button 
            className="btn-secondary help-back-btn" 
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          
          <h2 className="help-page-title">
            {info.title}
          </h2>
          
          <p className="help-page-description">
            {info.description}
          </p>
          
          <div className="help-contact-card">
            <h3 className="help-contact-title">
              Contact Us - Let's Help You
            </h3>
            <p className="help-contact-info">
              {info.contact}
            </p>
            <p className="help-contact-subtext">
              Our team is available to assist you. Reach out and we'll connect you with the right resources.
            </p>
          </div>
          
          <div className="help-action-buttons">
            <a 
              href={`tel:${phoneNumber.replace(/\s/g, '')}`}
              className="btn-primary help-call-btn"
            >
              📞 Call Now
            </a>
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary help-whatsapp-btn"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

