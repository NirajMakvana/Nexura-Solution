import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, FileText, CheckCircle, XCircle, Clock, Filter, Search, Eye, X } from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'
import { SkeletonBox } from '../../components/ui/Skeleton'

const LeaveRequests = () => {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const today = new Date().toISOString().split('T')[0]

  const livePreviewDays = formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
    : null

  useEffect(() => {
    loadLeaves()
  }, [])

  // ESC key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowRequestModal(false)
        setSelectedLeave(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const loadLeaves = async () => {
    try {
      setLoading(true)
      const response = await employeeService.getLeaves()
      setLeaveRequests(response)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitLeave = async (e) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const days = calculateDays(formData.startDate, formData.endDate)
      const formattedType = formData.leaveType.endsWith('Leave') ? formData.leaveType : `${formData.leaveType} Leave`

      await employeeService.requestLeave({
        type: formattedType,
        leaveType: formattedType, // Keep for fallback if needed
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: days,
        reason: formData.reason
      })

      toast.success('Leave request submitted successfully')

      setShowRequestModal(false)
      setFormData({
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: ''
      })
      loadLeaves()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return CheckCircle
      case 'Rejected': return XCircle
      case 'Pending': return Clock
      default: return Clock
    }
  }

  const filteredLeaves = leaveRequests.filter(leave => {
    const matchesStatus = filterStatus === 'all' || leave.status.toLowerCase() === filterStatus
    const leaveTypeStr = leave.type || leave.leaveType || ''
    const matchesSearch = leaveTypeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const calculateDays = (start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  // Calculate leave balance from actual data
  const leaveBalance = {
    casual: { total: 12, used: 0, remaining: 12 },
    sick: { total: 10, used: 0, remaining: 10 },
    annual: { total: 20, used: 0, remaining: 20 }
  }

  leaveRequests.forEach(leave => {
    if (leave.status === 'Approved') {
      const days = calculateDays(leave.startDate, leave.endDate)
      const type = (leave.type || leave.leaveType || '').toLowerCase()
      if (type.includes('casual')) {
        leaveBalance.casual.used += days
        leaveBalance.casual.remaining -= days
      } else if (type.includes('sick')) {
        leaveBalance.sick.used += days
        leaveBalance.sick.remaining -= days
      } else if (type.includes('annual')) {
        leaveBalance.annual.used += days
        leaveBalance.annual.remaining -= days
      }
    }
  })

  const totalPending = leaveRequests.filter(l => l.status === 'Pending').length
  const totalApproved = leaveRequests.filter(l => l.status === 'Approved').length
  const totalRejected = leaveRequests.filter(l => l.status === 'Rejected').length

  return (
    <EmployeeLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Requests</h1>
              <p className="text-gray-600">Request and manage your time off</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Request Leave
            </button>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-2">Casual Leave</p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Used</span>
                <span className="font-semibold text-red-600">{leaveBalance.casual.used} / {leaveBalance.casual.total} days</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(leaveBalance.casual.used / leaveBalance.casual.total) * 100}%` }} />
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">{leaveBalance.casual.remaining} days remaining</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-2">Sick Leave</p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Used</span>
                <span className="font-semibold text-red-600">{leaveBalance.sick.used} / {leaveBalance.sick.total} days</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(leaveBalance.sick.used / leaveBalance.sick.total) * 100}%` }} />
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">{leaveBalance.sick.remaining} days remaining</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-2">Annual Leave</p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Used</span>
                <span className="font-semibold text-red-600">{leaveBalance.annual.used} / {leaveBalance.annual.total} days</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(leaveBalance.annual.used / leaveBalance.annual.total) * 100}%` }} />
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">{leaveBalance.annual.remaining} days remaining</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              <p className="text-xl font-bold text-gray-900">{totalPending}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Approved</p>
              <p className="text-xl font-bold text-gray-900">{totalApproved}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Rejected</p>
              <p className="text-xl font-bold text-gray-900">{totalRejected}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search leave requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Leave History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center">
                      <div className="space-y-3">
                        <SkeletonBox className="h-4 w-3/4 mx-auto" />
                        <SkeletonBox className="h-4 w-1/2 mx-auto" />
                        <SkeletonBox className="h-4 w-2/3 mx-auto" />
                      </div>
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">No leave requests found</td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const StatusIcon = getStatusIcon(leave.status)
                    const days = calculateDays(leave.startDate, leave.endDate)
                    return (
                      <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">{leave.type || leave.leaveType}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[160px] truncate">{leave.reason}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{days} day{days > 1 ? 's' : ''}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLeave(leave)}
                            className="bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Leave Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Leave</h2>
                <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitLeave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.startDate}
                      min={today}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: '' })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate || today}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                {livePreviewDays !== null && livePreviewDays > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 font-medium">
                    📅 Duration: <strong>{livePreviewDays} day{livePreviewDays > 1 ? 's' : ''}</strong>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    rows="4"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide a reason for your leave request..."
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Detail Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Leave Details</h2>
                <button onClick={() => setSelectedLeave(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedLeave.type || selectedLeave.leaveType}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLeave.status)}`}>
                    {selectedLeave.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedLeave.reason}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} day
                      {calculateDays(selectedLeave.startDate, selectedLeave.endDate) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedLeave.approvedBy && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Reviewed by:</span> {selectedLeave.approvedBy.firstName} {selectedLeave.approvedBy.lastName}
                    </p>
                    {selectedLeave.approvedDate && (
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Review Date:</span> {new Date(selectedLeave.approvedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  )
}

export default LeaveRequests
