import mongoose from 'mongoose'

const { Schema } = mongoose

const PayslipSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  hra: Number,
  allowances: Number,
  deductions: Number,
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Processing'],
    default: 'Pending'
  },
  paymentDate: Date,
  pdfUrl: String
}, {
  timestamps: true
})

// Index for faster queries
PayslipSchema.index({ employee: 1, year: -1, month: -1 })

export default mongoose.model('Payslip', PayslipSchema)
