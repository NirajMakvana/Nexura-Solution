import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Read token only from Zustand persist storage (single source of truth)
const getToken = () => {
  try {
    const authStorage = localStorage.getItem('nexura-auth')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    }
  } catch {
    // corrupted storage — clear it
    localStorage.removeItem('nexura-auth')
  }
  return null
}

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRedirecting = false

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!isRedirecting) {
        isRedirecting = true

        // Clear all auth storage
        localStorage.removeItem('nexura-auth')
        localStorage.removeItem('currentEmployee')
        localStorage.removeItem('employeeAuthenticated')
        sessionStorage.removeItem('adminAuthenticated')

        const path = window.location.pathname

        if (!path.includes('/login')) {
          const redirectUrl = path.startsWith('/admin')
            ? '/admin/login?expired=true'
            : path.startsWith('/employee')
              ? '/employee/login?expired=true'
              : null

          if (redirectUrl) {
            // Reset flag after navigation so future 401s are handled
            setTimeout(() => { isRedirecting = false }, 3000)
            window.location.href = redirectUrl
          } else {
            isRedirecting = false
          }
        } else {
          isRedirecting = false
        }
      }

      // Return pending promise to suppress toast errors during redirect
      return new Promise(() => { })
    }
    return Promise.reject(error)
  }
)

export default api
