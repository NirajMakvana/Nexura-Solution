import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Logo from '../../components/ui/logo'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.')
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!passwordRegex.test(password)) {
            return setError('Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number.')
        }

        setIsSubmitting(true)
        try {
            const { data } = await api.put(`/auth/resetpassword/${token}`, { password })
            setIsSuccess(true)
            toast.success(data.message || 'Password reset successful')
            setTimeout(() => {
                navigate('/admin/login')
            }, 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-8">
                        <Logo size="lg" />
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
                    <p className="text-gray-600">Please enter your new password below.</p>
                </div>

                {isSuccess ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successfully</h3>
                        <p className="text-gray-600 mb-6">You will be redirected to the login page shortly.</p>
                        <Link to="/admin/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                            Go to Login Now
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                                    <span className="text-red-700 text-sm">{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter new password"
                                        disabled={!token}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Confirm new password"
                                        disabled={!token}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !token}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResetPasswordPage
