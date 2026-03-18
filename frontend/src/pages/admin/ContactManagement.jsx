import React, { useState, useEffect } from 'react'
import {
    Mail,
    User,
    Clock,
    Trash2,
    CheckCircle,
    MessageSquare,
    Search,
    Filter,
    ArrowRight,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Inbox,
    RefreshCcw,
    Eye,
    X,
    Send,
    Phone
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import { TableSkeleton } from '../../components/ui/Skeleton'
import ConfirmModal from '../../components/ui/ConfirmModal'

const ContactManagement = () => {
    const [inquiries, setInquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedInquiry, setSelectedInquiry] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })

    useEffect(() => {
        loadInquiries()
    }, [])

    const loadInquiries = async () => {
        try {
            setLoading(true)
            const data = await adminService.getInquiries()
            setInquiries(data)
        } catch (error) {
            console.error('Error loading inquiries:', error)
            toast.error('Failed to load contact inquiries')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminService.updateInquiry(id, { status })
            toast.success(`Inquiry marked as ${status.toLowerCase()}`)
            loadInquiries()
            if (selectedInquiry && selectedInquiry._id === id) {
                setSelectedInquiry({ ...selectedInquiry, status })
            }
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const handleDelete = async () => {
        const id = confirmModal.id
        setConfirmModal({ isOpen: false, id: null })
        try {
            await adminService.deleteInquiry(id)
            toast.success('Inquiry deleted')
            setShowModal(false)
            loadInquiries()
        } catch (error) {
            toast.error('Failed to delete inquiry')
        }
    }

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesFilter = filter === 'all' || inquiry.status === filter
        const matchesSearch =
            inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-700'
            case 'Read': return 'bg-purple-100 text-purple-700'
            case 'Replied': return 'bg-green-100 text-green-700'
            case 'Closed': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const stats = [
        {
            title: 'Total Inquiries',
            value: inquiries.length,
            icon: Inbox,
            color: 'blue'
        },
        {
            title: 'New Messages',
            value: inquiries.filter(i => i.status === 'New').length,
            icon: Mail,
            color: 'yellow'
        },
        {
            title: 'Replied',
            value: inquiries.filter(i => i.status === 'Replied').length,
            icon: CheckCircle,
            color: 'green'
        },
        {
            title: 'Read/Viewed',
            value: inquiries.filter(i => i.status === 'Read').length,
            icon: Eye,
            color: 'purple'
        }
    ]

    return (
    <>
        <AdminLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
                        <p className="text-gray-600 mt-1">Manage and respond to messages from your website visitors</p>
                    </div>
                    <button
                        onClick={loadInquiries}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center w-full md:w-auto">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                                <option value="all">All Status</option>
                                <option value="New">New</option>
                                <option value="Read">Read</option>
                                <option value="Replied">Replied</option>
                                <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8">
                            <TableSkeleton rows={8} />
                        </div>
                    ) : filteredInquiries.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No inquiries found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">When people contact you from the website, their messages will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInquiries.map((inquiry) => (
                                        <tr key={inquiry._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 uppercase">
                                                        {inquiry.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                                                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-sm font-medium text-gray-900 truncate">{inquiry.subject}</div>
                                                <div className="text-sm text-gray-500 truncate">{inquiry.message.substring(0, 50)}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(inquiry.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                                                    {inquiry.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInquiry(inquiry)
                                                            setShowModal(true)
                                                            if (inquiry.status === 'New') {
                                                                handleStatusUpdate(inquiry._id, 'Read')
                                                            }
                                                        }}
                                                        className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, id: inquiry._id })}
                                                        className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Inquiry Modal */}
                {showModal && selectedInquiry && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900">{selectedInquiry.name}</h3>
                                    <p className="text-gray-600">{selectedInquiry.email}</p>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusColor(selectedInquiry.status)}`}>
                                        {selectedInquiry.status}
                                    </span>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm">{selectedInquiry.email}</span>
                                        </div>
                                        {selectedInquiry.phone && (
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm">{selectedInquiry.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Inquiry Info</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Received:</span>
                                            <span className="font-medium">{new Date(selectedInquiry.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                                                {selectedInquiry.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subject & Message */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Subject</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInquiry.subject}</p>
                            </div>
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Message</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                    {selectedInquiry.status !== 'Replied' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedInquiry._id, 'Replied')}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Mark Replied
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setConfirmModal({ isOpen: true, id: selectedInquiry._id })}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                                        onClick={() => {
                                            if (selectedInquiry.status !== 'Replied') {
                                                handleStatusUpdate(selectedInquiry._id, 'Replied')
                                            }
                                        }}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Reply
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
        <ConfirmModal
            isOpen={confirmModal.isOpen}
            title="Delete Inquiry"
            message="Are you sure you want to delete this inquiry? This action cannot be undone."
            confirmText="Delete"
            onConfirm={handleDelete}
            onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        />
        </>
    )
}

export default ContactManagement
