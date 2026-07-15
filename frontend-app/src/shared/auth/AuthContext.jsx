import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as authApi from '../api/auth.api'
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/config'
import { ApiError } from '../api/http'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistSession(token, user) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)

  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [user, setUser] = useState(() => readStoredUser())

  const applyAuthResponse = useCallback((payload) => {
    const data = payload?.data ?? payload
    const accessToken = data?.accessToken ?? data?.AccessToken
    const profile = data?.user ?? data?.User ?? null

    if (!accessToken) {
      throw new ApiError('La respuesta de autenticación no incluye token.', {
        code: 'INVALID_AUTH_RESPONSE',
      })
    }

    const normalizedUser = profile
      ? {
          id: profile.id ?? profile.Id,
          name: profile.name ?? profile.Name ?? '',
          email: profile.email ?? profile.Email ?? '',
          roles: profile.roles ?? profile.Roles ?? [],
        }
      : null

    persistSession(accessToken, normalizedUser)
    setToken(accessToken)
    setUser(normalizedUser)
    return { token: accessToken, user: normalizedUser }
  }, [])

  const login = useCallback(
    async (email, password) => {
      const response = await authApi.login(email, password)
      return applyAuthResponse(response)
    },
    [applyAuthResponse],
  )

  const register = useCallback(
    async (name, email, password) => {
      const response = await authApi.register(name, email, password)
      return applyAuthResponse(response)
    },
    [applyAuthResponse],
  )

  const logout = useCallback(() => {
    persistSession(null, null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
