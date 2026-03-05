import api from './api'

export const publicService = {
  // Contact Form
  async submitContact(data) {
    const response = await api.post('/contact', data)
    return response.data
  },

  // Get public projects (for portfolio)
  async getPublicProjects() {
    const response = await api.get('/projects/public')
    return response.data
  },

  // Get single public project by id
  async getPublicProject(id) {
    const response = await api.get(`/projects/public/${id}`)
    return response.data
  },

  // Get single blog post
  async getBlogPost(id) {
    const response = await api.get(`/blogs/${id}`)
    return response.data
  },

  // Get team members (employees)
  async getTeamMembers() {
    const response = await api.get('/users/team')
    return response.data
  },

  // Get company stats
  async getCompanyStats() {
    const response = await api.get('/users/stats')
    return response.data
  },

  // Get blog posts (public)
  async getBlogPosts() {
    const response = await api.get('/blog')
    return response.data
  },

  // Get job openings
  async getJobOpenings() {
    const response = await api.get('/jobs')
    return response.data
  },

  // Get single job
  async getJob(id) {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

  // Submit job application
  async submitJobApplication(data) {
    const response = await api.post('/jobs/apply', data)
    return response.data
  },

  // Reviews
  async getPublicReviews(params = {}) {
    const response = await api.get('/reviews/public', { params })
    return response.data
  },

  async getReviewStats() {
    const response = await api.get('/reviews/stats')
    return response.data
  },

  async submitReview(reviewData) {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },

  // Newsletter Subscription
  async subscribeToNewsletter(email) {
    const response = await api.post('/subscribers', { email })
    return response.data
  }
}
