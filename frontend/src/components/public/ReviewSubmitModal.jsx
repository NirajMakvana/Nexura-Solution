import { useState } from 'react'
import { X, Star, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ReviewSubmitModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        service: 'Full Stack Development',
        rating: 5,
        content: ''
    })

    if (!isOpen) return null

    const SERVICES = [
        'UI/UX Design',
        'Full Stack Development',
        'Graphics Design',
        'Cards & Banners',
        'Web Development',
        'Brand Identity',
        'Other'
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.content) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setLoading(true)
            await api.post('/reviews', formData)
            toast.success('Thank you! Your review has been submitted for approval.')
            onClose()
            // Reset form
            setFormData({
                name: '',
                email: '',
                company: '',
                service: 'Full Stack Development',
                rating: 5,
                content: ''
            })
        } catch (error) {
            console.error('Error submitting review:', error)
            toast.error(error.response?.data?.message || 'Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    const renderStars = () => {
        return (
            <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                    >
                        <Star
                            className={`w-8 h-8 ${star <= formData.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 hover:text-yellow-300'
                                } transition-colors duration-200`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Rate Your Experience</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm font-medium text-gray-600 mb-3">How would you rate our service?</p>
                            {renderStars()}
                            <p className="text-xs text-gray-400 mt-2">{formData.rating} out of 5 stars</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    placeholder="Acme Corp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Provided</label>
                                <select
                                    value={formData.service}
                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                                >
                                    {SERVICES.map(service => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Review <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows="4"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                                placeholder="Tell us about your experience..."
                            ></textarea>
                        </div>

                        <div className="pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 flex justify-center items-center transition-all shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-3">
                                Your review will be published after approval by our team.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ReviewSubmitModal
