import express from 'express'
import Job from '../models/Job.js'
import JobApplication from '../models/JobApplication.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { emailService } from '../utils/emailService.js'

const router = express.Router()

// ─── Public Routes ────────────────────────────────────────────────────────────

// @route   GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).select('-postedBy').sort({ createdAt: -1 })
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/jobs/apply  — MUST be before /:id wildcard
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const applicationData = { ...req.body }
    if (req.file) applicationData.resumeUrl = `/uploads/${req.file.filename}`
    const application = await JobApplication.create(applicationData)

    Job.findById(application.job).then(job => {
      const jobTitle = job ? job.title : 'General Position'
      emailService.sendJobApplicationEmail(application, jobTitle).catch(e => console.error('Admin email error:', e))
      emailService.sendJobApplicationAutoReplyEmail(application.email, application.firstName, jobTitle).catch(e => console.error('Applicant email error:', e))
    }).catch(e => console.error('Job fetch error for email:', e))

    res.status(201).json({ message: 'Application submitted successfully', application })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Admin Routes — MUST be before /:id wildcard ──────────────────────────────

// @route   GET /api/jobs/admin/all
router.get('/admin/all', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 })
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/jobs/applications/all
router.get('/applications/all', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .populate('job', 'title department')
      .sort({ createdAt: -1 })
    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/jobs/applications/:id — MUST be before /:id wildcard
router.put('/applications/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('job', 'title department')
    if (!application) return res.status(404).json({ message: 'Application not found' })
    res.json(application)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Public single job — after all specific paths ─────────────────────────────

// @route   GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).json({ message: 'Job not found' })
    res.json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/jobs
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id })
    res.status(201).json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/jobs/:id
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!job) return res.status(404).json({ message: 'Job not found' })
    res.json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/jobs/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id)
    if (!job) return res.status(404).json({ message: 'Job not found' })
    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
