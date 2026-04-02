import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Star,
  DollarSign,
  FolderOpen,
  MessageCircle,
  ExternalLink,
  X,
  Download,
  Copy
} from 'lucide-react'
import { CardSkeleton, SkeletonBox, TableSkeleton } from '../../components/ui/Skeleton'
import { exportToCSV } from '../../utils/csvExport'
import Pagination from '../../components/ui/Pagination'
import ConfirmModal from '../../components/ui/ConfirmModal'

const ITEMS_PER_PAGE = 9

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })

  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    notes: ''
  })

  const isValidUrl = (urlString) => {
    if (!urlString) return true; // Optional field
    try {
      new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return true;
    } catch {
      return false;
    }
  }

  // Load clients on mount
  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await adminService.getClients()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || client.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1) }
  const handleFilterStatus = (val) => { setFilterStatus(val); setCurrentPage(1) }

  const handleExport = () => {
    const headers = [
      { key: 'name', label: 'Client Name' },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address', transform: (v) => formatAddress(v) },
      { key: 'status', label: 'Status' }
    ]

    exportToCSV(filteredClients, headers, 'Clients_List.csv')
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.company) {
      toast.error('Please fill in all required fields')
      return
    }

    if (newClient.website && !isValidUrl(newClient.website)) {
      toast.error('Please enter a valid website URL')
      return
    }

    try {
      await adminService.createClient(newClient)
      toast.success('Client created successfully')
      await loadClients()
      setNewClient({
        name: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        notes: ''
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error(error.response?.data?.message || 'Failed to create client')
    }
  }

  const handleDeleteClient = async () => {
    const id = confirmModal.id
    setConfirmModal({ isOpen: false, id: null })
    try {
      await adminService.deleteClient(id)
      toast.success('Client deleted successfully')
      await loadClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error(error.response?.data?.message || 'Failed to delete client')
    }
  }

  const handleEditClient = (client) => {
    setEditingClient({ ...client })
    setShowEditModal(true)
  }

  const handleUpdateClient = async () => {
    if (!editingClient.name || !editingClient.email || !editingClient.company) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingClient.website && !isValidUrl(editingClient.website)) {
      toast.error('Please enter a valid website URL')
      return
    }

    try {
      await adminService.updateClient(editingClient._id, editingClient)
      toast.success('Client updated successfully')
      await loadClients()
      setShowEditModal(false)
      setEditingClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
    }
  }

  const handleExportClients = () => {
    const csvData = [
      ['Name', 'Company', 'Email', 'Phone', 'Status', 'Total Projects', 'Revenue', 'Satisfaction'],
      ...filteredClients.map(client => [
        client.name,
        client.company,
        client.email,
        client.phone,
        client.status,
        client.totalProjects,
        client.totalRevenue,
        client.satisfaction
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      case 'Potential': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSatisfactionColor = (satisfaction) => {
    if (satisfaction >= 95) return 'text-green-600'
    if (satisfaction >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getClientAvatar = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatAddress = (address) => {
    if (!address) return ''
    if (typeof address === 'string') return address
    return [address.street, address.city, address.state, address.zipCode, address.country]
      .filter(Boolean).join(', ')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 space-y-8">
          <SkeletonBox className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <SkeletonBox className="h-28" />
            <SkeletonBox className="h-28" />
            <SkeletonBox className="h-28" />
            <SkeletonBox className="h-28" />
          </div>
          <SkeletonBox className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
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
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage your clients and their project history</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'Active').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(clients || []).reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{(clients || []).reduce((sum, c) => sum + (c.totalProjects || 0), 0)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-yellow-600" />
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => handleFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="potential">Potential</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedClients.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold">No clients found</p>
            </div>
          ) : paginatedClients.map((client) => (
          <div key={client._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {getClientAvatar(client.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-600">{client.company}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600 group">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate mr-2">{client.email}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(client.email);
                    toast.success('Email copied to clipboard');
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                  title="Copy email"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {client.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {formatAddress(client.address)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{client.totalProjects || 0}</p>
                <p className="text-xs text-gray-600">Total Projects</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">₹{(client.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-600">Revenue</p>
              </div>
            </div>

            {client.satisfaction && client.satisfaction > 0 && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <div className="flex items-center">
                  <div className="flex space-x-1 mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= Math.floor(client.satisfaction / 20)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${getSatisfactionColor(client.satisfaction)}`}>
                    {client.satisfaction}%
                  </span>
                </div>
              </div>
            )}

            {client.nextMeeting && (
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                Next meeting: {new Date(client.nextMeeting).toLocaleDateString()}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedClient(client)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <button
                onClick={() => handleEditClient(client)}
                className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => setConfirmModal({ isOpen: true, id: client._id })}
                className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredClients.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Client Name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Company Website (e.g. nexurasolutions.com)"
                value={newClient.website}
                onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${newClient.website && !isValidUrl(newClient.website) ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
              />
              <input
                type="text"
                placeholder="Address"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Notes"
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Satisfaction Rating (Optional)
                </label>
                <select
                  value={newClient.satisfaction}
                  onChange={(e) => setNewClient({ ...newClient, satisfaction: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No Rating Yet</option>
                  <option value={100}>⭐⭐⭐⭐⭐ Excellent (100%)</option>
                  <option value={98}>⭐⭐⭐⭐⭐ Outstanding (98%)</option>
                  <option value={95}>⭐⭐⭐⭐⭐ Very Good (95%)</option>
                  <option value={92}>⭐⭐⭐⭐⭐ Good (92%)</option>
                  <option value={90}>⭐⭐⭐⭐⭐ Above Average (90%)</option>
                  <option value={85}>⭐⭐⭐⭐ Average (85%)</option>
                  <option value={80}>⭐⭐⭐⭐ Below Average (80%)</option>
                  <option value={75}>⭐⭐⭐ Needs Improvement (75%)</option>
                </select>
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
                onClick={handleAddClient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Client</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Client Name"
                value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={editingClient.company}
                onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editingClient.email}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editingClient.phone}
                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Company Website (e.g. nexurasolutions.com)"
                value={editingClient.website || ''}
                onChange={(e) => setEditingClient({ ...editingClient, website: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingClient.website && !isValidUrl(editingClient.website) ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
              />
              <input
                type="text"
                placeholder="Address"
                value={formatAddress(editingClient.address)}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingClient.status}
                onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Potential">Potential</option>
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Satisfaction Rating
                </label>
                <select
                  value={editingClient.satisfaction || 0}
                  onChange={(e) => setEditingClient({ ...editingClient, satisfaction: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No Rating Yet</option>
                  <option value={100}>⭐⭐⭐⭐⭐ Excellent (100%)</option>
                  <option value={98}>⭐⭐⭐⭐⭐ Outstanding (98%)</option>
                  <option value={95}>⭐⭐⭐⭐⭐ Very Good (95%)</option>
                  <option value={92}>⭐⭐⭐⭐⭐ Good (92%)</option>
                  <option value={90}>⭐⭐⭐⭐⭐ Above Average (90%)</option>
                  <option value={85}>⭐⭐⭐⭐ Average (85%)</option>
                  <option value={80}>⭐⭐⭐⭐ Below Average (80%)</option>
                  <option value={75}>⭐⭐⭐ Needs Improvement (75%)</option>
                </select>
              </div>
              <textarea
                placeholder="Notes"
                value={editingClient.notes}
                onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingClient(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {getClientAvatar(selectedClient.name)}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-gray-600">{selectedClient.company}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm group">
                    <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="mr-2">{selectedClient.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClient.email);
                        toast.success('Email copied to clipboard');
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                      title="Copy email"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedClient.phone}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {formatAddress(selectedClient.address)}
                  </div>
                  {selectedClient.website && (
                    <div className="flex items-center text-sm">
                      <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={selectedClient.website.startsWith('http') ? selectedClient.website : `https://${selectedClient.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedClient.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Project Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.totalProjects}</p>
                    <p className="text-xs text-gray-600">Total Projects</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedClient.completedProjects}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedClient.notes && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedClient.notes}</p>
              </div>
            )}

            {/* Project History */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Projects</h4>
              <div className="space-y-3">
                {selectedClient.totalProjects > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedClient.lastProject}</p>
                        <p className="text-sm text-gray-600">Completed • {new Date(selectedClient.joinDate).toLocaleDateString()}</p>
                      </div>
                      <span className="text-green-600 font-medium">₹{(selectedClient.totalRevenue / selectedClient.totalProjects).toLocaleString()}</span>
                    </div>
                    {selectedClient.totalProjects > 1 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">+ {selectedClient.totalProjects - 1} more projects</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">No projects yet</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <a
                href={`mailto:${selectedClient.email}`}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
              <a
                href={`tel:${selectedClient.phone}`}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditClient(selectedClient)
                  setSelectedClient(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Client
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteClient}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </AdminLayout>
  )
}

export default ClientManagement