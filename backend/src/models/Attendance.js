import mongoose from 'mongoose'

const { Schema } = mongoose

const AttendanceSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clockIn: Date,
  clockOut: Date,
  totalHours: Number,
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
    default: 'Present'
  },
  location: {
    type: String,
    enum: ['Office', 'Remote', 'Field'],
    default: 'Office'
  },
  notes: String
}, {
  timestamps: true
})

// Index for faster queries
AttendanceSchema.index({ employee: 1, date: -1 })

export default mongoose.model('Attendance', AttendanceSchema)
