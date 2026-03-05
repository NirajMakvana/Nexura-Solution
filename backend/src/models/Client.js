import mongoose from 'mongoose'

const { Schema } = mongoose

const ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  company: String,
  email: {
    type: String,
    required: true
  },
  phone: String,
  website: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Prospect'],
    default: 'Active'
  },
  notes: String
}, {
  timestamps: true
})

export default mongoose.model('Client', ClientSchema)
