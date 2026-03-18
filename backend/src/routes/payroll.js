import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Payslip from '../models/Payslip.js';
import User from '../models/User.js';

const router = express.Router();

// Get all payslips (Admin/HR)
router.get('/', protect, authorize('admin', 'hr', 'manager'), async (req, res) => {
    try {
        const { year, month } = req.query;
        let query = {};
        if (year) query.year = parseInt(year);
        if (month) query.month = month;

        const payslips = await Payslip.find(query)
            .populate('employee', 'firstName lastName email employeeId')
            .sort({ year: -1, month: -1 });
        res.json(payslips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payslips', error: error.message });
    }
});

// Get payslips for a specific employee
router.get('/employee/:id', protect, async (req, res) => {
    try {
        // Only admin/hr or the employee themselves can view
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to view these payslips' });
        }

        const { year } = req.query;
        let query = { employee: req.params.id };
        if (year) query.year = parseInt(year);

        const payslips = await Payslip.find(query).sort({ year: -1, month: -1 });
        res.json(payslips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee payslips', error: error.message });
    }
});

// Create/Generate a payslip (Admin/HR)
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
    try {
        const { employee, month, year, basicSalary, hra, allowances, deductions, status, paymentDate } = req.body;

        console.log('Creating payslip with data:', req.body);

        // Validate employee exists
        const employeeExists = await User.findById(employee);
        if (!employeeExists) {
            console.log('Employee not found:', employee);
            return res.status(400).json({ message: 'Employee not found' });
        }

        // Check if payslip already exists for this month/year for this employee
        const existing = await Payslip.findOne({ employee, month, year });
        if (existing) {
            console.log('Payslip already exists for:', { employee, month, year });
            return res.status(400).json({ message: 'Payslip already exists for this month/year' });
        }

        const netSalary = (parseFloat(basicSalary) || 0) + (parseFloat(hra) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0);

        const payslip = await Payslip.create({
            employee,
            month,
            year,
            basicSalary,
            hra,
            allowances,
            deductions,
            netSalary,
            status,
            paymentDate
        });

        console.log('Payslip created successfully:', payslip._id);
        res.status(201).json(payslip);
    } catch (error) {
        console.error('Error creating payslip:', error);
        res.status(400).json({ message: 'Error creating payslip', error: error.message });
    }
});

// Update payslip (Admin/HR)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
    try {
        const { basicSalary, hra, allowances, deductions } = req.body;

        let updateData = { ...req.body };

        if (basicSalary !== undefined || hra !== undefined || allowances !== undefined || deductions !== undefined) {
            const current = await Payslip.findById(req.params.id);
            if (!current) return res.status(404).json({ message: 'Payslip not found' });

            const b = basicSalary !== undefined ? basicSalary : current.basicSalary;
            const h = hra !== undefined ? hra : current.hra;
            const a = allowances !== undefined ? allowances : current.allowances;
            const d = deductions !== undefined ? deductions : current.deductions;

            updateData.netSalary = (parseFloat(b) || 0) + (parseFloat(h) || 0) + (parseFloat(a) || 0) - (parseFloat(d) || 0);
        }

        const payslip = await Payslip.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
        res.json(payslip);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payslip', error: error.message });
    }
});

// Delete payslip (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const payslip = await Payslip.findByIdAndDelete(req.params.id);
        if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
        res.json({ message: 'Payslip deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting payslip', error: error.message });
    }
});

// Get single payslip
router.get('/:id', protect, async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id).populate('employee', 'firstName lastName email employeeId position department');
        if (!payslip) return res.status(404).json({ message: 'Payslip not found' });

        // Authorization check
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user._id.toString() !== payslip.employee._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this payslip' });
        }

        res.json(payslip);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payslip', error: error.message });
    }
});

export default router;
