import express from 'express'
import Project from '../models/Project.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/projects/public
// @desc    Get completed projects for public portfolio (no auth required)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Completed' })
      .populate('client', 'name')
      .select('name description status budget startDate endDate client technologies category progress team')
      .sort({ endDate: -1 })
      .limit(20)

    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/projects/public/:id
// @desc    Get single public project by ID
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name')
      .select('name description status budget startDate endDate client technologies category progress team')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/projects/count
// @desc    Get project count for public landing page stats
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const total = await Project.countDocuments()
    const completed = await Project.countDocuments({ status: 'Completed' })
    res.json({ total, completed })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/projects/my-projects
// @desc    Get current employee's projects
// @access  Private
router.get('/my-projects', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'team.employee': req.user._id })
      .populate('client', 'name email')
      .populate('team.employee', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('team.employee', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('team.employee', 'firstName lastName email position')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/projects
// @desc    Create new project and auto-assign tasks to team members
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const project = await Project.create(req.body)

    // Auto-create tasks for each team member assigned
    if (req.body.team && req.body.team.length > 0) {
      const Task = (await import('../models/Task.js')).default
      const tasks = req.body.team.map(member => {
        const employeeId = typeof member === 'object' ? (member.employee || member._id) : member
        // Map Urgent priority to High (Task model only allows Low/Medium/High)
        const rawPriority = req.body.priority || 'Medium'
        const priority = rawPriority === 'Urgent' ? 'High' : rawPriority
        return {
          title: `Work on: ${req.body.name}`,
          description: req.body.description || `Task for project: ${req.body.name}`,
          project: project._id,
          assignedTo: employeeId,
          assignedBy: req.user._id,
          status: 'To Do',
          priority,
          dueDate: req.body.endDate || null
        }
      })
      await Task.insertMany(tasks)
    }

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
