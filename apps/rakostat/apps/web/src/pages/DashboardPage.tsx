import { useQuery } from 'react-query'
import { Building2, Calendar, Users, TrendingUp } from 'lucide-react'
import { api } from '../services/api'

interface DashboardStats {
  totalUsers: number
  totalRooms: number
  totalBookings: number
  activeBookings: number
  totalTechnologies: number
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>(
    'dashboard-stats',
    () => api.get('/admin/dashboard').then(res => res.data)
  )

  const { data: recentBookings } = useQuery(
    'recent-bookings',
    () => api.get('/bookings?limit=5').then(res => res.data)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-costaatt-blue"></div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Technologies',
      value: stats?.totalTechnologies || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of the room booking system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentBookings?.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.room?.name} • {booking.room?.campus}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(booking.startTime).toLocaleDateString()}
                  </p>
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
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a
              href="/rooms"
              className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Building2 className="h-4 w-4 mr-3 text-costaatt-blue" />
              Browse Available Rooms
            </a>
            <a
              href="/bookings"
              className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Calendar className="h-4 w-4 mr-3 text-costaatt-blue" />
              View My Bookings
            </a>
            <a
              href="/calendar"
              className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Calendar className="h-4 w-4 mr-3 text-costaatt-blue" />
              Calendar View
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
