import express from 'express'
import Employee from '../models/Employee.js'
import User from '../models/User.js'
import Task from '../models/Task.js'
import Attendance from '../models/Attendance.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

// @route   GET /api/employees/profile
// @desc    Get current employee profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email role salary avatar bio phone address')

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' })
    }

    // Get active projects count for this employee
    const Project = (await import('../models/Project.js')).default
    const activeProjectsCount = await Project.countDocuments({
      'team.employee': employee.user._id,
      status: 'In Progress'
    })

    res.json({
      ...employee.toObject(),
      activeProjectsCount
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/employees/team
// @desc    Get team members
// @access  Private
router.get('/team', async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .populate('user', 'firstName lastName email role')
      .select('user position department joinDate skills')
      .sort({ joinDate: -1 })

    // Transform data for frontend
    const teamMembers = employees.map(emp => ({
      _id: emp._id,
      firstName: emp.user?.firstName || '',
      lastName: emp.user?.lastName || '',
      email: emp.user?.email || '',
      position: emp.position,
      role: emp.user?.role || emp.position,
      department: emp.department,
      joinDate: emp.joinDate,
      skills: emp.skills || [],
      status: 'Online', // Default status
      tasksCompleted: 0,
      tasksInProgress: 0,
      tasksPending: 0,
      performance: 85,
      productivity: 90,
      currentProject: 'Various Projects',
      lastActive: 'Just now',
      bio: `${emp.position} at Nexura Solutions`,
      phone: '+91 XXXXXXXXXX',
      location: 'Remote',
      recentTasks: []
    }))

    res.json(teamMembers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/employees/stats
// @desc    Get employee statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
    const attendance = await Attendance.find({ employee: req.user._id })
      .sort({ date: -1 })
      .limit(30)

    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length

    const stats = {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      attendanceRate: attendance.length > 0 ?
        Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100) : 0,
      performance: completedTasks > 0 ?
        Math.round((completedTasks / tasks.length) * 100) : 0
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/employees
// @desc    Get all employees (Admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'firstName lastName email role')
      .sort({ joinDate: -1 })

    res.json(employees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
