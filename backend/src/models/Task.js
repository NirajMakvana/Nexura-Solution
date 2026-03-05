import mongoose from 'mongoose'

const { Schema } = mongoose

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'In Review', 'Completed'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: Date,
  completedDate: Date,
  tags: [String],
  attachments: [String]
}, {
  timestamps: true
})

// Index for faster queries
TaskSchema.index({ assignedTo: 1, status: 1 })

export default mongoose.model('Task', TaskSchema)
