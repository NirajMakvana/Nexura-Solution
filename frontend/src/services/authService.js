import api from './api'
import { useAuthStore } from '../store/authStore'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    const { token, ...user } = response.data

    // Store in localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    // Update auth store
    const { login } = useAuthStore.getState()
    login(token, user)

    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    const { token, ...user } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentEmployee')
    localStorage.removeItem('employeeAuthenticated')
    sessionStorage.removeItem('adminAuthenticated')

    // Update auth store
    const { logout } = useAuthStore.getState()
    logout()
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  getToken() {
    return localStorage.getItem('token')
  },

  isAuthenticated() {
    return !!this.getToken()
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
