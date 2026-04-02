import { useState, useEffect } from 'react'
import {
  Code,
  GitBranch,
  GitPullRequest,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  FileCode,
  User,
  Calendar,
  Filter,
  Search,
  X
} from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'
import { SkeletonBox } from '../../components/ui/Skeleton'

const CodeReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewDecision, setReviewDecision] = useState('')

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      // Mock data for code reviews
      const mockReviews = [
        {
          _id: '1',
          title: 'Feature: User Authentication Module',
          description: 'Implemented JWT-based authentication with refresh tokens',
          author: { firstName: 'Raj', lastName: 'Patel' },
          branch: 'feature/auth-module',
          pullRequest: '#PR-123',
          filesChanged: 8,
          linesAdded: 245,
          linesRemoved: 32,
          status: 'Pending',
          priority: 'High',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          project: 'E-Commerce Platform',
          comments: []
        },
        {
          _id: '2',
          title: 'Fix: Payment Gateway Integration',
          description: 'Fixed timeout issues in payment processing',
          author: { firstName: 'Priya', lastName: 'Shah' },
          branch: 'bugfix/payment-timeout',
          pullRequest: '#PR-124',
          filesChanged: 3,
          linesAdded: 67,
          linesRemoved: 45,
          status: 'Pending',
          priority: 'Critical',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          project: 'E-Commerce Platform',
          comments: []
        },
        {
          _id: '3',
          title: 'Refactor: Database Query Optimization',
          description: 'Optimized slow queries and added proper indexing',
          author: { firstName: 'Amit', lastName: 'Kumar' },
          branch: 'refactor/db-optimization',
          pullRequest: '#PR-125',
          filesChanged: 12,
          linesAdded: 156,
          linesRemoved: 189,
          status: 'Approved',
          priority: 'Medium',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          project: 'CRM System',
          comments: [
            { author: 'You', text: 'Great optimization! LGTM', createdAt: new Date() }
          ]
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast.error('Failed to load code reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async (reviewId, decision) => {
    if (!reviewComment.trim()) {
      toast.error('Please add a comment')
      return
    }

    try {
      // Mock review submission
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { 
              ...review, 
              status: decision === 'approve' ? 'Approved' : 'Changes Requested',
              comments: [...review.comments, { 
                author: 'You', 
                text: reviewComment, 
                createdAt: new Date() 
              }]
            }
          : review
      ))
      
      toast.success(`Review ${decision === 'approve' ? 'approved' : 'changes requested'} successfully`)
      setSelectedReview(null)
      setReviewComment('')
      setReviewDecision('')
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Changes Requested': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50'
      case 'High': return 'text-orange-600 bg-orange-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || review.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'Pending').length,
    approved: reviews.filter(r => r.status === 'Approved').length,
    changesRequested: reviews.filter(r => r.status === 'Changes Requested').length
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Code Reviews</h1>
            <p className="text-gray-600 mt-1">Review pull requests and provide feedback</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <GitPullRequest className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Changes Requested</p>
                <p className="text-2xl font-bold text-gray-900">{stats.changesRequested}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Changes Requested">Changes Requested</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="space-y-3 max-w-md mx-auto">
              <SkeletonBox className="h-4 w-3/4 mx-auto" />
              <SkeletonBox className="h-4 w-2/3 mx-auto" />
              <SkeletonBox className="h-4 w-5/6 mx-auto" />
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Code Reviews</h3>
            <p className="text-gray-500">No code reviews match your current filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(review.priority)}`}>
                        {review.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{review.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{review.author.firstName} {review.author.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{review.branch}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitPullRequest className="w-4 h-4" />
                        <span>{review.pullRequest}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{getTimeAgo(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <FileCode className="w-4 h-4" />
                      {review.filesChanged} files
                    </span>
                    <span className="text-green-600">+{review.linesAdded}</span>
                    <span className="text-red-600">-{review.linesRemoved}</span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      {review.comments.length} comments
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReview(review)}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedReview.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedReview.status)}`}>
                        {selectedReview.status}
                      </span>
                      <span className="text-sm text-gray-600">{selectedReview.pullRequest}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedReview.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Author</h4>
                    <p className="text-gray-900">{selectedReview.author.firstName} {selectedReview.author.lastName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Branch</h4>
                    <p className="text-gray-900">{selectedReview.branch}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Project</h4>
                    <p className="text-gray-900">{selectedReview.project}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Changes</h4>
                    <p className="text-gray-900">
                      {selectedReview.filesChanged} files, 
                      <span className="text-green-600"> +{selectedReview.linesAdded}</span>,
                      <span className="text-red-600"> -{selectedReview.linesRemoved}</span>
                    </p>
                  </div>
                </div>

                {selectedReview.comments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
                    <div className="space-y-3">
                      {selectedReview.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReview.status === 'Pending' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Add Your Review</h3>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add your review comments..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>

              {selectedReview.status === 'Pending' && (
                <div className="p-6 border-t bg-gray-50 flex gap-3">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReviewSubmit(selectedReview._id, 'changes')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleReviewSubmit(selectedReview._id, 'approve')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  )
}

export default CodeReviews
