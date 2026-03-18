import { useState, useEffect } from 'react'
import { Clock, Calendar, CheckCircle, XCircle, MapPin, Download, TrendingUp, Play, Square } from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'

const AttendancePortal = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClockIn, setIsClockIn] = useState(false)
  const [hasCompletedShift, setHasCompletedShift] = useState(false)
  const [clockInTime, setClockInTime] = useState(null)
  const [currentAttendanceId, setCurrentAttendanceId] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalHours: 0,
    avgHours: 0
  })
  // Get current employee
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load attendance data
  useEffect(() => {
    loadAttendance()
  }, [selectedMonth, selectedYear])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const records = await employeeService.getAttendance(selectedMonth, selectedYear)
      setAttendanceRecords(records)

      // Check if already clocked in today
      const today = new Date().toDateString()
      const todayRecord = records.find(r => new Date(r.date).toDateString() === today)

      setIsClockIn(false)
      setHasCompletedShift(false)

      if (todayRecord) {
        if (todayRecord.clockIn && !todayRecord.clockOut) {
          setIsClockIn(true)
          setClockInTime(new Date(todayRecord.clockIn))
          setCurrentAttendanceId(todayRecord._id)
        } else if (todayRecord.clockIn && todayRecord.clockOut) {
          setHasCompletedShift(true)
        }
      }

      // Calculate stats
      const totalPresent = (records || []).filter(r => r.status === 'Present' || r.status === 'Late').length
      const totalAbsent = (records || []).filter(r => r.status === 'Absent').length
      const totalHours = (records || []).reduce((sum, r) => sum + (parseFloat(r.totalHours || 0) || 0), 0)
      const avgHours = (records && records.length > 0) ? (totalHours / records.length).toFixed(2) : 0

      setStats({ totalPresent, totalAbsent, totalHours, avgHours })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    try {
      const response = await employeeService.clockIn('Office')
      setIsClockIn(true)
      setClockInTime(new Date(response.clockIn))
      setCurrentAttendanceId(response._id)
      toast.success('Clocked in successfully')
      loadAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in')
    }
  }

  const handleClockOut = async () => {
    try {
      await employeeService.clockOut(currentAttendanceId)
      setIsClockIn(false)
      setHasCompletedShift(true)
      setClockInTime(null)
      setCurrentAttendanceId(null)
      toast.success('Clocked out successfully')
      loadAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock out')
    }
  }

  const getWorkingHours = () => {
    if (!clockInTime) return '0h 0m'
    const diff = new Date() - clockInTime
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800'
      case 'Absent': return 'bg-red-100 text-red-800'
      case 'Late': return 'bg-yellow-100 text-yellow-800'
      case 'Half Day': return 'bg-orange-100 text-orange-800'
      case 'Leave': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <EmployeeLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Portal</h1>
          <p className="text-gray-600">Track your daily attendance and working hours</p>
        </div>

        {/* Clock In/Out Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Current Time</p>
                  <p className="text-3xl font-bold">{currentTime.toLocaleTimeString()}</p>
                </div>
              </div>
              <p className="text-sm opacity-90">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="text-center">
              {hasCompletedShift ? (
                <div>
                  <div className="mb-4">
                    <p className="text-sm opacity-90 mb-1">Shift Status</p>
                    <p className="text-xl font-bold">Completed for Today</p>
                  </div>
                  <button
                    disabled
                    className="bg-gray-200 text-gray-500 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Shift Completed
                  </button>
                </div>
              ) : isClockIn ? (
                <div>
                  <div className="mb-4">
                    <p className="text-sm opacity-90 mb-1">Working Hours</p>
                    <p className="text-4xl font-bold">{getWorkingHours()}</p>
                  </div>
                  <button
                    onClick={handleClockOut}
                    className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold  transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Square className="w-5 h-5" />
                    Clock Out
                  </button>
                </div>
              ) : (
                  <button
                    onClick={handleClockIn}
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold  transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    Clock In
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Present</p>
              <p className="text-xl font-bold text-gray-900">{loading ? '—' : stats.totalPresent}</p>
              <p className="text-xs text-gray-400 mt-0.5">This month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Absent</p>
              <p className="text-xl font-bold text-gray-900">{loading ? '—' : stats.totalAbsent}</p>
              <p className="text-xs text-gray-400 mt-0.5">This month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Hours</p>
              <p className="text-xl font-bold text-gray-900">{loading ? '—' : stats.totalHours.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-0.5">This month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Avg Hours/Day</p>
              <p className="text-xl font-bold text-gray-900">{loading ? '—' : stats.avgHours}</p>
              <p className="text-xs text-gray-400 mt-0.5">This month</p>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
              <span className="text-gray-600">{selectedYear}</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg ">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Attendance Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : (attendanceRecords || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No attendance records found for this month
                    </td>
                  </tr>
                ) : (
                  (attendanceRecords || []).map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTime(record.clockIn)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTime(record.clockOut)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.totalHours ? `${parseFloat(record.totalHours || 0).toFixed(2)}h` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {record.location || 'Office'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default AttendancePortal

