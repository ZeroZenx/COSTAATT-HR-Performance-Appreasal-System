import axios from 'axios'
import { useMsal } from '@msal/react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from MSAL
    const { instance, accounts } = useMsal()
    
    if (accounts.length > 0) {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: ['openid', 'profile', 'email'],
          account: accounts[0],
        })
        
        if (response.accessToken) {
          config.headers.Authorization = `Bearer ${response.accessToken}`
        }
      } catch (error) {
        console.error('Failed to acquire token:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

export default api
