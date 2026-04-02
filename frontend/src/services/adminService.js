import api from './api'

export const adminService = {
  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        todayAttendance: 0,
        pendingLeaves: 0,
        totalProjects: 0,
        activeProjects: 0,
        totalClients: 0,
        completedProjects: 0
      }
    }
  },

  // Employee Management
  async getEmployees() {
    const response = await api.get('/users')
    return response.data
  },

  async getEmployee(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async createEmployee(data) {
    const response = await api.post('/users', data)
    return response.data
  },

  async updateEmployee(id, data) {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  async deleteEmployee(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Attendance Management
  async getAttendance(params = {}) {
    const response = await api.get('/attendance', { params })
    // Backend returns paginated { data, total } — unwrap to array
    return Array.isArray(response.data) ? response.data : (response.data?.data || [])
  },

  // Leave Management
  async getLeaves(params = {}) {
    const response = await api.get('/leaves', { params })
    // Backend returns paginated { data, total } — unwrap to array
    return Array.isArray(response.data) ? response.data : (response.data?.data || [])
  },

  async approveLeave(leaveId) {
    const response = await api.put(`/leaves/${leaveId}/approve`)
    return response.data
  },

  async rejectLeave(leaveId, reason) {
    const response = await api.put(`/leaves/${leaveId}/reject`, { rejectionReason: reason })
    return response.data
  },

  // Payroll Management
  async getPayslips(params = {}) {
    const response = await api.get('/payroll', { params })
    // Backend returns paginated { data, total } — unwrap to array
    return Array.isArray(response.data) ? response.data : (response.data?.data || [])
  },

  async createPayslip(data) {
    const response = await api.post('/payroll', data)
    return response.data
  },

  async updatePayslip(id, data) {
    const response = await api.put(`/payroll/${id}`, data)
    return response.data
  },

  async deletePayslip(id) {
    const response = await api.delete(`/payroll/${id}`)
    return response.data
  },

  // Project Management
  async getProjects() {
    const response = await api.get('/projects')
    // Backend returns paginated { data, total } — unwrap to array
    return Array.isArray(response.data) ? response.data : (response.data?.data || [])
  },

  async getProject(id) {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async createProject(data) {
    const response = await api.post('/projects', data)
    return response.data
  },

  async updateProject(id, data) {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },

  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },

  // Client Management
  async getClients() {
    const response = await api.get('/clients')
    return response.data
  },

  async getClient(id) {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  async createClient(data) {
    const response = await api.post('/clients', data)
    return response.data
  },

  async updateClient(id, data) {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  },

  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`)
    return response.data
  },

  // Invoice Management
  async getInvoices() {
    const response = await api.get('/invoices')
    return response.data
  },

  async getInvoiceStats() {
    const response = await api.get('/invoices/stats')
    return response.data
  },

  async getInvoice(id) {
    const response = await api.get(`/invoices/${id}`)
    return response.data
  },

  async createInvoice(data) {
    const response = await api.post('/invoices', data)
    return response.data
  },

  async updateInvoice(id, data) {
    const response = await api.put(`/invoices/${id}`, data)
    return response.data
  },

  async updateInvoiceStatus(id, status) {
    const response = await api.put(`/invoices/${id}/status`, { status })
    return response.data
  },

  async deleteInvoice(id) {
    const response = await api.delete(`/invoices/${id}`)
    return response.data
  },

  // Task Management
  async getTasks() {
    const response = await api.get('/tasks', {
      params: { _t: Date.now() } // Cache busting
    })
    // Backend returns paginated { data, total } — unwrap to array
    return Array.isArray(response.data) ? response.data : (response.data?.data || [])
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`, {
      params: { _t: Date.now() } // Cache busting
    })
    return response.data
  },

  async createTask(data) {
    const response = await api.post('/tasks', data)
    return response.data
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },

  // Analytics
  async getAnalytics(timeRange = 'year') {
    try {
      const response = await api.get('/dashboard/analytics')
      return response.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  },

  // Review Management
  async getReviews(params = {}) {
    const response = await api.get('/reviews', { params })
    return response.data
  },

  async getReview(id) {
    const response = await api.get(`/reviews/${id}`)
    return response.data
  },

  async approveReview(reviewId) {
    const response = await api.put(`/reviews/${reviewId}/approve`)
    return response.data
  },

  async rejectReview(reviewId, data) {
    const response = await api.put(`/reviews/${reviewId}/reject`, data)
    return response.data
  },

  async unpublishReview(reviewId) {
    const response = await api.put(`/reviews/${reviewId}/unpublish`)
    return response.data
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
  },

  // Blog Management (Admin)
  async getAdminBlogs() {
    const response = await api.get('/blogs/admin')
    return response.data
  },

  async createBlog(data) {
    const response = await api.post('/blogs', data)
    return response.data
  },

  async updateBlog(id, data) {
    const response = await api.put(`/blogs/${id}`, data)
    return response.data
  },

  async toggleBlogPublish(id) {
    const response = await api.put(`/blogs/${id}/publish`)
    return response.data
  },

  async deleteBlog(id) {
    const response = await api.delete(`/blogs/${id}`)
    return response.data
  },

  // Dashboard Activities
  async getDashboardActivities() {
    const response = await api.get('/dashboard/activity')
    return response.data
  },

  // Contact Inquiry Management
  async getInquiries(params = {}) {
    const response = await api.get('/contact', { params })
    return response.data
  },

  async getInquiry(id) {
    const response = await api.get(`/contact/${id}`)
    return response.data
  },

  async updateInquiry(id, data) {
    const response = await api.put(`/contact/${id}`, data)
    return response.data
  },

  async deleteInquiry(id) {
    const response = await api.delete(`/contact/${id}`)
    return response.data
  },

  // Subscriber Management
  async getSubscribers() {
    const response = await api.get('/subscribers')
    return response.data
  },

  async deleteSubscriber(id) {
    const response = await api.delete(`/subscribers/${id}`)
    return response.data
  },

  // Job Management
  async getAdminJobs() {
    const response = await api.get('/jobs/admin/all')
    return response.data
  },

  async createJob(data) {
    const response = await api.post('/jobs', data)
    return response.data
  },

  async updateJob(id, data) {
    const response = await api.put(`/jobs/${id}`, data)
    return response.data
  },

  async deleteJob(id) {
    const response = await api.delete(`/jobs/${id}`)
    return response.data
  },

  // Job Application Management
  async getJobApplications() {
    const response = await api.get('/jobs/applications/all')
    return response.data
  },

  async updateJobApplicationStatus(id, data) {
    const response = await api.put(`/jobs/applications/${id}`, data)
    return response.data
  }
}
