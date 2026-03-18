import { validationResult, body, param, query } from 'express-validator'

// Run validation and return errors if any
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    })
  }
  next()
}

// Auth validators
export const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and a number'),
]

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

// Leave validators
export const leaveValidator = [
  body('type').notEmpty().withMessage('Leave type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    }),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 500 }),
]

// Project validators
export const projectValidator = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
  body('category').notEmpty().withMessage('Category is required'),
  body('status').optional().isIn(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
]

// Task validators
export const taskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 }),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Completed']).withMessage('Invalid status'),
]

// Client validators
export const clientValidator = [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
]

// Contact form validators
export const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
]

// Attendance validators
export const clockInValidator = [
  body('employee').notEmpty().withMessage('Employee ID is required'),
]

// Pagination helper
export const paginateQuery = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  req.pagination = { page, limit, skip: (page - 1) * limit }
  next()
}
