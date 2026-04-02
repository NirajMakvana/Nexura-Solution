import express from 'express'
import Notification from '../models/Notification.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

// Helper to create a notification (used internally by other routes too)
export const createNotification = async (recipientId, type, title, message, link = null) => {
    try {
        return await Notification.create({ recipient: recipientId, type, title, message, link })
    } catch (err) {
        console.error('Failed to create notification:', err.message)
        return null
    }
}

// PUT /api/notifications/read-all — Mark all as read  — MUST be before /:id routes
router.put('/read-all', async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
        res.json({ message: 'All notifications marked as read' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// GET /api/notifications/unread-count — Quick unread badge count
router.get('/unread-count', async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false })
        res.json({ count })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// GET /api/notifications — Get logged-in user's notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
        res.json(notifications)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// PUT /api/notifications/:id/read — Mark one as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        )
        if (!notification) return res.status(404).json({ message: 'Notification not found' })
        res.json(notification)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// DELETE /api/notifications/:id — Delete one
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })
        res.json({ message: 'Notification deleted' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
