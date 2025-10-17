import { useState } from 'react'
import { useQuery } from 'react-query'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { api } from '../services/api'

interface Booking {
  id: string
  title: string
  startTime: string
  endTime: string
  status: string
  room: {
    name: string
    campus: string
  }
  user: {
    name: string
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const { data: bookings, isLoading } = useQuery<Booking[]>(
    ['calendar-bookings', startOfMonth, endOfMonth],
    () => api.get(`/bookings/calendar?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`).then(res => res.data)
  )

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getBookingsForDate = (date: Date) => {
    if (!bookings) return []
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate.toDateString() === date.toDateString()
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-costaatt-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            View room bookings in calendar format
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="btn-secondary text-sm"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>
                }
                
                const dayBookings = getBookingsForDate(day)
                const isCurrentDay = isToday(day)
                const isSelectedDay = isSelected(day)
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      isCurrentDay ? 'bg-costaatt-blue text-white' : ''
                    } ${isSelectedDay ? 'ring-2 ring-costaatt-blue' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-sm font-medium">
                      {day.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayBookings.slice(0, 2).map(booking => (
                        <div
                          key={booking.id}
                          className={`text-xs p-1 rounded truncate ${
                            isCurrentDay 
                              ? 'bg-white text-costaatt-blue' 
                              : 'bg-costaatt-blue text-white'
                          }`}
                        >
                          {booking.title}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="space-y-3">
              {getBookingsForDate(selectedDate).map(booking => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {booking.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.room.name} • {booking.room.campus.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {getBookingsForDate(selectedDate).length === 0 && (
                <div className="text-center py-6">
                  <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No bookings for this date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
