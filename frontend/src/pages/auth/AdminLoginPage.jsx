import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Logo from '../../components/ui/logo'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('expired') === 'true') {
      toast.error('Your session has expired. Please log in again.', { duration: 4000 })
      window.history.replaceState(null, '', '/admin/login')
    }
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.login(formData.email, formData.password)

      // Check if user is admin
      if (response.role !== 'admin' && response.role !== 'hr') {
        toast.error('Access denied. Admin credentials required.')
        setIsLoading(false)
        return
      }

      // Store user in auth store correctly
      login(response.token, {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role,
      })

      sessionStorage.setItem('adminAuthenticated', 'true')
      toast.success('Login successful! Redirecting to admin panel...')

      setTimeout(() => {
        navigate('/admin')
      }, 1500)
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please check your credentials and try again.'
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          </div>
          <p className="text-gray-600">
            Secure access to Nexura Solutions admin panel
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Authorized Access Only</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This area is restricted to authorized personnel only. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@nexurasolutions.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>


        </div>

        {/* Back to Website */}
        <div className="text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← Back to Website
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2025 Nexura Solutions. All rights reserved.</p>
          <p className="mt-1">Secure admin access • All activities are logged</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage