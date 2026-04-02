import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  FolderOpen,
  Calendar,
  Download,
  Filter,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { SkeletonBox } from '../../components/ui/Skeleton'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('year')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalClients: 0,
    monthlyRevenue: [],
    projectStats: [],
    clientStats: [],
    avgProjectValue: 0
  })
  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAnalytics(timeRange)
      setAnalytics(prev => ({ ...prev, ...data }))
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Don't show toast on initial load failure to avoid spamming
    } finally {
      setLoading(false)
    }
  }

  // Export functionality
  const handleExportReport = () => {
    // Create CSV data
    const csvData = [
      ['Month', 'Revenue', 'Projects'],
      ...analytics.monthlyRevenue.map(item => [item.month, item.revenue, item.projects])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Filter data based on time range
  const getFilteredData = () => {
    const data = analytics.monthlyRevenue

    switch (timeRange) {
      case 'week':
        return data.slice(-1) // Last month as week data
      case 'month':
        return data.slice(-3) // Last 3 months
      case 'quarter':
        return data.slice(-3) // Last quarter
      case 'year':
        return data // Full year
      default:
        return data
    }
  }

  // Calculate dynamic metrics based on filtered data
  const filteredData = getFilteredData()
  const maxRevenue = filteredData.length > 0 ? Math.max(...filteredData.map(m => m.revenue || 0)) || 1 : 1
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const totalProjects = filteredData.reduce((sum, item) => sum + item.projects, 0)

  return (
    <AdminLayout>
      <div className="p-1 md:p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={handleExportReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : `₹${analytics.totalRevenue.toLocaleString()}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">From completed projects</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : analytics.activeProjects}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">In progress</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : analytics.totalClients}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">Happy clients</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Project Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : `₹${analytics.avgProjectValue.toLocaleString()}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">Per project</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Revenue Trend</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Projects</span>
              </div>
            </div>
          </div>

          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-md space-y-3">
                  <SkeletonBox className="h-4 w-3/4 mx-auto" />
                  <SkeletonBox className="h-4 w-2/3 mx-auto" />
                  <SkeletonBox className="h-4 w-1/2 mx-auto" />
                  <SkeletonBox className="h-4 w-5/6 mx-auto" />
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available</p>
              </div>
            ) : (
              <div className="flex items-end justify-between h-full space-x-2">
                {filteredData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="flex flex-col items-center justify-end h-64 w-full">
                      {/* Revenue Bar */}
                      <div
                        className="bg-blue-500 rounded-t w-full mb-1 relative group cursor-pointer hover:bg-blue-600 transition-colors"
                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{(data.revenue || 0).toLocaleString()}
                        </div>
                      </div>
                      {/* Projects indicator */}
                      <div className="flex space-x-1 mb-2">
                        {Array.from({ length: Math.min(data.projects, 10) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Categories & Top Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Categories */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Categories</h2>
            {loading ? (
              <div className="space-y-4 py-6">
                <SkeletonBox className="h-4 w-5/6 mx-auto" />
                <SkeletonBox className="h-4 w-4/6 mx-auto" />
                <SkeletonBox className="h-4 w-3/4 mx-auto" />
                <SkeletonBox className="h-4 w-2/3 mx-auto" />
              </div>
            ) : analytics.projectStats.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No project data available</p>
            ) : (
              <div className="space-y-4">
                {analytics.projectStats.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.count} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(category.revenue || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Clients</h2>
            {loading ? (
              <div className="space-y-4 py-6">
                <SkeletonBox className="h-4 w-5/6 mx-auto" />
                <SkeletonBox className="h-4 w-4/6 mx-auto" />
                <SkeletonBox className="h-4 w-3/4 mx-auto" />
                <SkeletonBox className="h-4 w-2/3 mx-auto" />
              </div>
            ) : analytics.clientStats.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No client data available</p>
            ) : (
              <div className="space-y-4">
                {analytics.clientStats.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(client.name || 'CN').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.projects} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(client.revenue || 0).toLocaleString()}</p>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600">{client.satisfaction}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">
                  {loading ? '...' : analytics.completedProjects > 0
                    ? Math.round((analytics.completedProjects / analytics.totalProjects) * 100)
                    : 0}%
                </span>
              </div>
              <h3 className="font-medium text-gray-900">Project Success Rate</h3>
              <p className="text-sm text-gray-600 mt-1">Projects completed successfully</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4.8</span>
              </div>
              <h3 className="font-medium text-gray-900">Client Satisfaction</h3>
              <p className="text-sm text-gray-600 mt-1">Average rating out of 5</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : analytics.totalProjects}
                </span>
              </div>
              <h3 className="font-medium text-gray-900">Total Projects</h3>
              <p className="text-sm text-gray-600 mt-1">All time project count</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Analytics