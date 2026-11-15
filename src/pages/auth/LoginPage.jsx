
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react'

import { useAuth } from '../../context/useAuth'
import './Auth.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const account = await login({
        username: username.trim(),
        password,
      })

      if (account.must_change_password) {
        navigate('/change-password', { replace: true })
      } else if (account.role === 'agent') {
        navigate('/agent', { replace: true })
      } else if (
        ['admin', 'mp', 'editor'].includes(account.role)
      ) {
        navigate('/admin', { replace: true })
      } else {
        setError('This account does not have portal access.')
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-story">
          <Link to="/" className="auth-brand">
            <span className="brand-mark">M</span>
            <span className="brand-name">
              MATUNGULU
              <small>CAMPAIGN</small>
            </span>
          </Link>

          <div className="auth-story-copy">
            <span className="eyebrow">CAMPAIGN WORKSPACE</span>

            <h1>
              One workspace.
              <br />
              <span>Connected operations.</span>
            </h1>

            <p>
              Access campaign administration, manage published
              information, and coordinate authorised field operations.
            </p>
          </div>

          <div className="auth-story-footer">
            <ShieldCheck size={19} />
            <span>Authorised access only</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="auth-icon">
              <LockKeyhole size={21} />
            </span>

            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your workspace</h2>
            <p>Use the account credentials provided by your administrator.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-form-footer">
            Need assistance? Contact your system administrator.
          </p>

          <Link to="/" className="auth-back-link">
            Return to public website
          </Link>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
