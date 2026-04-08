import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MyBookings() {
  const [, setLocation] = useLocation();
  const { user, loading, getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';

  // Get filter from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    if (filter) {
      setActiveFilter(filter);
    }
  }, []);

  // Fetch bookings when component mounts
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setBookings((data.bookings || []).sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate)));
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Booking cancelled successfully');
        // Refresh bookings
        setBookings(bookings.map(b => 
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
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
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  };

  const DetailItem = ({ label, value }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-900 break-words">{formatValue(value)}</div>
    </div>
  );

  const renderFullBookingDetails = (booking) => {
    const commonDetails = (
      <>
        <DetailItem label="Booking ID" value={booking.bookingId} />
        <DetailItem label="Status" value={booking.status} />
        <DetailItem label="Booking Type" value={booking.bookingType} />
        <DetailItem label="Booked On" value={booking.bookingDate ? formatDate(booking.bookingDate) : formatDate(booking.createdAt)} />
        <DetailItem label="Amount" value={`Rs ${getBookingAmount(booking)}`} />
        <DetailItem label="Payment Method" value={booking.paymentMethod} />
        <DetailItem label="Contact Name" value={booking.contactDetails?.name} />
        <DetailItem label="Contact Phone" value={booking.contactDetails?.phone} />
        <DetailItem label="Contact Email" value={booking.contactDetails?.email} />
      </>
    );

    let typeDetails = null;

    if (booking.bookingType === 'hotel' && booking.hotelDetails) {
      typeDetails = (
        <>
          <DetailItem label="Hotel" value={booking.hotelDetails.hotelName} />
          <DetailItem label="Address" value={booking.hotelDetails.hotelAddress} />
          <DetailItem label="Check In" value={booking.hotelDetails.checkIn ? formatDate(booking.hotelDetails.checkIn) : '-'} />
          <DetailItem label="Check Out" value={booking.hotelDetails.checkOut ? formatDate(booking.hotelDetails.checkOut) : '-'} />
          <DetailItem label="Guests" value={booking.hotelDetails.guests} />
          <DetailItem label="Rooms" value={booking.hotelDetails.rooms} />
          <DetailItem label="Room Type" value={booking.hotelDetails.roomType} />
          <DetailItem label="Special Requests" value={booking.specialRequests} />
        </>
      );
    }

    if (booking.bookingType === 'parking' && booking.parkingDetails) {
      typeDetails = (
        <>
          <DetailItem label="Parking" value={booking.parkingDetails.parkingName} />
          <DetailItem label="Slot" value={booking.parkingDetails.slotId} />
          <DetailItem label="Vehicle Number" value={booking.parkingDetails.vehicleNumber} />
          <DetailItem label="Vehicle Type" value={booking.parkingDetails.vehicleType} />
          <DetailItem label="Passengers" value={booking.parkingDetails.passengers} />
          <DetailItem label="Reserved For" value={booking.parkingDetails.reservedFor ? formatDate(booking.parkingDetails.reservedFor) : '-'} />
          <DetailItem label="Valid Until" value={booking.parkingDetails.validUntil ? formatDate(booking.parkingDetails.validUntil) : '30 minutes'} />
        </>
      );
    }

    if (booking.bookingType === 'medical' && booking.medicalDetails) {
      typeDetails = (
        <>
          <DetailItem label="Service" value={booking.medicalDetails.serviceName} />
          <DetailItem label="Service Type" value={booking.medicalDetails.serviceType} />
          <DetailItem label="Address" value={booking.medicalDetails.address} />
          <DetailItem label="Phone" value={booking.medicalDetails.phone} />
          <DetailItem label="Patient" value={booking.medicalDetails.patientName} />
          <DetailItem label="Age" value={booking.medicalDetails.age} />
          <DetailItem label="Gender" value={booking.medicalDetails.gender} />
          <DetailItem label="Symptoms" value={booking.medicalDetails.symptoms} />
          <DetailItem label="Urgency" value={booking.medicalDetails.urgency} />
        </>
      );
    }

    if (booking.bookingType === 'transport' && booking.transportDetails) {
      typeDetails = (
        <>
          <DetailItem label="Transport Type" value={getBookingTitle(booking)} />
          <DetailItem label="From" value={booking.transportDetails.from} />
          <DetailItem label="To" value={booking.transportDetails.to} />
          <DetailItem label="Date" value={booking.transportDetails.date ? formatDate(booking.transportDetails.date) : '-'} />
          <DetailItem label="Time" value={booking.transportDetails.time || booking.bookingDetails?.departure} />
          <DetailItem label="Passengers" value={booking.transportDetails.passengers} />
          <DetailItem label="Operator" value={booking.bookingDetails?.operator} />
          <DetailItem label="Bus Number" value={booking.bookingDetails?.busNumber} />
          <DetailItem label="Bus Type" value={booking.bookingDetails?.busType} />
          <DetailItem label="Arrival" value={booking.bookingDetails?.arrival} />
          <DetailItem label="Duration" value={booking.bookingDetails?.duration} />
          <DetailItem label="Amenities" value={booking.bookingDetails?.amenities} />
          <DetailItem label="Train Name" value={booking.bookingDetails?.trainName} />
          <DetailItem label="Class" value={booking.bookingDetails?.selectedClass} />
          <DetailItem label="Cab" value={booking.bookingDetails?.cabName} />
        </>
      );
    }

    return (
      <div className="mt-4 rounded-lg border border-orange-100 bg-orange-50 p-4">
        <h4 className="mb-4 text-lg font-bold text-kumbh-text">Booking Details</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {commonDetails}
          {typeDetails}
        </div>

        {booking.guestDetails?.length > 0 && (
          <div className="mt-4">
            <h5 className="mb-2 font-semibold text-kumbh-text">Passenger / Guest Details</h5>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {booking.guestDetails.map((guest, index) => (
                <div key={`${booking._id}-guest-${index}`} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="font-semibold">Person {index + 1}</div>
                  <div className="mt-1 text-sm text-gray-700">Name: {formatValue(guest.name)}</div>
                  <div className="text-sm text-gray-700">Age: {formatValue(guest.age)}</div>
                  <div className="text-sm text-gray-700">Gender: {formatValue(guest.gender)}</div>
                  <div className="text-sm text-gray-700">ID Proof: {formatValue(guest.idProof)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBookingDetails = (booking) => {
    if (booking.bookingType === 'hotel' && booking.hotelDetails) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-600">Check-in</div>
            <div className="font-semibold">{formatDate(booking.hotelDetails.checkIn)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Check-out</div>
            <div className="font-semibold">{formatDate(booking.hotelDetails.checkOut)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Guests</div>
            <div className="font-semibold">{booking.hotelDetails.guests}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Rooms</div>
            <div className="font-semibold">{booking.hotelDetails.rooms}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Room Type</div>
            <div className="font-semibold">{booking.hotelDetails.roomType}</div>
          </div>
        </div>
      );
    }

    if (booking.bookingType === 'parking' && booking.parkingDetails) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-600">Parking</div>
            <div className="font-semibold">{booking.parkingDetails.parkingName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Slot</div>
            <div className="font-semibold">{booking.parkingDetails.slotId}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Vehicle</div>
            <div className="font-semibold">{booking.parkingDetails.vehicleNumber}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Vehicle Type</div>
            <div className="font-semibold">{booking.parkingDetails.vehicleType}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Valid Until</div>
            <div className="font-semibold">{booking.parkingDetails.validUntil ? formatDate(booking.parkingDetails.validUntil) : '30 minutes'}</div>
          </div>
        </div>
      );
    }

    if (booking.bookingType === 'medical' && booking.medicalDetails) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-600">Service</div>
            <div className="font-semibold">{booking.medicalDetails.serviceName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Patient</div>
            <div className="font-semibold">{booking.medicalDetails.patientName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Urgency</div>
            <div className="font-semibold">{booking.medicalDetails.urgency}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Phone</div>
            <div className="font-semibold">{booking.medicalDetails.phone || booking.contactDetails?.phone || '-'}</div>
          </div>
        </div>
      );
    }

    if (booking.bookingType === 'transport' && booking.transportDetails) {
      if (booking.transportDetails.type === 'intercity-bus') {
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div><div className="text-xs text-gray-600">Operator</div><div className="font-semibold">{booking.bookingDetails?.operator || '-'}</div></div>
            <div><div className="text-xs text-gray-600">Bus</div><div className="font-semibold">{booking.bookingDetails?.busNumber || booking.bookingDetails?.busType || '-'}</div></div>
            <div><div className="text-xs text-gray-600">Route</div><div className="font-semibold">{booking.transportDetails.from} to {booking.transportDetails.to}</div></div>
            <div><div className="text-xs text-gray-600">Date / Time</div><div className="font-semibold">{booking.transportDetails.date ? formatDate(booking.transportDetails.date) : '-'} {booking.transportDetails.time || ''}</div></div>
            <div><div className="text-xs text-gray-600">Passengers</div><div className="font-semibold">{booking.transportDetails.passengers}</div></div>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div><div className="text-xs text-gray-600">Type</div><div className="font-semibold">{booking.transportDetails.type}</div></div>
          <div><div className="text-xs text-gray-600">From</div><div className="font-semibold">{booking.transportDetails.from}</div></div>
          <div><div className="text-xs text-gray-600">To</div><div className="font-semibold">{booking.transportDetails.to}</div></div>
          <div><div className="text-xs text-gray-600">Date</div><div className="font-semibold">{booking.transportDetails.date ? formatDate(booking.transportDetails.date) : '-'}</div></div>
          <div><div className="text-xs text-gray-600">Passengers</div><div className="font-semibold">{booking.transportDetails.passengers}</div></div>
        </div>
      );
    }

    return null;
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kumbh-light via-white to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-kumbh-text">
              My Bookings | मेरी बुकिंग
            </h1>
            <p className="text-gray-600 mt-1">View and manage your reservations</p>
          </div>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
          >
            ← Back to Home
          </Button>
        </div>

        {/* Filter Tabs */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              className={activeFilter === 'all' ? 'bg-kumbh-orange text-white' : ''}
            >
              All Bookings ({bookings.length})
            </Button>
            <Button
              variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('upcoming')}
              className={activeFilter === 'upcoming' ? 'bg-blue-600 text-white' : ''}
            >
              Upcoming ({bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length})
            </Button>
            <Button
              variant={activeFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('completed')}
              className={activeFilter === 'completed' ? 'bg-green-600 text-white' : ''}
            >
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </Button>
            <Button
              variant={activeFilter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('cancelled')}
              className={activeFilter === 'cancelled' ? 'bg-red-600 text-white' : ''}
            >
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </Button>
          </div>
        </Card>

        {/* Bookings List or Empty State */}
        {bookingsLoading ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-lg text-gray-600">Loading bookings...</div>
          </Card>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Bookings Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't made any bookings yet. Start exploring and book your stay!
            </p>
            <Button
              onClick={() => setLocation('/hotel-booking')}
              className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
            >
              Book a Hotel
            </Button>
          </Card>
        ) : (
          (() => {
            const filteredBookings = bookings.filter(booking => {
              if (activeFilter === 'all') return true;
              if (activeFilter === 'upcoming') return booking.status === 'confirmed' || booking.status === 'pending';
              if (activeFilter === 'completed') return booking.status === 'completed';
              if (activeFilter === 'cancelled') return booking.status === 'cancelled';
              return true;
            });

            if (filteredBookings.length === 0) {
              return (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    No {activeFilter === 'all' ? '' : activeFilter} bookings found
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Try selecting a different filter or make a new booking.
                  </p>
                  <Button
                    onClick={() => setActiveFilter('all')}
                    variant="outline"
                  >
                    Show All Bookings
                  </Button>
                </Card>
              );
            }

            return (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
              <Card key={booking._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-kumbh-text">
                        {getBookingTitle(booking)}
                      </h3>
                      <Badge variant="secondary">
                        {booking.bookingType.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Booking ID: <span className="font-semibold">{booking.bookingId}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Booked on: {formatDate(booking.bookingDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-kumbh-orange">
                      Rs {getBookingAmount(booking)}
                    </div>
                  </div>
                </div>

                {false && booking.bookingType === 'hotel' && booking.hotelDetails && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-600">Check-in</div>
                      <div className="font-semibold">{formatDate(booking.hotelDetails.checkIn)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Check-out</div>
                      <div className="font-semibold">{formatDate(booking.hotelDetails.checkOut)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Duration</div>
                      <div className="font-semibold">
                        {Math.ceil((new Date(booking.hotelDetails.checkOut) - new Date(booking.hotelDetails.checkIn)) / (1000 * 60 * 60 * 24))} Nights
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Guests</div>
                      <div className="font-semibold">{booking.hotelDetails.guests}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Rooms</div>
                      <div className="font-semibold">{booking.hotelDetails.rooms}</div>
                    </div>
                  </div>
                )}

                {renderBookingDetails(booking)}

                {expandedBookingId === booking._id && renderFullBookingDetails(booking)}

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                  >
                    {expandedBookingId === booking._id ? 'Hide Details' : 'View Details'}
                  </Button>
                  {(booking.status === 'confirmed' || booking.status === 'pending') && (
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </Card>
            ))}
              </div>
            );
          })()
        )}

        {/* Info Box */}
        {bookings.length > 0 && (
          <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">Booking Information</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You can cancel confirmed bookings anytime</li>
                  <li>Cancelled bookings cannot be restored</li>
                  <li>For modifications, please contact support</li>
                  <li>Keep your booking ID for reference</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
