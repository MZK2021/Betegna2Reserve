import axios from 'axios'

export const API_BASE = 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('betegna_auth')
  if (stored) {
    const parsed = JSON.parse(stored) as { accessToken?: string }
    if (parsed.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${parsed.accessToken}`
      }
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh the token
      const stored = localStorage.getItem('betegna_auth')
      if (stored) {
        const parsed = JSON.parse(stored) as { refreshToken?: string; user?: any }
        if (parsed.refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
              refreshToken: parsed.refreshToken
            })
            
            const newAccessToken = refreshResponse.data.accessToken
            localStorage.setItem('betegna_auth', JSON.stringify({
              ...parsed,
              accessToken: newAccessToken
            }))

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect to login
            localStorage.removeItem('betegna_auth')
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
              window.location.href = '/login'
            }
          }
        } else {
          // No refresh token - clear auth and redirect to login
          localStorage.removeItem('betegna_auth')
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login'
          }
        }
      } else {
        // No stored auth - redirect to login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)


