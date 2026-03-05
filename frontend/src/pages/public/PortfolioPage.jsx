import { Link } from 'react-router-dom'
import {
  ExternalLink,
  Github,
  ArrowRight,
  Code,
  Smartphone,
  Cloud,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Tag,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import Navbar from '@/components/ui/navbar'
import SEO from '@/components/ui/SEO'
import { publicService } from '@/services/publicService'
import { toast } from 'react-hot-toast'

const PortfolioPage = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await publicService.getPublicProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from projects
  const categories = [
    { id: 'all', name: 'All Projects', count: projects.length },
    ...Array.from(new Set(projects.map(p => p.category).filter(Boolean))).map(cat => ({
      id: cat.toLowerCase(),
      name: cat,
      count: projects.filter(p => p.category === cat).length
    }))
  ]

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(project => project.category?.toLowerCase() === activeFilter)

  const featuredProjects = projects.slice(0, 2) // First 2 as featured

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('web') || cat.includes('development')) return Code
    if (cat.includes('design') || cat.includes('ui')) return Smartphone
    if (cat.includes('graphic')) return Search
    return Cloud
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Our Portfolio | Nexura Solutions"
        description="View our portfolio of successful projects including UI/UX design, web development, and digital graphics."
        keywords="Nexura Solutions Portfolio, Web Design Portfolio, IT Projects, UI/UX Portfolio, Development Case Studies"
      />
      {/* Navigation */}
      <Navbar currentPage="portfolio" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Portfolio</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our completed projects showcasing UI/UX design, full stack development,
              graphics design, and digital solutions delivered for our valued clients.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mx-4">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Coming Soon</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            We're currently polishing our latest masterpieces. Check back soon to see our recent success stories.
          </p>
          <Link to="/contact" className="btn-nexura mt-8 inline-block">
            Start Your Own Project
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Projects */}
          {featuredProjects.length > 0 && (
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Our most impactful projects demonstrating expertise in web development, UI/UX design, and digital solutions
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredProjects.map((project) => {
                    const CategoryIcon = getCategoryIcon(project.category)
                    return (
                      <div key={project._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift">
                        <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                          <div className="absolute top-4 right-4">
                            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Featured
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                              <CategoryIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{project.name}</h3>
                          </div>
                        </div>

                        <div className="p-8">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-blue-600 font-medium">{project.client?.name || 'Client'}</span>
                            <span className="text-gray-500 text-sm">
                              {project.endDate ? new Date(project.endDate).getFullYear() : '2025'}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>

                          {project.budget && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-3">Project Value:</h4>
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-gray-700 text-sm">₹{project.budget.toLocaleString()}</span>
                              </div>
                            </div>
                          )}

                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mb-6">
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <span key={techIndex} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {project.startDate && project.endDate && (
                                <>
                                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                </>
                              )}
                            </span>
                            <Link
                              to={`/portfolio/${project._id}`}
                              className="btn-nexura flex items-center group"
                            >
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Filter Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Projects</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                  Browse through our portfolio of {projects.length} completed projects
                </p>

                {/* Filter Buttons */}
                {categories.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveFilter(category.id)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${activeFilter === category.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                      >
                        {category.name}
                        <span className="ml-2 text-sm opacity-75">({category.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => {
                  const CategoryIcon = getCategoryIcon(project.category)
                  return (
                    <div key={project._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover-lift">
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <CategoryIcon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 px-4">{project.name}</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-blue-600 font-medium text-sm">{project.client?.name || 'Client'}</span>
                          <span className="text-gray-500 text-xs">
                            {project.endDate ? new Date(project.endDate).getFullYear() : '2025'}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{project.description}</p>

                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                                <span key={techIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  +{project.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {project.budget && (
                            <span className="text-sm text-green-600 font-medium">
                              ₹{project.budget.toLocaleString()}
                            </span>
                          )}
                          <Link
                            to={`/portfolio/${project._id}`}
                            className="btn-nexura btn-nexura-sm flex items-center group ml-auto"
                          >
                            View Details
                            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Ready to bring your ideas to life? Let's discuss your project requirements and create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="btn-nexura-cta-white flex items-center justify-center group"
            >
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/services"
              className="btn-nexura-cta-outline"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" className="mb-4" />
              <p className="text-gray-400 mb-6 max-w-md">
                Nexura Solutions provides comprehensive IT services to help businesses
                achieve digital transformation and sustainable growth.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/services" className="hover:text-white transition-colors">UI/UX Design</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Full Stack Development</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Graphics Design</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Cards & Banners</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Nexura Solutions. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PortfolioPage