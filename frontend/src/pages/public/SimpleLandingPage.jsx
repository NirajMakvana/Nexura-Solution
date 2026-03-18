import { Link } from 'react-router-dom'
import {
  Code,
  Smartphone,
  Cloud,
  Search,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  Globe,
  Clock,
  Award,
  ChevronUp,
  ChevronDown,
  Zap,
  Users,
  Edit3,
  Database,
  Cpu,
  Layers
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import ReviewForm from '@/components/ui/ReviewForm'
import ReviewsSection from '@/components/ui/ReviewsSection'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'
import Logo from '@/components/ui/logo'
import SEO from '@/components/ui/SEO'
import { publicService } from '../../services/publicService'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

// Count-up hook for animated stats
const useCountUp = (target, duration = 1500, start = false) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || typeof target !== 'number') return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

const StatCard = ({ stat, visible, loading }) => {
  const count = useCountUp(stat.value || 0, 1500, visible && !loading)
  const display = loading ? '...' : stat.display ? stat.display : `${count}${stat.suffix}`
  return (
    <div className="text-center group">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors group-hover:scale-110 transform duration-300">
          <stat.icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {display}
      </div>
      <div className="text-gray-600 font-medium">{stat.label}</div>
    </div>
  )
}

const SimpleLandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const [showAllTestimonials, setShowAllTestimonials] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    satisfaction: 100
  })
  const [loading, setLoading] = useState(true)
  const [allTestimonials, setAllTestimonials] = useState([])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    loadStats()
    loadReviews()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects/count'),
        api.get('/clients/count')
      ])
      setStats({
        projects: projectsRes.data.total || 0,
        clients: clientsRes.data.total || 0,
        satisfaction: 100
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const res = await api.get('/reviews/public?limit=20')
      const mapped = res.data.map(r => ({
        name: r.name,
        position: r.company || 'Client',
        content: r.content,
        rating: r.rating
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const features = [
    {
      icon: Code,
      title: "Full Stack Development",
      description: "Complete web applications built with modern technologies like React, Node.js, and responsive design for optimal performance.",
      color: "bg-blue-500"
    },
    {
      icon: Smartphone,
      title: "UI/UX Design",
      description: "User-centered design solutions creating intuitive interfaces and exceptional user experiences for web and mobile applications.",
      color: "bg-green-500"
    },
    {
      icon: Cloud,
      title: "Graphics Design",
      description: "Creative visual solutions including logos, branding materials, and digital graphics that make your brand stand out.",
      color: "bg-yellow-500"
    },
    {
      icon: Search,
      title: "Cards & Banners",
      description: "Professional business cards, promotional banners, and marketing materials designed to enhance your brand presence.",
      color: "bg-purple-500"
    },
    {
      icon: Shield,
      title: "Web Development",
      description: "Custom websites and web applications with modern frameworks, responsive design, and SEO optimization.",
      color: "bg-red-500"
    },
    {
      icon: BarChart3,
      title: "Brand Identity",
      description: "Complete branding solutions including logo design, color schemes, and visual identity that represents your business.",
      color: "bg-indigo-500"
    }
  ]

  const statsDisplay = [
    { number: loading ? "..." : `${stats.projects}+`, label: "Projects Completed", icon: Globe },
    { number: loading ? "..." : `${stats.clients}+`, label: "Happy Clients", icon: Users },
    { number: `${stats.satisfaction}%`, label: "Client Satisfaction", icon: Clock },
    { number: "9AM-7PM", label: "Support Hours", icon: Award }
  ]

  const testimonials = allTestimonials

  const displayedTestimonials = showAllTestimonials ? testimonials : testimonials.slice(0, 3)

  const pricingPlans = [
    {
      name: "Basic Package",
      price: "₹15,000",
      period: "/project",
      description: "Perfect for small businesses",
      features: ["Simple Website (3-5 pages)", "Responsive Design", "Basic Graphics", "Contact Form", "1 Month Support"],
      popular: false
    },
    {
      name: "Professional Package",
      price: "₹35,000",
      period: "/project",
      description: "Ideal for growing companies",
      features: ["Advanced Website", "Custom UI/UX Design", "Graphics Package", "Admin Panel", "3 Months Support"],
      popular: true
    },
    {
      name: "Premium Package",
      price: "₹60,000",
      period: "/project",
      description: "For comprehensive solutions",
      features: ["Full Stack Application", "Complete Branding", "Custom Graphics", "Database Integration", "6 Months Support"],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Nexura Solutions | Premium Digital Products & IT Services"
        description="Transform your business with Nexura Solutions. We offer high-end UI/UX design, full stack development, and creative strategies tailored for startups and enterprises."
        keywords="Nexura Solutions, IT Services, Web Development India, Premium UI/UX Design, Remote Startup, Digital Agency"
      />
      {/* Navigation */}
      <Navbar currentPage="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 lg:pt-24 pb-12">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-200 to-purple-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column: Content */}
            <div className="text-left py-4 md:py-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-8 border border-blue-100 shadow-sm animate-fade-in-up">
                <span className="flex w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                Launched 2025 • Remote-First Startup
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight">
                Transform Your Business
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                  With Technology
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                India's emerging remote-first IT startup specializing in premium UI/UX design, full stack development, and complete digital solutions for modern businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex justify-center items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:-translate-y-1 group"
                >
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white text-gray-800 font-bold rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <Play className="h-5 w-5 mr-2 text-blue-600" />
                  View Our Work
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-gray-600">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Free Consultation
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  Premium Design
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <Zap className="w-5 h-5 text-blue-500 mr-2" />
                  Fast Delivery
                </div>
              </div>
            </div>

            {/* Right Column: 3D Tech Illustration */}
            <div className="hidden lg:block relative w-full h-[600px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Decorative background blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-3/4 -translate-y-3/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                {/* Central Platform Element */}
                <div className="relative z-10 w-72 h-72 bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white flex flex-col items-center justify-center transform hover:scale-110 transition-all duration-700 ease-out group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-colors"></div>
                  <div className="p-6 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-500/30 mb-5 transform group-hover:rotate-12 transition-transform duration-500">
                    <Layers className="w-12 h-12 text-white" />
                  </div>
                  <div className="font-bold text-gray-900 text-xl tracking-tight">Core Engine</div>
                  <div className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full mt-3 border border-blue-100 uppercase tracking-wider">v2.0 Active</div>
                </div>

                {/* Floating Tech Nodes - Matching Screenshot */}
                <div className="absolute top-[5%] left-[15%] p-6 bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white hover:scale-110 transition-transform duration-500 animate-float z-20">
                  <Code className="w-10 h-10 text-blue-600" />
                </div>

                <div className="absolute top-[15%] right-[5%] p-6 bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white hover:scale-110 transition-transform duration-500 animate-float z-20" style={{ animationDelay: '1s' }}>
                  <Cloud className="w-10 h-10 text-sky-500" />
                </div>

                <div className="absolute bottom-[25%] left-[5%] p-6 bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white hover:scale-110 transition-transform duration-500 animate-float z-20" style={{ animationDelay: '2s' }}>
                  <Smartphone className="w-10 h-10 text-indigo-600" />
                </div>

                <div className="absolute bottom-[5%] right-[15%] p-6 bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white hover:scale-110 transition-transform duration-500 animate-float z-20" style={{ animationDelay: '1.5s' }}>
                  <Database className="w-10 h-10 text-purple-600" />
                </div>

                <div className="absolute top-[45%] right-[-5%] p-5 bg-white/90 backdrop-blur-xl rounded-[1.2rem] shadow-2xl border border-white hover:scale-110 transition-transform duration-500 animate-float z-20" style={{ animationDelay: '2.5s' }}>
                  <Cpu className="w-8 h-8 text-green-500" />
                </div>

                {/* Connecting abstract lines/dots */}
                <svg className="absolute inset-0 w-full h-full pt-10 pl-10 -z-10 opacity-30" viewBox="0 0 400 400">
                  <path d="M 120 120 Q 200 200 280 150" fill="none" stroke="url(#line-grad-1)" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
                  <path d="M 100 280 Q 200 200 300 320" fill="none" stroke="url(#line-grad-2)" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '1s' }} />
                  <defs>
                    <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="line-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-16 bg-white" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: stats.projects, suffix: '+', label: 'Projects Completed', icon: Globe },
              { value: stats.clients, suffix: '+', label: 'Happy Clients', icon: Users },
              { value: stats.satisfaction, suffix: '%', label: 'Client Satisfaction', icon: Clock },
              { value: null, display: '9AM-7PM', label: 'Support Hours', icon: Award }
            ].map((stat, index) => (
              <StatCard key={index} stat={stat} visible={statsVisible} loading={loading} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete IT Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional technology services designed to accelerate your business growth,
              enhance digital presence, and drive innovation with cutting-edge solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover-lift group">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Client Says
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Real feedback from our valued client
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
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.position}</div>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white p-8 rounded-xl shadow-sm border-2 transition-all duration-300 hover-lift ${plan.popular ? 'border-blue-500 relative scale-105' : 'border-gray-200 hover:border-blue-300'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } block text-center`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-10 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-10 rounded-full animate-float delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white opacity-10 rounded-full animate-float delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Partner with Nexura Solutions for cutting-edge technology solutions.
            Let's transform your ideas into powerful digital experiences!
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn-nexura fixed bottom-8 right-8 p-3 rounded-full z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )
      }
    </div>
  )
}

export default SimpleLandingPage