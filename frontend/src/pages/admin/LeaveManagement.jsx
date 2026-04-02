import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import { TableSkeleton, CardSkeleton } from '../../components/ui/Skeleton'
import { exportToCSV } from '../../utils/csvExport'
import { Avatar } from '../../components/ui/Avatar'
import {
    Calendar,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    User,
    AlertCircle,
    Eye,
    X,
    Download
} from 'lucide-react'

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLeave, setSelectedLeave] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectingLeave, setRejectingLeave] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [processingId, setProcessingId] = useState(null)

    useEffect(() => {
        fetchLeaves()
    }, [filterStatus])

    const fetchLeaves = async () => {
        try {
            setLoading(true)
            const params = filterStatus !== 'all' ? { status: filterStatus } : {}
            const data = await adminService.getLeaves(params)
            setLeaves(data)
        } catch (error) {
            toast.error('Failed to fetch leave requests')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (leaveId) => {
        try {
            setProcessingId(leaveId)
            await adminService.approveLeave(leaveId)
            toast.success('Leave request approved!')
            fetchLeaves()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve leave')
        } finally {
            setProcessingId(null)
        }
    }

    const openRejectModal = (leave) => {
        setRejectingLeave(leave)
        setRejectionReason('')
        setShowRejectModal(true)
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }
        try {
            setProcessingId(rejectingLeave._id)
            await adminService.rejectLeave(rejectingLeave._id, rejectionReason)
            toast.success('Leave request rejected')
            setShowRejectModal(false)
            setRejectingLeave(null)
            fetchLeaves()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject leave')
        } finally {
            setProcessingId(null)
        }
    }

    const filteredLeaves = leaves.filter(leave => {
        const employeeName = `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.toLowerCase()
        return employeeName.includes(searchTerm.toLowerCase()) ||
            leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const handleExport = () => {
        const headers = [
            { key: 'employeeName', label: 'Employee' },
            { key: 'leaveType', label: 'Type' },
            { key: 'startDate', label: 'Start Date' },
            { key: 'endDate', label: 'End Date' },
            { key: 'days', label: 'Days' },
            { key: 'status', label: 'Status' },
            { key: 'reason', label: 'Reason' }
        ]

        const dataToExport = filteredLeaves.map(leave => ({
            ...leave,
            employeeName: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`,
            startDate: new Date(leave.startDate).toLocaleDateString(),
            endDate: new Date(leave.endDate).toLocaleDateString()
        }))

        exportToCSV(dataToExport, headers, 'Leave_Records.csv')
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>
            case 'Rejected':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" />Rejected</span>
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center w-fit"><Clock className="w-3 h-3 mr-1" />Pending</span>
        }
    }

    const stats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
    }

    return (
        <AdminLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                        <p className="text-gray-600 mt-1">Review and manage all employee leave requests</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Requests', value: stats.total, color: 'blue', icon: Calendar },
                        { label: 'Pending', value: stats.pending, color: 'yellow', icon: Clock },
                        { label: 'Approved', value: stats.approved, color: 'green', icon: CheckCircle },
                        { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircle },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-6">
                            <TableSkeleton columns={7} rows={6} withContainer={false} />
                        </div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="px-6 py-20 text-center text-gray-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-bold">No records found</p>
                            <p className="mt-1">Try adjusting your filters or search terms</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4 bg-gray-50/50">
                                {filteredLeaves.map((leave) => {
                                    const startDate = new Date(leave.startDate)
                                    const endDate = new Date(leave.endDate)
                                    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                                    return (
                                        <div key={leave._id} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar
                                                        src={leave.employee?.profileImage}
                                                        firstName={leave.employee?.firstName}
                                                        lastName={leave.employee?.lastName}
                                                        size="md"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {leave.employee?.firstName} {leave.employee?.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">ID: {leave.employee?.employeeId || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 ml-2">{getStatusBadge(leave.status)}</div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                                                <div>
                                                    <span className="text-gray-500 text-xs block mb-1 uppercase font-medium">Type</span>
                                                    <div className="text-gray-900 font-medium">{leave.leaveType || leave.type || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 text-xs block mb-1 uppercase font-medium">Duration</span>
                                                    <div className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block font-semibold">
                                                        {days} day{days > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-500 text-xs block mb-1 uppercase font-medium">Date Range</span>
                                                    <div className="text-gray-900 text-sm flex items-center">
                                                        {startDate.toLocaleDateString()} <span className="mx-2 text-gray-400">→</span> {endDate.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => { setSelectedLeave(leave); setShowDetailModal(true) }}
                                                    className={`flex items-center justify-center py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors ${leave.status === 'Pending' ? 'w-1/3' : 'w-full'}`}
                                                >
                                                    <Eye className="w-4 h-4 mr-1.5" /> View
                                                </button>
                                                {leave.status === 'Pending' && (
                                                    <div className="flex w-2/3 gap-2">
                                                        <button
                                                            onClick={() => handleApprove(leave._id)}
                                                            disabled={processingId === leave._id}
                                                            className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(leave)}
                                                            disabled={processingId === leave._id}
                                                            className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLeaves.map((leave) => {
                                            const startDate = new Date(leave.startDate)
                                            const endDate = new Date(leave.endDate)
                                            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                                            return (
                                                <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Avatar
                                                                src={leave.employee?.profileImage}
                                                                firstName={leave.employee?.firstName}
                                                                lastName={leave.employee?.lastName}
                                                                size="sm"
                                                            />
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {leave.employee?.firstName} {leave.employee?.lastName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{leave.employee?.employeeId || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{leave.leaveType || leave.type || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{startDate.toLocaleDateString()}</div>
                                                        <div className="text-sm text-gray-500">{endDate.toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{days} day{days > 1 ? 's' : ''}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {leave.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{new Date(leave.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => { setSelectedLeave(leave); setShowDetailModal(true) }}
                                                                className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {leave.status === 'Pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(leave._id)}
                                                                        disabled={processingId === leave._id}
                                                                        className="bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 text-xs font-medium"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openRejectModal(leave)}
                                                                        disabled={processingId === leave._id}
                                                                        className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 text-xs font-medium"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Detail Modal */}
                {showDetailModal && selectedLeave && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
                                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {selectedLeave.employee?.firstName?.[0]}{selectedLeave.employee?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}</h3>
                                        <p className="text-sm text-gray-500">{selectedLeave.employee?.employeeId}</p>
                                    </div>
                                    <div className="ml-auto">{getStatusBadge(selectedLeave.status)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Leave Type</p>
                                        <p className="font-semibold text-gray-900">{selectedLeave.leaveType || selectedLeave.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Applied On</p>
                                        <p className="font-semibold text-gray-900">{new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">From</p>
                                        <p className="font-semibold text-gray-900">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">To</p>
                                        <p className="font-semibold text-gray-900">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {selectedLeave.reason && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-2">Reason</p>
                                        <p className="text-gray-700 bg-gray-50 rounded-xl p-4 text-sm leading-relaxed">{selectedLeave.reason}</p>
                                    </div>
                                )}
                                {selectedLeave.rejectionReason && (
                                    <div>
                                        <p className="text-xs text-red-500 uppercase font-medium mb-2">Rejection Reason</p>
                                        <p className="text-red-700 bg-red-50 rounded-xl p-4 text-sm leading-relaxed">{selectedLeave.rejectionReason}</p>
                                    </div>
                                )}
                                {selectedLeave.status === 'Pending' && (
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => { handleApprove(selectedLeave._id); setShowDetailModal(false) }}
                                            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => { setShowDetailModal(false); openRejectModal(selectedLeave) }}
                                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && rejectingLeave && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Reject Leave Request</h2>
                                <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-700">
                                        You are rejecting {rejectingLeave.employee?.firstName}'s {rejectingLeave.leaveType || rejectingLeave.type} request.
                                    </p>
                                </div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    placeholder="Please provide a clear reason for rejection..."
                                />
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => setShowRejectModal(false)}
                                        className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={processingId === rejectingLeave._id}
                                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {processingId === rejectingLeave._id ? 'Rejecting...' : 'Confirm Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default LeaveManagement
