import { useState } from 'react'

interface LoginPageProps {
  onLogin: (password: string) => boolean
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = onLogin(password)
    if (!ok) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-icon">🌳</span>
        <h1>Wallevik Family Tree</h1>
        <p className="login-subtitle">Enter the family password to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Password"
              autoFocus
              required
            />
          </label>

          {error && <p className="login-error">Incorrect password</p>}

          <button type="submit" className="btn btn-primary login-btn">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
