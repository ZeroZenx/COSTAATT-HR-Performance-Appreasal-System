import { useQuery } from 'react-query'
import { 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  Activity,
  MapPin
} from 'lucide-react'
import { api } from '../services/api'

interface DashboardStats {
  totalUsers: number
  totalRooms: number
  totalBookings: number
  activeBookings: number
  totalTechnologies: number
}

interface CampusStats {
  campus: string
  rooms: number
  bookings: number
  users: number
}

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>(
    'admin-dashboard',
    () => api.get('/admin/dashboard').then(res => res.data)
  )

  const { data: campusStats, isLoading: campusLoading } = useQuery<CampusStats[]>(
    'campus-stats',
    () => api.get('/admin/campus-stats').then(res => res.data)
  )

  const { data: bookingTrends } = useQuery(
    'booking-trends',
    () => api.get('/admin/booking-trends?days=30').then(res => res.data)
  )

  const { data: roomUtilization } = useQuery(
    'room-utilization',
    () => api.get('/admin/room-utilization').then(res => res.data)
  )

  const { data: topBookedRooms } = useQuery(
    'top-booked-rooms',
    () => api.get('/admin/top-booked-rooms?limit=5').then(res => res.data)
  )

  if (statsLoading || campusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-costaatt-blue"></div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: Building2,
      color: 'bg-green-500',
      change: '+3%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Technologies',
      value: stats?.totalTechnologies || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+2%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          System overview and analytics
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
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campus Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Campus Statistics
          </h3>
          <div className="space-y-4">
            {campusStats?.map((campus) => (
              <div key={campus.campus} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {campus.campus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{campus.rooms} rooms</span>
                  <span>{campus.bookings} bookings</span>
                  <span>{campus.users} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Booked Rooms
          </h3>
          <div className="space-y-3">
            {topBookedRooms?.map((room: any, index: number) => (
              <div key={room.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 bg-costaatt-blue text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {room.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {room.campus.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {room.bookingCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Utilization */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Room Utilization
        </h3>
        <div className="space-y-3">
          {roomUtilization?.slice(0, 10).map((room: any) => (
            <div key={room.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {room.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {room.bookingCount} bookings
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-costaatt-blue h-2 rounded-full"
                    style={{ width: `${Math.min(room.utilization, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {room.campus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {room.utilization.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button className="card hover:shadow-md transition-shadow text-left">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-costaatt-blue" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Manage Users</h3>
              <p className="text-xs text-gray-500">Add, edit, or remove users</p>
            </div>
          </div>
        </button>

        <button className="card hover:shadow-md transition-shadow text-left">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-costaatt-blue" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Manage Rooms</h3>
              <p className="text-xs text-gray-500">Add or configure rooms</p>
            </div>
          </div>
        </button>

        <button className="card hover:shadow-md transition-shadow text-left">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-costaatt-blue" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">View Bookings</h3>
              <p className="text-xs text-gray-500">Monitor all bookings</p>
            </div>
          </div>
        </button>

        <button className="card hover:shadow-md transition-shadow text-left">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-costaatt-blue" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Reports</h3>
              <p className="text-xs text-gray-500">Generate usage reports</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
