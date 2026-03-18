import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicantName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    resume: {
        type: String, // URL to stored resume file
        required: true
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Interview Scheduled', 'Rejected', 'Hired'],
        default: 'Pending'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('JobApplication', jobApplicationSchema);
