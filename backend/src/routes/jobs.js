import express from 'express'
import Job from '../models/Job.js'
import JobApplication from '../models/JobApplication.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { emailService } from '../utils/emailService.js'

const router = express.Router()

// @route   GET /api/jobs
// @desc    Get all open job postings (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' })
      .select('-postedBy')
      .sort({ createdAt: -1 })
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/jobs/:id
// @desc    Get single job posting (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    res.json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/jobs/apply
// @desc    Submit job application (public)
// @access  Public
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const applicationData = { ...req.body }
    if (req.file) {
      applicationData.resumeUrl = `/uploads/${req.file.filename}`
    }
    const application = await JobApplication.create(applicationData)

    // Send emails silently
    Job.findById(application.job).then(job => {
      const jobTitle = job ? job.title : 'General Position';
      emailService.sendJobApplicationEmail(application, jobTitle).catch(e => console.error('Admin email error:', e));
      emailService.sendJobApplicationAutoReplyEmail(application.email, application.firstName, jobTitle).catch(e => console.error('Applicant email error:', e));
    }).catch(e => console.error('Job fetch error for email:', e));

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Protected routes below (Admin only)
router.use(protect)
router.use(authorize('admin', 'hr'))

// @route   GET /api/jobs/admin/all
// @desc    Get all job postings (Admin)
// @access  Private (Admin/HR)
router.get('/admin/all', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 })
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Admin/HR)
router.post('/', async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id
    })
    res.status(201).json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/jobs/applications/all
// @desc    Get all job applications
// @access  Private (Admin/HR)
router.get('/applications/all', async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .populate('job', 'title department')
      .sort({ createdAt: -1 })
    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/jobs/applications/:id
// @desc    Update application status
// @access  Private (Admin/HR)
router.put('/applications/:id', async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('job', 'title department')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }
    res.json(application)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Admin/HR)
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    res.json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})



export default router
