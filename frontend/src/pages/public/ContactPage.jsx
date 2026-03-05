import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  Clock,
  Send,
  ArrowRight,
  CheckCircle,
  User,
  Building,
  Globe
} from 'lucide-react'
import { useState } from 'react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import SEO from '@/components/ui/SEO'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'
import { publicService } from '../../services/publicService'
import { toast } from 'react-hot-toast'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const MAX_MESSAGE = 1000

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'message' && value.length > MAX_MESSAGE) return
    if (name === 'email') {
      setEmailError(value && !validateEmail(value) ? 'Please enter a valid email address' : '')
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      await publicService.submitContact(formData)

      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

      toast.success('Thank you for contacting us! We will get back to you soon.')

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: ["info@nexurasolutions.com", "projects@nexurasolutions.com"],
      description: "Send us your project requirements"
    },
    {
      icon: WhatsAppIcon,
      title: "WhatsApp",
      details: ["+91 97266 69466", "Quick response guaranteed"],
      description: "Chat with us instantly for faster communication",
      link: "https://wa.me/919726669466"
    },
    {
      icon: Globe,
      title: "Remote-First Company",
      details: ["100% Virtual Operations", "Serving Clients Across India"],
      description: "We work remotely to serve you better"
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: Available for urgent projects"],
      description: "Flexible hours to accommodate your needs"
    }
  ]

  const services = [
    "UI/UX Design",
    "Full Stack Development",
    "Graphics Design",
    "Cards & Banners",
    "Website Development",
    "Mobile App Development",
    "Logo Design",
    "Business Cards"
  ]

  const budgetRanges = [
    "Under ₹15,000",
    "₹15,000 - ₹30,000",
    "₹30,000 - ₹60,000",
    "₹60,000 - ₹1,00,000",
    "Above ₹1,00,000"
  ]

  const timelines = [
    "ASAP (Rush Job)",
    "1-2 weeks",
    "1 month",
    "2-3 months",
    "3-6 months",
    "6+ months"
  ]

  const faqs = [
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary based on complexity. Simple websites take 1-2 weeks, UI/UX designs take 3-5 days, and graphics projects are usually completed within 2-3 days. We provide detailed timelines during consultation."
    },
    {
      question: "Do you provide revisions and support?",
      answer: "Yes, we offer unlimited revisions during the project phase and provide ongoing support after delivery. We ensure you're completely satisfied with the final result."
    },
    {
      question: "What is your payment process?",
      answer: "We typically work with a 50% advance payment to start the project and 50% upon completion. For larger projects, we can discuss milestone-based payments."
    },
    {
      question: "Can you work with tight deadlines?",
      answer: "Absolutely! We understand business urgency and offer rush delivery options. Contact us with your timeline and we'll do our best to accommodate your needs."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact Us - Get Your Project Started"
        description="Contact Nexura Solutions for professional IT services. Get quotes for UI/UX design, web development, graphics design, and digital solutions. Free consultation available."
        keywords="contact nexura solutions, IT services quote, web development contact, UI/UX design inquiry, graphics design services"
      />

      {/* Navigation */}
      <Navbar currentPage="contact" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get In
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Touch</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to start your project? Let's discuss your requirements and create
              a solution that drives your business forward.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Start Your Project</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours with a detailed proposal.
              </p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-6">
                    Your message has been sent successfully. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-nexura"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${emailError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="+91 97266 69466"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select a subject</option>
                        {services.map((service, index) => (
                          <option key={index} value={service}>{service}</option>
                        ))}
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Partnership">Partnership Opportunity</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs ${formData.message.length > MAX_MESSAGE * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                        {formData.message.length}/{MAX_MESSAGE}
                      </span>
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      maxLength={MAX_MESSAGE}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell us about your project requirements, goals, and any specific features you need..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-nexura flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Get in touch with us through any of these channels. We're here to help you succeed.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200">
                    <div className="flex items-start">
                      <div className={`w-12 h-12 ${info.title === 'WhatsApp' ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                        <div className="space-y-1 mb-2">
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-gray-700 font-medium">{detail}</p>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{info.description}</p>
                        {info.link && (
                          <a
                            href={info.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            <WhatsAppIcon className="w-4 h-4 mr-2" />
                            Chat Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">24hrs</div>
                    <div className="text-blue-100 text-sm">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">1</div>
                    <div className="text-blue-100 text-sm">Happy Client</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">5</div>
                    <div className="text-blue-100 text-sm">Projects Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">2025</div>
                    <div className="text-blue-100 text-sm">Founded</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Common questions about our services and process
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your digital journey with Nexura Solutions. Let's create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/portfolio"
              className="btn-nexura-cta-white flex items-center justify-center group"
            >
              View Our Work
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/services"
              className="btn-nexura-cta-outline"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ContactPage