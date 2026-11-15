
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'

import { useAuth } from '../../context/useAuth'
import './Auth.css'

function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const passwordLength = Array.from(newPassword).length

    if (passwordLength < 12 || passwordLength > 128) {
      setError('Your new password must contain 12 to 128 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setError('Your new password must differ from the current password.')
      return
    }

    setIsSubmitting(true)

    try {
      const updatedUser = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })

      if (updatedUser.role === 'agent') {
        navigate('/agent', { replace: true })
      } else if (
        ['admin', 'mp', 'editor'].includes(updatedUser.role)
      ) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to change password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-story">
          <div className="auth-brand">
            <span className="brand-mark">M</span>
            <span className="brand-name">
              MATUNGULU
              <small>CAMPAIGN</small>
            </span>
          </div>

          <div className="auth-story-copy">
            <span className="eyebrow">ACCOUNT SECURITY</span>

            <h1>
              Protect your
              <br />
              <span>workspace access.</span>
            </h1>

            <p>
              A new password helps protect your account and the
              information available through your workspace.
            </p>
          </div>

          <div className="auth-story-footer">
            <ShieldCheck size={19} />
            <span>Secure account access</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="auth-icon">
              <KeyRound size={21} />
            </span>

            <span className="eyebrow">PASSWORD UPDATE REQUIRED</span>
            <h2>Choose a new password</h2>
            <p>
              Your account must have a new password before you
              continue to your workspace.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <small>Use 12 to 128 characters.</small>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
              <span>
                {isSubmitting ? 'Updating password...' : 'Update password'}
              </span>
              <ArrowRight size={18} />
            </button>
          </form>

          <button
            className="auth-back-link auth-logout"
            type="button"
            onClick={handleLogout}
          >
            Sign out{user?.username ? ` (${user.username})` : ''}
          </button>
        </section>
      </div>
    </main>
  )
}

export default ChangePasswordPage

