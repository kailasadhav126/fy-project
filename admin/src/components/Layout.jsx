import { Link, useLocation } from 'wouter'
import { useAuth } from '../hooks/useAuth.jsx'
import { Home, Hotel, Stethoscope, ParkingCircle, Users, Calendar, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const [location, setLocation] = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setLocation('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/hotels', label: 'Hotels', icon: Hotel },
    { path: '/medical-services', label: 'Medical Services', icon: Stethoscope },
    { path: '/parking', label: 'Parking', icon: ParkingCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Kumbh Sahyogi</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location === item.path
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}

