import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Hotel, Stethoscope, ParkingCircle, TrendingUp, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    hotels: 0,
    medicalServices: 0,
    parking: 0,
    loading: true,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hotels, medical, parking] = await Promise.all([
          api.getHotels(),
          api.getMedicalServices(),
          api.getParking(),
        ])
        setStats({
          hotels: hotels.length || 0,
          medicalServices: medical.length || 0,
          parking: parking.length || 0,
          loading: false,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Hotels',
      value: stats.hotels,
      icon: Hotel,
      color: 'bg-blue-500',
    },
    {
      title: 'Medical Services',
      value: stats.medicalServices,
      icon: Stethoscope,
      color: 'bg-green-500',
    },
    {
      title: 'Parking Spaces',
      value: stats.parking,
      icon: ParkingCircle,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {stats.loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Manage Hotels</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove hotels from the database</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Manage Medical Services</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove medical facilities</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Manage Parking</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove parking spaces</p>
          </div>
        </div>
      </div>
    </div>
  )
}

