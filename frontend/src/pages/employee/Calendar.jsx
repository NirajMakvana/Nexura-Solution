import { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  X,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import EmployeeLayout from '../../components/employee/EmployeeLayout'
import { employeeService } from '../../services/employeeService'
import { toast } from 'react-hot-toast'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [viewMode, setViewMode] = useState('month') // month, week, day

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  const loadEvents = async () => {
    try {
      // Mock events data
      const mockEvents = [
        {
          _id: '1',
          title: 'Team Standup Meeting',
          description: 'Daily standup with development team',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0),
          duration: 30,
          type: 'meeting',
          location: 'Conference Room A',
          attendees: ['Team Lead', 'Developers'],
          isRecurring: true,
          color: 'blue'
        },
        {
          _id: '2',
          title: 'Client Presentation',
          description: 'Present project progress to client',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 14, 0),
          duration: 60,
          type: 'meeting',
          location: 'Virtual - Zoom',
          attendees: ['Client', 'Project Manager', 'You'],
          isRecurring: false,
          color: 'purple'
        },
        {
          _id: '3',
          title: 'Code Review Session',
          description: 'Review pull requests from team members',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 15, 30),
          duration: 90,
          type: 'task',
          location: 'Online',
          attendees: ['Development Team'],
          isRecurring: false,
          color: 'green'
        },
        {
          _id: '4',
          title: 'Project Deadline',
          description: 'E-Commerce Platform Phase 1 delivery',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 17, 0),
          duration: 0,
          type: 'deadline',
          location: 'N/A',
          attendees: [],
          isRecurring: false,
          color: 'red'
        },
        {
          _id: '5',
          title: 'Training: React Advanced Patterns',
          description: 'Internal training session on advanced React patterns',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3, 11, 0),
          duration: 120,
          type: 'training',
          location: 'Training Room',
          attendees: ['All Developers'],
          isRecurring: false,
          color: 'orange'
        }
      ]
      setEvents(mockEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return Users
      case 'task': return CheckCircle
      case 'deadline': return AlertCircle
      case 'training': return CalendarIcon
      default: return CalendarIcon
    }
  }

  const getEventTypeColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[color] || colors.blue
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    if (!date) return false
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your schedule and upcoming events</p>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Events</p>
              <p className="text-xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Meetings</p>
              <p className="text-xl font-bold text-gray-900">{events.filter(e => e.type === 'meeting').length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tasks</p>
              <p className="text-xl font-bold text-gray-900">{events.filter(e => e.type === 'task').length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Deadlines</p>
              <p className="text-xl font-bold text-gray-900">{events.filter(e => e.type === 'deadline').length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date)
                return (
                  <button
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date}
                    className={`
                      aspect-square p-2 rounded-lg text-sm transition-all
                      ${!date ? 'invisible' : ''}
                      ${isToday(date) ? 'bg-green-100 border-2 border-green-600 font-bold' : ''}
                      ${isSelected(date) && !isToday(date) ? 'bg-blue-100 border-2 border-blue-600' : ''}
                      ${!isToday(date) && !isSelected(date) ? 'hover:bg-gray-100' : ''}
                      ${date && date.getMonth() !== currentDate.getMonth() ? 'text-gray-400' : 'text-gray-900'}
                    `}
                  >
                    {date && (
                      <div className="flex flex-col items-center">
                        <span>{date.getDate()}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  event.color === 'blue' ? 'bg-blue-500' :
                                  event.color === 'green' ? 'bg-green-500' :
                                  event.color === 'purple' ? 'bg-purple-500' :
                                  event.color === 'red' ? 'bg-red-500' :
                                  'bg-orange-500'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {formatDate(selectedDate)}
            </h3>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No events scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => {
                  const EventIcon = getEventTypeIcon(event.type)
                  return (
                    <button
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${getEventTypeColor(event.color)}`}
                    >
                      <div className="flex items-start gap-3">
                        <EventIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.date)}</span>
                            {event.duration > 0 && (
                              <span>({event.duration}min)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border-2 ${getEventTypeColor(selectedEvent.color)}`}>
                      {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time
                    </h4>
                    <p className="text-gray-900">{formatTime(selectedEvent.date)}</p>
                    {selectedEvent.duration > 0 && (
                      <p className="text-sm text-gray-500">{selectedEvent.duration} minutes</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h4>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                </div>

                {selectedEvent.attendees.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Attendees
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendees.map((attendee, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.isRecurring && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      This is a recurring event
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  )
}

export default Calendar
