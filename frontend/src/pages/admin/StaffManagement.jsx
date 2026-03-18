import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import { TableSkeleton, CardSkeleton } from '../../components/ui/Skeleton'
import { Avatar } from '../../components/ui/Avatar'
import {
  Users,
  Search,
  Plus,
  Edit2,
  Edit3,
  Trash2,
  X,
  Check,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  MapPin,
  User,
  Briefcase,
  Star,
  MoreVertical,
  Eye,
  UserPlus,
  Upload
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { exportToCSV } from '../../utils/csvExport'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import ConfirmModal from '../../components/ui/ConfirmModal'

const ITEMS_PER_PAGE = 10

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '', // Should be set by admin
    phone: '',
    role: '',
    department: '',
    salary: '',
    joinDate: ''
  })
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    salary: '',
    joinDate: '',
    bio: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })
  const departments = ['Design', 'Development', 'Management', 'Marketing', 'Sales']
  const roles = ['UI/UX Designer', 'Full Stack Developer', 'Project Manager', 'Marketing Specialist', 'Sales Executive']

  useEffect(() => {
    fetchEmployees()
  }, [])

  // ESC key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedEmployee(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await adminService.getEmployees()
      setEmployees(data || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === 'all' || employee.department?.toLowerCase() === filterRole.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filter/search changes
  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1) }
  const handleFilter = (val) => { setFilterRole(val); setCurrentPage(1) }

  const handleExport = () => {
    const headers = [
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'department', label: 'Department' },
      { key: 'position', label: 'Position' },
      { key: 'joinDate', label: 'Join Date' },
      { key: 'isActive', label: 'Status' }
    ]

    const dataToExport = filteredEmployees.map(emp => ({
      ...emp,
      joinDate: new Date(emp.joinDate).toLocaleDateString(),
      isActive: emp.isActive ? 'Active' : 'Inactive'
    }))

    exportToCSV(dataToExport, headers, 'Staff_Registry.csv')
  }

  const handleAddEmployee = async () => {
    // Frontend validation
    if (!newEmployee.name.trim()) return toast.error('Full name is required')
    if (!newEmployee.email.trim()) return toast.error('Email is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) return toast.error('Enter a valid email address')
    if (!newEmployee.role) return toast.error('Role/Position is required')
    if (newEmployee.password && newEmployee.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (newEmployee.phone && !/^[+\d\s\-()]{7,15}$/.test(newEmployee.phone)) return toast.error('Enter a valid phone number')

    try {
      // Split name into firstName and lastName
      const nameParts = newEmployee.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || firstName // If no last name, use first name

      // Prepare employee data with correct field names
      const employeeData = {
        firstName,
        lastName,
        email: newEmployee.email,
        password: newEmployee.password,
        phone: newEmployee.phone,
        role: 'employee', // System access role
        position: newEmployee.role, // Job Title / Position
        department: newEmployee.department,
        salary: newEmployee.salary ? {
          amount: parseFloat(newEmployee.salary),
          currency: 'INR',
          payFrequency: 'monthly'
        } : undefined,
        joinDate: newEmployee.joinDate || new Date()
      }

      await adminService.createEmployee(employeeData)

      toast.success('Employee added successfully')

      setNewEmployee({
        name: '',
        email: '',
        password: 'password123',
        phone: '',
        role: '',
        department: '',
        salary: '',
        joinDate: ''
      })
      setShowAddModal(false)
      fetchEmployees() // Reload employees
    } catch (error) {
      console.error('Error adding employee:', error)
      console.error('Error response:', error.response)

      let errorMessage = 'Failed to add employee'

      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again as admin.'
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You do not have permission to add employees.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
    }
  }

  const handleDeleteEmployee = async () => {
    const id = confirmModal.id
    setConfirmModal({ isOpen: false, id: null })
    try {
      await adminService.deleteEmployee(id)
      toast.success('Employee deleted successfully')
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee')
    }
  }

  const handleOpenEditModal = (employee) => {
    setEditEmployee({
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.position || '',
      department: employee.department || '',
      salary: employee.salary?.amount || '',
      joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
      bio: employee.bio || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateEmployee = async () => {
    if (!editEmployee.name || !editEmployee.email) {
      toast.error('Please fill in all required fields (Name, Email)')
      return
    }

    try {
      // Split name into firstName and lastName
      const nameParts = editEmployee.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || firstName

      // Prepare employee data
      const employeeData = {
        firstName,
        lastName,
        email: editEmployee.email,
        phone: editEmployee.phone,
        position: editEmployee.role,
        department: editEmployee.department,
        bio: editEmployee.bio,
        salary: editEmployee.salary ? {
          amount: parseFloat(editEmployee.salary),
          currency: 'INR',
          payFrequency: 'monthly'
        } : undefined,
        joinDate: editEmployee.joinDate || undefined
      }

      await adminService.updateEmployee(editEmployee.id, employeeData)

      toast.success('Employee updated successfully')

      setShowEditModal(false)
      fetchEmployees() // Reload employees
    } catch (error) {
      console.error('Error updating employee:', error)

      toast.error(error.response?.data?.message || 'Failed to update employee')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      case 'On Leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return 'text-green-600'
    if (performance >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their information</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.isActive).length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.length > 0
                    ? Math.round(employees.reduce((acc, emp) => acc + (emp.performance || 0), 0) / employees.length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
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
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => handleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          {loading ? (
            <div className="p-6">
              <TableSkeleton columns={5} rows={5} />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No employees found"
                description={searchTerm ? `No results for "${searchTerm}". Try a different search.` : 'Add your first team member to get started.'}
                action={
                  !searchTerm && (
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto">
                      <UserPlus className="w-4 h-4 mr-2" /> Add Employee
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-4 p-4 bg-gray-50/50">
                {paginatedEmployees.map((employee) => (
                  <div key={employee._id} className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={employee.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${employee.avatar}` : null}
                          firstName={employee.firstName}
                          lastName={employee.lastName}
                          size="md"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500">ID: {employee.employeeId || employee._id?.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${getStatusColor(employee.isActive ? 'Active' : 'Inactive')}`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Role</span>
                        <div className="text-gray-900 font-medium">{employee.position || employee.role || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{employee.department || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Performance</span>
                        <div className={`font-medium ${getPerformanceColor(employee.performance || 0)}`}>
                          {employee.performance || 0}%
                        </div>
                        <div className="text-gray-500 text-xs">{employee.projects || 0} projects</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 text-xs block mb-1">Contact</span>
                        <div className="flex items-center text-gray-900 mb-1">
                          <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center text-gray-900">
                          <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          {employee.phone || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3 border-t">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                        title="View"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(employee)}
                        className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, id: employee._id })}
                        className="flex-shrink-0 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Department</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedEmployees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <Avatar
                                src={employee.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${employee.avatar}` : null}
                                firstName={employee.firstName}
                                lastName={employee.lastName}
                                size="md"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
                              <div className="text-sm text-gray-500">ID: {employee.employeeId || employee._id?.slice(-6).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.position || employee.role || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{employee.department || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center"><Mail className="w-4 h-4 mr-1" />{employee.email}</div>
                          <div className="text-sm text-gray-500 flex items-center"><Phone className="w-4 h-4 mr-1" />{employee.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getPerformanceColor(employee.performance || 0)}`}>{employee.performance || 0}%</div>
                          <div className="text-sm text-gray-500">{employee.projects || 0} projects</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.isActive ? 'Active' : 'Inactive')}`}>
                            {employee.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => setSelectedEmployee(employee)} className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleOpenEditModal(employee)} className="bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setConfirmModal({ isOpen: true, id: employee._id })} className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredEmployees.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="e.g. john@nexurasolutions.com"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Set login password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Min 6 characters. Employee uses this to login.</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position <span className="text-red-500">*</span></label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Join Date</label>
                <input
                  type="date"
                  value={newEmployee.joinDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <Avatar
                  src={selectedEmployee.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${selectedEmployee.avatar}` : null}
                  firstName={selectedEmployee.firstName}
                  lastName={selectedEmployee.lastName}
                  size="xl"
                  className="mr-4"
                />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedEmployee.position || selectedEmployee.role || 'N/A'}</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusColor(selectedEmployee.isActive ? 'Active' : 'Inactive')}`}>
                    {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedEmployee.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Work Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">{selectedEmployee.employeeId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{selectedEmployee.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Join Date:</span>
                    <span className="font-medium">
                      {selectedEmployee.joinDate
                        ? new Date(selectedEmployee.joinDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-green-600">
                      {selectedEmployee.salary?.amount
                        ? `₹${selectedEmployee.salary.amount.toLocaleString()}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Performance & Projects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Performance Score</span>
                    <span className={`font-bold ${getPerformanceColor(selectedEmployee.performance || 0)}`}>
                      {selectedEmployee.performance || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${(selectedEmployee.performance || 0) >= 90 ? 'bg-green-500' :
                        (selectedEmployee.performance || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${selectedEmployee.performance || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Projects</span>
                    <span className="font-bold text-blue-600">{selectedEmployee.projects || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null)
                  handleOpenEditModal(selectedEmployee)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={editEmployee.name}
                onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={editEmployee.email}
                onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editEmployee.phone}
                onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editEmployee.role}
                onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                value={editEmployee.department}
                onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Salary (e.g., 45000)"
                value={editEmployee.salary}
                onChange={(e) => setEditEmployee({ ...editEmployee, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="Join Date"
                value={editEmployee.joinDate}
                onChange={(e) => setEditEmployee({ ...editEmployee, joinDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Bio / About (shown on public website)</label>
                <textarea
                  placeholder="Short bio about the employee..."
                  value={editEmployee.bio}
                  onChange={(e) => setEditEmployee({ ...editEmployee, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Employee
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteEmployee}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </AdminLayout>
  )
}

export default StaffManagement