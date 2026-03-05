import React, { useState } from 'react'
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { notificationService } from '../../services/notificationService'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  React.useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id)
      const n = notifications.find(note => note._id === id)
      if (n && !n.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      setNotifications(notifications.filter(n => n._id !== id))
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id)
    }
    if (notification.link) {
      navigate(notification.link)
      setIsOpen(false)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'leave_status': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'leave_request': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'contact_form': return <Info className="w-5 h-5 text-blue-500" />
      case 'task_assigned': return <CheckCircle className="w-5 h-5 text-indigo-500" />
      default: return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getBgColor = (read, type) => {
    if (read) return 'bg-white'
    switch (type) {
      case 'leave_status': return 'bg-green-50/50 border-l-4 border-green-500'
      case 'leave_request': return 'bg-yellow-50/50 border-l-4 border-yellow-500'
      case 'contact_form': return 'bg-blue-50/50 border-l-4 border-blue-500'
      case 'task_assigned': return 'bg-indigo-50/50 border-l-4 border-indigo-500'
      default: return 'bg-gray-50 border-l-4 border-gray-300'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">You have {unreadCount} unread messages</p>
                </div>
                <div className="flex items-center space-x-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">Stay tuned for updates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 transition-all cursor-pointer group hover:bg-gray-50/80 ${getBgColor(notification.isRead, notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`text-xs font-bold leading-tight ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs mt-1 leading-normal ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="text-[10px] font-medium text-gray-400">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification._id); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {notification.link && (
                                <div className="text-blue-500">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 text-center bg-gray-50/30">
              <button className="text-[11px] font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest transition-colors">
                Recent Activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationCenter