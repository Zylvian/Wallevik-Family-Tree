import { useCallback, useState } from 'react'
import { isAuthenticated, login, logout } from '../lib/auth'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated)

  const handleLogin = useCallback((password: string) => {
    const ok = login(password)
    if (ok) setAuthenticated(true)
    return ok
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setAuthenticated(false)
  }, [])

  return {
    isAuthenticated: authenticated,
    login: handleLogin,
    logout: handleLogout,
  }
}
