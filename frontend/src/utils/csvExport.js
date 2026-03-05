/**
 * Utility to export data to CSV and trigger a browser download
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Optional array of header mapping [{ key: 'firstName', label: 'First Name' }]
 * @param {string} filename - Name of the file to save as
 */
export const exportToCSV = (data, headers, filename = 'export.csv') => {
    if (!data || !data.length) {
        console.error('No data to export')
        return
    }

    // Use headers if provided, otherwise extract from the first object
    const headerRow = headers
        ? headers.map(h => h.label).join(',')
        : Object.keys(data[0]).join(',')

    const keys = headers
        ? headers.map(h => h.key)
        : Object.keys(data[0])

    const rows = data.map(item => {
        return keys.map(key => {
            let value = item[key]

            // Handle nested objects (simple stringification)
            if (value && typeof value === 'object') {
                value = JSON.stringify(value).replace(/"/g, '""')
            }

            // Escape commas and wrap in quotes for CSV safety
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`
            }
            return value === null || value === undefined ? '' : value
        }).join(',')
    })

    const csvContent = [headerRow, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
