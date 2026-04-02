import { useState, useEffect } from 'react'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    Shield,
    Key,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const EmployeeSettings = () => {
    const { user: authUser, updateUser } = useAuthStore()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        bio: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const data = await employeeService.getProfile()

            setProfileData({
                firstName: data.user?.firstName || data.firstName || '',
                lastName: data.user?.lastName || data.lastName || '',
                email: data.user?.email || data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                bio: data.bio || ''
            })
        } catch (error) {
            toast.error('Failed to load settings data')
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage({ type: '', text: '' })

        try {
            await employeeService.updateProfile(profileData)

            // Optionally update auth store if basic details changed
            if (authUser) {
                updateUser({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                })
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            toast.success('Profile updated successfully!')

            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update profile'
            setMessage({ type: 'error', text: errorMsg })
            toast.error(errorMsg)
        } finally {
            setIsSaving(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match!' })
            return
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long!' })
            return
        }

        setIsSaving(true)

        try {
            // Call the dedicated /auth/password endpoint
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setMessage({ type: 'success', text: 'Password changed successfully!' })
            toast.success('Password changed successfully!')

            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to change password. Please check your current password.'
            setMessage({ type: 'error', text: errorMsg })
            toast.error(errorMsg)
        } finally {
            setIsSaving(false)
        }
    }

    const tabs = [
        { id: 'profile', name: 'Profile Details', icon: User },
        { id: 'security', name: 'Security & Password', icon: Shield }
    ]

    if (loading) {
        return (
            <EmployeeLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </EmployeeLayout>
        )
    }

    return (
        <EmployeeLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-2">Update your personal information and security preferences.</p>
                </div>

                {/* Success/Error Messages */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        )}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-green-50 text-green-700 border border-green-200 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                            {/* Profile Details Tab */}
                            {activeTab === 'profile' && (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                                    </div>

                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={profileData.firstName}
                                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={profileData.lastName}
                                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address <span className="text-xs text-gray-400 font-normal ml-2">(Contact Admin to change)</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        disabled
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                        placeholder="+91..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                        placeholder="Enter full address"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bio
                                                </label>
                                                <textarea
                                                    value={profileData.bio}
                                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none"
                                                    placeholder="Tell us a little about yourself..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving Updates...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-5 h-5 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Ensure your account is using a long, random password to stay secure. Password must be at least 8 characters.
                                        </p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-5 h-5 mr-2" />
                                                        Update Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    )
}

export default EmployeeSettings
