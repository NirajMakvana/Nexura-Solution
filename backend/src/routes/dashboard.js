import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import Leave from '../models/Leave.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import Client from '../models/Client.js'
import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

const router = express.Router()

router.use(protect)

// @route   GET /api/dashboard/activity
// @desc    Get recent system activities
// @access  Private (Admin)
router.get('/activity', authorize('admin', 'hr'), async (req, res) => {
    try {
        // Fetch recent items from different collections
        const [invoices, projects, leaves, tasks] = await Promise.all([
            Invoice.find().sort({ createdAt: -1 }).limit(5).populate('client', 'name'),
            Project.find().sort({ createdAt: -1 }).limit(5).populate('client', 'name'),
            Leave.find().sort({ createdAt: -1 }).limit(5).populate('employee', 'firstName lastName'),
            Task.find().sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'firstName lastName')
        ])

        // Normalize activities
        const activities = [
            ...invoices.map(inv => ({
                id: inv._id,
                type: 'invoice',
                title: 'New Invoice Created',
                description: `Invoice ${inv.invoiceNumber} for ${inv.client?.name || 'Client'}`,
                time: inv.createdAt,
                status: inv.status
            })),
            ...projects.map(proj => ({
                id: proj._id,
                type: 'project',
                title: 'New Project Launched',
                description: `${proj.name} for ${proj.client?.name || 'Client'}`,
                time: proj.createdAt,
                status: proj.status
            })),
            ...leaves.map(leave => ({
                id: leave._id,
                type: 'leave',
                title: 'New Leave Request',
                description: `${leave.employee?.firstName} ${leave.employee?.lastName} requested ${leave.type}`,
                time: leave.createdAt,
                status: leave.status
            })),
            ...tasks.map(task => ({
                id: task._id,
                type: 'task',
                title: 'Task Assigned',
                description: `${task.title} assigned to ${task.assignedTo?.firstName}`,
                time: task.createdAt,
                status: task.status
            }))
        ]

        // Sort by most recent
        const sortedActivities = activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10)

        res.json(sortedActivities)
    } catch (error) {
        console.error('Dashboard activity error:', error)
        res.status(500).json({ message: 'Error fetching board activities' })
    }
})

// @route   GET /api/dashboard/stats
// @desc    Get dashboard summary statistics
// @access  Private (Admin/HR)
router.get('/stats', authorize('admin', 'hr'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalEmployees,
            activeEmployees,
            todayAttendance,
            pendingLeaves,
            totalProjects,
            activeProjects,
            totalClients,
            completedProjects
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ role: { $ne: 'admin' }, isActive: true }),
            Attendance.countDocuments({ date: { $gte: today } }),
            Leave.countDocuments({ status: 'Pending' }),
            Project.countDocuments(),
            Project.countDocuments({ status: 'In Progress' }),
            Client.countDocuments(),
            Project.countDocuments({ status: 'Completed' })
        ]);

        res.json({
            totalEmployees,
            activeEmployees,
            todayAttendance,
            pendingLeaves,
            totalProjects,
            activeProjects,
            totalClients,
            completedProjects
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics data
// @access  Private (Admin)
router.get('/analytics', authorize('admin'), async (req, res) => {
    try {
        const [projects, clients] = await Promise.all([
            Project.find().populate('client', 'name companyName'),
            Client.countDocuments()
        ]);

        const completedProjects = projects.filter(p => p.status === 'Completed');
        const totalRevenue = completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

        // Group projects by month for chart (Last 12 months)
        const monthlyData = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = { month: monthNames[d.getMonth()], revenue: 0, projects: 0 };
        }

        projects.forEach(project => {
            const date = new Date(project.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[key]) {
                monthlyData[key].projects += 1;
                if (project.status === 'Completed') {
                    monthlyData[key].revenue += project.budget || 0;
                }
            }
        });

        const monthlyRevenue = Object.values(monthlyData);

        // Project categories aggregation
        const projectStats = Object.entries(
            projects.reduce((acc, p) => {
                const cat = p.category || 'Other';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {})
        ).map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / projects.length) * 100) || 0
        }));

        res.json({
            totalRevenue,
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'In Progress').length,
            completedProjects: completedProjects.length,
            totalClients: clients,
            monthlyRevenue,
            projectStats,
            avgProjectValue: completedProjects.length > 0 ? Math.round(totalRevenue / completedProjects.length) : 0
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

export default router
