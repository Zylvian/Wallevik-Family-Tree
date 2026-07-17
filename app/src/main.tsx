import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LoginPage } from './components/LoginPage'
import { useAuth } from './hooks/useAuth'
import './index.css'

function Root() {
  const { isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return <App onLogout={logout} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
