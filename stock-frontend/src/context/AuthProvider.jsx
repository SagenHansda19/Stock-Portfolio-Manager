import { useCallback, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../services/authService'
import { getToken, removeToken, setToken } from '../utils/tokenStorage'
import { AuthContext } from './authContext'

export const AuthProvider = ({ children }) => {
  const [token, setAuthToken] = useState(() => getToken())

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
  }, [])

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isInitializing: false,
      login,
      logout,
      register,
    }),
    [token, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
