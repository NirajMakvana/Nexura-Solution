import express from 'express'
import Client from '../models/Client.js'
import Project from '../models/Project.js'
import Invoice from '../models/Invoice.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/clients/count
// @desc    Get client count for public landing page stats
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const total = await Client.countDocuments()
    res.json({ total })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const clients = await Client.find().lean().sort({ createdAt: -1 })

    // Process each client to attach totalProjects and totalRevenue
    const processedClients = await Promise.all(clients.map(async (client) => {
      // Get all projects for this client
      const projects = await Project.find({ client: client._id })

      // Get all paid invoices for this client to compute revenue
      const invoices = await Invoice.find({ client: client._id, status: 'paid' })
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)

      return {
        ...client,
        id: client._id, // Map _id to id for frontend compatibility
        totalProjects: projects.length,
        completedProjects: projects.filter(p => p.status === 'Completed').length,
        totalRevenue: totalRevenue
      }
    }))

    res.json(processedClients)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    res.json(client)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/clients
// @desc    Create new client
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const client = await Client.create(req.body)
    res.status(201).json(client)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    res.json(client)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)

    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    res.json({ message: 'Client deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
