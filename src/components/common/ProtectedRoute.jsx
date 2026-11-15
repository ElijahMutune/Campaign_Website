import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function LoadingScreen() {
  return (
      <main className="auth-loading">
        <div>
          <span className="auth-loading-mark">M</span>
          <p>Restoring your session...</p>
        </div>
      </main>
  )
}

export function ProtectedRoute({
                                 children,
                                 allowedRoles,
                                 allowPasswordChange = false,
                               }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
        <Navigate
            to="/login"
            replace
            state={{ from: location }}
        />
    )
  }

  if (user.must_change_password && !allowPasswordChange) {
    return <Navigate to="/change-password" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (['admin', 'mp', 'editor'].includes(user.role)) {
      return <Navigate to="/admin" replace />
    }

    return <Navigate to="/" replace />
  }

  return children
}

export function PublicOnly({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return children
  }

  if (user.must_change_password) {
    return <Navigate to="/change-password" replace />
  }

  if (['admin', 'mp', 'editor'].includes(user.role)) {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/" replace />
}