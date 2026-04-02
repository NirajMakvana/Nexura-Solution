import api from './api'
import { useAuthStore } from '../store/authStore'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    const { token, ...user } = response.data
    // Persist only via Zustand store (single source of truth)
    useAuthStore.getState().login(token, user)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    const { token, ...user } = response.data
    useAuthStore.getState().login(token, user)
    return response.data
  },

  async logout() {
    // Clear all legacy keys + Zustand store
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentEmployee')
    localStorage.removeItem('employeeAuthenticated')
    sessionStorage.removeItem('adminAuthenticated')
    useAuthStore.getState().logout()
  },

  getCurrentUser() {
    return useAuthStore.getState().user
  },

  getToken() {
    return useAuthStore.getState().token
  },

  isAuthenticated() {
    return useAuthStore.getState().isAuthenticated
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
