import { Building2, Users, Calendar, Shield } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-costaatt-blue to-costaatt-green flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-costaatt-blue" />
          </div>
          <h2 className="text-3xl font-bold text-white">Rakostat</h2>
          <p className="mt-2 text-lg text-blue-100">
            COSTAATT Room Booking System
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Welcome to Rakostat
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Sign in with your COSTAATT Microsoft account to access the room booking system.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-costaatt-blue" />
                <span>Book rooms across 5 COSTAATT campuses</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-costaatt-blue" />
                <span>View availability and manage bookings</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-costaatt-blue" />
                <span>Role-based access control</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-costaatt-blue" />
                <span>Secure Microsoft 365 authentication</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                You will be redirected to Microsoft 365 for authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-blue-100">
            © 2024 COSTAATT. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
