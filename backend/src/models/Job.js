import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Draft'],
        default: 'Draft'
    },
    requirements: [{
        type: String
    }],
    applicants: [{
        name: String,
        email: String,
        resumeUrl: String,
        status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Interview Scheduled', 'Rejected', 'Hired'],
            default: 'Pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

export default mongoose.model('Job', jobSchema);
