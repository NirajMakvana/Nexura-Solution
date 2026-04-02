import React from 'react'

/**
 * Simple role-based spinner for consistent loading UI.
 * @param {object} props
 * @param {'blue'|'green'|'white'} props.variant
 * @param {number} props.size
 * @param {string} props.className
 */
const Spinner = ({ variant = 'blue', size = 48, className = '' }) => {
  const borderColor =
    variant === 'green'
      ? 'border-green-600'
      : variant === 'white'
        ? 'border-white'
        : 'border-blue-600'

  return (
    <div
      className={`animate-spin rounded-full ${borderColor} border-b-2 mx-auto ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default Spinner

