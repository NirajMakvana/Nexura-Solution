import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    joiningDate: {
        type: Date,
        required: true
    },
    salary: {
        basic: { type: Number, required: true },
        hra: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 }
    },
    skills: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Resigned', 'Terminated'],
        default: 'Active'
    }
}, {
    timestamps: true
});

export default mongoose.model('Employee', employeeSchema);
