import React from 'react'
import PropTypes from 'prop-types'

const Logo = ({
    className = '',
    size = 'md',
    variant = 'full'
}) => {
    const sizeClasses = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-12',
        xl: 'h-16'
    }

    if (variant === 'icon') {
        return (
            <div className={`${sizeClasses[size]} ${className}`}>
                <svg viewBox="0 0 60 60" className="h-full w-auto">
                    {/* N Letter with gradient */}
                    <defs>
                        <linearGradient id="nexura-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e40af" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M10 10 L10 50 L18 50 L18 28 L35 50 L42 50 L42 10 L34 10 L34 32 L17 10 Z"
                        fill="url(#nexura-gradient)"
                    />
                    {/* Upward arrow accent */}
                    <path
                        d="M45 15 L50 10 L55 15 M50 10 L50 25"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        fill="none"
                    />
                    {/* Small dots */}
                    <circle cx="48" cy="30" r="2" fill="#06b6d4" />
                    <circle cx="52" cy="35" r="1.5" fill="#3b82f6" />
                </svg>
            </div>
        )
    }

    if (variant === 'text') {
        return (
            <div className={`${className}`}>
                <span className="text-2xl font-bold text-gray-900">
                    Nexura <span className="text-primary">Solutions</span>
                </span>
            </div>
        )
    }

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* Icon */}
            <div className={sizeClasses[size]}>
                <svg viewBox="0 0 60 60" className="h-full w-auto">
                    <defs>
                        <linearGradient id="nexura-gradient-full" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e40af" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M10 10 L10 50 L18 50 L18 28 L35 50 L42 50 L42 10 L34 10 L34 32 L17 10 Z"
                        fill="url(#nexura-gradient-full)"
                    />
                    <path
                        d="M45 15 L50 10 L55 15 M50 10 L50 25"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        fill="none"
                    />
                    <circle cx="48" cy="30" r="2" fill="#06b6d4" />
                    <circle cx="52" cy="35" r="1.5" fill="#3b82f6" />
                </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col">
                <span className={`font-bold text-gray-900 ${size === 'sm' ? 'text-lg' :
                        size === 'md' ? 'text-xl' :
                            size === 'lg' ? 'text-2xl' : 'text-3xl'
                    }`}>
                    Nexura
                </span>
                <span className={`text-primary font-medium ${size === 'sm' ? 'text-xs' :
                        size === 'md' ? 'text-sm' :
                            size === 'lg' ? 'text-base' : 'text-lg'
                    }`}>
                    SOLUTIONS
                </span>
            </div>
        </div>
    )
}

Logo.propTypes = {
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    variant: PropTypes.oneOf(['full', 'icon', 'text'])
}

export default Logo
