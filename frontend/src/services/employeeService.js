import api from './api'

export const employeeService = {
  // Profile
  async getMyProfile() {
    const response = await api.get('/employees/profile')
    return response.data
  },

  async getProfile() {
    const response = await api.get('/employees/profile')
    return response.data
  },

  async updateProfile(data) {
    const response = await api.put('/auth/me', data)
    return response.data
  },

  // Attendance
  async getAttendance(month, year) {
    const response = await api.get('/attendance/my-records', {
      params: { month, year }
    })
    return response.data
  },

  async clockIn(location = 'Office') {
    const user = JSON.parse(localStorage.getItem('user'))
    const response = await api.post('/attendance/clock-in', {
      employee: user._id,
      location
    })
    return response.data
  },

  async clockOut(attendanceId) {
    const response = await api.put(`/attendance/clock-out/${attendanceId}`)
    return response.data
  },

  async getAttendanceStats(employeeId, month, year) {
    const response = await api.get(`/attendance/stats/${employeeId}`, {
      params: { month, year }
    })
    return response.data
  },

  // Leaves
  async getLeaves() {
    const user = JSON.parse(localStorage.getItem('user'))
    const response = await api.get('/leaves', {
      params: { employee: user._id }
    })
    return response.data
  },

  async requestLeave(leaveData) {
    const user = JSON.parse(localStorage.getItem('user'))
    const response = await api.post('/leaves', {
      ...leaveData,
      employee: user._id
    })
    return response.data
  },

  // Payslips
  async getPayslips(year) {
    const user = JSON.parse(localStorage.getItem('user'))
    const response = await api.get(`/payroll/employee/${user._id}`, {
      params: { year }
    })
    return response.data
  },

  async getPayslip(id) {
    const response = await api.get(`/payroll/${id}`)
    return response.data
  },

  // Tasks
  async getMyTasks() {
    const response = await api.get('/tasks/my-tasks')
    return response.data
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.put(`/tasks/${taskId}`, { status })
    return response.data
  },

  async updateTask(taskId, data) {
    const response = await api.put(`/tasks/${taskId}`, data)
    return response.data
  },

  // Team Members
  async getTeamMembers() {
    const response = await api.get('/employees/team')
    return response.data
  },

  // Projects
  async getMyProjects() {
    const response = await api.get('/projects/my-projects')
    return response.data
  },

  // Employee Stats
  async getMyStats() {
    const response = await api.get('/employees/stats')
    return response.data
  }
}
