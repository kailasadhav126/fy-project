const API_BASE = import.meta.env.VITE_API_BASE || 'https://fy-project-1shr.onrender.com'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token')
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || error.message || 'Request failed')
  }

  return response.json()
}

export const api = {
  // Hotels
  getHotels: () => request('/api/admin/hotels'),
  getHotel: (id) => request(`/api/admin/hotels/${id}`),
  createHotel: (data) => request('/api/admin/hotels', { method: 'POST', body: JSON.stringify(data) }),
  updateHotel: (id, data) => request(`/api/admin/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHotel: (id) => request(`/api/admin/hotels/${id}`, { method: 'DELETE' }),

  // Medical Services
  getMedicalServices: () => request('/api/admin/medical'),
  getMedicalService: (id) => request(`/api/admin/medical/${id}`),
  createMedicalService: (data) => request('/api/admin/medical', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicalService: (id, data) => request(`/api/admin/medical/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicalService: (id) => request(`/api/admin/medical/${id}`, { method: 'DELETE' }),

  // Parking
  getParking: () => request('/api/admin/parking'),
  getParkingSpace: (id) => request(`/api/admin/parking/${id}`),
  createParking: (data) => request('/api/admin/parking', { method: 'POST', body: JSON.stringify(data) }),
  updateParking: (id, data) => request(`/api/admin/parking/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteParking: (id) => request(`/api/admin/parking/${id}`, { method: 'DELETE' }),
}

