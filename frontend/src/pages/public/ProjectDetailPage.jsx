import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Tag,
  TrendingUp,
  CheckCircle,
  Code,
  Smartphone,
  Cloud,
  Monitor,
  Database,
  Palette,
  Users,
  Globe,
  Clock,
  DollarSign,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import { publicService } from '../../services/publicService'

const getCategoryIcon = (category) => {
  const c = (category || '').toLowerCase()
  if (c.includes('mobile')) return Smartphone
  if (c.includes('cloud')) return Cloud
  if (c.includes('database')) return Database
  if (c.includes('design') || c.includes('ui') || c.includes('ux') || c.includes('graphic')) return Palette
  if (c.includes('digital') || c.includes('marketing')) return Globe
  return Code
}

const ProjectDetailPage = () => {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [otherProjects, setOtherProjects] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [proj, all] = await Promise.all([
          publicService.getPublicProject(projectId).catch(() => null),
          publicService.getPublicProjects().catch(() => [])
        ])
        if (proj) {
          setProject(proj)
          setOtherProjects((all || []).filter(p => p._id !== proj._id).slice(0, 3))
        } else {
          setError('Project not found')
        }
      } catch (err) {
        setError('Failed to load project. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-500 mb-6">{error || 'This project does not exist.'}</p>
          <Link to="/portfolio" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    )
  }

  const CategoryIcon = getCategoryIcon(project.category)
  const clientName = typeof project.client === 'object' ? project.client?.name : project.client
  const budgetDisplay = typeof project.budget === 'number'
    ? `₹${project.budget.toLocaleString()}`
    : project.budget || 'N/A'
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const teamCount = Array.isArray(project.team) ? project.team.length : 0
  const progress = project.progress || 0

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="portfolio" />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/portfolio"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portfolio
        </Link>
      </div>

      {/* Project Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  {project.category || 'Project'}
                </span>
                {project.endDate && (
                  <span className="ml-3 text-gray-500">
                    {new Date(project.endDate).getFullYear()}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {project.name}
              </h1>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {project.description}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {clientName && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Client</div>
                    <div className="font-semibold text-gray-900">{clientName}</div>
                  </div>
                )}
                {project.startDate && project.endDate && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Duration</div>
                    <div className="font-semibold text-gray-900">
                      {Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24 * 30))} months
                    </div>
                  </div>
                )}
                {project.budget && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Budget</div>
                    <div className="font-semibold text-gray-900">{budgetDisplay}</div>
                  </div>
                )}
                {teamCount > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Team Size</div>
                    <div className="font-semibold text-gray-900">{teamCount} member{teamCount !== 1 ? 's' : ''}</div>
                  </div>
                )}
              </div>

              {/* Progress */}
              {progress > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Project Progress</span>
                    <span className="font-semibold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <span className={`px-4 py-2 rounded-full font-medium text-sm ${project.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CategoryIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{project.name}</h3>
                  <p className="text-gray-600 mt-2">{project.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Used */}
      {technologies.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Technologies Used</h2>
              <p className="text-lg text-gray-600">
                Cutting-edge technologies for optimal performance
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <span className="font-medium text-gray-900">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Project Timeline */}
      {project.startDate && project.endDate && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Timeline</h2>
            </div>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center bg-blue-50 rounded-xl p-6 flex-1 max-w-xs">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p className="font-semibold text-gray-900">{new Date(project.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="text-center bg-green-50 rounded-xl p-6 flex-1 max-w-xs">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">End Date</p>
                <p className="font-semibold text-gray-900">{new Date(project.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherProjects.map((proj) => {
                const Icon = getCategoryIcon(proj.category)
                return (
                  <Link key={proj._id} to={`/portfolio/${proj._id}`} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{proj.name}</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{proj.category}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's create something amazing together. Contact us to discuss your project requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Project
            </Link>
            <Link
              to="/portfolio"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View More Projects
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ProjectDetailPage