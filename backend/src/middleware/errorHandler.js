export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error(err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = { name: 'CastError', message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'Field'
    const value = err.keyValue ? Object.values(err.keyValue)[0] : 'value'
    let message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already taken.`

    // Explicit email duplication messaging
    if (field === 'email') {
      message = 'An account with this email address already exists. Please login or use a different email.'
    } else if (field === 'employeeId') {
      message = 'An employee with this exact ID already exists in the system.'
    }

    error = { name: 'DuplicateError', message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    let message
    if (err.errors) {
      message = Object.values(err.errors).map((val) => val.message).join('. ')
    } else {
      message = 'Validation failed.'
    }
    error = { name: 'ValidationError', message, statusCode: 400 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  })
}