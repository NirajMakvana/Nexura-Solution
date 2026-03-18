import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import {
    FileText,
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    X,
    Save,
    Globe,
    Tag,
    Clock,
    BookOpen
} from 'lucide-react'
import ConfirmModal from '../../components/ui/ConfirmModal'

const CATEGORIES = [
    { id: 'web-development', name: 'Web Development' },
    { id: 'ui-ux-design', name: 'UI/UX Design' },
    { id: 'graphics-design', name: 'Graphics Design' },
    { id: 'company-news', name: 'Company News' },
    { id: 'technology', name: 'Technology' },
]

const EMPTY_FORM = {
    title: '',
    excerpt: '',
    content: '',
    category: 'company-news',
    author: '',
    authorRole: '',
    readTime: '1 min read',
    tags: [],
    featured: false,
    status: 'draft'
}

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingBlog, setEditingBlog] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [tagInput, setTagInput] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })

    useEffect(() => {
        fetchBlogs()
    }, [])

    useEffect(() => {
        if (formData.content) {
            const words = formData.content.trim().split(/\s+/).length
            const minutes = Math.max(1, Math.ceil(words / 200))
            setFormData(prev => ({ ...prev, readTime: `${minutes} min read` }))
        } else {
            setFormData(prev => ({ ...prev, readTime: `1 min read` }))
        }
    }, [formData.content])

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const data = await adminService.getAdminBlogs()
            setBlogs(data)
        } catch (error) {
            toast.error('Failed to fetch blog posts')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingBlog(null)
        setFormData(EMPTY_FORM)
        setTagInput('')
        setShowPreview(false)
        setShowModal(true)
    }

    const openEditModal = (blog) => {
        setEditingBlog(blog)
        setFormData({
            title: blog.title || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            category: blog.category || 'company-news',
            author: blog.author || '',
            authorRole: blog.authorRole || '',
            readTime: blog.readTime || '5 min read',
            tags: blog.tags || [],
            featured: blog.featured || false,
            status: blog.status || 'draft'
        })
        setTagInput('')
        setShowPreview(false)
        setShowModal(true)
    }

    const handleTagAdd = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const tag = tagInput.trim()
            if (tag && !formData.tags.includes(tag)) {
                setFormData({ ...formData, tags: [...formData.tags, tag] })
                setTagInput('')
            }
        }
    }

    const handleTagRemove = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.excerpt || !formData.content || !formData.author) {
            toast.error('Please fill in all required fields')
            return
        }

        setSaving(true)
        try {
            const payload = { ...formData }

            if (editingBlog) {
                await adminService.updateBlog(editingBlog._id, payload)
                toast.success('Blog post updated successfully!')
            } else {
                await adminService.createBlog(payload)
                toast.success('Blog post created successfully!')
            }

            setShowModal(false)
            fetchBlogs()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save blog post')
        } finally {
            setSaving(false)
        }
    }

    const handleTogglePublish = async (blog) => {
        try {
            await adminService.toggleBlogPublish(blog._id)
            toast.success(`Blog post ${blog.status === 'published' ? 'unpublished' : 'published'} successfully!`)
            fetchBlogs()
        } catch (error) {
            toast.error('Failed to update blog status')
        }
    }

    const handleDelete = async () => {
        const blogId = confirmModal.id
        setConfirmModal({ isOpen: false, id: null })
        try {
            await adminService.deleteBlog(blogId)
            toast.success('Blog post deleted successfully!')
            fetchBlogs()
        } catch (error) {
            toast.error('Failed to delete blog post')
        }
    }

    const filtered = blogs.filter(b => {
        const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author.toLowerCase().includes(searchTerm.toLowerCase())
        const matchStatus = filterStatus === 'all' || b.status === filterStatus
        return matchSearch && matchStatus
    })

    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.status === 'published').length,
        drafts: blogs.filter(b => b.status === 'draft').length,
        featured: blogs.filter(b => b.featured).length,
    }

    return (
        <AdminLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                        <p className="text-gray-600 mt-1">Create, edit and publish blog articles for the public website</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Post
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Posts', value: stats.total, color: 'blue', icon: FileText },
                        { label: 'Published', value: stats.published, color: 'green', icon: Globe },
                        { label: 'Drafts', value: stats.drafts, color: 'yellow', icon: Edit3 },
                        { label: 'Featured', value: stats.featured, color: 'purple', icon: BookOpen },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'published', 'draft'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="px-6 py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading blog records...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="px-6 py-20 text-center text-gray-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-bold">No records found</p>
                            <p className="mt-1">Try adjusting your filters or search terms</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Post</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.map((blog) => (
                                        <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-sm font-medium text-gray-900 truncate">{blog.title}</div>
                                                <div className="text-sm text-gray-500 truncate">{blog.excerpt}</div>
                                                {blog.featured && (
                                                    <span className="mt-1 inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Featured</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 capitalize">{blog.category?.replace(/-/g, ' ')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{blog.author}</div>
                                                <div className="text-sm text-gray-500">{blog.authorRole}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    blog.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {blog.status === 'published' ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{blog.views || 0}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{new Date(blog.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleTogglePublish(blog)}
                                                        title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                                        className={`py-2 px-3 rounded-lg transition-colors ${
                                                            blog.status === 'published'
                                                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {blog.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(blog)}
                                                        className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, id: blog._id })}
                                                        className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Enter blog post title..."
                                />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Excerpt / Summary <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                    placeholder="Short summary shown on the blog listing..."
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    rows={8}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y"
                                    placeholder="Write the full article content here..."
                                />
                            </div>

                            {/* Row: Category + Read Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.readTime}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none text-sm text-gray-500 cursor-not-allowed"
                                            placeholder="Auto-calculated"
                                            title="Read time is calculated automatically based on content length"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row: Author + Author Role */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Author Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="e.g. Niraj Makvana"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Role</label>
                                    <input
                                        type="text"
                                        value={formData.authorRole}
                                        onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="e.g. Founder & UI/UX Designer"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags <span className="text-xs text-gray-400 font-normal ml-1">(Type and press Enter)</span>
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagAdd}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Add tag and press Enter"
                                    />
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-sm">
                                                {tag}
                                                <button type="button" onClick={() => handleTagRemove(tag)} className="ml-1 text-blue-400 hover:text-blue-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Checkboxes */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.status === 'published'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                                </label>
                            </div>

                            {/* Preview Section */}
                            {showPreview && (
                                <div className="mt-6 p-6 border border-blue-200 bg-blue-50/50 rounded-xl">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled Article'}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                                        <span>By {formData.author || 'Author'}</span>
                                        <span>•</span>
                                        <span>{formData.readTime}</span>
                                        <span>•</span>
                                        <span className="capitalize">{formData.category?.replace('-', ' ')}</span>
                                    </div>
                                    <p className="text-lg text-gray-600 mb-8 font-medium">{formData.excerpt}</p>
                                    <div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-wrap">
                                        {formData.content || 'Content will appear here...'}
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                                            {formData.tags.map((tag, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex justify-between items-center gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className={`px-4 py-2.5 flex items-center text-sm font-medium rounded-xl transition-colors ${showPreview ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                                >
                                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
                                    >
                                        {saving ? (
                                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> {editingBlog ? 'Update Post' : 'Create Post'}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Delete Blog Post"
                message="Are you sure you want to delete this blog post? This cannot be undone."
                confirmText="Delete"
                onConfirm={handleDelete}
                onCancel={() => setConfirmModal({ isOpen: false, id: null })}
            />
        </AdminLayout>
    )
}

export default BlogManagement
