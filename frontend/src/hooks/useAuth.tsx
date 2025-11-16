import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

type Role = 'TENANT' | 'OWNER' | 'BOTH' | 'ADMIN'

interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  login: (data: { email: string; password: string }) => Promise<void>
  signup: (data: { name: string; email: string; password: string; role: Role }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('betegna_auth')
    if (stored) {
      const parsed = JSON.parse(stored) as { user: AuthUser; accessToken: string }
      setUser(parsed.user)
      setAccessToken(parsed.accessToken)
    }
  }, [])

  const persist = (u: AuthUser, token: string) => {
    setUser(u)
    setAccessToken(token)
    localStorage.setItem('betegna_auth', JSON.stringify({ user: u, accessToken: token }))
  }

  const login = async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data)
    persist(res.data.user, res.data.accessToken)
  }

  const signup = async (data: { name: string; email: string; password: string; role: Role }) => {
    const res = await api.post('/auth/register', data)
    persist(res.data.user, res.data.accessToken)
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('betegna_auth')
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


