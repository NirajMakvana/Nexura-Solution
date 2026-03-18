import express from 'express'
import Attendance from '../models/Attendance.js'
import { protect } from '../middleware/auth.js'
import { clockInValidator, validate, paginateQuery } from '../middleware/validate.js'

const router = express.Router()

router.use(protect)

// @route   GET /api/attendance/my-records
// @desc    Get my attendance records
// @access  Private
router.get('/my-records', async (req, res) => {
  try {
    const { month, year } = req.query
    let query = { employee: req.user._id }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30)

    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', paginateQuery, async (req, res) => {
  try {
    const { employee, startDate, endDate } = req.query
    const { page, limit, skip } = req.pagination

    let query = {}
    if (employee) query.employee = employee
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employee', 'firstName lastName employeeId')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query)
    ])

    res.json({ data: attendance, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/attendance/clock-in
// @desc    Clock in
// @access  Private
router.post('/clock-in', clockInValidator, validate, async (req, res) => {
  try {
    const { employee, location } = req.body
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employee,
      date: { $gte: startOfToday, $lt: endOfToday }
    })

    if (existing && existing.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' })
    }

    const attendance = await Attendance.create({
      employee,
      date: new Date(),
      clockIn: new Date(),
      location: location || 'Office',
      status: 'Present'
    })

    res.status(201).json(attendance)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/attendance/clock-out/:id
// @desc    Clock out
// @access  Private
router.put('/clock-out/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out' })
    }

    attendance.clockOut = new Date()

    // Calculate total hours
    const diff = attendance.clockOut - attendance.clockIn
    attendance.totalHours = (diff / (1000 * 60 * 60)).toFixed(2)

    await attendance.save()
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/attendance/stats/:employeeId
// @desc    Get attendance statistics
// @access  Private
router.get('/stats/:employeeId', async (req, res) => {
  try {
    const { month, year } = req.query
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const records = await Attendance.find({
      employee: req.params.employeeId,
      date: { $gte: startDate, $lte: endDate }
    })

    const stats = {
      totalPresent: records.filter(r => r.status === 'Present').length,
      totalAbsent: records.filter(r => r.status === 'Absent').length,
      totalLate: records.filter(r => r.status === 'Late').length,
      totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0)
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
