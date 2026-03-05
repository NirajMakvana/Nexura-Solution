import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Heart,
  Eye,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle,
  Code,
  Smartphone,
  Search,
  TrendingUp,
  Zap,
  AlertCircle
} from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import { publicService } from '../../services/publicService'
import { toast } from 'react-hot-toast'

const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:5002'

const getCategoryIcon = (category) => {
  switch (category) {
    case 'web-development': return Code
    case 'ui-ux-design': return Smartphone
    case 'graphics-design': return Search
    case 'company-news': return TrendingUp
    default: return Zap
  }
}

const BlogArticlePage = () => {
  const { articleId } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch from dynamic API first
        let articleData = null
        let allBlogs = []

        try {
          const res = await fetch(`${BASE_API}/api/blogs/${articleId}`)
          if (res.ok) {
            articleData = await res.json()
          }
        } catch (e) { /* fallback */ }

        try {
          const res = await fetch(`${BASE_API}/api/blogs`)
          if (res.ok) {
            allBlogs = await res.json()
          }
        } catch (e) { /* fallback */ }

        if (articleData) {
          setArticle(articleData)
          setRelatedArticles(
            (Array.isArray(allBlogs) ? allBlogs : [])
              .filter(b => b._id !== articleData._id)
              .slice(0, 3)
          )
        } else {
          setError('Article not found')
        }
      } catch (err) {
        setError('Failed to load article')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [articleId])

  const handleShare = (platform) => {
    const url = window.location.href
    const title = article?.title || ''

    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar currentPage="blog" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar currentPage="blog" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link to="/blog" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const author = typeof article.author === 'object' ? article.author?.firstName + ' ' + article.author?.lastName : (article.author || 'Nexura Team')
  const authorInitials = author.split(' ').map(n => n[0]).join('').slice(0, 2)
  const tags = Array.isArray(article.tags) ? article.tags : []
  const views = article.views || 0
  const publishDate = article.publishDate || article.createdAt

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="blog" />

      {/* Back to Blog */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </div>
      </section>

      {/* Article Header */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {React.createElement(getCategoryIcon(article.category), { className: "w-4 h-4 text-white" })}
              </div>
              <span className="text-sm font-medium text-blue-600 capitalize">
                {(article.category || '').replace(/-/g, ' ')}
              </span>
              {article.featured && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {article.excerpt}
              </p>
            )}

            {/* Article Meta */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {authorInitials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{author}</div>
                    {article.authorRole && <div className="text-gray-600 text-sm">{article.authorRole}</div>}
                  </div>
                </div>

                <div className="text-gray-500 text-sm space-y-1">
                  {publishDate && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                  {article.readTime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6 text-gray-500 text-sm">
                {views > 0 && (
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {views.toLocaleString()} views
                  </div>
                )}
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                  {(article.likes || 0) + (liked ? 1 : 0)}
                </button>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center space-x-4 pb-8 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Share:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                title="Copy link"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-800"
            dangerouslySetInnerHTML={{ __html: article.content || article.body || `<p>${article.excerpt || ''}</p>` }}
          />
        </div>
      </section>

      {/* Author Bio */}
      {article.authorBio && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {authorInitials}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">About {author}</h3>
                  {article.authorRole && <p className="text-blue-600 font-medium mb-4">{article.authorRole}</p>}
                  <p className="text-gray-700 leading-relaxed">{article.authorBio}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Articles</h2>
              <p className="text-lg text-gray-600">Continue reading with these related posts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((related) => (
                <article key={related._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {React.createElement(getCategoryIcon(related.category), { className: "w-4 h-4 text-white" })}
                    </div>
                    <span className="text-sm font-medium text-blue-600 capitalize">
                      {(related.category || '').replace(/-/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${related._id}`}>{related.title}</Link>
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">{related.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{typeof related.author === 'object' ? related.author?.firstName : related.author}</span>
                    {related.readTime && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {related.readTime}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/blog/${related._id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group"
                  >
                    Read Article
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/portfolio"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default BlogArticlePage