import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Single source of truth: Zustand auth store only
  if (!isAuthenticated || !user) {
    const redirectTo = allowedRoles.includes('admin') ? '/admin/login' : '/employee/login'
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles.includes('admin')) {
    if (user.role === 'admin' || user.role === 'hr') {
      return children
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (allowedRoles.includes('employee')) {
    if (user.role === 'employee' || user.role === 'manager' || user.role === 'admin' || user.role === 'hr') {
      return children
    }
    return <Navigate to="/employee/login" state={{ from: location }} replace />
  }

  return <Navigate to="/" replace />
}

export default ProtectedRoute
