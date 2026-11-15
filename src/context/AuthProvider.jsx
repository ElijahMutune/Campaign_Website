
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { AuthContext } from './auth-context'
import { authApi } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const [isLoading, setIsLoading] = useState(
    () => Boolean(authApi.getToken()),
  )

  useEffect(() => {
    let active = true

    const handleUnauthorized = () => {
      authApi.clearToken()
      setUser(null)
      setIsLoading(false)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    const restoreSession = async () => {
      if (!authApi.getToken()) {
        return
      }

      try {
        const currentUser = await authApi.me()

        if (active) {
          setUser(currentUser)
        }
      } catch {
        authApi.clearToken()

        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      active = false
      window.removeEventListener(
        'auth:unauthorized',
        handleUnauthorized,
      )
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)

    authApi.setToken(result.token)
    setUser(result.user)

    return result.user
  }, [])

  const changePassword = useCallback(async (credentials) => {
    const result = await authApi.changePassword(credentials)

    setUser(result.user)

    return result.user
  }, [])

  const logout = useCallback(() => {
    authApi.clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      changePassword,
    }),
    [user, isLoading, login, logout, changePassword],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
