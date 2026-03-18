import { useState, useEffect } from 'react'
import { Users, FolderOpen, Award, DollarSign, BarChart3, Plus, Calendar, TrendingUp, Clock, Bell, Activity, CheckCircle2, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import useProjectStore from '../../store/projectStore'
import { adminService } from '../../services/adminService'
import { SkeletonBox } from '../../components/ui/Skeleton'

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    completedProjects: 0
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [realTasks, setRealTasks] = useState([])
  const [realTeamMembers, setRealTeamMembers] = useState([])
  const [systemActivities, setSystemActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, projects, leaves, tasks, employees, activities] = await Promise.all([
        adminService.getDashboardStats().catch(() => ({
          totalEmployees: 0, activeEmployees: 0, todayAttendance: 0, pendingLeaves: 0,
          totalProjects: 0, activeProjects: 0, totalClients: 0, completedProjects: 0
        })),
        adminService.getProjects().catch(() => []),
        adminService.getLeaves().catch(() => []),
        adminService.getTasks().catch(() => []),
        adminService.getEmployees().catch(() => []),
        adminService.getDashboardActivities().catch(() => [])
      ])

      setDashboardStats(stats)
      setRecentProjects((projects || []).slice(0, 4))
      setPendingLeaves((leaves || []).filter(l => l.status === 'Pending').slice(0, 5))
      setRealTasks((tasks || []).slice(0, 5))
      setRealTeamMembers((employees || []).filter(emp => emp.isActive).slice(0, 4))
      setSystemActivities(activities || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleApproveLeave = async (leaveId) => {
    try {
      await adminService.approveLeave(leaveId)
      toast.success('Leave request approved successfully')
      loadDashboardData() // Reload data
    } catch (error) {
      console.error('Error approving leave:', error)
      toast.error('Failed to approve leave request')
    }
  }

  const handleRejectLeave = async (leaveId) => {
    try {
      await adminService.rejectLeave(leaveId, 'Rejected by admin')
      toast.success('Leave request rejected')
      loadDashboardData() // Reload data
    } catch (error) {
      console.error('Error rejecting leave:', error)
      toast.error('Failed to reject leave request')
    }
  }

  // Use real stats from API
  const stats = [
    {
      title: 'Total Projects',
      value: loading ? '...' : dashboardStats.totalProjects?.toString() || '0',
      icon: FolderOpen,
      change: `${dashboardStats.completedProjects || 0} completed`,
      trend: dashboardStats.completedProjects > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Active Projects',
      value: loading ? '...' : dashboardStats.activeProjects?.toString() || '0',
      icon: Activity,
      change: 'In progress',
      trend: dashboardStats.activeProjects > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Employees',
      value: loading ? '...' : dashboardStats.totalEmployees?.toString() || '0',
      icon: Users,
      change: `${dashboardStats.activeEmployees || 0} active`,
      trend: dashboardStats.activeEmployees > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Clients',
      value: loading ? '...' : dashboardStats.totalClients?.toString() || '0',
      icon: Target,
      change: 'Active clients',
      trend: dashboardStats.totalClients > 0 ? 'up' : 'neutral'
    }
  ]

  // Use real recent projects from API
  const projectsList = recentProjects.map(project => ({
    name: project.name,
    client: typeof project.client === 'object' ? project.client?.name : 'N/A',
    status: project.status,
    progress: project.progress || 0,
    priority: project.priority || 'Medium',
    dueDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
    revenue: typeof project.budget === 'number' ? `₹${project.budget.toLocaleString()}` : '₹0'
  }))



  return (
    <AdminLayout>
      {/* Enhanced Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {greeting}, Admin! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening at Nexura Solutions today.</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.title === 'Total Revenue' ? 'bg-green-100' :
                stat.title === 'Active Projects' ? 'bg-blue-100' :
                  stat.title === 'Happy Clients' ? 'bg-purple-100' :
                    'bg-orange-100'
                }`}>
                <stat.icon className={`w-6 h-6 ${stat.title === 'Total Revenue' ? 'text-green-600' :
                  stat.title === 'Active Projects' ? 'text-blue-600' :
                    stat.title === 'Happy Clients' ? 'text-purple-600' :
                      'text-orange-600'
                  }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards - Moved to top like Employee Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/analytics" className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
          <BarChart3 className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
          <p className="text-purple-100 text-sm">View business insights and performance metrics</p>
        </Link>

        <Link to="/admin/clients" className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105">
          <Users className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Client Management</h3>
          <p className="text-indigo-100 text-sm">Manage clients and their project history</p>
        </Link>

        <Link to="/admin/projects" className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
          <FolderOpen className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Project Management</h3>
          <p className="text-blue-100 text-sm">Create, track and manage all your projects</p>
        </Link>

        <Link to="/admin/staff" className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
          <Users className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Staff Management</h3>
          <p className="text-green-100 text-sm">Add, edit and manage your team members</p>
        </Link>

        <Link to="/admin/invoices" className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-xl text-white hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105">
          <DollarSign className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice Management</h3>
          <p className="text-emerald-100 text-sm">Create and track invoices and payments</p>
        </Link>

        <Link to="/admin/timeline" className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105">
          <Calendar className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Project Timeline</h3>
          <p className="text-orange-100 text-sm">Track milestones and project progress</p>
        </Link>

        <Link to="/admin/payroll" className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-xl text-white hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-105">
          <DollarSign className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payroll Management</h3>
          <p className="text-teal-100 text-sm">Manage employee salaries and payslips</p>
        </Link>

        <Link to="/admin/attendance" className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 rounded-xl text-white hover:from-rose-600 hover:to-rose-700 transition-all transform hover:scale-105">
          <Clock className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Attendance Tracking</h3>
          <p className="text-rose-100 text-sm">Monitor daily employee logs and hours</p>
        </Link>
      </div>

      {/* Enhanced Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
              Recent Projects
            </h2>
            <Link to="/admin/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              View All
              <TrendingUp className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <SkeletonBox className="h-20 w-full" />
                <SkeletonBox className="h-20 w-full" />
                <SkeletonBox className="h-20 w-full" />
                <SkeletonBox className="h-20 w-full" />
              </div>
            ) : projectsList.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent projects</p>
            ) : (
              projectsList.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'Review' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Client: {project.client}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 w-20">
                            <div
                              className={`h-2 rounded-full ${project.progress === 100 ? 'bg-green-500' :
                                project.progress >= 75 ? 'bg-blue-500' :
                                  project.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 ml-2">{project.progress}%</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${project.priority === 'High' ? 'bg-red-100 text-red-700' :
                          project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {project.priority}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{project.revenue}</p>
                        <p className="text-xs text-gray-500">Due: {project.dueDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Pending Leaves
            </h2>
            <span className="text-sm font-medium text-orange-600">
              {loading ? '...' : pendingLeaves.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <SkeletonBox className="h-32 w-full" />
                <SkeletonBox className="h-32 w-full" />
              </div>
            ) : pendingLeaves.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No pending leave requests</p>
            ) : (
              pendingLeaves.map((leave) => (
                <div key={leave._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{leave.leaveType} Leave</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">{leave.reason}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveLeave(leave._id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLeave(leave._id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </h2>
            <Link to="/admin/projects" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <div className="flex space-x-3"><SkeletonBox className="h-8 w-8 rounded-full" /><SkeletonBox className="h-8 w-full" /></div>
                <div className="flex space-x-3"><SkeletonBox className="h-8 w-8 rounded-full" /><SkeletonBox className="h-8 w-full" /></div>
                <div className="flex space-x-3"><SkeletonBox className="h-8 w-8 rounded-full" /><SkeletonBox className="h-8 w-full" /></div>
              </div>
            ) : realTasks.length === 0 && recentProjects.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            ) : (
              <>
                {recentProjects.slice(0, 2).map((project, index) => (
                  <div key={`p-${index}`} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Project {project.status.toLowerCase()}</span>
                        <span className="text-gray-600"> - {project.name}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Updated recently</p>
                    </div>
                  </div>
                ))}
                {realTasks.slice(0, 3).map((task, index) => (
                  <div key={`t-${index}`} className="flex items-start space-x-3 mt-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.status === 'Completed' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Task {task.status.toLowerCase()}</span>
                        <span className="text-gray-600"> - {task.title}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Updated recently</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Upcoming Deadlines
            </h2>
            <Link to="/admin/timeline" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
              View Timeline →
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <SkeletonBox className="h-16 w-full" />
                <SkeletonBox className="h-16 w-full" />
                <SkeletonBox className="h-16 w-full" />
              </div>
            ) : recentProjects.filter(p => ['In Progress', 'Planning'].includes(p.status) && p.endDate).length === 0 ? (
              <p className="text-center text-gray-500 py-4">No upcoming deadlines.</p>
            ) : (
              recentProjects
                .filter(p => ['In Progress', 'Planning'].includes(p.status) && p.endDate)
                .slice(0, 4)
                .map((project, index) => {
                  const daysLeft = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysLeft < 0

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        <p className="text-xs text-gray-600">Client: {project.client?.name || 'Internal'}</p>
                        <p className="text-xs text-gray-500 mt-1">Due: {new Date(project.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-800' :
                          daysLeft <= 7 ? 'bg-orange-100 text-orange-800' :
                            daysLeft <= 14 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                          }`}>
                          {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>

      {/* Additional Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link to="/admin/projects" className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors group">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700 group-hover:text-blue-700 font-medium">Create New Project</span>
            </Link>
            <Link to="/admin/clients" className="flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors group">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 group-hover:text-green-700 font-medium">Add New Client</span>
            </Link>
            <Link to="/admin/invoices" className="flex items-center p-2 rounded-lg hover:bg-purple-50 transition-colors group">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700 group-hover:text-purple-700 font-medium">Create Invoice</span>
            </Link>
            <Link to="/admin/staff" className="flex items-center p-2 rounded-lg hover:bg-orange-50 transition-colors group">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200">
                <Plus className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-gray-700 group-hover:text-orange-700 font-medium">Add Team Member</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-4">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-full" />
              </div>
            ) : systemActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activities.</p>
            ) : (
              systemActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'invoice' ? 'bg-blue-500' :
                    activity.type === 'project' ? 'bg-green-500' :
                      activity.type === 'leave' ? 'bg-yellow-500' :
                        'bg-purple-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.description} • {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Today's Priority Tasks</h3>
            </div>
            <Link to="/admin/projects" className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {realTasks.slice(0, 4).map((task, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${task.status === 'overdue' ? 'bg-red-500' :
                  task.status === 'upcoming' ? 'bg-blue-500' :
                    task.priority === 'High' ? 'bg-orange-500' :
                      task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{task.project?.name || 'Internal'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      task.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>&copy; 2025 Nexura Solutions. All rights reserved.</p>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard