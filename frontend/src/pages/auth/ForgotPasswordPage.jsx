import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react'
import Logo from '../../components/ui/logo'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const { data } = await api.post('/auth/forgotpassword', { email })
      setIsSubmitted(true)
      toast.success(data.message || 'Reset link sent successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-8">
            <Logo size="lg" />
          </Link>

          {!isSubmitted ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                No worries! Enter your email address and we'll send you a reset link.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </>
          )}
        </div>

        {!isSubmitted ? (
          /* Reset Form */
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Success Message */
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Try Again
                </button>
                <Link
                  to="/admin/login"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Need help? {' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
              Contact Support
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-gray-700 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2024 Nexura Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage