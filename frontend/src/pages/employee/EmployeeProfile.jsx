import { useState, useEffect } from 'react'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    CalendarDays,
    Award,
    TrendingUp,
    CheckCircle,
    Activity,
    Award as AwardIcon,
    Camera
} from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

const EmployeeProfile = () => {
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState(null)
    const [statsData, setStatsData] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({ phone: '', address: '', bio: '' })

    useEffect(() => {
        loadProfileAndStats()
    }, [])

    const loadProfileAndStats = async () => {
        try {
            setLoading(true)

            // Load profile (critical)
            const profile = await employeeService.getProfile()

            setProfileData({
                firstName: profile.user?.firstName || profile.firstName || '',
                lastName: profile.user?.lastName || profile.lastName || '',
                email: profile.user?.email || profile.email || '',
                phone: profile.phone || '+91 XXXXXXXXXX',
                address: typeof profile.address === 'object' ? profile.address?.street : (profile.address || 'Not specified'),
                position: profile.position || 'Employee',
                role: profile.user?.role || profile.role || 'Employee',
                department: profile.department || 'General',
                joinDate: profile.joinDate || profile.createdAt,
                skills: profile.skills || ['React', 'Node.js', 'JavaScript'],
                bio: profile.bio || 'Passionate software engineer at Nexura Solutions.',
                avatar: profile.user?.avatar || profile.avatar || ''
            })

            // Load stats (optional — silent failure)
            const stats = await employeeService.getMyStats().catch(() => null)
            setStatsData(stats || {
                completedTasks: 0,
                attendanceRate: 0,
                performance: 0
            })

        } catch (error) {
            console.error('Error loading profile:', error)
            toast.error('Failed to load profile data')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            await employeeService.updateProfile(editForm)
            setProfileData(prev => ({ ...prev, ...editForm }))
            setIsEditing(false)
            toast.success('Profile updated successfully')
        } catch (error) {
            console.error('Update err:', error)
            toast.error('Failed to update profile')
        }
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const response = await authService.updateAvatar(file)
            setProfileData(prev => ({ ...prev, avatar: response.avatar }))

            // Update local storage user object
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            user.avatar = response.avatar
            localStorage.setItem('user', JSON.stringify(user))

            // Update Auth Store
            useAuthStore.getState().updateUser({ avatar: response.avatar })

            toast.success('Profile picture updated!')
        } catch (error) {
            console.error('Avatar upload error:', error)
            toast.error('Failed to update profile picture. Max size 2MB.')
        }
    }

    if (loading) {
        return (
            <EmployeeLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </EmployeeLayout>
        )
    }

    return (
        <EmployeeLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">View your personal information, skills, and performance statistics.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Area */}
                    <div className="lg:col-span-1 border-none shadow-none">
                        <div className="glass rounded-xl shadow-premium border border-white/20 p-6">
                            {/* Profile Summary */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block mb-4">
                                    {profileData?.avatar ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${profileData.avatar}`}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover mx-auto shadow-md border-2 border-green-100"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-md">
                                            {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => document.getElementById('employee-avatar-input').click()}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors shadow-lg border-2 border-white"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input
                                        id="employee-avatar-input"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {profileData?.firstName} {profileData?.lastName}
                                </h3>
                                <p className="text-green-600 font-medium">{profileData?.position}</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                                        {profileData?.department}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                        {profileData?.role}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6 space-y-4">
                                {/* Quick Stats Sidebar */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-500 flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Tasks</span>
                                        <span className="text-sm font-semibold text-gray-900">{statsData?.completedTasks || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-500 flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> Attendance</span>
                                        <span className="text-sm font-semibold text-gray-900">{statsData?.attendanceRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${statsData?.attendanceRate}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass p-6 rounded-xl shadow-premium border border-white/20 flex items-center space-x-4 hover-lift transition-all">
                                <div className="p-3 bg-green-100/80 text-green-600 rounded-lg">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Completed Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">{statsData?.completedTasks || 0}</p>
                                </div>
                            </div>
                            <div className="glass p-6 rounded-xl shadow-premium border border-white/20 flex items-center space-x-4 hover-lift transition-all">
                                <div className="p-3 bg-blue-100/80 text-blue-600 rounded-lg">
                                    <AwardIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Performance</p>
                                    <p className="text-2xl font-bold text-gray-900">{statsData?.performance || 0}%</p>
                                </div>
                            </div>
                            <div className="glass p-6 rounded-xl shadow-premium border border-white/20 flex items-center space-x-4 hover-lift transition-all">
                                <div className="p-3 bg-emerald-100/80 text-emerald-600 rounded-lg">
                                    <CalendarDays className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Join Date</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {profileData?.joinDate ? new Date(profileData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl shadow-premium border border-white/20 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                <button
                                    onClick={() => {
                                        setEditForm({
                                            phone: profileData.phone === '+91 XXXXXXXXXX' ? '' : profileData.phone,
                                            address: profileData.address === 'Not specified' ? '' : profileData.address,
                                            bio: profileData.bio
                                        })
                                        setIsEditing(true)
                                    }}
                                    className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors font-medium border border-green-100"
                                >
                                    Edit Details
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="flex items-start">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                                            <p className="text-base text-gray-900 font-medium mt-1">{profileData?.firstName} {profileData?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                                            <p className="text-base text-gray-900 font-medium mt-1">{profileData?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                            <p className="text-base text-gray-900 font-medium mt-1">{profileData?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Address</p>
                                            <p className="text-base text-gray-900 font-medium mt-1">{profileData?.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:col-span-2">
                                        <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-500 mb-2">Bio / About</p>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm leading-relaxed">
                                                {profileData?.bio}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="glass rounded-xl shadow-premium border border-white/20 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Skills & Expertise</h2>
                            </div>
                            <div className="p-6">
                                {profileData?.skills && profileData.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.skills.map((skill, index) => (
                                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium rounded-lg text-sm flex items-center shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No skills added yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 bg-black bg-opacity-50">
                        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4" id="modal-title">
                                            Edit Personal Details
                                        </h3>
                                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={editForm.phone}
                                                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 uppercase-placeholder"
                                                        placeholder="+91 9876543210"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={editForm.address}
                                                        onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                                                        placeholder="City, State"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                                                <textarea
                                                    rows="4"
                                                    value={editForm.bio}
                                                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 resize-none"
                                                    placeholder="Tell us about yourself..."
                                                ></textarea>
                                            </div>

                                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 -mx-6 -mb-6 mt-6 rounded-b-xl border-t border-gray-100">
                                                <button
                                                    type="submit"
                                                    className="inline-flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto transition-colors"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    )
}

export default EmployeeProfile
