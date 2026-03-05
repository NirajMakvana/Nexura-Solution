import React from 'react'

export const Avatar = ({
    src,
    firstName = '',
    lastName = '',
    name = '',
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-24 h-24 text-3xl'
    }

    // Determine initials
    let initials = ''
    if (firstName || lastName) {
        initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    } else if (name) {
        const parts = name.split(' ')
        initials = parts.length > 1
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : name.substring(0, 2).toUpperCase()
    }

    // Fallback icon if no name or pic
    if (!src && !initials) {
        initials = 'U'
    }

    const containerClass = `${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center shrink-0 ${className}`

    if (src) {
        return (
            <img
                src={src}
                alt={name || `${firstName} ${lastName}`}
                className={`${containerClass} object-cover border-2 border-white shadow-sm`}
                onError={(e) => {
                    e.target.onerror = null
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                }}
            />
        )
    }

    return (
        <div className={`${containerClass} bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-sm border-2 border-white`}>
            {initials}
        </div>
    )
}
