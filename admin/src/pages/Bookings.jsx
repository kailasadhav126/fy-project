import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/api/admin/bookings/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const getBookingTitle = (booking) => {
    if (booking.bookingType === 'hotel') return booking.hotelDetails?.hotelName || 'Hotel Booking';
    if (booking.bookingType === 'parking') return booking.parkingDetails?.parkingName || 'Parking Slot Booking';
    if (booking.bookingType === 'medical') return booking.medicalDetails?.serviceName || 'Medical Appointment';
    if (booking.bookingType === 'transport') {
      if (booking.transportDetails?.type === 'intercity-bus') return 'Bus to Nashik Booking';
      if (booking.transportDetails?.type === 'city-bus') return 'Nashik City Bus Booking';
      return `${booking.transportDetails?.type || 'Transport'} Booking`;
    }
    return 'Booking';
  };

  const getBookingAmount = (booking) => (
    booking.amount ??
    booking.hotelDetails?.totalPrice ??
    booking.transportDetails?.totalPrice ??
    0
  );

  const getBookingDetails = (booking) => {
    if (booking.bookingType === 'hotel' && booking.hotelDetails) {
      return `${booking.hotelDetails.hotelName || 'Hotel'} | ${formatDate(booking.hotelDetails.checkIn)} - ${formatDate(booking.hotelDetails.checkOut)} | Guests: ${booking.hotelDetails.guests || '-'}`;
    }
    if (booking.bookingType === 'parking' && booking.parkingDetails) {
      return `${booking.parkingDetails.parkingName || 'Parking'} | Slot: ${booking.parkingDetails.slotId || '-'} | Vehicle: ${booking.parkingDetails.vehicleNumber || '-'} | ${booking.parkingDetails.vehicleType || '-'} | ${booking.parkingDetails.passengers || '-'} pax`;
    }
    if (booking.bookingType === 'medical' && booking.medicalDetails) {
      return `${booking.medicalDetails.serviceName || 'Medical Service'} | Patient: ${booking.medicalDetails.patientName || '-'} | Urgency: ${booking.medicalDetails.urgency || '-'} | Symptoms: ${booking.medicalDetails.symptoms || '-'}`;
    }
    if (booking.bookingType === 'transport' && booking.transportDetails) {
      if (booking.transportDetails.type === 'intercity-bus') {
        const details = booking.bookingDetails || {};
        return `${details.operator || 'Bus'} ${details.busNumber ? `(${details.busNumber})` : ''} | ${booking.transportDetails.from || '-'} to ${booking.transportDetails.to || '-'} | ${booking.transportDetails.date ? formatDate(booking.transportDetails.date) : '-'} ${booking.transportDetails.time || ''} | Passengers: ${booking.transportDetails.passengers || '-'}`;
      }
      if (booking.transportDetails.type === 'city-bus') {
        return `City Bus Route ${booking.bookingDetails?.routeNumber || '-'} | ${booking.transportDetails.from || '-'} to ${booking.transportDetails.to || '-'} | ${booking.transportDetails.date ? formatDate(booking.transportDetails.date) : '-'} ${booking.transportDetails.time || ''} | Passengers: ${booking.transportDetails.passengers || '-'}`;
      }
      return `${booking.transportDetails.type || 'Transport'} | ${booking.transportDetails.from || '-'} to ${booking.transportDetails.to || '-'} | Passengers: ${booking.transportDetails.passengers || '-'}`;
    }
    return 'No booking details available';
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        setBookings((prev) => prev.map((booking) => (booking._id === bookingId ? data.booking : booking)));
        fetchStats();
      } else {
        alert(data.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Cancelled</div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Hotel / Transport / Parking / Medical</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.byType?.hotel || 0} / {stats.byType?.transport || 0} / {stats.byType?.parking || 0} / {stats.byType?.medical || 0}
            </div>
          </Card>
        </div>
      )}

      {/* Bookings Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Booking ID</th>
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Details</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{booking.bookingId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{booking.userId?.name}</div>
                      <div className="text-gray-500">{booking.userId?.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{booking.bookingType}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {false && booking.bookingType === 'hotel' && booking.hotelDetails && (
                        <>
                          <div className="font-medium">{booking.hotelDetails.hotelName}</div>
                          <div className="text-gray-500">
                            {formatDate(booking.hotelDetails.checkIn)} - {formatDate(booking.hotelDetails.checkOut)}
                          </div>
                        </>
                      )}
                      <div className="font-medium">{getBookingTitle(booking)}</div>
                      <div className="text-gray-500">{getBookingDetails(booking)}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">
                      Rs {getBookingAmount(booking)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-2">
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                        className="block border rounded px-2 py-1 text-sm"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(booking.bookingDate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
