import express from 'express'
import Contact from '../models/Contact.js'
import { protect, authorize } from '../middleware/auth.js'
import { emailService } from '../utils/emailService.js'
import { createNotification } from './notifications.js'
import { contactValidator, validate, paginateQuery } from '../middleware/validate.js'

const router = express.Router()

// @route   POST /api/contact
// @desc    Submit contact form (public)
// @access  Public
router.post('/', contactValidator, validate, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    })

    // Send email to admin asynchronously
    emailService.sendContactFormEmail(name, email, phone, subject, message)
      .catch(err => console.error('Admin Email error:', err))

    // Send auto-reply to user asynchronously
    emailService.sendAutoReplyEmail(email, name)
      .catch(err => console.error('Auto-reply Email error:', err))

    // Notify admins/hr
    const User = (await import('../models/User.js')).default
    const admins = await User.find({ role: { $in: ['admin', 'hr'] } })
    admins.forEach(admin => {
      createNotification(
        admin._id,
        'contact_form',
        'New Contact Inquiry',
        `${name} sent a new message regarding: ${subject}`,
        '/admin/inquiries'
      ).catch(err => console.error('Notification error:', err))
    })

    res.status(201).json({
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/contact
// @desc    Get all contact submissions
// @access  Private (Admin/HR/Manager)
router.get('/', protect, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { status } = req.query

    let query = {}
    if (status) query.status = status

    const contacts = await Contact.find(query).sort({ createdAt: -1 })

    res.json(contacts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/contact/:id
// @desc    Get single contact submission
// @access  Private (Admin/HR/Manager)
router.get('/:id', protect, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    // Mark as read
    if (contact.status === 'New') {
      contact.status = 'Read'
      await contact.save()
    }

    res.json(contact)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/contact/:id
// @desc    Update contact submission
// @access  Private (Admin/HR/Manager)
router.put('/:id', protect, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { status, priority, notes } = req.body

    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    if (status) contact.status = status
    if (notes !== undefined) contact.adminNotes = notes

    await contact.save()

    res.json(contact)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    await contact.deleteOne()

    res.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
