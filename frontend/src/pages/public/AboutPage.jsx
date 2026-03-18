import { Link } from 'react-router-dom'
import {
  Users,
  Target,
  Award,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Clock,
  Shield,
  Code,
  Smartphone,
  Cloud,
  TrendingUp,
  Heart,
  Lightbulb,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import SEO from '@/components/ui/SEO'
import ReviewForm from '@/components/ui/ReviewForm'
import { publicService } from '@/services/publicService'
import { toast } from 'react-hot-toast'

const AboutPage = () => {
  const [team, setTeam] = useState([])
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    employees: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [teamData, statsData] = await Promise.all([
        publicService.getTeamMembers().catch(() => []),
        publicService.getCompanyStats().catch(() => ({ projects: 0, clients: 0 }))
      ])
      setTeam(teamData || [])
      setStats(statsData || {})
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const launchYear = new Date().getFullYear();

  const displayStats = [
    { number: "New", label: `Company (${launchYear})`, icon: Clock },
    { number: `${stats.projects >= 0 ? stats.projects : 0}+`, label: "Projects Completed", icon: Award },
    { number: `${stats.clients >= 0 ? stats.clients : 0}+`, label: "Happy Clients", icon: Users },
    { number: "9AM-7PM", label: "Support Available", icon: Shield }
  ]

  const values = [
    {
      icon: Target,
      title: "Design Excellence",
      description: "We prioritize exceptional UI/UX design that creates intuitive and engaging user experiences for every project."
    },
    {
      icon: Users,
      title: "Client-Centric",
      description: "Your success is our success. We work closely with clients to understand their vision and deliver beyond expectations."
    },
    {
      icon: Shield,
      title: "Quality First",
      description: "Every project undergoes thorough testing and quality checks to ensure reliable, secure, and scalable solutions."
    },
    {
      icon: Heart,
      title: "Team Collaboration",
      description: "Our small but dedicated team brings creativity, expertise, and passion to every project we undertake."
    }
  ]

  const milestones = [
    {
      year: launchYear.toString(),
      title: "Company Founded",
      description: "Started Nexura Solutions with a vision to provide exceptional UI/UX design and full-stack development services."
    },
    {
      year: launchYear.toString(),
      title: "First Client Success",
      description: "Successfully delivered our first project for Dharmesh Hadiyal, establishing our reputation for quality work."
    },
    {
      year: launchYear.toString(),
      title: "Team Formation",
      description: `Assembled a talented team of ${stats.employees || 4} professionals specializing in design and development.`
    },
    {
      year: launchYear.toString(),
      title: `${Math.max(stats.projects || 0, 5)}+ Projects Milestone`,
      description: `Completed ${Math.max(stats.projects || 0, 5)}+ successful projects, building our portfolio and client satisfaction record.`
    },
    {
      year: launchYear.toString(),
      title: "Remote-First Approach",
      description: "Established our remote-first work culture, enabling us to serve clients globally with competitive pricing."
    },
    {
      year: "Future",
      title: "Growth & Expansion",
      description: "Planning to expand our services and reach more clients while maintaining our commitment to quality."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Nexura Solutions | Remote-First IT Startup"
        description="Learn about Nexura Solutions, a passionate remote-first IT startup offering premium UI/UX design and full stack development."
        keywords="About Nexura Solutions, Remote IT Company, Startup, Team, Mission, Values"
      />
      {/* Navigation */}
      <Navbar currentPage="about" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Nexura Solutions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are a passionate team of {stats.employees || 4} professionals specializing in UI/UX design and full-stack development,
              working remotely to deliver exceptional digital solutions for businesses worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors group-hover:scale-110 transform duration-300">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2025, Nexura Solutions started with a clear mission: to provide exceptional UI/UX design
                and full-stack development services through a remote-first approach. Our founder Niraj Makvana,
                with his passion for design, assembled a talented team of developers to create comprehensive digital solutions.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Today, our team of 4 dedicated professionals works collaboratively to deliver high-quality projects
                that exceed client expectations. We believe in combining beautiful design with robust development
                to create digital experiences that truly make a difference.
              </p>
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">100% Remote-First Company</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Specialized in UI/UX & Full Stack Development</span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                <Lightbulb className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-blue-100 leading-relaxed">
                  To create exceptional digital experiences through innovative UI/UX design and robust full-stack development,
                  helping businesses establish a strong digital presence and achieve their goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our work and define our company culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group hover-lift">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Talented professionals dedicated to delivering exceptional results
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No team members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => {
                const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'
                const avatarUrl = member.avatar ? `${apiBase}${member.avatar}` : null

                return (
                  <div key={member._id || index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    {/* Avatar Area */}
                    <div className="h-56 bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div
                        className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                        style={{ display: avatarUrl ? 'none' : 'flex' }}
                      >
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      {member.department && (
                        <span className="mt-3 px-3 py-1 bg-white/80 text-blue-700 text-xs font-semibold rounded-full backdrop-blur-sm shadow-sm">
                          {member.department}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-blue-600 font-semibold text-sm mb-3">{member.position || member.role}</p>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                        {member.bio || `${member.position || member.role} at Nexura Solutions`}
                      </p>
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {member.skills.slice(0, 3).map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full font-medium border border-gray-100">
                              +{member.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our company's growth and evolution
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help transform your business with innovative technology solutions.
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

export default AboutPage