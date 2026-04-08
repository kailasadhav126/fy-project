import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function Parking() {
  const [parking, setParking] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingParking, setEditingParking] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nameHindi: '',
    address: '',
    capacity: '',
    total_spaces: '',
    available_spaces: '',
    price_per_hour: '',
    price_per_day: '',
    opening_hours: '',
    phone: '',
    verified: true,
    latitude: '',
    longitude: '',
  })

  useEffect(() => {
    fetchParking()
  }, [])

  const fetchParking = async () => {
    try {
      setLoading(true)
      const data = await api.getParking()
      setParking(data)
    } catch (error) {
      console.error('Failed to fetch parking:', error)
      alert('Failed to load parking spaces')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const parkingData = {
        ...formData,
        capacity: Number(formData.capacity),
        total_spaces: Number(formData.total_spaces),
        available_spaces: Number(formData.available_spaces),
        price_per_hour: Number(formData.price_per_hour),
        price_per_day: Number(formData.price_per_day),
        verified: formData.verified,
        location: {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
        },
      }

      if (editingParking) {
        await api.updateParking(editingParking._id, parkingData)
      } else {
        await api.createParking(parkingData)
      }

      resetForm()
      fetchParking()
      alert(editingParking ? 'Parking space updated successfully!' : 'Parking space added successfully!')
    } catch (error) {
      alert('Failed to save parking space: ' + error.message)
    }
  }

  const handleEdit = (parkingSpace) => {
    setEditingParking(parkingSpace)
    setFormData({
      name: parkingSpace.name || '',
      nameHindi: parkingSpace.nameHindi || '',
      address: parkingSpace.address || '',
      capacity: parkingSpace.capacity || '',
      total_spaces: parkingSpace.total_spaces || '',
      available_spaces: parkingSpace.available_spaces || '',
      price_per_hour: parkingSpace.price_per_hour || '',
      price_per_day: parkingSpace.price_per_day || '',
      opening_hours: parkingSpace.opening_hours || '',
      phone: parkingSpace.phone || '',
      verified: parkingSpace.verified ?? true,
      latitude: parkingSpace.location?.coordinates?.[1] || '',
      longitude: parkingSpace.location?.coordinates?.[0] || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this parking space?')) return

    try {
      await api.deleteParking(id)
      fetchParking()
      alert('Parking space deleted successfully!')
    } catch (error) {
      alert('Failed to delete parking space: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameHindi: '',
      address: '',
      capacity: '',
      total_spaces: '',
      available_spaces: '',
      price_per_hour: '',
      price_per_day: '',
      opening_hours: '',
      phone: '',
      verified: true,
      latitude: '',
      longitude: '',
    })
    setEditingParking(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Parking Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'Add Parking Space'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingParking ? 'Edit Parking Space' : 'Add New Parking Space'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Hindi)</label>
                <input
                  type="text"
                  value={formData.nameHindi}
                  onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Spaces *</label>
                <input
                  type="number"
                  value={formData.total_spaces}
                  onChange={(e) => setFormData({ ...formData, total_spaces: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Spaces *</label>
                <input
                  type="number"
                  value={formData.available_spaces}
                  onChange={(e) => setFormData({ ...formData, available_spaces: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (₹) *</label>
                <input
                  type="number"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Day (₹) *</label>
                <input
                  type="number"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  placeholder="e.g., 6:00 AM - 10:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">Verified</label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                {editingParking ? 'Update Parking' : 'Add Parking'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Hour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parking.map((parkingSpace) => (
                <tr key={parkingSpace._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{parkingSpace.name}</div>
                    {parkingSpace.nameHindi && (
                      <div className="text-sm text-gray-500">{parkingSpace.nameHindi}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{parkingSpace.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parkingSpace.capacity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={parkingSpace.available_spaces > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                      {parkingSpace.available_spaces || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{parkingSpace.price_per_hour || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(parkingSpace)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(parkingSpace._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {parking.length === 0 && (
            <div className="text-center py-12 text-gray-500">No parking spaces found</div>
          )}
        </div>
      )}
    </div>
  )
}

