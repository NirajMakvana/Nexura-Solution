import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/ui/logo'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'

const Navbar = ({ currentPage = '' }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navLinks = [
        { to: '/', label: 'Home', key: 'home' },
        { to: '/about', label: 'About', key: 'about' },
        { to: '/services', label: 'Services', key: 'services' },
        { to: '/portfolio', label: 'Portfolio', key: 'portfolio' },
        { to: '/blog', label: 'Blog', key: 'blog' },
        { to: '/careers', label: 'Careers', key: 'careers' },
        { to: '/contact', label: 'Contact', key: 'contact' }
    ]

    const isActive = (key) => currentPage === key

    return (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center">
                        <Logo size="md" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.key}
                                to={link.to}
                                className={`font-medium transition-colors ${isActive(link.key)
                                        ? 'text-blue-600'
                                        : 'text-gray-600 hover:text-blue-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Completely remove internal access from public view */}
                        {/* Internal access only via direct URLs: /admin/login and /employee/login */}

                        <a
                            href="https://wa.me/919726669466"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium transition-colors flex items-center"
                        >
                            <WhatsAppIcon className="w-4 h-4 mr-2" />
                            WhatsApp
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 p-2"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.key}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`font-medium transition-colors py-2 ${isActive(link.key)
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-blue-600'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Completely removed internal access from mobile menu */}
                            {/* Internal access only via direct URLs: /admin/login and /employee/login */}

                            <a
                                href="https://wa.me/919726669466"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsMenuOpen(false)}
                                className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-medium text-center transition-colors flex items-center justify-center mt-2"
                            >
                                <WhatsAppIcon className="w-4 h-4 mr-2" />
                                WhatsApp Us
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
