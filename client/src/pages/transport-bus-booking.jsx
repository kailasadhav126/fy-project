import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

export default function TransportBusBooking() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [bookingData, setBookingData] = useState({
    passengerName: '',
    phoneNumber: '',
    email: '',
    selectedTime: '',
    journeyType: 'one-way',
    numberOfPassengers: 1,
    seatPreference: 'any'
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Get selected route from localStorage
    const storedRoute = localStorage.getItem('selectedBusRoute');
    if (storedRoute) {
      setSelectedRoute(JSON.parse(storedRoute));
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    setBookingData(prev => ({
      ...prev,
      email: prev.email || user.email
    }));
  }, [user?.email]);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBooking = async () => {
    if (!requireLoginForBooking({ isAuthenticated, setLocation, message: 'Please login first to book transport. After login, you will return to this booking page.' })) {
      return;
    }

    // Validate required fields
    if (!bookingData.passengerName || !bookingData.phoneNumber || !bookingData.email || !bookingData.selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    const fare = Number(String(selectedRoute.price || '').replace(/[^\d]/g, '')) || 0;
    let serverBookingId = '';
    try {
      const booking = await createBookingRecord({
        API_BASE,
        token: getToken(),
        bookingData: {
          bookingType: 'transport',
          status: 'pending',
          transportDetails: {
            type: 'bus',
            from: selectedRoute.from,
            to: selectedRoute.to,
            time: bookingData.selectedTime,
            passengers: bookingData.numberOfPassengers,
            totalPrice: fare * Number(bookingData.numberOfPassengers || 1)
          },
          contactDetails: {
            name: bookingData.passengerName,
            phone: bookingData.phoneNumber,
            email: bookingData.email.trim()
          },
          amount: fare * Number(bookingData.numberOfPassengers || 1),
          bookingDetails: {
            routeNumber: selectedRoute.routeNumber,
            routeName: selectedRoute.routeName,
            via: selectedRoute.via,
            journeyType: bookingData.journeyType,
            seatPreference: bookingData.seatPreference
          }
        }
      });
      serverBookingId = booking.bookingId;
    } catch (error) {
      alert(error.message || 'Failed to create bus booking');
      return;
    }

    // Create booking confirmation
    const bookingConfirmation = {
      bookingId: serverBookingId,
      route: selectedRoute,
      passenger: bookingData,
      bookingDate: new Date().toISOString(),
      status: 'pending'
    };

    // Store booking in localStorage
    const existingBookings = JSON.parse(localStorage.getItem('busBookings') || '[]');
    existingBookings.push(bookingConfirmation);
    localStorage.setItem('busBookings', JSON.stringify(existingBookings));

    // Show success message
    alert(`Booking confirmed! Booking ID: ${bookingConfirmation.bookingId}`);
    
    // Navigate back to transport page
    setLocation('/transport/in-city');
  };

  if (!selectedRoute) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-kumbh-text mb-4">
              No Route Selected
            </h1>
            <p className="text-gray-600 mb-6">
              Please select a bus route first to proceed with booking.
            </p>
            <Button
              onClick={() => setLocation('/transport/in-city')}
              className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
            >
              Back to Transport
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            onClick={() => setLocation('/transport/in-city')}
            variant="outline"
            className="mb-4"
          >
            ← Back to Transport
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-2">
            Bus Booking | बस बुकिंग
          </h1>
          <p className="text-gray-600">
            Book your city bus ticket for Nashik
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Route Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Route Details | मार्ग विवरण
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Route Number</div>
                <div className="font-semibold text-kumbh-text">{selectedRoute.routeNumber}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Route Name</div>
                <div className="font-semibold text-kumbh-text">{selectedRoute.routeName}</div>
                <div className="font-devanagari text-kumbh-orange text-sm">{selectedRoute.routeNameHindi}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">From</div>
                  <div className="font-semibold text-kumbh-text">{selectedRoute.from}</div>
                  <div className="font-devanagari text-kumbh-orange text-sm">{selectedRoute.fromHindi}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">To</div>
                  <div className="font-semibold text-kumbh-text">{selectedRoute.to}</div>
                  <div className="font-devanagari text-kumbh-orange text-sm">{selectedRoute.toHindi}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Via</div>
                <div className="font-semibold text-kumbh-text">{selectedRoute.via}</div>
                <div className="font-devanagari text-kumbh-orange text-sm">{selectedRoute.viaHindi}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Fare</div>
                  <div className="font-semibold text-kumbh-orange text-lg">{selectedRoute.price}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Frequency</div>
                  <div className="font-semibold text-kumbh-text">{selectedRoute.frequency}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Form */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Passenger Details | यात्री विवरण
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name * | पूरा नाम *
                </label>
                <Input
                  type="text"
                  value={bookingData.passengerName}
                  onChange={(e) => handleInputChange('passengerName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number * | फोन नंबर *
                </label>
                <Input
                  type="tel"
                  value={bookingData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email | ईमेल
                </label>
                <Input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departure Time * | प्रस्थान समय *
                </label>
                <Select value={bookingData.selectedTime} onValueChange={(value) => handleInputChange('selectedTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure time" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedRoute.departureTimes.map((time, index) => (
                      <SelectItem key={index} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Journey Type | यात्रा प्रकार
                </label>
                <Select value={bookingData.journeyType} onValueChange={(value) => handleInputChange('journeyType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-way">One Way | एक तरफा</SelectItem>
                    <SelectItem value="return">Return | वापसी</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Passengers | यात्रियों की संख्या
                </label>
                <Select value={bookingData.numberOfPassengers.toString()} onValueChange={(value) => handleInputChange('numberOfPassengers', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seat Preference | सीट प्राथमिकता
                </label>
                <Select value={bookingData.seatPreference} onValueChange={(value) => handleInputChange('seatPreference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Available | कोई भी उपलब्ध</SelectItem>
                    <SelectItem value="window">Window Seat | खिड़की की सीट</SelectItem>
                    <SelectItem value="aisle">Aisle Seat | गलियारे की सीट</SelectItem>
                    <SelectItem value="front">Front Seat | आगे की सीट</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleBooking}
                  className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep py-3"
                >
                  Confirm Booking | बुकिंग की पुष्टि करें
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Information */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold text-kumbh-text mb-4">
            Booking Information | बुकिंग की जानकारी
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🎫</div>
              <div className="font-semibold text-kumbh-text">E-Ticket</div>
              <div className="text-sm text-gray-600">Digital ticket sent to your phone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-kumbh-text">Payment</div>
              <div className="text-sm text-gray-600">Pay at bus or online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold text-kumbh-text">SMS Confirmation</div>
              <div className="text-sm text-gray-600">Instant booking confirmation</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
