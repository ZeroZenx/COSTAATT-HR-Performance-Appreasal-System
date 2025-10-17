import { Routes, Route } from 'react-router-dom'
import { useMsal } from '@msal/react'
import { useEffect } from 'react'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RoomsPage from './pages/RoomsPage'
import BookingsPage from './pages/BookingsPage'
import CalendarPage from './pages/CalendarPage'
import AdminPage from './pages/AdminPage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { instance } = useMsal()
  const { user, isLoading, login } = useAuth()

  useEffect(() => {
    // Check if user is already logged in
    const accounts = instance.getAllAccounts()
    if (accounts.length > 0) {
      login()
    }
  }, [instance, login])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-costaatt-blue"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  )
}

export default App
