import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If role is required, wait for userProfile to load
  if (requiredRole) {
    if (!userProfile) {
      return <LoadingSpinner />
    }
    if (userProfile.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
