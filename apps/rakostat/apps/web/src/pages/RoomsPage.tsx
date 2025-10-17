import { useState } from 'react'
import { useQuery } from 'react-query'
import { Search, Filter, Plus, MapPin, Users, Wifi } from 'lucide-react'
import { api } from '../services/api'

interface Room {
  id: string
  name: string
  campus: string
  capacity: number
  technologies: Array<{
    technology: {
      id: string
      name: string
    }
  }>
  _count: {
    bookings: number
  }
}

const CAMPUSES = [
  'CITY_CAMPUS',
  'NORTH_LEARNING_CENTER', 
  'CHAGUANAS_CAMPUS',
  'SAN_FERNANDO_CAMPUS',
  'TOBAGO_CAMPUS'
]

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('')
  const [minCapacity, setMinCapacity] = useState('')

  const { data: rooms, isLoading } = useQuery<Room[]>(
    ['rooms', selectedCampus],
    () => {
      const params = new URLSearchParams()
      if (selectedCampus) params.append('campus', selectedCampus)
      return api.get(`/rooms?${params.toString()}`).then(res => res.data)
    }
  )

  const { data: technologies } = useQuery(
    'technologies',
    () => api.get('/technologies').then(res => res.data)
  )

  const filteredRooms = rooms?.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCapacity = !minCapacity || room.capacity >= parseInt(minCapacity)
    return matchesSearch && matchesCapacity
  }) || []

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
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and search available rooms across all campuses
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Search Rooms</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by room name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="label">Campus</label>
            <select
              className="input"
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
            >
              <option value="">All Campuses</option>
              {CAMPUSES.map(campus => (
                <option key={campus} value={campus}>
                  {campus.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Minimum Capacity</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 20"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <div key={room.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {room.name}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {room.campus.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {room.capacity} people
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {room.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech.technology.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tech.technology.name}
                  </span>
                ))}
                {room.technologies.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{room.technologies.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {room._count.bookings} bookings
              </div>
              <button className="btn-primary text-sm">
                Book Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}
