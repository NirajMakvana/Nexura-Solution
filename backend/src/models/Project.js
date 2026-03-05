import mongoose from 'mongoose'

const { Schema } = mongoose

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  category: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  budget: Number,
  technologies: [{
    type: String
  }],
  team: [{
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
})

export default mongoose.model('Project', ProjectSchema)
