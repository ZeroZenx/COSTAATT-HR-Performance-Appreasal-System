import { useState, useEffect } from 'react'
import { useMsal } from '@msal/react'
import { useQuery } from 'react-query'
import { api } from '../services/api'

export interface User {
  id: string
  email: string
  name: string
  role: string
  campus?: string
}

export function useAuth() {
  const { instance, accounts } = useMsal()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { data: userData, isLoading: isUserLoading } = useQuery(
    'user',
    () => api.get('/auth/profile').then(res => res.data),
    {
      enabled: !!user,
      retry: false,
    }
  )

  useEffect(() => {
    if (accounts.length > 0) {
      const account = accounts[0]
      setUser({
        id: account.localAccountId,
        email: account.username,
        name: account.name || account.username,
        role: 'STAFF', // Will be updated from API
      })
    } else {
      setIsLoading(false)
    }
  }, [accounts])

  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData])

  useEffect(() => {
    if (isUserLoading === false) {
      setIsLoading(false)
    }
  }, [isUserLoading])

  const login = async () => {
    try {
      const loginRequest = {
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      }

      const response = await instance.loginPopup(loginRequest)
      
      if (response.account) {
        setUser({
          id: response.account.localAccountId,
          email: response.account.username,
          name: response.account.name || response.account.username,
          role: 'STAFF',
        })
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    user,
    isLoading,
    login,
    logout,
  }
}
