import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    category: {
        type: String,
        enum: ['web-development', 'ui-ux-design', 'graphics-design', 'company-news', 'technology'],
        default: 'company-news'
    },
    tags: [String],
    author: {
        type: String,
        required: true
    },
    authorRole: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    readTime: {
        type: String,
        default: '5 min read'
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Auto-generate slug from title before save
blogSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }
    next()
})

const Blog = mongoose.model('Blog', blogSchema)
export default Blog
