import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const serviceInfo: Record<string, { title: string; description: string; contact: string }> = {
  visa: {
    title: 'VISA Services - Turkey & Europe',
    description: 'Need help with visa applications for Turkey or Europe? Our community partners can assist you with the visa process.',
    contact: 'Call us: +971 XX XXX XXXX | WhatsApp: +971 XX XXX XXXX'
  },
  car: {
    title: 'Car & Lyft Services',
    description: 'Looking for car rental, ride-sharing, or transportation services? We can connect you with trusted drivers and car services in your area.',
    contact: 'Call us: +971 XX XXX XXXX | WhatsApp: +971 XX XXX XXXX'
  },
  business: {
    title: 'Business Connections',
    description: 'Need business networking, partnerships, or connections within the Ethiopian community? Let us help you connect with entrepreneurs and business owners.',
    contact: 'Call us: +971 XX XXX XXXX | WhatsApp: +971 XX XXX XXXX'
  },
  grocery: {
    title: 'Ethiopian Grocery - Injera, Berbere, Shero',
    description: 'Looking for authentic Ethiopian ingredients? We can help you find Ethiopian grocery stores, restaurants, and suppliers for Injera, Berbere, Shero, and more.',
    contact: 'Call us: +971 XX XXX XXXX | WhatsApp: +971 XX XXX XXXX'
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
    contact: 'Call us: +971 XX XXX XXXX | WhatsApp: +971 XX XXX XXXX'
  }

  return (
    <div style={{ maxWidth: 700, margin: '3rem auto' }}>
      <div className="card">
        <button 
          className="btn-secondary" 
          onClick={() => navigate(-1)}
          style={{ marginBottom: '1.5rem' }}
        >
          ← Back
        </button>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-900)' }}>
          {info.title}
        </h2>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--gray-700)', marginBottom: '2rem', lineHeight: 1.6 }}>
          {info.description}
        </p>
        
        <div style={{
          background: 'var(--gradient-hero)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--deep-royal-blue)',
          marginBottom: '1.5rem',
          color: 'var(--white)',
          boxShadow: 'var(--shadow-brand-lg)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--white)' }}>
            Contact Us - Let's Help You
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            {info.contact}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
            Our team is available to assist you. Reach out and we'll connect you with the right resources.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <a 
            href="tel:+971XXXXXXXXX" 
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            📞 Call Now
          </a>
          <a 
            href="https://wa.me/971XXXXXXXXX" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'var(--gold-accent)',
              color: 'var(--midnight-navy)',
              borderColor: 'var(--gold-accent)'
            }}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

