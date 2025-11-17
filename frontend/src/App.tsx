import React, { useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { RoomsPage } from './pages/RoomsPage'
import { RoomDetailPage } from './pages/RoomDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { ChatPage } from './pages/ChatPage'
import { AdminPage } from './pages/AdminPage'
import { MyRoomsPage } from './pages/MyRoomsPage'
import { CreateRoomPage } from './pages/CreateRoomPage'
import { HelpPage } from './pages/HelpPage'
import { Footer } from './components/Footer'
import { useAuth } from './hooks/useAuth'

type ProtectedProps = {
  children: React.ReactElement
  roles?: string[]
}

function ProtectedRoute({ children, roles }: ProtectedProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

function Header() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-dropdown-wrapper')) {
        setShowProfileDropdown(false)
      }
      if (!target.closest('.nav-links') && !target.closest('.mobile-menu-btn')) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header>
      <div className="container flex items-center justify-between" style={{ padding: '1rem 0' }}>
        <Link to="/" className="logo-text">
          {t('appName')}
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        
        <nav className={`nav-links ${showMobileMenu ? 'nav-links-open' : ''}`}>
          <Link to="/rooms">🏠 {t('nav.rooms')}</Link>
          {user && (user.role === 'OWNER' || user.role === 'BOTH') && (
            <Link to="/my-rooms">🛏️ {t('nav.myRooms')}</Link>
          )}
          {user && <Link to="/profile">👤 {t('nav.profile')}</Link>}
          {user && <Link to="/chat">💬 {t('nav.chat')}</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin">{t('nav.admin')}</Link>}
        </nav>
        
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <div className="lang-select-wrapper">
            <select
              className="lang-select"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">🌐 {t('lang.en')}</option>
              <option value="am">🌐 {t('lang.am')}</option>
              <option value="om">🌐 {t('lang.om')}</option>
              <option value="ti">🌐 {t('lang.ti')}</option>
            </select>
          </div>
          
          {!user && (
            <>
              <Link to="/login" className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                {t('nav.login')}
              </Link>
              <Link to="/signup" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                {t('nav.signup')}
              </Link>
            </>
          )}
          
          {user && (
            <div className="profile-dropdown-wrapper">
              <button 
                className="profile-icon-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                aria-label="Profile menu"
              >
                👤
              </button>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/profile" onClick={() => setShowProfileDropdown(false)}>
                    👤 View Profile
                  </Link>
                  <Link to="/profile" onClick={() => setShowProfileDropdown(false)}>
                    ⚙️ Settings
                  </Link>
                  <button onClick={() => { logout(); setShowProfileDropdown(false); }}>
                    🚪 {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container py-4" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route
            path="/my-rooms"
            element={
              <ProtectedRoute>
                <MyRoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/create"
            element={
              <ProtectedRoute>
                <CreateRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
