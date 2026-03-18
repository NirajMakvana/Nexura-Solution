import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'
import { emailService } from '../utils/emailService.js'
import { registerValidator, loginValidator, validate } from '../middleware/validate.js'

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidator, validate, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body

    // Strong Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number.'
      })
    }

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee'
    })

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidator, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check for user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department || '',
      position: user.position || '',
      avatar: user.avatar || null,
      bio: user.bio || null,
      token: generateToken(user._id)
    })
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// @route   PUT /api/auth/me
// @desc    Update current user personal info
// @access  Private
router.put('/me', protect, async (req, res, next) => {
  try {
    const { phone, bio, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) {
      // if frontend sent string, put it in street
      if (typeof address === 'string') {
        user.address = { street: address, city: '', state: '', zipCode: '', country: '' };
      } else {
        user.address = { ...user.address, ...address };
      }
    }

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
})

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Strong Password Validation for New Password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number.'
      })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    // Send email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken)
      res.status(200).json({ success: true, message: 'Email sent successfully' })
    } catch (err) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      return res.status(500).json({ message: 'Email could not be sent' })
    }
  } catch (error) {
    next(error)
  }
})

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    // Validate strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number.'
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(200).json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/auth/avatar
router.post('/avatar', protect, uploadImage.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.avatar = `/uploads/${req.file.filename}`
    await user.save()

    res.json({
      message: 'Profile picture updated successfully',
      avatar: user.avatar
    })
  } catch (error) {
    next(error)
  }
})

export default router
