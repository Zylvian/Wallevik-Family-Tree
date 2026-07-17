const AUTH_KEY = 'wallevik-authenticated'
const SITE_PASSWORD = 'wallevik'

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true'
}

export function login(password: string): boolean {
  if (password === SITE_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY)
}
