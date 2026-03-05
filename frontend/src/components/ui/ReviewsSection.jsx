import { useState, useEffect } from 'react'
import { Star, Quote, Loader2, MessageSquare } from 'lucide-react'
import { publicService } from '../../services/publicService'
import ReviewForm from './ReviewForm'

const ReviewsSection = ({ limit = 6, showWriteReview = true, service = null }) => {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    loadReviews()
    loadStats()
  }, [service])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const params = { limit }
      if (service) params.service = service

      const data = await publicService.getPublicReviews(params)
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await publicService.getReviewStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleReviewSubmit = () => {
    loadReviews()
    loadStats()
  }

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our satisfied clients
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex justify-center items-center space-x-8 mt-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <Star className="w-8 h-8 text-yellow-400 fill-current" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {stats.totalReviews}+
                </div>
                <p className="text-sm text-gray-600 mt-1">Happy Clients</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-blue-600 opacity-20" />
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed line-clamp-4">
                  {review.content}
                </p>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      {review.company && (
                        <p className="text-sm text-gray-600">{review.company}</p>
                      )}
                    </div>
                    {review.service && (
                      <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {review.service}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Write Review Button */}
        {showWriteReview && (
          <div className="text-center">
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-nexura inline-flex items-center"
            >
              <Star className="w-5 h-5 mr-2" />
              Write a Review
            </button>
          </div>
        )}

        {/* Review Form Modal */}
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </section>
  )
}

export default ReviewsSection
