import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  CheckSquare,
  Clock,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  Settings,
  CalendarDays,
  Users,
  BarChart3
} from 'lucide-react'
import Logo from '../ui/logo'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import NotificationCenter from '../admin/NotificationCenter'

const EmployeeLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Get current employee from auth store
  const { user, logout } = useAuthStore()
  const currentEmployee = user || {
    firstName: 'Employee',
    lastName: '',
    role: 'Employee',
    email: ''
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('employeeAuthenticated')
    navigate('/employee/login')
  }

  // Role-based search functionality
  const getRoleBasedSearchItems = (role) => {
    const baseSearchItems = [
      { name: 'Dashboard', href: '/employee', type: 'page' },
      { name: 'My Tasks', href: '/employee/tasks', type: 'page' },
      { name: 'Attendance', href: '/employee/attendance', type: 'page' },
      { name: 'Leave Requests', href: '/employee/leave', type: 'page' },
      { name: 'Payslips', href: '/employee/payslips', type: 'page' },
      { name: 'Profile', href: '/employee/profile', type: 'page' },
      { name: 'Clock In', href: '/employee/attendance', type: 'action' },
      { name: 'Request Leave', href: '/employee/leave', type: 'action' },
      { name: 'View Tasks', href: '/employee/tasks', type: 'action' }
    ]

    if (role === 'Project Manager') {
      baseSearchItems.push(
        { name: 'Team Overview', href: '/employee/team', type: 'page' },
        { name: 'Project Timeline', href: '/employee/projects', type: 'page' },
        { name: 'Manage Team', href: '/employee/team', type: 'action' }
      )
    }

    if (role.includes('Developer') || role.includes('Full Stack')) {
      baseSearchItems.push(
        { name: 'Code Reviews', href: '/employee/reviews', type: 'page' },
        { name: 'Submit Code', href: '/employee/reviews', type: 'action' }
      )
    }

    return baseSearchItems
  }

  // Quick search functionality
  const searchItems = getRoleBasedSearchItems(currentEmployee.position || currentEmployee.role)

  const filteredSearchResults = searchQuery.length > 0
    ? searchItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : []

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
      breadcrumbs.push({ name: 'Employee', href: '/employee' })

      const currentPage = pathSegments[1]
      const pageNames = {
        'tasks': 'My Tasks',
        'attendance': 'Attendance',
        'leave': 'Leave Requests',
        'payslips': 'Payslips',
        'profile': 'Profile',
        'team': 'Team Overview',
        'projects': 'Project Timeline',
        'reviews': 'Code Reviews'
      }

      if (pageNames[currentPage]) {
        breadcrumbs.push({ name: pageNames[currentPage], href: location.pathname })
      }
    }

    return breadcrumbs
  }

  // Get role-based menu items
  const getRoleBasedMenuItems = (role) => {
    const baseMenuItems = [
      {
        title: 'Dashboard',
        icon: Home,
        href: '/employee',
        active: location.pathname === '/employee'
      },
      {
        title: 'My Tasks',
        icon: CheckSquare,
        href: '/employee/tasks',
        active: location.pathname === '/employee/tasks'
      },
      {
        title: 'Calendar',
        icon: Calendar,
        href: '/employee/calendar',
        active: location.pathname === '/employee/calendar'
      },
      {
        title: 'Attendance',
        icon: Clock,
        href: '/employee/attendance',
        active: location.pathname === '/employee/attendance'
      },
      {
        title: 'Leave Requests',
        icon: CalendarDays,
        href: '/employee/leave',
        active: location.pathname === '/employee/leave'
      },
      {
        title: 'Payslips',
        icon: FileText,
        href: '/employee/payslips',
        active: location.pathname === '/employee/payslips'
      }
    ]

    // Add role-specific menu items
    if (role === 'Project Manager') {
      // Project Manager gets additional management features
      baseMenuItems.splice(2, 0, {
        title: 'Team Overview',
        icon: Users,
        href: '/employee/team',
        active: location.pathname === '/employee/team'
      })
      baseMenuItems.splice(3, 0, {
        title: 'Project Timeline',
        icon: BarChart3,
        href: '/employee/projects',
        active: location.pathname === '/employee/projects'
      })
    }

    if (role.includes('Developer') || role.includes('Full Stack')) {
      // Developers get code-related features
      baseMenuItems.splice(2, 0, {
        title: 'Code Reviews',
        icon: Search,
        href: '/employee/reviews',
        active: location.pathname === '/employee/reviews'
      })
    }

    return baseMenuItems
  }

  const menuItems = getRoleBasedMenuItems(currentEmployee.position || currentEmployee.role)

  // Role-based notifications
  const getRoleBasedNotifications = (role) => {
    const baseNotifications = [
      { id: 1, message: 'New task assigned: Website Update', time: '10 min ago', unread: true },
      { id: 2, message: 'Leave request approved', time: '2 hours ago', unread: true },
      { id: 3, message: 'Payslip for December available', time: '1 day ago', unread: false }
    ]

    if (role === 'Project Manager') {
      baseNotifications.unshift(
        { id: 4, message: 'Team meeting scheduled for tomorrow', time: '5 min ago', unread: true },
        { id: 5, message: 'Project deadline approaching', time: '1 hour ago', unread: true }
      )
    }

    if (role.includes('Developer') || role.includes('Full Stack')) {
      baseNotifications.unshift(
        { id: 6, message: 'Code review requested', time: '15 min ago', unread: true },
        { id: 7, message: 'Build completed successfully', time: '30 min ago', unread: false }
      )
    }

    return baseNotifications
  }

  const notifications = getRoleBasedNotifications(currentEmployee.position || currentEmployee.role)

  const unreadCount = notifications.filter(n => n.unread).length

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

            {/* Center - Search (desktop only) */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                        <div className={`w-2 h-2 rounded-full mr-3 ${item.type === 'page' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded ${item.type === 'page' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
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
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <NotificationCenter />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Avatar
                    src={currentEmployee.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${currentEmployee.avatar}` : null}
                    firstName={currentEmployee.firstName}
                    lastName={currentEmployee.lastName}
                    size="sm"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {currentEmployee.firstName} {currentEmployee.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{currentEmployee.position || currentEmployee.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/employee/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      My Profile
                    </Link>
                    <Link
                      to="/employee/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
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

          {/* Mobile Search Row */}
          {mobileSearchOpen && (
            <div className="md:hidden px-4 pb-3 border-t border-gray-100">
              <form onSubmit={handleSearchSubmit} className="relative w-full mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search pages & actions..."
                  value={searchQuery}
                  autoFocus
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(e.target.value.length > 0)
                  }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
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
                          setMobileSearchOpen(false)
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${item.type === 'page' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded ${item.type === 'page' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.type}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </form>
            </div>
          )}
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
                    ? 'bg-green-50 text-green-700'
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
                          ? 'text-green-600'
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

export default EmployeeLayout