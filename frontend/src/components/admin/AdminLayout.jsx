import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  FolderOpen,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Building2,
  FileText,
  Calendar,
  Star,
  Bell,
  Mail,
  Briefcase
} from 'lucide-react'
import Logo from '../ui/logo'
import NotificationCenter from './NotificationCenter'
import { adminService } from '../../services/adminService'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'
import { Avatar } from '../ui/Avatar'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const location = useLocation()
  const { user, logout: authLogout } = useAuthStore()

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Admin User'
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'
  const avatarUrl = user?.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${user.avatar}` : null

  // Quick search functionality
  const searchItems = [
    { name: 'Dashboard', href: '/admin', type: 'page' },
    { name: 'Analytics', href: '/admin/analytics', type: 'page' },
    { name: 'Projects', href: '/admin/projects', type: 'page' },
    { name: 'Clients', href: '/admin/clients', type: 'page' },
    { name: 'Invoices', href: '/admin/invoices', type: 'page' },
    { name: 'Staff', href: '/admin/staff', type: 'page' },
    { name: 'Settings', href: '/admin/settings', type: 'page' },
    { name: 'Profile', href: '/admin/profile', type: 'page' },
    { name: 'Create Project', href: '/admin/projects', type: 'action' },
    { name: 'Add Client', href: '/admin/clients', type: 'action' },
    { name: 'Create Invoice', href: '/admin/invoices', type: 'action' },
    { name: 'Add Employee', href: '/admin/staff', type: 'action' },
    { name: 'Manage Reviews', href: '/admin/reviews', type: 'action' },
    { name: 'Reviews', href: '/admin/reviews', type: 'page' },
    { name: 'Leave Management', href: '/admin/leaves', type: 'page' },
    { name: 'Manage Leaves', href: '/admin/leaves', type: 'action' },
    { name: 'Blog Management', href: '/admin/blogs', type: 'page' },
    { name: 'Job & Careers', href: '/admin/jobs', type: 'page' },
    { name: 'Create Blog Post', href: '/admin/blogs', type: 'action' },
    { name: 'Create Job Post', href: '/admin/jobs', type: 'action' },
    { name: 'Contact Inquiries', href: '/admin/contacts', type: 'page' },
    { name: 'Manage Inquiries', href: '/admin/contacts', type: 'action' }
  ]

  const filteredSearchResults = searchQuery.length > 0
    ? searchItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : []

  const navigate = useNavigate()

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (filteredSearchResults.length > 0) {
      navigate(filteredSearchResults[0].href)
      setSearchQuery('')
      setShowSearchResults(false)
    }
  }

  // Breadcrumb generation
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    if (pathSegments.length > 1) {
      breadcrumbs.push({ name: 'Admin', href: '/admin' })

      const currentPage = pathSegments[1]
      const pageNames = {
        'analytics': 'Analytics',
        'projects': 'Projects',
        'timeline': 'Project Timeline',
        'clients': 'Clients',
        'invoices': 'Invoices',
        'staff': 'Staff',
        'settings': 'Settings',
        'profile': 'Profile',
        'reviews': 'Reviews',
        'jobs': 'Career & Recruitment',
        'leaves': 'Leave Management',
        'blogs': 'Blog Management',
        'contacts': 'Contact Inquiries'
      }

      if (pageNames[currentPage]) {
        breadcrumbs.push({ name: pageNames[currentPage], href: location.pathname })
      }
    }

    return breadcrumbs
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/admin',
      active: location.pathname === '/admin'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      active: location.pathname === '/admin/analytics'
    },
    {
      title: 'Projects',
      icon: FolderOpen,
      href: '/admin/projects',
      active: location.pathname === '/admin/projects'
    },
    {
      title: 'Project Timeline',
      icon: Calendar,
      href: '/admin/timeline',
      active: location.pathname === '/admin/timeline'
    },
    {
      title: 'Clients',
      icon: Building2,
      href: '/admin/clients',
      active: location.pathname === '/admin/clients'
    },
    {
      title: 'Invoices',
      icon: FileText,
      href: '/admin/invoices',
      active: location.pathname === '/admin/invoices'
    },
    {
      title: 'Staff',
      icon: Users,
      href: '/admin/staff',
      active: location.pathname === '/admin/staff'
    },
    {
      title: 'Reviews',
      icon: Star,
      href: '/admin/reviews',
      active: location.pathname === '/admin/reviews'
    },
    {
      title: 'Leave Management',
      icon: Calendar,
      href: '/admin/leaves',
      active: location.pathname === '/admin/leaves'
    },
    {
      title: 'Blog Management',
      icon: FileText,
      href: '/admin/blogs',
      active: location.pathname === '/admin/blogs'
    },
    {
      title: 'Job & Careers',
      icon: Briefcase,
      href: '/admin/jobs',
      active: location.pathname === '/admin/jobs'
    },
    {
      title: 'Contact Inquiries',
      icon: Mail,
      href: '/admin/contacts',
      active: location.pathname === '/admin/contacts'
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      active: location.pathname === '/admin/settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div className="flex items-center ml-4 lg:ml-0">
                <Logo size="sm" />
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Quick search... (Pages, Actions)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(e.target.value.length > 0)
                  }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && filteredSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {filteredSearchResults.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSearchQuery('')
                          setShowSearchResults(false)
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${item.type === 'page' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded ${item.type === 'page' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                          {item.type}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationCenter />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Avatar
                    src={avatarUrl}
                    name={displayName}
                    size="sm"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/admin/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      My Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setProfileDropdown(false)
                        authService.logout()
                        navigate('/admin/login')
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-sm border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 pt-16 lg:pt-16 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>

          {/* Navigation Menu */}
          <nav className="mt-6 px-4 pb-6">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Breadcrumb Navigation */}
          {getBreadcrumbs().length > 0 && (
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {getBreadcrumbs().map((breadcrumb, index) => (
                    <li key={breadcrumb.href} className="flex items-center">
                      {index > 0 && (
                        <ChevronDown className="w-4 h-4 text-gray-400 mx-2 rotate-[-90deg]" />
                      )}
                      <Link
                        to={breadcrumb.href}
                        className={`text-sm font-medium ${index === getBreadcrumbs().length - 1
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {breadcrumb.name}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          )}

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout