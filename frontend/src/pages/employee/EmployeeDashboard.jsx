import { useState, useEffect } from 'react'
import {
  Clock,
  CheckSquare,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Briefcase,
  DollarSign,
  Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(true)
  const [employeeData, setEmployeeData] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])

  // Get current employee from auth store
  const { user } = useAuthStore()
  const currentEmployee = user || {
    firstName: 'Employee',
    lastName: '',
    role: 'Employee',
    email: ''
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadEmployeeData()
    loadMyTasks()
  }, [])

  const loadEmployeeData = async () => {
    try {
      const data = await employeeService.getMyProfile()
      setEmployeeData(data)
    } catch (error) {
      console.error('Error loading employee data:', error)
    }
  }

  const loadMyTasks = async () => {
    try {
      setLoading(true)
      const tasks = await employeeService.getMyTasks()
      // Transform tasks to match UI format
      const formattedTasks = tasks.map(task => ({
        _id: task._id,
        name: task.title,
        project: task.project?.name || 'No Project',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        progress: calculateProgress(task.status)
      }))
      setRecentTasks(formattedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress based on status
  const calculateProgress = (status) => {
    switch (status) {
      case 'Completed': return 100
      case 'In Progress': return 60
      case 'Pending': return 0
      default: return 0
    }
  }

  // Calculate dynamic stats - Admin style with proper metrics
  const completedTasks = recentTasks.filter(t => t.status === 'Completed').length
  const inProgressTasks = recentTasks.filter(t => t.status === 'In Progress').length
  const performanceScore = recentTasks.length > 0
    ? Math.round(recentTasks.reduce((sum, task) => sum + task.progress, 0) / recentTasks.length)
    : 0

  // Employee earnings calculation from real data
  const monthlyEarnings = employeeData?.user?.salary?.amount || user?.salary?.amount || 0
  const bonusEarnings = 0 // Can be calculated from performance later
  const totalEarnings = monthlyEarnings + bonusEarnings

  const stats = [
    {
      title: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Tasks Completed',
      value: completedTasks.toString(),
      icon: CheckSquare,
      change: `${recentTasks.length} total tasks`,
      trend: 'up'
    },
    {
      title: 'Active Projects',
      value: employeeData?.activeProjectsCount?.toString() || '0',
      icon: Briefcase,
      change: `${inProgressTasks} active tasks`,
      trend: 'up'
    },
    {
      title: 'Performance Score',
      value: `${performanceScore}%`,
      icon: TrendingUp,
      change: '+5% from last month',
      trend: 'up'
    }
  ]

  // Role-based upcoming events
  const getRoleBasedEvents = (role) => {
    const baseEvents = [
      { title: 'Team Meeting', time: '10:00 AM', date: 'Today', type: 'meeting' },
      { title: 'Project Deadline', time: '5:00 PM', date: 'Jan 5', type: 'deadline' }
    ]

    if (role === 'Project Manager') {
      baseEvents.push(
        { title: 'Client Presentation', time: '11:00 AM', date: 'Jan 8', type: 'presentation' },
        { title: 'Team Performance Review', time: '3:00 PM', date: 'Jan 10', type: 'review' },
        { title: 'Project Planning Session', time: '9:00 AM', date: 'Jan 12', type: 'meeting' }
      )
    }

    if (role.includes('Developer') || role.includes('Full Stack')) {
      baseEvents.push(
        { title: 'Code Review Session', time: '2:00 PM', date: 'Jan 6', type: 'review' },
        { title: 'Technical Discussion', time: '4:00 PM', date: 'Jan 9', type: 'meeting' }
      )
    }

    return baseEvents
  }

  const upcomingEvents = getRoleBasedEvents(currentEmployee.role)

  // Role-based quick actions
  const getRoleBasedQuickActions = (role) => {
    const baseActions = [
      { title: 'Clock In/Out', icon: Clock, description: 'Track your attendance', href: '/employee/attendance', color: 'from-green-500 to-green-600' },
      { title: 'My Tasks', icon: CheckSquare, description: 'View assigned tasks', href: '/employee/tasks', color: 'from-green-500 to-green-600' },
      { title: 'Leave Request', icon: Calendar, description: 'Request time off', href: '/employee/leave', color: 'from-emerald-500 to-emerald-600' },
      { title: 'Payslips', icon: FileText, description: 'Download payslips', href: '/employee/payslips', color: 'from-teal-500 to-teal-600' }
    ]

    if (role === 'Project Manager') {
      // Project Manager gets team management actions
      baseActions.push(
        { title: 'Team Overview', icon: Users, description: 'Manage team members', href: '/employee/team', color: 'from-blue-500 to-blue-600' },
        { title: 'Project Timeline', icon: Target, description: 'Track project progress', href: '/employee/projects', color: 'from-purple-500 to-purple-600' }
      )
    }

    if (role.includes('Developer') || role.includes('Full Stack')) {
      // Developers get code-related actions
      baseActions.push(
        { title: 'Code Reviews', icon: Activity, description: 'Review code submissions', href: '/employee/reviews', color: 'from-orange-500 to-orange-600' }
      )
    }

    return baseActions
  }

  const quickActions = getRoleBasedQuickActions(currentEmployee.role)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return Users
      case 'deadline': return AlertCircle
      case 'review': return CheckCircle
      case 'presentation': return Target
      default: return Calendar
    }
  }

  return (
    <EmployeeLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {greeting}, {employeeData?.firstName || currentEmployee.firstName}! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening in your workspace today.</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-sm text-gray-500 mb-1">Current time</div>
            <div className="text-2xl font-bold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Admin-style Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="glass p-6 rounded-xl shadow-premium border border-white/20 hover-lift transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.title === 'Total Earnings' ? 'bg-green-100' :
                stat.title === 'Tasks Completed' ? 'bg-blue-100' :
                  stat.title === 'Active Projects' ? 'bg-purple-100' :
                    'bg-orange-100'
                }`}>
                <stat.icon className={`w-6 h-6 ${stat.title === 'Total Earnings' ? 'text-green-600' :
                  stat.title === 'Tasks Completed' ? 'text-blue-600' :
                    stat.title === 'Active Projects' ? 'text-purple-600' :
                      'text-orange-600'
                  }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className={`bg-gradient-to-r ${action.color} p-6 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <action.icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
            <p className="text-white/80 text-sm">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Tasks with Progress Bars */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Recent Tasks</h2>
            <Link to="/employee/tasks" className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.slice(0, 5).map((task) => (
                <div key={task._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{task.name}</p>
                      <p className="text-xs text-gray-600">Project: {task.project}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${task.progress === 100 ? 'bg-green-500' :
                          task.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/employee/calendar" className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
              View Calendar →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const IconComponent = getEventIcon(event.type)
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600">{event.date} at {event.time}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Tasks Completed</h3>
            <p className="text-2xl font-bold text-green-600">95%</p>
            <p className="text-sm text-gray-500">On-time completion rate</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Productivity</h3>
            <p className="text-2xl font-bold text-green-600">{performanceScore}%</p>
            <p className="text-sm text-gray-500">Above team average</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Team Rating</h3>
            <p className="text-2xl font-bold text-purple-600">4.8/5</p>
            <p className="text-sm text-gray-500">Peer feedback score</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>&copy; 2025 Nexura Solutions. Employee Portal</p>
      </div>
    </EmployeeLayout>
  )
}

export default EmployeeDashboard