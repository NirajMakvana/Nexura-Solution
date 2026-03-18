import { useState, useEffect } from 'react'
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Flag,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Save
} from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'

const TaskBoard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Get current employee data
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || '{"name": "Employee", "role": "Employee", "avatar": "E", "id": null}')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await employeeService.getMyTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const statuses = ['To Do', 'In Progress', 'In Review', 'Completed']
  const priorities = ['Low', 'Medium', 'High', 'Urgent']

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || task.status?.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600'
      case 'High': return 'text-orange-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle
      case 'In Progress': return Clock
      case 'Pending': return AlertCircle
      case 'Review': return Eye
      case 'Blocked': return XCircle
      default: return CheckSquare
    }
  }

  const getProgressPercentage = (task) => {
    if (task.status === 'Completed') return 100;
    if (!task.estimatedHours) return task.completedHours > 0 ? 50 : 0;
    return task.estimatedHours > 0 ? Math.round((task.completedHours / task.estimatedHours) * 100) : 0;
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await employeeService.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  }

  const handleUpdateTask = async () => {
    try {
      await employeeService.updateTask(editingTask._id, {
        status: editingTask.status,
        completedHours: editingTask.completedHours
      });
      setTasks(tasks.map(task =>
        task._id === editingTask._id ? editingTask : task
      ));
      setEditingTask(null);
      toast.success('Task details updated');
    } catch (error) {
      toast.error('Failed to update task details');
    }
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length

  return (
    <EmployeeLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Manage and track your assigned tasks</p>
      </div>

      {/* Stats Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
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
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => {
          const StatusIcon = getStatusIcon(task.status)
          const progress = getProgressPercentage(task)

          return (
            <div key={task._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Project</span>
                  <span className="text-sm font-medium text-gray-900">{typeof task.project === 'object' ? task.project?.name : (task.project || 'N/A')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="flex items-center">
                    <StatusIcon className="w-4 h-4 mr-1" />
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Priority</span>
                  <div className="flex items-center">
                    <Flag className={`w-4 h-4 mr-1 ${getPriorityColor(task.priority)}`} />
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Assigned By</span>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-900">{typeof task.assignedBy === 'object' ? `${task.assignedBy?.firstName || ''} ${task.assignedBy?.lastName || ''}`.trim() : (task.assignedBy || 'N/A')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' :
                        progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{task.completedHours}h completed</span>
                    <span>{task.estimatedHours}h estimated</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {(task.tags || []).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Status Update */}
                {task.status !== 'Completed' && (
                  <div className="pt-3 border-t">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons - Admin Style */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => setEditingTask(task)}
                    className="flex-1 bg-teal-50 text-teal-600 py-2 px-3 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{selectedTask.title}</h3>
                <p className="text-gray-600">{typeof selectedTask.project === 'object' ? selectedTask.project?.name : (selectedTask.project || 'N/A')}</p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const StatusIcon = getStatusIcon(selectedTask.status)
                    return <StatusIcon className="w-4 h-4 mr-1" />
                  })()}
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Task Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <div className="flex items-center">
                      <Flag className={`w-4 h-4 mr-1 ${getPriorityColor(selectedTask.priority)}`} />
                      <span className={`font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned By:</span>
                    <span className="font-medium">{typeof selectedTask.assignedBy === 'object' ? `${selectedTask.assignedBy?.firstName || ''} ${selectedTask.assignedBy?.lastName || ''}`.trim() : (selectedTask.assignedBy || 'N/A')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{selectedTask.completedHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated:</span>
                    <span className="font-medium">{selectedTask.estimatedHours}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                      className={`h-3 rounded-full ${getProgressPercentage(selectedTask) === 100 ? 'bg-green-500' :
                        getProgressPercentage(selectedTask) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                      style={{ width: `${getProgressPercentage(selectedTask)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">{getProgressPercentage(selectedTask)}% Complete</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedTask.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedTask.tags || []).map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingTask(selectedTask)
                  setSelectedTask(null)
                }}
                className="bg-teal-50 text-teal-600 hover:bg-teal-100 px-4 py-2 rounded-lg flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Task Progress</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingTask.status || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completed Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingTask.estimatedHours || 0}
                  value={editingTask.completedHours || 0}
                  onChange={(e) => setEditingTask({ ...editingTask, completedHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Out of {editingTask.estimatedHours} estimated hours
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any notes about your progress..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  )
}

export default TaskBoard