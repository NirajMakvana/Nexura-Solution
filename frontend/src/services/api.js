import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    // Read from Zustand persist storage
    const authStorage = localStorage.getItem('nexura-auth')
    let token = localStorage.getItem('token') // Fallback to direct token

    if (authStorage && !token) {
      try {
        const parsed = JSON.parse(authStorage)
        token = parsed.state?.token
      } catch (err) {
        console.error('Could not parse auth store:', err)
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRedirecting = false

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!isRedirecting) {
        isRedirecting = true

        // Unauthorized - clear token
        localStorage.removeItem('nexura-auth')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('currentEmployee')
        localStorage.removeItem('employeeAuthenticated')
        sessionStorage.removeItem('adminAuthenticated')

        // Redirect based on current path
        const path = window.location.pathname

        // Don't redirect if already on login page
        if (!path.includes('/login')) {
          if (path.startsWith('/admin')) {
            window.location.href = '/admin/login?expired=true'
          } else if (path.startsWith('/employee')) {
            window.location.href = '/employee/login?expired=true'
          } else {
            window.location.href = '/'
          }
        }
      }

      // Return a pending promise to prevent the component's catch block from running 
      // and showing "Failed to load data" toast errors before the page unloads
      return new Promise(() => { })
    }
    return Promise.reject(error)
  }
)

export default api
