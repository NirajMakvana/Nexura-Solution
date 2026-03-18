import express from 'express'
import Task from '../models/Task.js'
import { protect } from '../middleware/auth.js'
import { emailService } from '../utils/emailService.js'
import { createNotification } from './notifications.js'

const router = express.Router()

router.use(protect)

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks for current user
// @access  Private
router.get('/my-tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all tasks for user:', req.user.email)
    const tasks = await Task.find()
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .sort({ createdAt: -1 })

    console.log(`Found ${tasks.length} tasks`)
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/tasks
// @desc    Create task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedBy: req.user._id
    })

    // Populate for email
    await task.populate('assignedTo', 'firstName email')
    await task.populate('project', 'name')

    // Send email notification silently
    if (task.assignedTo && task.assignedTo.email) {
      emailService.sendTaskAssignmentEmail(
        task.assignedTo.email,
        task.assignedTo.firstName,
        task.title,
        task.project?.name || 'General Project',
        task.dueDate
      ).catch(err => console.error('Email error:', err))
    }

    // Trigger In-App Notification
    if (task.assignedTo) {
      createNotification(
        task.assignedTo._id || task.assignedTo,
        'task_assigned',
        'New Task Assigned',
        `You have been assigned the task: ${task.title}`,
        '/employee/tasks'
      ).catch(err => console.error('Notification error:', err))
    }

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating task:', req.params.id, 'with data:', req.body)
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'firstName lastName email')
      .populate('project', 'name')
      .populate('assignedBy', 'firstName lastName')

    if (!task) {
      console.log('Task not found:', req.params.id)
      return res.status(404).json({ message: 'Task not found' })
    }

    console.log('Task updated successfully:', task._id, 'Status:', task.status)
    res.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ message: error.message })
  }
})

export default router
