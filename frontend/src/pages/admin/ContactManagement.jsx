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

const ContactManagement = () => {
    const [inquiries, setInquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedInquiry, setSelectedInquiry] = useState(null)
    const [showModal, setShowModal] = useState(false)

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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return
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
            color: 'bg-blue-100 text-blue-600'
        },
        {
            title: 'New Messages',
            value: inquiries.filter(i => i.status === 'New').length,
            icon: Mail,
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Replied',
            value: inquiries.filter(i => i.status === 'Replied').length,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Read/Viewed',
            value: inquiries.filter(i => i.status === 'Read').length,
            icon: Eye,
            color: 'bg-purple-100 text-purple-600'
        }
    ]

    return (
        <AdminLayout>
            <div className="space-y-8">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
                            <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
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
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 md:flex-none">
                            <Filter className="w-4 h-4 text-gray-400 mr-2" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-transparent text-sm focus:outline-none w-full"
                            >
                                <option value="all">All Status</option>
                                <option value="New">New</option>
                                <option value="Read">Read</option>
                                <option value="Replied">Replied</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
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
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Sender</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Subject</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInquiries.map((inquiry) => (
                                        <tr key={inquiry._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                        {inquiry.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{inquiry.name}</div>
                                                        <div className="text-xs text-gray-500">{inquiry.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{inquiry.subject}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{inquiry.message.substring(0, 40)}...</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(inquiry.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusColor(inquiry.status)}`}>
                                                    {inquiry.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInquiry(inquiry)
                                                            setShowModal(true)
                                                            if (inquiry.status === 'New') {
                                                                handleStatusUpdate(inquiry._id, 'Read')
                                                            }
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(inquiry._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Inquiry Details</h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">From</label>
                                        <p className="font-semibold text-gray-900">{selectedInquiry.name}</p>
                                        <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Received On</label>
                                        <p className="font-semibold text-gray-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(selectedInquiry.status)}`}>
                                            {selectedInquiry.status}
                                        </span>
                                    </div>
                                    {selectedInquiry.phone && (
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                                            <p className="font-semibold text-blue-600 flex items-center">
                                                <Phone className="w-4 h-4 mr-2" />
                                                {selectedInquiry.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Subject</label>
                                    <p className="font-semibold text-gray-900 mb-3">{selectedInquiry.subject}</p>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block border-t pt-3 border-gray-200">Message</label>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedInquiry.message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex space-x-2">
                                        {selectedInquiry.status !== 'Replied' && (
                                            <button
                                                onClick={() => handleStatusUpdate(selectedInquiry._id, 'Replied')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark Replied
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(selectedInquiry._id)}
                                            className="px-4 py-2 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                    <a
                                        href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center shadow-lg shadow-blue-200"
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
    )
}

export default ContactManagement
