import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

export default function TransportCabBooking() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const [selectedCab, setSelectedCab] = useState(null);
  const [bookingData, setBookingData] = useState({
    passengerName: '',
    phoneNumber: '',
    email: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    paymentMethod: 'cash'
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Get selected cab from localStorage
    const storedCab = localStorage.getItem('selectedCab');
    if (storedCab) {
      setSelectedCab(JSON.parse(storedCab));
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
    if (!requireLoginForBooking({ isAuthenticated, setLocation, message: 'Please login first to book a cab. After login, you will return to this booking page.' })) {
      return;
    }

    // Validate required fields
    if (!bookingData.passengerName || !bookingData.phoneNumber || !bookingData.email || !bookingData.pickupLocation || !bookingData.dropoffLocation) {
      alert('Please fill in all required fields');
      return;
    }

    let serverBookingId = '';
    try {
      const booking = await createBookingRecord({
        API_BASE,
        token: getToken(),
        bookingData: {
          bookingType: 'transport',
          status: 'pending',
          transportDetails: {
            type: 'cab',
            from: bookingData.pickupLocation,
            to: bookingData.dropoffLocation,
            date: bookingData.pickupTime ? new Date(bookingData.pickupTime) : undefined,
            totalPrice: Number(selectedCab.totalPrice) || 0
          },
          contactDetails: {
            name: bookingData.passengerName,
            phone: bookingData.phoneNumber,
            email: bookingData.email.trim()
          },
          amount: Number(selectedCab.totalPrice) || 0,
          paymentMethod: bookingData.paymentMethod,
          bookingDetails: {
            cabName: selectedCab.name,
            basePrice: selectedCab.basePrice,
            perKm: selectedCab.perKm,
            estimatedDistance: selectedCab.estimatedDistance,
            estimatedTime: selectedCab.estimatedTime
          }
        }
      });
      serverBookingId = booking.bookingId;
    } catch (error) {
      alert(error.message || 'Failed to create cab booking');
      return;
    }

    // Create booking confirmation
    const bookingConfirmation = {
      bookingId: serverBookingId,
      cab: selectedCab,
      passenger: bookingData,
      bookingDate: new Date().toISOString(),
      status: 'pending'
    };

    // Store booking in localStorage
    const existingBookings = JSON.parse(localStorage.getItem('cabBookings') || '[]');
    existingBookings.push(bookingConfirmation);
    localStorage.setItem('cabBookings', JSON.stringify(existingBookings));

    // Show success message
    alert(`Cab booking confirmed! Booking ID: ${bookingConfirmation.bookingId}`);
    
    // Navigate back to transport page
    setLocation('/transport/to-city');
  };

  if (!selectedCab) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-kumbh-text mb-4">
              No Cab Selected
            </h1>
            <p className="text-gray-600 mb-6">
              Please select a cab first to proceed with booking.
            </p>
            <Button
              onClick={() => setLocation('/transport/to-city')}
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
            onClick={() => setLocation('/transport/to-city')}
            variant="outline"
            className="mb-4"
          >
            ← Back to Transport
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-2">
            Cab Booking | कैब बुकिंग
          </h1>
          <p className="text-gray-600">
            Book your cab for Nashik
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cab Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Cab Details | कैब विवरण
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Cab Type</div>
                <div className="font-semibold text-kumbh-text">{selectedCab.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Base Price</div>
                  <div className="font-semibold text-kumbh-text">₹{selectedCab.basePrice}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Per KM</div>
                  <div className="font-semibold text-kumbh-text">₹{selectedCab.perKm}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Estimated Distance</div>
                <div className="font-semibold text-kumbh-text">{selectedCab.estimatedDistance} km</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Total Price</div>
                <div className="font-semibold text-kumbh-orange text-lg">₹{selectedCab.totalPrice}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Estimated Time</div>
                <div className="font-semibold text-kumbh-text">{selectedCab.estimatedTime}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Features</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCab.features?.map((feature, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Form */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Booking Details | बुकिंग विवरण
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
                  Email * | ईमेल
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
                  Pickup Location * | पिकअप स्थान *
                </label>
                <Input
                  type="text"
                  value={bookingData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dropoff Location * | ड्रॉपऑफ स्थान *
                </label>
                <Input
                  type="text"
                  value={bookingData.dropoffLocation}
                  onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                  placeholder="Enter dropoff location"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Time | पिकअप समय
                </label>
                <Input
                  type="datetime-local"
                  value={bookingData.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method | भुगतान विधि
                </label>
                <Select value={bookingData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash | नकद</SelectItem>
                    <SelectItem value="card">Card | कार्ड</SelectItem>
                    <SelectItem value="upi">UPI | यूपीआई</SelectItem>
                    <SelectItem value="wallet">Wallet | वॉलेट</SelectItem>
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
              <div className="text-2xl mb-2">🚗</div>
              <div className="font-semibold text-kumbh-text">Driver Details</div>
              <div className="text-sm text-gray-600">Driver info sent to your phone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-kumbh-text">Payment</div>
              <div className="text-sm text-gray-600">Pay as per your selected method</div>
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
