import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Eye,
  MessageCircle,
  TrendingUp,
  Code,
  Smartphone,
  Zap
} from 'lucide-react'
import Logo from '@/components/ui/logo'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import SEO from '@/components/ui/SEO'
import { publicService } from '../../services/publicService'
import { toast } from 'react-hot-toast'

const STATIC_POSTS = [
  {
    _id: '1',
    title: "Welcome to Nexura Solutions: Our Journey Begins",
    excerpt: "Introducing Nexura Solutions - a new remote-first IT company specializing in UI/UX design, full stack development, and graphics design.",
    author: "Niraj Makvana",
    authorRole: "Founder & UI/UX Designer",
    createdAt: "2025-01-15",
    readTime: "5 min read",
    category: "company-news",
    tags: ["Company", "Launch", "Remote Work", "IT Services"],
    views: 450,
    featured: true
  },
  {
    _id: '2',
    title: "Modern Web Development with React.js: Best Practices",
    excerpt: "Learn the essential best practices for building scalable and maintainable React.js applications in 2025.",
    author: "Jadav Kuldip",
    authorRole: "Senior Full Stack Developer",
    createdAt: "2025-01-10",
    readTime: "8 min read",
    category: "web-development",
    tags: ["React.js", "JavaScript", "Frontend", "Best Practices"],
    views: 680,
    featured: true
  },
  {
    _id: '3',
    title: "UI/UX Design Trends That Will Dominate 2025",
    excerpt: "Explore the latest UI/UX design trends that are shaping user experiences and how to implement them in your projects.",
    author: "Niraj Makvana",
    authorRole: "Founder & UI/UX Designer",
    createdAt: "2025-01-05",
    readTime: "6 min read",
    category: "ui-ux-design",
    tags: ["UI/UX", "Design Trends", "User Experience", "2025"],
    views: 520,
    featured: false
  },
  {
    _id: '4',
    title: "Building Full Stack Applications with Node.js and MongoDB",
    excerpt: "A comprehensive guide to creating robust backend systems using Node.js and MongoDB for modern web applications.",
    author: "Kargar Herry",
    authorRole: "Full Stack Developer",
    createdAt: "2025-01-02",
    readTime: "10 min read",
    category: "web-development",
    tags: ["Node.js", "MongoDB", "Backend", "Full Stack"],
    views: 390,
    featured: false
  },
  {
    _id: '5',
    title: "The Art of Visual Branding: Creating Memorable Graphics",
    excerpt: "Discover how effective graphics design can transform your brand identity and create lasting impressions.",
    author: "Niraj Makvana",
    authorRole: "Founder & UI/UX Designer",
    createdAt: "2024-12-28",
    readTime: "7 min read",
    category: "graphics-design",
    tags: ["Graphics", "Branding", "Visual Identity", "Design"],
    views: 310,
    featured: false
  },
  {
    _id: '6',
    title: "Responsive Design: Making Your Website Mobile-First",
    excerpt: "Learn why mobile-first design is crucial in 2025 and how to implement responsive design principles effectively.",
    author: "Dhruv Hadiyal",
    authorRole: "Project Manager",
    createdAt: "2024-12-25",
    readTime: "6 min read",
    category: "ui-ux-design",
    tags: ["Responsive Design", "Mobile First", "CSS", "Web Design"],
    views: 280,
    featured: false
  }
]

const BlogPage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setSubmitting(true)
    try {
      const res = await publicService.subscribeToNewsletter(email)
      toast.success(res.message || 'Subscribed successfully!')
      setEmail('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/blogs`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setBlogs(data)
        }
      } catch (err) {
        // Silently fallback to static data
      }
    }
    fetchBlogs()
  }, [])

  const categories = [
    { id: 'all', name: 'All Posts', count: blogs.length },
    { id: 'web-development', name: 'Web Development', count: blogs.filter(p => p.category === 'web-development').length },
    { id: 'ui-ux-design', name: 'UI/UX Design', count: blogs.filter(p => p.category === 'ui-ux-design').length },
    { id: 'graphics-design', name: 'Graphics Design', count: blogs.filter(p => p.category === 'graphics-design').length },
    { id: 'company-news', name: 'Company News', count: blogs.filter(p => p.category === 'company-news').length },
  ]

  const filteredPosts = blogs.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredPosts = blogs.filter(post => post.featured)
  const recentPosts = blogs.slice(0, 5)

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'web-development': return Code
      case 'ui-ux-design': return Smartphone
      case 'graphics-design': return Search
      case 'company-news': return TrendingUp
      default: return Zap
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar currentPage="blog" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Tech
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Insights, tutorials, and updates from the Nexura Solutions team. Stay informed about web development,
              UI/UX design, graphics, and the latest trends in technology.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-12">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {activeCategory === 'all' && featuredPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Articles</h2>
              <p className="text-lg text-gray-600">Our most popular and trending content</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <article key={post._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        {React.createElement(getCategoryIcon(post.category), { className: "w-8 h-8 text-white" })}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 px-4">{post.title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{post.author}</div>
                          <div className="text-gray-500 text-xs">{post.authorRole}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-gray-500 text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.views || 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {(post.tags || []).slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={`/blog/${post._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center group"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeCategory === 'all' ? 'Latest Articles' : categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-gray-600">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="space-y-8">
                {filteredPosts.map((post) => (
                  <article key={post._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          {React.createElement(getCategoryIcon(post.category), { className: "w-4 h-4 text-white" })}
                        </div>
                        <span className="text-sm font-medium text-blue-600 capitalize">
                          {post.category.replace(/-/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-gray-500 text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.views || 0}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post._id}`}>{post.title}</Link>
                    </h3>

                    <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{post.author}</div>
                          <div className="text-gray-500 text-sm">{post.authorRole}</div>
                        </div>
                      </div>

                      <div className="text-gray-500 text-sm">
                        <div className="flex items-center mb-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {(post.tags || []).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={`/blog/${post._id}`}
                        className="btn-nexura btn-nexura-sm flex items-center group"
                      >
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                {/* Recent Posts */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post._id} className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          {React.createElement(getCategoryIcon(post.category), { className: "w-6 h-6 text-white" })}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                            <Link to={`/blog/${post._id}`} className="hover:text-blue-600 transition-colors">
                              {post.title}
                            </Link>
                          </h4>
                          <div className="text-gray-500 text-xs flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React.js', 'Node.js', 'UI/UX', 'Graphics', 'JavaScript', 'MongoDB', 'Design', 'Branding'].map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer border border-gray-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Get the latest tech insights delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's turn your ideas into reality with our expert development team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="btn-nexura-cta-white flex items-center justify-center group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/portfolio"
              className="btn-nexura-cta-outline"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default BlogPage