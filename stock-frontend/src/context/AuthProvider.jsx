import { useCallback, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../services/authService'
import { getToken, removeToken, setToken } from '../utils/tokenStorage'
import { getPortfolio } from '../services/portfolioService'
import { AuthContext } from './authContext'

export const AuthProvider = ({ children }) => {
  const [token, setAuthToken] = useState(() => getToken())
  const [cashBalance, setCashBalance] = useState(null)

  const saveAuthResponse = useCallback((authResponse) => {
    setToken(authResponse.token)
    setAuthToken(authResponse.token)
    return authResponse
  }, [])

  const login = useCallback(async (credentials) => {
    const authResponse = await loginUser(credentials)
    return saveAuthResponse(authResponse)
  }, [saveAuthResponse])

  const register = useCallback(async (userData) => {
    const authResponse = await registerUser(userData)
    return saveAuthResponse(authResponse)
  }, [saveAuthResponse])

  const logout = useCallback(() => {
    removeToken()
    setAuthToken(null)
    setCashBalance(null)
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!token) return null
    try {
      const data = await getPortfolio({ page: 0, size: 1 })
      if (data?.cashBalance !== undefined) {
        setCashBalance(data.cashBalance)
        return data.cashBalance
      }
    } catch (err) {
      console.error('Error refreshing cash balance:', err)
    }
    return null
  }, [token])

  useEffect(() => {
    if (token) {
      refreshBalance()
    } else {
      setCashBalance(null)
    }
  }, [token, refreshBalance])

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isInitializing: false,
      login,
      logout,
      register,
      cashBalance,
      setCashBalance,
      refreshBalance,
    }),
    [token, login, logout, register, cashBalance, refreshBalance],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
