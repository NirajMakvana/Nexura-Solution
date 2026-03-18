import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Logo from '../../components/ui/logo'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const EmployeeLoginPage = () => {
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
      window.history.replaceState(null, '', '/employee/login')
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

      // Check if user is employee or manager
      if (response.role === 'admin' || response.role === 'hr') {
        toast.error('Access denied. Please use the admin login page.')
        setIsLoading(false)
        return
      }

      // Store user in auth store
      login(response.token, {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role,           // system role: 'employee', 'manager', etc.
        position: response.position,   // job title: 'Frontend Developer', etc.
        department: response.department
      })

      localStorage.setItem('employeeAuthenticated', 'true')

      toast.success(`Welcome ${response.firstName} ${response.lastName}! Redirecting to your dashboard...`)

      setTimeout(() => {
        navigate('/employee')
      }, 1500)
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please check your credentials and try again.'
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Employee Login</h2>
          </div>
          <p className="text-gray-600">
            Access your employee portal and manage your tasks
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Employee Email
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="your@nexurasolutions.com"
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <User className="w-5 h-5 mr-2" />
                  Access Employee Portal
                </>
              )}
            </button>
          </form>


        </div>

        {/* Links */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors block"
          >
            ← Back to Website
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2025 Nexura Solutions. All rights reserved.</p>
          <p className="mt-1">Employee Portal • Secure Access</p>
        </div>
      </div>
    </div>
  )
}

export default EmployeeLoginPage