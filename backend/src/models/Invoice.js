import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    rate: {
        type: Number,
        required: true,
        min: 0
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
})

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    items: [invoiceItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    taxPercentage: {
        type: Number,
        default: 18
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    notes: {
        type: String
    },
    terms: {
        type: String
    },
    paidDate: {
        type: Date
    }
}, {
    timestamps: true
})

// Auto-generate invoice number
invoiceSchema.pre('validate', async function (next) {
    if (this.isNew && !this.invoiceNumber) {
        try {
            const count = await this.constructor.countDocuments()
            const date = new Date()
            const year = date.getFullYear().toString().substr(-2)
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`
            next()
        } catch (error) {
            next(error)
        }
    } else {
        next()
    }
})

export default mongoose.model('Invoice', invoiceSchema)
