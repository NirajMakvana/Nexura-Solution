import { Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Users,
  Briefcase,
  ArrowRight,
  Star,
  Heart,
  Coffee,
  Zap,
  Award,
  TrendingUp,
  Globe,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import { publicService } from '@/services/publicService'
import { toast } from 'react-hot-toast'

const CareersPage = () => {
  const [jobOpenings, setJobOpenings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const data = await publicService.getJobOpenings()
      setJobOpenings(data)
    } catch (error) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load job openings')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: Heart,
      title: "Learning & Growth",
      description: "Continuous learning opportunities and skill development programs"
    },
    {
      icon: Coffee,
      title: "100% Remote Work",
      description: "Work from anywhere in India with complete flexibility"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Grow with the company and take on new challenges"
    },
    {
      icon: Award,
      title: "Project Bonuses",
      description: "Performance-based bonuses on successful project completion"
    },
    {
      icon: Zap,
      title: "Modern Tech Stack",
      description: "Work with latest technologies and development tools"
    },
    {
      icon: Globe,
      title: "Diverse Projects",
      description: "Work on varied projects across different industries"
    }
  ]

  const companyValues = [
    {
      title: "Quality First",
      description: "We deliver high-quality solutions that exceed client expectations and stand the test of time."
    },
    {
      title: "Innovation & Learning",
      description: "We embrace new technologies and continuously learn to stay ahead in the rapidly evolving tech landscape."
    },
    {
      title: "Client Partnership",
      description: "We build long-term relationships with our clients, understanding their needs and growing together."
    },
    {
      title: "Team Collaboration",
      description: "We believe in open communication, knowledge sharing, and supporting each other's growth."
    }
  ]

  const stats = [
    { number: "4", label: "Team Members", icon: Users },
    { number: "5", label: "Projects Completed", icon: Briefcase },
    { number: "2025", label: "Founded", icon: Star },
    { number: "100%", label: "Remote Team", icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar currentPage="careers" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Amazing Team</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Join our growing remote-first IT startup. We're looking for passionate individuals
              who want to build innovative solutions and grow with us from the ground up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#openings"
                className="btn-nexura flex items-center justify-center group"
              >
                View Open Positions
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/about"
                className="btn-nexura-outline"
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
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

      {/* Why Join Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Nexura Solutions?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer more than just a job - we provide an opportunity to grow with a startup and make a real impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover-lift group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl hover-lift transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section id="openings" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {jobOpenings.length > 0 ? `Current Openings (${jobOpenings.length})` : 'Current Openings'}
            </h2>
            <p className="text-xl text-gray-600">
              {jobOpenings.length > 0
                ? "Join our team and work on exciting projects"
                : "Check back soon for new opportunities"}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          ) : jobOpenings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 max-w-2xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Openings</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                We're not currently hiring for specific roles, but we're always looking for exceptional talent to join our remote-first team.
              </p>
              <Link to="/contact" className="btn-nexura inline-flex items-center">
                Submit Your Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {jobOpenings.map((job) => (
                <div key={job._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Briefcase className="w-4 h-4 mr-2" />
                          <span className="mr-4">{job.department}</span>
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{job.description}</p>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Experience: {job.experience}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center mb-4">
                          <Star className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-700 font-medium">Salary: {job.salary}</span>
                        </div>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/apply/${job._id}`}
                      className="btn-nexura flex items-center group w-fit"
                    >
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Don't See Your Perfect Role?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We're always open to connecting with talented individuals. Even if we don't have an opening that matches your skills right now, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="btn-nexura-cta-white flex items-center justify-center group"
            >
              Send Your Resume
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="btn-nexura-cta-outline"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default CareersPage