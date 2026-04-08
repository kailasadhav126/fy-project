import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

export default function TransportTrainBooking() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [bookingData, setBookingData] = useState({
    passengerName: '',
    phoneNumber: '',
    email: '',
    selectedClass: '',
    numberOfPassengers: 1,
    berthPreference: 'any'
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Get selected train from localStorage
    const storedTrain = localStorage.getItem('selectedTrain');
    if (storedTrain) {
      const trainData = JSON.parse(storedTrain);
      setSelectedTrain(trainData);
      setBookingData(prev => ({
        ...prev,
        selectedClass: trainData.selectedClass || 'AC'
      }));
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
    if (!requireLoginForBooking({ isAuthenticated, setLocation, message: 'Please login first to book a train. After login, you will return to this booking page.' })) {
      return;
    }

    // Validate required fields
    if (!bookingData.passengerName || !bookingData.phoneNumber || !bookingData.email || !bookingData.selectedClass) {
      alert('Please fill in all required fields');
      return;
    }

    const classPrice = selectedTrain.classes?.[bookingData.selectedClass]?.price || 0;
    const totalPrice = Number(classPrice) * Number(bookingData.numberOfPassengers || 1);
    let serverBookingId = '';
    try {
      const booking = await createBookingRecord({
        API_BASE,
        token: getToken(),
        bookingData: {
          bookingType: 'transport',
          status: 'pending',
          transportDetails: {
            type: 'train',
            from: selectedTrain.from,
            to: selectedTrain.to,
            time: selectedTrain.departureTime,
            passengers: bookingData.numberOfPassengers,
            totalPrice
          },
          contactDetails: {
            name: bookingData.passengerName,
            phone: bookingData.phoneNumber,
            email: bookingData.email.trim()
          },
          amount: totalPrice,
          bookingDetails: {
            trainName: selectedTrain.name,
            selectedClass: bookingData.selectedClass,
            berthPreference: bookingData.berthPreference
          }
        }
      });
      serverBookingId = booking.bookingId;
    } catch (error) {
      alert(error.message || 'Failed to create train booking');
      return;
    }

    // Create booking confirmation
    const bookingConfirmation = {
      bookingId: serverBookingId,
      train: selectedTrain,
      passenger: bookingData,
      bookingDate: new Date().toISOString(),
      status: 'pending'
    };

    // Store booking in localStorage
    const existingBookings = JSON.parse(localStorage.getItem('trainBookings') || '[]');
    existingBookings.push(bookingConfirmation);
    localStorage.setItem('trainBookings', JSON.stringify(existingBookings));

    // Show success message
    alert(`Train booking confirmed! Booking ID: ${bookingConfirmation.bookingId}`);
    
    // Navigate back to transport page
    setLocation('/transport/to-city');
  };

  if (!selectedTrain) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-kumbh-text mb-4">
              No Train Selected
            </h1>
            <p className="text-gray-600 mb-6">
              Please select a train first to proceed with booking.
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
            Train Booking | ट्रेन बुकिंग
          </h1>
          <p className="text-gray-600">
            Book your train ticket for Nashik
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Train Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Train Details | ट्रेन विवरण
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Train Name</div>
                <div className="font-semibold text-kumbh-text">{selectedTrain.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">From</div>
                  <div className="font-semibold text-kumbh-text">{selectedTrain.from}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">To</div>
                  <div className="font-semibold text-kumbh-text">{selectedTrain.to}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Departure</div>
                  <div className="font-semibold text-kumbh-text">{selectedTrain.departureTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Arrival</div>
                  <div className="font-semibold text-kumbh-text">{selectedTrain.arrivalTime}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-semibold text-kumbh-text">{selectedTrain.duration}</div>
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
                  Class * | क्लास *
                </label>
                <Select value={bookingData.selectedClass} onValueChange={(value) => handleInputChange('selectedClass', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(selectedTrain.classes || {}).map(([className, classData]) => (
                      <SelectItem key={className} value={className}>
                        {className} - ₹{classData.price} ({classData.available} seats)
                      </SelectItem>
                    ))}
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
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Berth Preference | बर्थ प्राथमिकता
                </label>
                <Select value={bookingData.berthPreference} onValueChange={(value) => handleInputChange('berthPreference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Available | कोई भी उपलब्ध</SelectItem>
                    <SelectItem value="lower">Lower Berth | निचला बर्थ</SelectItem>
                    <SelectItem value="middle">Middle Berth | मध्य बर्थ</SelectItem>
                    <SelectItem value="upper">Upper Berth | ऊपरी बर्थ</SelectItem>
                    <SelectItem value="side-lower">Side Lower | साइड लोअर</SelectItem>
                    <SelectItem value="side-upper">Side Upper | साइड अपर</SelectItem>
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
              <div className="text-sm text-gray-600">Pay online or at station</div>
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
