import { useState, useEffect } from 'react'
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  Clock,
  EyeOff,
  Eye,
  X
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import { TableSkeleton } from '../../components/ui/Skeleton'

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReview, setSelectedReview] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadReviews()
  }, []) // Load all reviews once

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowDetailModal(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      // Always fetch all to keep global stats accurate
      const data = await adminService.getReviews()
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reviewId, newStatus) => {
    setActionLoading(true)
    try {
      if (newStatus === 'Approved') {
        await adminService.approveReview(reviewId)
        toast.success('Review approved and published')
      } else if (newStatus === 'Rejected') {
        await adminService.rejectReview(reviewId, { adminNotes: 'Does not meet guidelines' })
        toast.success('Review rejected')
      }
      loadReviews()
    } catch (error) {
      console.error(`Error changing review status to ${newStatus}: `, error)
      toast.error(`Failed to ${newStatus.toLowerCase()} review`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    setActionLoading(true)
    try {
      await adminService.deleteReview(reviewId)
      toast.success('Review deleted')
      loadReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;

    return matchesSearch && matchesStatus;
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              } `}
          />
        ))}
      </div>
    )
  }

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'Pending').length,
    approved: reviews.filter(r => r.status === 'Approved').length,
    rejected: reviews.filter(r => r.status === 'Rejected').length
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
            <p className="text-gray-600 mt-1">Manage and moderate customer reviews</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Reviews', value: stats.total, color: 'blue', icon: MessageSquare },
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

        {/* Reviews List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading review records...</p>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-20 text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold">No records found</p>
              <p className="mt-1">Try adjusting your filters or search terms</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 pt-2">
              {filteredReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{review.email}</p>
                      {(review.company || review.service) && (
                        <p className="text-xs text-gray-400 mt-0.5">{[review.company, review.service].filter(Boolean).join(' • ')}</p>
                      )}
                    </div>
                    <div className="shrink-0">{renderStars(review.rating)}</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed italic line-clamp-3">"{review.content}"</p>
                  </div>

                  <div className="flex justify-between items-center text-sm border-b pb-3">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)} `}>
                      {review.status}
                    </span>
                    <span className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-1">
                    <div className="flex gap-2 w-full">
                      {review.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(review._id, 'Approved')}
                          disabled={actionLoading}
                          className="flex-1 py-1.5 flex justify-center items-center bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {review.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(review._id, 'Rejected')}
                          disabled={actionLoading}
                          className="flex-1 py-1.5 flex justify-center items-center bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={actionLoading}
                      className="p-1.5 flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviewer</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{review.email}</p>
                            {(review.company || review.service) && (
                              <p className="text-xs text-gray-400 mt-0.5">{[review.company, review.service].filter(Boolean).join(' • ')}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={review.content}>{review.content}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${getStatusColor(review.status)} `}>
                              {review.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {review.status !== 'Approved' && (
                              <button
                                onClick={() => handleStatusChange(review._id, 'Approved')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {review.status !== 'Rejected' && (
                              <button
                                onClick={() => handleStatusChange(review._id, 'Rejected')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button
                              onClick={() => handleDelete(review._id)}
                              disabled={actionLoading}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
            </div>
          </>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Review Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedReview.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedReview.email}</p>
                </div>

                {selectedReview.company && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-gray-900">{selectedReview.company}</p>
                  </div>
                )}

                {selectedReview.service && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service</label>
                    <p className="text-gray-900">{selectedReview.service}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <div className="mt-1">{renderStars(selectedReview.rating)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Review</label>
                  <p className="text-gray-900 mt-1 leading-relaxed">{selectedReview.content}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${getStatusColor(selectedReview.status)}`}>
                    {selectedReview.status}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="text-gray-900">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ReviewManagement
