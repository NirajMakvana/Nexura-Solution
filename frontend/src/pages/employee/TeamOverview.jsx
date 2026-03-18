import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Award,
  Activity,
  Mail,
  Phone,
  MapPin,
  Eye,
  Plus,
  UserPlus,
  Calendar
} from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'

const TeamOverview = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAssignTask, setShowAssignTask] = useState(false)

  // Calculate statistics
  const totalMembers = teamMembers.length
  const onlineMembers = teamMembers.filter(m => m.status === 'Online').length
  const totalTasksCompleted = teamMembers.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0)
  const averagePerformance = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, m) => sum + (m.performance || 0), 0) / teamMembers.length)
    : 0

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      const data = await employeeService.getTeamMembers()
      setTeamMembers(data)
    } catch (error) {
      console.error('Error loading team:', error)
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800 border-green-200'
      case 'Away': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Offline': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusDot = (status) => {
    switch (status) {
      case 'Online': return 'bg-green-500'
      case 'Away': return 'bg-yellow-500'
      case 'Offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50'
      case 'In Progress': return 'text-blue-600 bg-blue-50'
      case 'Pending': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <EmployeeLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your team performance</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </button>
            <button
              onClick={() => setShowAssignTask(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Task
            </button>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-xl shadow-premium border border-white/20 hover-lift transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100/80 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl shadow-premium border border-white/20 hover-lift transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Online Now</p>
              <p className="text-2xl font-bold text-gray-900">{onlineMembers}</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">Available</span>
              </div>
            </div>
            <div className="p-3 bg-green-100/80 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl shadow-premium border border-white/20 hover-lift transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasksCompleted}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600 font-medium">This month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100/80 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl shadow-premium border border-white/20 hover-lift transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{averagePerformance}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 font-medium">Excellent</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100/80 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass p-6 rounded-xl shadow-premium border border-white/20 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="glass rounded-xl p-6 shadow-premium border border-white/20 hover-lift transition-all cursor-pointer group"
          >
            {/* Member Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(member.status)} rounded-full border-2 border-white shadow-sm`}></div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                  <p className="text-green-600 text-sm font-semibold mb-3">{member.position || member.role}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(member.status)}`}>
                {member.status}
              </span>
            </div>

            {/* Member Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Current Project</span>
                <span className="text-sm font-medium text-gray-900">{member.currentProject}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Performance</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${member.performance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">{member.performance}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Active</span>
                <span className="text-sm text-gray-900">{member.lastActive}</span>
              </div>
            </div>

            {/* Task Summary */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Task Summary</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">{member.tasksCompleted}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{member.tasksInProgress}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{member.tasksPending}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{member.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMember(member)}
                className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <button className="flex-1 bg-teal-50 text-teal-600 py-2 px-3 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </button>
              <button className="bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white">
                    {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusDot(selectedMember.status)} rounded-full border-2 border-white shadow-md`}></div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedMember.firstName} {selectedMember.lastName}</h3>
                  <p className="text-gray-600 font-medium">{selectedMember.position || selectedMember.role}</p>
                  <span className={`inline-flex text-xs px-2 py-1 rounded-full border mt-2 ${getStatusColor(selectedMember.status)}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedMember.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedMember.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Overall Performance</span>
                      <span className="text-sm font-medium">{selectedMember.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${selectedMember.performance}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Productivity</span>
                      <span className="text-sm font-medium">{selectedMember.productivity}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedMember.productivity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMember.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Tasks</h4>
              <div className="space-y-2">
                {selectedMember.recentTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Assign New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select team member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Task description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignTask(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAssignTask(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  )
}

export default TeamOverview