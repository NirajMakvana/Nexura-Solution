import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Code,
  Smartphone,
  Search,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Database,
  Palette,
  Settings,
  Users,
  Monitor,
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react'
import Logo from '@/components/ui/logo'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import SEO from '@/components/ui/SEO'
import ReviewForm from '@/components/ui/ReviewForm'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const ServicesPage = () => {
  const [showAllTestimonials, setShowAllTestimonials] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [allTestimonials, setAllTestimonials] = useState([])

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const res = await api.get('/reviews/public?limit=20')
      const mapped = res.data.map(r => ({
        name: r.name,
        company: r.company || 'Client',
        content: r.content,
        rating: r.rating,
        service: r.service || 'General'
      }))
      if (mapped.length > 0) setAllTestimonials(mapped)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      await api.post('/reviews', {
        name: reviewData.name,
        email: reviewData.email,
        company: reviewData.company || '',
        rating: reviewData.rating,
        content: reviewData.content,
        service: reviewData.service || ''
      })
      toast.success('Thank you for your review! It will be published after approval.')
      setShowReviewForm(false)
    } catch (error) {
      console.error('Review submit error:', error)
      toast.error(error.response?.data?.message || 'Failed to submit review. Please try again.')
    }
  }
  const mainServices = [
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "User-centered design solutions creating intuitive and engaging digital experiences",
      features: ["User Research", "Wireframing", "Prototyping", "Visual Design", "Usability Testing"],
      technologies: ["Figma", "Adobe XD", "Sketch", "InVision"],
      price: "Starting from ₹15,000",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Code,
      title: "Full Stack Development",
      description: "Complete web applications built with modern technologies and best practices",
      features: ["Frontend Development", "Backend Development", "Database Design", "API Integration", "Responsive Design"],
      technologies: ["React.js", "Node.js", "MongoDB", "JavaScript"],
      price: "Starting from ₹25,000",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Palette,
      title: "Graphics Design",
      description: "Creative visual solutions including logos, branding, and digital graphics",
      features: ["Logo Design", "Brand Identity", "Digital Graphics", "Print Design", "Social Media Graphics"],
      technologies: ["Adobe Photoshop", "Illustrator", "Canva", "Figma"],
      price: "Starting from ₹5,000",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Monitor,
      title: "Cards & Banners",
      description: "Professional business cards, promotional banners, and marketing materials",
      features: ["Business Cards", "Promotional Banners", "Social Media Banners", "Print Materials", "Digital Ads"],
      technologies: ["Adobe Creative Suite", "Canva", "Figma", "CorelDRAW"],
      price: "Starting from ₹2,000",
      color: "from-orange-500 to-red-500"
    }
  ]

  const additionalServices = [
    {
      icon: Database,
      title: "Website Development",
      description: "Custom websites with modern design and functionality"
    },
    {
      icon: Smartphone,
      title: "Mobile UI Design",
      description: "Mobile app interface design and user experience"
    },
    {
      icon: Settings,
      title: "Brand Consultation",
      description: "Strategic branding advice and visual identity planning"
    },
    {
      icon: Shield,
      title: "Design Systems",
      description: "Comprehensive design systems and style guides"
    },
    {
      icon: BarChart3,
      title: "Print Design",
      description: "Brochures, flyers, and other print marketing materials"
    },
    {
      icon: Users,
      title: "Design Support",
      description: "Ongoing design support and maintenance services"
    }
  ]

  const process = [
    {
      step: "01",
      title: "Discovery & Planning",
      description: "We understand your requirements, analyze your business needs, and create a detailed project roadmap.",
      icon: Search
    },
    {
      step: "02",
      title: "Design & Prototyping",
      description: "Our design team creates wireframes, mockups, and interactive prototypes for your approval.",
      icon: Palette
    },
    {
      step: "03",
      title: "Development & Testing",
      description: "Our developers build your solution using best practices with continuous testing and quality assurance.",
      icon: Code
    },
    {
      step: "04",
      title: "Deployment & Support",
      description: "We deploy your solution and provide ongoing maintenance and support to ensure optimal performance.",
      icon: Zap
    }
  ]

  const technologies = [
    { name: "Figma", category: "Design" },
    { name: "Adobe XD", category: "Design" },
    { name: "Photoshop", category: "Graphics" },
    { name: "Illustrator", category: "Graphics" },
    { name: "React.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "JavaScript", category: "Programming" },
    { name: "MongoDB", category: "Database" },
    { name: "HTML/CSS", category: "Frontend" },
    { name: "Canva", category: "Graphics" },
    { name: "CorelDRAW", category: "Graphics" },
    { name: "Sketch", category: "Design" }
  ]

  const testimonials = allTestimonials

  const displayedTestimonials = showAllTestimonials ? testimonials : testimonials.slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar currentPage="services" />

      <SEO
        title="Our Services | Nexura Solutions"
        description="Explore our range of IT services including UI/UX design, full stack development, graphics design, and more."
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional IT services including UI/UX design, full stack development, graphics design,
              and custom digital solutions to elevate your business presence.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Core Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional technology services designed to accelerate your business growth
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift border border-gray-100">
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center mb-6`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">{service.price}</div>
                    <Link
                      to="/contact"
                      className="btn-nexura flex items-center group"
                    >
                      Get Quote
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized services to complement your technology stack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover-lift text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Development Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology that ensures successful project delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Technologies We Use</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technologies and frameworks for modern solutions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group hover-lift">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{tech.name}</h4>
                <p className="text-gray-500 text-xs">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Success stories from businesses we've helped transform
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-nexura flex items-center mx-auto group"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayedTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover-lift transition-all duration-300 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-200">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.company}</div>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {testimonial.service}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Reviews Button */}
          {testimonials.length > 3 && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllTestimonials(!showAllTestimonials)}
                className="btn-nexura flex items-center mx-auto group"
              >
                {showAllTestimonials ? (
                  <>
                    Show Less Reviews
                    <ChevronUp className="ml-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                  </>
                ) : (
                  <>
                    View All Reviews ({testimonials.length})
                    <ChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleReviewSubmit}
      />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's discuss your requirements and create a custom solution that drives your business forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="btn-nexura-cta-white flex items-center justify-center group"
            >
              Get Free Consultation
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

export default ServicesPage