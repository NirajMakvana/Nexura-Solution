import express from 'express'
import User from '../models/User.js'
import Employee from '../models/Employee.js'
import Project from '../models/Project.js'
import Client from '../models/Client.js'
import { protect, authorize } from '../middleware/auth.js'
import { emailService } from '../utils/emailService.js'

const router = express.Router()

// @route   GET /api/users/team
// @desc    Get team members for public About page (no auth required)
// @access  Public
router.get('/team', async (req, res) => {
  try {
    // Get active users (use isActive field which is correct for User model)
    const users = await User.find({ isActive: true })
      .select('firstName lastName email position role department avatar bio')
      .sort({ createdAt: 1 })

    // Also fetch Employee records to get skills
    const employeeRecords = await Employee.find({ isActive: true })
      .populate('user', '_id')
      .select('user skills')

    // Build a quick lookup: userId -> skills
    const skillsMap = {}
    employeeRecords.forEach(emp => {
      if (emp.user?._id) {
        skillsMap[emp.user._id.toString()] = emp.skills || []
      }
    })

    // Merge user data with skills from employee records
    const team = users.map(u => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      position: u.position,
      role: u.role,
      department: u.department,
      avatar: u.avatar || null,
      bio: u.bio || null,
      skills: skillsMap[u._id.toString()] || []
    }))

    res.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/users/stats
// @desc    Get company stats for public pages (no auth required)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [projectCount, clientCount, employeeCount] = await Promise.all([
      Project.countDocuments({ status: 'Completed' }),
      Client.countDocuments(),
      User.countDocuments({ isActive: true })
    ])

    res.json({
      projects: projectCount,
      clients: clientCount,
      employees: employeeCount
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// All routes below are protected and require admin/hr role
router.use(protect)
router.use(authorize('admin', 'hr'))

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/HR)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin/HR)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin/HR)
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body)

    // Sync: Create Employee record if role is employee, manager or hr
    if (['employee', 'manager', 'hr'].includes(user.role)) {
      try {
        await Employee.create({
          user: user._id,
          employeeId: user.employeeId,
          department: user.department || 'General',
          position: user.position || user.role,
          joinDate: user.joinDate || new Date(),
          salary: {
            basic: user.salary?.amount || 0,
            hra: 0,
            allowances: 0,
            deductions: 0
          },
          isActive: user.isActive !== undefined ? user.isActive : true
        })
      } catch (empErr) {
        console.error('Failed to create synced employee record:', empErr)
      }
    }

    if (req.body.password) {
      emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        req.body.password
      ).catch(err => console.error('Email error:', err))
    }

    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin/HR)
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Sync: Update Employee record if it exists
    try {
      await Employee.findOneAndUpdate(
        { user: user._id },
        {
          department: user.department,
          position: user.position,
          isActive: user.isActive,
          employeeId: user.employeeId,
          salary: user.salary ? {
            basic: user.salary.amount || 0,
            hra: 0,
            allowances: 0,
            deductions: 0
          } : undefined
        },
        { upsert: ['employee', 'manager', 'hr'].includes(user.role) }
      )
    } catch (empErr) {
      // Non-critical: log sync failure but don't fail the request
      console.error('Failed to sync employee update:', empErr)
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
