import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import {
  FolderOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  DollarSign,
  Eye,
  Users,
  TrendingUp,
  Download,
  X
} from 'lucide-react'
import ConfirmModal from '../../components/ui/ConfirmModal'
import Spinner from '../../components/ui/Spinner'
import { SkeletonBox } from '../../components/ui/Skeleton'

const ProjectManagement = () => {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    category: '',
    technologies: [],
    team: []
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [techInput, setTechInput] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })

  const categories = ['Web Development', 'UI/UX Design', 'Graphics Design', 'Cards & Banners', 'Mobile App']
  const statuses = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled']
  const priorities = ['Low', 'Medium', 'High', 'Urgent']

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false)
        setShowEditModal(false)
        setShowViewModal(false)
        setSelectedProject(null)
        setEditingProject(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectsData, clientsData, employeesData] = await Promise.all([
        adminService.getProjects().catch(() => []),
        adminService.getClients().catch(() => []),
        adminService.getEmployees().catch(() => [])
      ])
      setProjects(projectsData || [])
      setClients(clientsData || [])
      setEmployees(employeesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const clientName = typeof project.client === 'object' ? (project.client?.name || '') : (project.client || '')
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const handleAddProject = async () => {
    const errors = {}
    if (!newProject.name) errors.name = true
    if (!newProject.client) errors.client = true
    if (!newProject.category) errors.category = true

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fill all required fields marked with *')
      return
    }

    setValidationErrors({})

    try {
      const projectPayload = {
        ...newProject,
        team: newProject.team.map(id => ({ employee: id, role: 'Member' }))
      }
      await adminService.createProject(projectPayload)
      toast.success('Project created successfully')
      await loadData()
      setNewProject({
        name: '',
        client: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: '',
        category: '',
        technologies: [],
        team: []
      })
      setTechInput('')
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const handleDeleteProject = async () => {
    const id = confirmModal.id
    setConfirmModal({ isOpen: false, id: null })
    try {
      await adminService.deleteProject(id)
      toast.success('Project deleted successfully')
      await loadData()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleEditProject = (project) => {
    const toDateInput = (dateStr) => {
      if (!dateStr) return ''
      return new Date(dateStr).toISOString().split('T')[0]
    }
    setEditingProject({
      ...project,
      client: typeof project.client === 'object' ? project.client._id : project.client,
      startDate: toDateInput(project.startDate),
      endDate: toDateInput(project.endDate),
      technologies: project.technologies || [],
      team: project.team.map(member => {
        if (typeof member === 'object' && member.employee) {
          return typeof member.employee === 'object' ? member.employee._id : member.employee;
        }
        return typeof member === 'object' ? member._id : member;
      })
    })
    setShowEditModal(true)
  }

  const handleTechAdd = (e, isEditing = false) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tech = techInput.trim()
      if (tech) {
        if (isEditing) {
          if (!editingProject.technologies.includes(tech)) {
            setEditingProject({ ...editingProject, technologies: [...editingProject.technologies, tech] })
          }
        } else {
          if (!newProject.technologies.includes(tech)) {
            setNewProject({ ...newProject, technologies: [...newProject.technologies, tech] })
          }
        }
        setTechInput('')
      }
    }
  }

  const handleTechRemove = (techToRemove, isEditing = false) => {
    if (isEditing) {
      setEditingProject({
        ...editingProject,
        technologies: editingProject.technologies.filter(t => t !== techToRemove)
      })
    } else {
      setNewProject({
        ...newProject,
        technologies: newProject.technologies.filter(t => t !== techToRemove)
      })
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject.name || !editingProject.client || !editingProject.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const projectPayload = {
        ...editingProject,
        team: editingProject.team.map(id => ({ employee: id, role: 'Member' }))
      }
      await adminService.updateProject(editingProject._id, projectPayload)
      toast.success('Project updated successfully')
      await loadData()
      setShowEditModal(false)
      setEditingProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  const handleViewProject = (project) => {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  const handleExportProjects = () => {
    const csvData = [
      ['Project Name', 'Client', 'Status', 'Priority', 'Progress', 'Budget', 'Category', 'Start Date', 'End Date'],
      ...filteredProjects.map(project => [
        project.name,
        project.client,
        project.status,
        project.priority,
        project.progress + '%',
        project.budget,
        project.category,
        project.startDate,
        project.endDate
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Planning': return 'bg-yellow-100 text-yellow-800'
      case 'Review': return 'bg-purple-100 text-purple-800'
      case 'On Hold': return 'bg-orange-100 text-orange-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Calculate stats
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'Completed').length
  const activeProjects = projects.filter(p => ['In Progress', 'Planning', 'Review'].includes(p.status)).length
  const totalRevenue = projects.filter(p => p.status === 'Completed').reduce((sum, p) => {
    const budget = typeof p.budget === 'string' ? parseInt(p.budget.replace(/[₹,]/g, '')) : p.budget
    return sum + (budget || 0)
  }, 0)

  const getClientName = (client) => {
    return typeof client === 'object' ? client.name : client
  }

  const getTeamMembers = (team) => {
    if (!team || team.length === 0) return []
    return team.map(member => {
      if (typeof member === 'string') return { name: member }
      if (member.employee) {
        return {
          ...member.employee,
          name: member.employee.firstName ? `${member.employee.firstName} ${member.employee.lastName}` : 'Unknown'
        }
      }
      return {
        ...member,
        name: member.name || (member.firstName ? `${member.firstName} ${member.lastName}` : 'Unknown')
      }
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 px-4">
          <div className="text-center max-w-md w-full">
            <Spinner variant="blue" size={48} />
            <div className="mt-4 space-y-3">
              <SkeletonBox className="h-4 w-56 mx-auto" />
              <SkeletonBox className="h-4 w-72 mx-auto" />
              <SkeletonBox className="h-4 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all your projects</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportProjects}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 font-medium">{getClientName(project.client)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full glow-blue ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{project.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(project.progress || 0)}`}
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Budget</span>
                  <span className="text-sm font-medium text-green-600">
                    {typeof project.budget === 'number' ? `₹${project.budget.toLocaleString()}` : project.budget}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Priority</span>
                  <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium">{project.category}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Timeline</span>
                  <span className="text-sm text-gray-600">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <div className="flex -space-x-2">
                      {getTeamMembers(project.team).slice(0, 3).map((member, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                          title={member.name}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {project.team && project.team.length > 3 && (
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleViewProject(project)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEditProject(project)}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setConfirmModal({ isOpen: true, id: project._id })}
                  className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => {
                    setNewProject({ ...newProject, name: e.target.value })
                    if (e.target.value) setValidationErrors(prev => ({ ...prev, name: false }))
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client <span className="text-red-500">*</span></label>
                <select
                  value={newProject.client}
                  onChange={(e) => {
                    setNewProject({ ...newProject, client: e.target.value })
                    if (e.target.value) setValidationErrors(prev => ({ ...prev, client: false }))
                  }}
                  className={`w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none ${validationErrors.client ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={newProject.category}
                  onChange={(e) => {
                    setNewProject({ ...newProject, category: e.target.value })
                    if (e.target.value) setValidationErrors(prev => ({ ...prev, category: false }))
                  }}
                  className={`w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none ${validationErrors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g., 50000"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newProject.budget && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(newProject.budget)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
              <textarea
                placeholder="Describe the project scope and requirements..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Technologies Chip Input */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add Technologies (Press Enter to add)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => handleTechAdd(e, false)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newProject.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProject.technologies.map((tech, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-sm">
                      {tech}
                      <button type="button" onClick={() => handleTechRemove(tech, false)} className="ml-1 text-blue-400 hover:text-blue-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Team Members
              </label>
              <div className="grid grid-cols-2 gap-2">
                {employees.map(employee => (
                  <label key={employee._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProject.team.includes(employee._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProject({
                            ...newProject,
                            team: [...newProject.team, employee._id]
                          })
                        } else {
                          setNewProject({
                            ...newProject,
                            team: newProject.team.filter(id => id !== employee._id)
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{employee.firstName} {employee.lastName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={editingProject.name}
                onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingProject.client}
                onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
              <select
                value={editingProject.category}
                onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={editingProject.priority}
                onChange={(e) => setEditingProject({ ...editingProject, priority: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              <div>
                <input
                  type="number"
                  placeholder="Budget (e.g., 50000)"
                  value={editingProject.budget}
                  onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingProject.budget && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(editingProject.budget)}
                  </p>
                )}
              </div>
              <select
                value={editingProject.status}
                onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Start Date"
                value={editingProject.startDate}
                onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="End Date"
                value={editingProject.endDate}
                onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              placeholder="Project Description"
              value={editingProject.description}
              onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
            />
            {/* Technologies Chip Input */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add Technologies (Press Enter to add)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => handleTechAdd(e, true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {editingProject.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingProject.technologies.map((tech, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-sm">
                      {tech}
                      <button type="button" onClick={() => handleTechRemove(tech, true)} className="ml-1 text-blue-400 hover:text-blue-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress ({editingProject.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editingProject.progress}
                onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <textarea
              placeholder="Project Description"
              value={editingProject.description}
              onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Team Members
              </label>
              <div className="grid grid-cols-2 gap-2">
                {employees.map(employee => (
                  <label key={employee._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProject.team.includes(employee._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingProject({
                            ...editingProject,
                            team: [...editingProject.team, employee._id]
                          })
                        } else {
                          setEditingProject({
                            ...editingProject,
                            team: editingProject.team.filter(id => id !== employee._id)
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{employee.firstName} {employee.lastName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingProject(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{selectedProject.name}</h3>
                <p className="text-gray-600">{getClientName(selectedProject.client)}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Project Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{selectedProject.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`font-medium ${getPriorityColor(selectedProject.priority)}`}>
                      {selectedProject.priority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-green-600">{selectedProject.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(selectedProject.endDate) - new Date(selectedProject.startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedProject.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Team Members</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedProject.team || []).map((member, index) => {
                  const name = typeof member === 'object'
                    ? (member.employee
                      ? `${member.employee.firstName || ''} ${member.employee.lastName || ''}`.trim()
                      : `${member.firstName || ''} ${member.lastName || ''}`.trim())
                    : member
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
                  return (
                    <div key={index} className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                        {initials || '?'}
                      </div>
                      <span className="text-sm font-medium">{name || 'Unknown'}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Progress</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getProgressColor(selectedProject.progress)}`}
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{selectedProject.progress}% Complete</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditProject(selectedProject)
                  setShowViewModal(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteProject}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </AdminLayout>
  )
}

export default ProjectManagement