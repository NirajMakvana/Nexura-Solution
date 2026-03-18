import dotenv from 'dotenv'
dotenv.config() // Move to top to ensure variables are available for all imports

import express from 'express'
import cors from 'cors'
import path from 'path'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'

// Route imports
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import attendanceRoutes from './routes/attendance.js'
import payrollRoutes from './routes/payroll.js'
import leavesRoutes from './routes/leaves.js'
import tasksRoutes from './routes/tasks.js'
import jobRoutes from './routes/jobs.js'
import projectRoutes from './routes/projects.js'
import clientRoutes from './routes/clients.js'
import contactRoutes from './routes/contact.js'
import employeeRoutes from './routes/employees.js'
import reviewRoutes from './routes/reviews.js'
import invoiceRoutes from './routes/invoices.js'
import blogRoutes from './routes/blogs.js'
import notificationRoutes from './routes/notifications.js'
import dashboardRoutes from './routes/dashboard.js'
import subscriberRoutes from './routes/subscribers.js'

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5002
// Force reload v3

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow uploads to be served cross-origin
}))
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ].filter(Boolean)
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

// General rate limiting - 500 requests per 15 min (generous for dev + public pages)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// Strict rate limit only for auth routes (protect against brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' }
})
app.use('/api/auth/', authLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Compression and logging
app.use(compression())
app.use(morgan('combined'))

// Static files
app.use('/uploads', express.static('uploads'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Nexura Solution API'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/payroll', payrollRoutes)
app.use('/api/leaves', leavesRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/subscribers', subscriberRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handling middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Nexura Solution API running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})