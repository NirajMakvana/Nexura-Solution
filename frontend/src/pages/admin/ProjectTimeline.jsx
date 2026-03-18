import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  Target,
  Flag,
  Download,
  X,
  Users,
  FolderOpen,
  TrendingUp
} from 'lucide-react'

const ProjectTimeline = () => {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState('all')
  const [viewMode, setViewMode] = useState('timeline')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectsData, tasksData] = await Promise.all([
        adminService.getProjects().catch(() => []),
        adminService.getTasks().catch(() => [])
      ])
      setProjects(Array.isArray(projectsData) ? projectsData : [])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
    } catch (error) {
      console.error('Error loading timeline data:', error)
      toast.error('Failed to load timeline data')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = selectedProject === 'all'
    ? projects
    : projects.filter(p => p._id === selectedProject)

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(t => {
      if (!t.project) return false
      const projId = typeof t.project === 'object' ? t.project._id : t.project
      return projId === selectedProject
    })

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'completed' || s === 'done') return 'bg-green-100 text-green-800 border-green-200'
    if (s === 'in-progress' || s === 'in progress') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (s === 'overdue') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'completed' || s === 'done') return <CheckCircle className="w-4 h-4 text-green-600" />
    if (s === 'in-progress' || s === 'in progress') return <Clock className="w-4 h-4 text-blue-600" />
    if (s === 'overdue') return <AlertCircle className="w-4 h-4 text-red-600" />
    return <AlertCircle className="w-4 h-4 text-yellow-600" />
  }

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Planning': return 'bg-purple-100 text-purple-800'
      case 'On Hold': return 'bg-gray-100 text-gray-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getClientName = (client) => {
    if (!client) return 'No Client'
    if (typeof client === 'object') return client.name || 'Unknown'
    return client
  }

  const getAssigneeName = (assignedTo) => {
    if (!assignedTo) return 'Unassigned'
    if (typeof assignedTo === 'object') {
      return `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim() || 'Unknown'
    }
    return assignedTo
  }

  // Stats
  const completedProjects = projects.filter(p => p.status === 'Completed').length
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length
  const completedTasks = tasks.filter(t => ['completed', 'done', 'Completed'].includes(t.status)).length
  const pendingTasks = tasks.filter(t => !['completed', 'done', 'Completed'].includes(t.status)).length

  const handleExportTimeline = () => {
    const csvData = [
      ['Type', 'Title', 'Project/Client', 'Status', 'Due Date / End Date'],
      ...filteredProjects.map(p => [
        'Project',
        p.name,
        getClientName(p.client),
        p.status,
        p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'
      ]),
      ...filteredTasks.map(t => [
        'Task',
        t.title,
        typeof t.project === 'object' ? t.project?.name : '',
        t.status,
        t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `project-timeline-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('Timeline exported successfully!')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading timeline data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Timeline</h1>
              <p className="text-gray-600 mt-1">Track project progress and milestones</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportTimeline}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={loadData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <div className="flex items-center mt-2">
                  <FolderOpen className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">Active tracking</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedProjects}/{projects.length}</p>
                <div className="flex items-center mt-2">
                  <Flag className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Projects done</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Flag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Done</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}/{tasks.length}</p>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">Completed</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressProjects}</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Active projects</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Project Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Timeline View
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'gantt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Gantt View
              </button>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects List */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
                Projects ({filteredProjects.length})
              </h2>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No projects found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project, index) => (
                    <div key={project._id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${project.status === 'Completed' ? 'bg-green-500' :
                            project.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                          {index + 1}
                        </div>
                        {index < filteredProjects.length - 1 && (
                          <div className="w-0.5 h-10 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${getProjectStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{getClientName(project.client)}</p>
                        {project.endDate && (
                          <p className="text-xs text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(project.endDate).toLocaleDateString()}
                          </p>
                        )}
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{project.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Tasks ({filteredTasks.length})
              </h2>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No tasks found for selected project</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.slice(0, 15).map(task => (
                    <div key={task._id} className={`p-4 rounded-lg border ${['completed', 'done', 'Completed'].includes(task.status) ? 'bg-green-50 border-green-200' :
                        ['in-progress', 'in progress'].includes((task.status || '').toLowerCase()) ? 'bg-blue-50 border-blue-200' :
                          'bg-yellow-50 border-yellow-200'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate flex-1">{task.title}</h3>
                        <div className="flex items-center ml-2">
                          {getStatusIcon(task.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {getAssigneeName(task.assignedTo)}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {task.priority && (
                        <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${task.priority === 'Urgent' || task.priority === 'High' ? 'bg-red-100 text-red-700' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                          }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  ))}
                  {filteredTasks.length > 15 && (
                    <p className="text-center text-sm text-gray-500 py-2">
                      + {filteredTasks.length - 15} more tasks
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gantt View */}
        {viewMode === 'gantt' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Gantt Chart</h2>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>No projects available to display</p>
              </div>
            ) : (
              <div className="min-w-[600px]">
                {filteredProjects.filter(p => p.startDate && p.endDate).map(project => {
                  const start = new Date(project.startDate)
                  const end = new Date(project.endDate)
                  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
                  const progress = project.progress || 0
                  return (
                    <div key={project._id} className="flex items-center py-3 border-b border-gray-100 gap-4">
                      <div className="w-48 flex-shrink-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{project.name}</div>
                        <div className="text-xs text-gray-500">{getClientName(project.client)}</div>
                      </div>
                      <div className="flex-1 relative">
                        <div className="w-full bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div
                            className={`h-8 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all ${project.status === 'Completed' ? 'bg-green-500' :
                                project.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                              }`}
                            style={{ width: `${Math.max(progress, 5)}%` }}
                          >
                            {progress > 10 ? `${progress}%` : ''}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{start.toLocaleDateString()}</span>
                          <span>{end.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ProjectTimeline