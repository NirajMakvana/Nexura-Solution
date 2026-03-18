import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Review from '../models/Review.js';

const router = express.Router();

// Get all reviews (Admin)
router.get('/', protect, authorize('admin', 'manager', 'hr'), async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const reviews = await Review.find(query).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Get approved reviews for public landing page
router.get('/public', async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'Approved' }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public reviews', error: error.message });
    }
});

// Create a review (Public)
router.post('/', async (req, res) => {
    try {
        // Ensure status defaults to Pending even if provided
        const reviewData = { ...req.body, status: 'Pending', isPublished: false };
        const review = await Review.create(reviewData);
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: 'Error creating review', error: error.message });
    }
});

// Approve a review (Admin)
router.put('/:id/approve', protect, authorize('admin', 'manager', 'hr'), async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Approved',
                isPublished: true,
                publishedDate: new Date(),
                reviewedBy: req.user._id
            },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json(review);
    } catch (error) {
        res.status(400).json({ message: 'Error approving review', error: error.message });
    }
});

// Reject a review (Admin)
router.put('/:id/reject', protect, authorize('admin', 'manager', 'hr'), async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Rejected',
                isPublished: false,
                reviewedBy: req.user._id
            },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json(review);
    } catch (error) {
        res.status(400).json({ message: 'Error rejecting review', error: error.message });
    }
});

// Delete a review (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting review', error: error.message });
    }
});

export default router;
