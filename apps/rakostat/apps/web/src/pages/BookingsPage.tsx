import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Calendar, Clock, MapPin, User, MoreVertical } from 'lucide-react'
import { api } from '../services/api'

interface Booking {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: string
  user: {
    name: string
    email: string
  }
  room: {
    id: string
    name: string
    campus: string
  }
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
}

export default function BookingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: bookings, isLoading } = useQuery<Booking[]>(
    'bookings',
    () => api.get('/bookings').then(res => res.data)
  )

  const cancelBookingMutation = useMutation(
    (id: string) => api.patch(`/bookings/${id}/cancel`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
      },
    }
  )

  const confirmBookingMutation = useMutation(
    (id: string) => api.patch(`/bookings/${id}/confirm`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
      },
    }
  )

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id)
    }
  }

  const handleConfirm = (id: string) => {
    confirmBookingMutation.mutate(id)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your room bookings and reservations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings?.map((booking) => (
          <div key={booking.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.title}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]}`}>
                    {booking.status}
                  </span>
                </div>
                
                {booking.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {booking.description}
                  </p>
                )}

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(booking.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {booking.room.name} • {booking.room.campus.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  {booking.user.name}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {booking.status === 'PENDING' && (
                  <button
                    onClick={() => handleConfirm(booking.id)}
                    className="btn-success text-sm"
                    disabled={confirmBookingMutation.isLoading}
                  >
                    Confirm
                  </button>
                )}
                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="btn-secondary text-sm"
                    disabled={cancelBookingMutation.isLoading}
                  >
                    Cancel
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookings?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first booking.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
