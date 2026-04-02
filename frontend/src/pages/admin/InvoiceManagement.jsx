import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { toast } from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import { exportToCSV } from '../../utils/csvExport'
import html2pdf from 'html2pdf.js'
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  X,
  Edit
} from 'lucide-react'
import Pagination from '../../components/ui/Pagination'
import ConfirmModal from '../../components/ui/ConfirmModal'

const ITEMS_PER_PAGE = 10

const InvoiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    totalInvoices: 0
  })

  const [newInvoice, setNewInvoice] = useState({
    client: '',
    project: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    taxPercentage: 18,
    discount: 0,
    notes: '',
    terms: 'Payment due within 30 days'
  })

  const [editInvoice, setEditInvoice] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [invoicesData, clientsData, projectsData, statsData] = await Promise.all([
        adminService.getInvoices().catch(() => []),
        adminService.getClients().catch(() => []),
        adminService.getProjects().catch(() => []),
        adminService.getInvoiceStats().catch(() => ({ totalAmount: 0, paidAmount: 0, pendingAmount: 0 }))
      ])
      setInvoices(invoicesData || [])
      setClients(clientsData || [])
      setProjects(projectsData || [])
      setStats(statsData || {})
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1) }
  const handleFilterStatus = (val) => { setFilterStatus(val); setCurrentPage(1) }

  const handleExport = () => {
    const headers = [
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'clientName', label: 'Client' },
      { key: 'date', label: 'Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'amount', label: 'Amount (₹)' },
      { key: 'status', label: 'Status' }
    ]

    const dataToExport = filteredInvoices.map(inv => ({
      ...inv,
      clientName: inv.client?.name || 'N/A',
      date: new Date(inv.date).toLocaleDateString(),
      dueDate: new Date(inv.dueDate).toLocaleDateString()
    }))

    exportToCSV(dataToExport, headers, 'Invoices_Export.csv')
  }

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    })
  }

  const handleRemoveItem = (index) => {
    const items = newInvoice.items.filter((_, i) => i !== index)
    setNewInvoice({ ...newInvoice, items })
  }

  const handleItemChange = (index, field, value) => {
    const items = [...newInvoice.items]
    items[index][field] = value

    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate
    }

    setNewInvoice({ ...newInvoice, items })
  }

  const handleCreateInvoice = async () => {
    try {
      if (!newInvoice.client || !newInvoice.dueDate || newInvoice.items.length === 0) {
        toast.error('Please fill all required fields')
        return
      }

      // Calculate subtotal
      const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0)

      const invoiceData = {
        ...newInvoice,
        issueDate: new Date(),
        subtotal
      }

      await adminService.createInvoice(invoiceData)
      toast.success('Invoice created successfully')
      setShowAddModal(false)
      setNewInvoice({
        client: '',
        project: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        taxPercentage: 18,
        discount: 0,
        notes: '',
        terms: 'Payment due within 30 days'
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to create invoice')
      console.error(error)
    }
  }

  const handleUpdateInvoice = async () => {
    try {
      await adminService.updateInvoice(editInvoice._id, editInvoice)
      toast.success('Invoice updated successfully')
      setShowEditModal(false)
      setEditInvoice(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update invoice')
      console.error(error)
    }
  }

  const handleDeleteInvoice = async () => {
    const id = confirmModal.id
    setConfirmModal({ isOpen: false, id: null })
    try {
      await adminService.deleteInvoice(id)
      toast.success('Invoice deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete invoice')
      console.error(error)
    }
  }

  const updateInvoiceStatus = async (id, newStatus) => {
    try {
      await adminService.updateInvoiceStatus(id, newStatus)
      toast.success(`Invoice marked as ${newStatus}`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    }
  }

  const handleExportReport = () => {
    const csvData = [
      ['Invoice Number', 'Client', 'Project', 'Subtotal', 'Tax', 'Total', 'Status', 'Issue Date', 'Due Date'],
      ...filteredInvoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.client?.name || 'N/A',
        invoice.project?.name || 'N/A',
        invoice.subtotal,
        invoice.tax,
        invoice.total,
        invoice.status,
        new Date(invoice.issueDate).toLocaleDateString(),
        new Date(invoice.dueDate).toLocaleDateString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  const handleDownloadPDF = () => {
    if (!selectedInvoice) return

    const element = document.getElementById('invoice-content')
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Invoice_${selectedInvoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    toast.loading('Generating PDF...', { id: 'pdf-toast' })
    html2pdf().set(opt).from(element).save()
      .then(() => {
        toast.dismiss('pdf-toast')
        toast.success('PDF generated successfully')
      })
      .catch((error) => {
        console.error('PDF error:', error)
        toast.dismiss('pdf-toast')
        toast.error('Failed to generate PDF')
      })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'overdue': return <AlertCircle className="w-4 h-4" />
      case 'draft': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-1">Create, track and manage your invoices</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueInvoices || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
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
                  placeholder="Search invoices..."
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-xl font-bold">No records found</p>
                      <p className="mt-1">Try adjusting your filters or search terms</p>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                            <div className="text-sm text-gray-500">{invoice.project?.name || 'No project'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{invoice.client?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{invoice.client?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">₹{invoice.total?.toLocaleString() || 0}</div>
                        <div className="text-sm text-gray-500">Subtotal: ₹{invoice.subtotal?.toLocaleString() || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditInvoice(invoice)
                              setShowEditModal(true)
                            }}
                            className="bg-purple-50 text-purple-600 p-2 rounded-lg hover:bg-purple-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice._id, 'paid')}
                              className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, id: invoice._id })}
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredInvoices.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">Create New Invoice</h3>

            <div className="space-y-4">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                <select
                  value={newInvoice.client}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.company || client.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project (Optional)</label>
                <select
                  value={newInvoice.project}
                  onChange={(e) => setNewInvoice({ ...newInvoice, project: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Invoice Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.amount}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        {newInvoice.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                  <input
                    type="number"
                    value={newInvoice.taxPercentage}
                    onChange={(e) => setNewInvoice({ ...newInvoice, taxPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.discount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <input
                  type="text"
                  value={newInvoice.terms}
                  onChange={(e) => setNewInvoice({ ...newInvoice, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{newInvoice.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({newInvoice.taxPercentage}%):</span>
                    <span>₹{((newInvoice.items.reduce((sum, item) => sum + item.amount, 0) * newInvoice.taxPercentage) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-₹{newInvoice.discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{(
                      newInvoice.items.reduce((sum, item) => sum + item.amount, 0) +
                      (newInvoice.items.reduce((sum, item) => sum + item.amount, 0) * newInvoice.taxPercentage) / 100 -
                      newInvoice.discount
                    ).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewInvoice({
                    client: '',
                    project: '',
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
                    taxPercentage: 18,
                    discount: 0,
                    notes: '',
                    terms: 'Payment due within 30 days'
                  })
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* The actual content to turn into PDF */}
            <div id="invoice-content" className="p-4 bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-gray-600">{selectedInvoice.project?.name || 'No project'}</p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedInvoice.client?.name || 'N/A'}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedInvoice.client?.email || 'N/A'}</p>
                    <p><span className="text-gray-600">Company:</span> {selectedInvoice.client?.company || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Invoice Details</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Issue Date:</span> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    {selectedInvoice.paidDate && (
                      <p><span className="text-gray-600">Paid Date:</span> {new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                    )}
                    <p><span className="text-gray-600">Status:</span> <span className="capitalize">{selectedInvoice.status}</span></p>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rate</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-right">₹{item.rate.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Amount Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({selectedInvoice.taxPercentage}%):</span>
                    <span>₹{selectedInvoice.tax?.toLocaleString() || 0}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{selectedInvoice.discount?.toLocaleString() || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{selectedInvoice.total?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedInvoice.notes}</p>
                </div>
              )}

              {selectedInvoice.terms && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Terms</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedInvoice.terms}</p>
                </div>
              )}
            </div> {/* End of PDF Content #invoice-content */}

            <div className="flex justify-end space-x-3 mt-4 border-t pt-4">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Invoice Modal */}
      {showEditModal && editInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Invoice — {editInvoice.invoiceNumber}</h3>
              <button onClick={() => { setShowEditModal(false); setEditInvoice(null) }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editInvoice.status}
                  onChange={(e) => setEditInvoice({ ...editInvoice, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={editInvoice.dueDate ? new Date(editInvoice.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tax & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                  <input
                    type="number"
                    value={editInvoice.taxPercentage ?? 18}
                    onChange={(e) => setEditInvoice({ ...editInvoice, taxPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0" max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
                  <input
                    type="number"
                    value={editInvoice.discount ?? 0}
                    onChange={(e) => setEditInvoice({ ...editInvoice, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editInvoice.notes || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <input
                  type="text"
                  value={editInvoice.terms || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditInvoice(null) }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteInvoice}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </AdminLayout>
  )
}

export default InvoiceManagement
