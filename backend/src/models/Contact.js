import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'Read', 'In Progress', 'Replied', 'Resolved', 'Closed', 'Archived'],
        default: 'New'
    },
    phone: {
        type: String
    },
    adminNotes: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Contact', contactSchema);
