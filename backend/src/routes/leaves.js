import express from 'express'
import Leave from '../models/Leave.js'
import { protect, authorize } from '../middleware/auth.js'
import { emailService } from '../utils/emailService.js'
import { createNotification } from './notifications.js'
import { leaveValidator, validate, paginateQuery } from '../middleware/validate.js'

const router = express.Router()

router.use(protect)

// @route   GET /api/leaves/my-leaves
// @desc    Get my leave requests
// @access  Private
router.get('/my-leaves', async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.json(leaves)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/leaves
// @desc    Get all leave requests
// @access  Private
router.get('/', paginateQuery, async (req, res) => {
  try {
    const { employee, status } = req.query
    const { page, limit, skip } = req.pagination

    let query = {}
    if (employee) query.employee = employee
    if (status) query.status = status

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate('employee', 'firstName lastName employeeId')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Leave.countDocuments(query)
    ])

    res.json({ data: leaves, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/leaves
// @desc    Create leave request
// @access  Private
router.post('/', leaveValidator, validate, async (req, res) => {
  try {
    const leave = await Leave.create(req.body)

    // Notify admins about new leave request
    const User = (await import('../models/User.js')).default
    const admins = await User.find({ role: { $in: ['admin', 'hr'] } })
    admins.forEach(admin => {
      createNotification(
        admin._id,
        'leave_request',
        'New Leave Request',
        `New leave request from employee ID: ${leave.employee}`,
        '/admin/leaves'
      ).catch(err => console.error('Notification error:', err))
    })

    res.status(201).json(leave)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request
// @access  Private (Admin/HR/Manager)
router.put('/:id/approve', authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee', 'firstName email')

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' })
    }

    leave.status = 'Approved'
    leave.approvedBy = req.user._id
    leave.approvedDate = new Date()

    await leave.save()

    if (leave.employee && leave.employee.email) {
      emailService.sendLeaveStatusEmail(
        leave.employee.email,
        leave.employee.firstName,
        leave.type || 'Leave',
        'Approved'
      ).catch(err => console.error('Email error:', err))
    }

    // Notify Employee
    if (leave.employee) {
      createNotification(
        leave.employee._id || leave.employee,
        'leave_status',
        'Leave Request Approved',
        `Your ${leave.type || 'leave'} request has been approved.`,
        '/employee/leave'
      ).catch(err => console.error('Notification error:', err))
    }

    res.json(leave)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request
// @access  Private (Admin/HR/Manager)
router.put('/:id/reject', authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { rejectionReason } = req.body

    const leave = await Leave.findById(req.params.id).populate('employee', 'firstName email')

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' })
    }

    leave.status = 'Rejected'
    leave.approvedBy = req.user._id
    leave.approvedDate = new Date()
    leave.rejectionReason = rejectionReason

    await leave.save()

    if (leave.employee && leave.employee.email) {
      emailService.sendLeaveStatusEmail(
        leave.employee.email,
        leave.employee.firstName,
        leave.type || 'Leave',
        'Rejected'
      ).catch(err => console.error('Email error:', err))
    }

    // Notify Employee
    if (leave.employee) {
      createNotification(
        leave.employee._id || leave.employee,
        'leave_status',
        'Leave Request Rejected',
        `Your ${leave.type || 'leave'} request was rejected. Reason: ${leave.rejectionReason || 'Not provided'}`,
        '/employee/leave'
      ).catch(err => console.error('Notification error:', err))
    }

    res.json(leave)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
