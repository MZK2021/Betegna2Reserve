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


