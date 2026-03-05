import express from 'express'
import Subscriber from '../models/Subscriber.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/subscribers
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        // Check if already subscribed
        const existing = await Subscriber.findOne({ email })
        if (existing) {
            if (existing.status === 'Active') {
                return res.status(400).json({ message: 'You are already subscribed!' })
            } else {
                existing.status = 'Active'
                await existing.save()
                return res.status(200).json({ message: 'Subscription reactivated successfully!' })
            }
        }

        await Subscriber.create({ email })
        res.status(201).json({ message: 'Subscribed successfully! Thank you.' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 })
        res.json(subscribers)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   DELETE /api/subscribers/:id
// @desc    Delete/Unsubscribe
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id)
        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found' })
        }
        await subscriber.deleteOne()
        res.json({ message: 'Subscriber removed' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
