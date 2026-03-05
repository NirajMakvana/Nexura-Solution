import mongoose from 'mongoose'

const { Schema } = mongoose

const LeaveSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Emergency Leave'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: Date,
  rejectionReason: String
}, {
  timestamps: true
})

// Index for faster queries
LeaveSchema.index({ employee: 1, status: 1 })

export default mongoose.model('Leave', LeaveSchema)
