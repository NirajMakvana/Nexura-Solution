import express from 'express'
import Blog from '../models/Blog.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/blogs
// @desc    Get all published blogs (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, featured, limit } = req.query
        let query = { status: 'published' }
        if (category && category !== 'all') query.category = category
        if (featured === 'true') query.featured = true

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit ? parseInt(limit) : 100)

        res.json(blogs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/blogs/admin
// @desc    Get ALL blogs including drafts (admin only)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 })
        res.json(blogs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/blogs/:id
// @desc    Get single blog by id (increment views)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (!blog || blog.status !== 'published') {
            return res.status(404).json({ message: 'Blog post not found' })
        }
        // Increment views
        blog.views = (blog.views || 0) + 1
        await blog.save()
        res.json(blog)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   POST /api/blogs
// @desc    Create blog post (admin)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const blog = await Blog.create(req.body)
        res.status(201).json(blog)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   PUT /api/blogs/:id
// @desc    Update blog post (admin)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' })
        }
        res.json(blog)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   PUT /api/blogs/:id/publish
// @desc    Publish/Unpublish a blog post (toggle)
// @access  Private/Admin
router.put('/:id/publish', protect, authorize('admin'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' })
        }
        blog.status = blog.status === 'published' ? 'draft' : 'published'
        await blog.save()
        res.json({ message: `Blog ${blog.status === 'published' ? 'published' : 'unpublished'} successfully`, blog })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   DELETE /api/blogs/:id
// @desc    Delete blog post (admin)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id)
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' })
        }
        res.json({ message: 'Blog post deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
