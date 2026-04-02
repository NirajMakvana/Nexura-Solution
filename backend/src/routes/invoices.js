import express from 'express'
import Invoice from '../models/Invoice.js'
import { protect, authorize } from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = express.Router()

// Protect all routes
router.use(protect)
// and restrict to admin
router.use(authorize('admin'))

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('client', 'name email companyName')
            .populate('project', 'name')
            .sort({ createdAt: -1 })
        res.json(invoices)
    } catch (err) {
                res.status(500).json({ message: 'Server Error' })
    }
})

// @route   GET /api/invoices/stats
// @desc    Get invoice statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        const invoices = await Invoice.find()

        // Calculate total revenue from paid invoices
        const totalRevenue = invoices
            .filter(i => i.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.total, 0)

        // Calculate pending amount from sent and draft invoices
        const pendingAmount = invoices
            .filter(i => ['sent', 'draft'].includes(i.status))
            .reduce((sum, invoice) => sum + invoice.total, 0)

        // Calculate overdue amount
        const overdueAmount = invoices
            .filter(i => i.status === 'overdue')
            .reduce((sum, invoice) => sum + invoice.total, 0)

        const overdueInvoices = invoices.filter(i => i.status === 'overdue').length

        res.json({
            totalRevenue,
            pendingAmount,
            overdueAmount,
            overdueInvoices,
            totalInvoices: invoices.length
        })
    } catch (error) {
                res.status(500).json({ message: 'Failed to fetch invoice stats' })
    }
})

// @route   GET /api/invoices/:id
// @desc    Get an invoice
// @access  Private/Admin
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('client', 'name email companyName')
            .populate('project', 'name')
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' })
        }
        res.json(invoice)
    } catch (err) {
                res.status(500).json({ message: 'Server Error' })
    }
})

// @route   POST /api/invoices
// @desc    Create an invoice
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { items, taxPercentage = 18, discount = 0, subtotal } = req.body

        // Calculate total
        const computedSubtotal = Array.isArray(items) ? items.reduce((sum, item) => sum + item.amount, 0) : 0
        const tax = (computedSubtotal * taxPercentage) / 100
        const total = computedSubtotal + tax - discount

        const newInvoice = new Invoice({
            ...req.body,
            subtotal: computedSubtotal,
            tax,
            total
        })

        const savedInvoice = await newInvoice.save()
        res.status(201).json(savedInvoice)
    } catch (err) {
                res.status(500).json({ message: 'Server Error' })
    }
})

// @route   PUT /api/invoices/:id
// @desc    Update an invoice
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        const { items, taxPercentage, discount } = req.body

        // Recalculate if totals or items change
        let updates = { ...req.body }
        if (items) {
            const computedSubtotal = items.reduce((sum, item) => sum + item.amount, 0)
            const tax = (computedSubtotal * (taxPercentage || 18)) / 100
            const total = computedSubtotal + tax - (discount || 0)
            updates.subtotal = computedSubtotal
            updates.tax = tax
            updates.total = total
        }

        const invoice = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true })
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' })
        }
        res.json(invoice)
    } catch (err) {
                res.status(500).json({ message: 'Server Error' })
    }
})

// @route   PUT /api/invoices/:id/status
// @desc    Update invoice status
// @access  Private/Admin
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body

        const updates = { status }
        if (status === 'paid') {
            updates.paidDate = Date.now()
        }

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        )

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' })
        }

        res.json(invoice)
    } catch (err) {
                res.status(500).json({ message: 'Server Error' })
    }
})

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id)
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' })
        }
        res.json({ message: 'Invoice deleted successfully' })
    } catch (err) {
                res.status(500).json({ message: 'Server Error' })
    }
})

export default router

