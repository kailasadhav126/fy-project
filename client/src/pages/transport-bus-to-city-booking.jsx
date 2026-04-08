import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

const emptyPassenger = { name: '', age: '', gender: '', idProof: '' };

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function toNumber(value, fallback = 0) {
  const parsed = Number(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function TransportBusToCityBooking() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const [selectedBus, setSelectedBus] = useState(null);
  const [bookingData, setBookingData] = useState({
    passengerName: '',
    phoneNumber: '',
    email: '',
    travelDate: '',
    passengers: '1',
    paymentMethod: 'pay-at-counter',
    passengerDetails: [{ ...emptyPassenger }],
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    const storedBus = localStorage.getItem('selectedBus');
    if (storedBus) {
      const bus = JSON.parse(storedBus);
      const passengers = String(bus.passengers || '1');
      const passengerCount = Math.max(1, Number(passengers) || 1);

      setSelectedBus(bus);
      setBookingData((prev) => ({
        ...prev,
        travelDate: bus.date || '',
        passengers,
        passengerDetails: Array.from({ length: passengerCount }, () => ({ ...emptyPassenger })),
      }));
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    setBookingData((prev) => ({
      ...prev,
      email: prev.email || user.email,
    }));
  }, [user?.email]);

  const farePerPerson = useMemo(() => toNumber(selectedBus?.price), [selectedBus]);
  const passengerCount = Math.max(1, Number(bookingData.passengers) || 1);
  const totalFare = farePerPerson * passengerCount;

  const updateBookingField = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePassengerCount = (value) => {
    const nextCount = Math.max(1, Number(value) || 1);
    setBookingData((prev) => ({
      ...prev,
      passengers: value,
      passengerDetails: Array.from({ length: nextCount }, (_, index) => prev.passengerDetails[index] || { ...emptyPassenger }),
    }));
  };

  const updatePassenger = (index, field, value) => {
    setBookingData((prev) => {
      const passengerDetails = [...prev.passengerDetails];
      passengerDetails[index] = { ...(passengerDetails[index] || emptyPassenger), [field]: value };
      return { ...prev, passengerDetails };
    });
  };

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book your bus to Nashik. After login, you will return to this booking page.',
    })) {
      return;
    }

    if (!selectedBus) {
      alert('Please select a bus first.');
      setLocation('/transport/bus');
      return;
    }

    if (!bookingData.passengerName || !bookingData.phoneNumber || !bookingData.email || !bookingData.travelDate) {
      alert('Please fill name, phone number, email, and travel date.');
      return;
    }

    const missingPassenger = bookingData.passengerDetails.some((passenger) => !passenger.name || !passenger.age || !passenger.gender || !passenger.idProof);
    if (missingPassenger) {
      alert('Please fill all passenger details.');
      return;
    }

    try {
      setIsSubmitting(true);
      const booking = await createBookingRecord({
        API_BASE,
        token: getToken(),
        bookingData: {
          bookingType: 'transport',
          status: 'pending',
          transportDetails: {
            type: 'intercity-bus',
            from: selectedBus.from,
            to: selectedBus.to,
            date: bookingData.travelDate,
            time: selectedBus.departure,
            passengers: passengerCount,
            totalPrice: totalFare,
          },
          contactDetails: {
            name: bookingData.passengerName,
            phone: bookingData.phoneNumber,
            email: bookingData.email.trim(),
          },
          guestDetails: bookingData.passengerDetails.map((passenger) => ({
            name: passenger.name,
            age: Number(passenger.age),
            gender: passenger.gender,
            idProof: passenger.idProof,
          })),
          amount: totalFare,
          paymentMethod: bookingData.paymentMethod,
          bookingDetails: {
            source: 'transport-to-city-bus',
            transportScope: 'to-city',
            operator: selectedBus.operator,
            busNumber: selectedBus.busNumber,
            busType: selectedBus.type,
            departure: selectedBus.departure,
            arrival: selectedBus.arrival,
            duration: selectedBus.duration,
            amenities: selectedBus.amenities || [],
          },
        },
      });

      setBookingId(booking.bookingId);
      setBookingConfirmed(true);
      localStorage.removeItem('selectedBus');
    } catch (error) {
      alert(error.message || 'Failed to create bus booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedBus) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-kumbh-text mb-4">No Bus Selected</h1>
            <p className="text-gray-600 mb-6">Please select an outside-city bus route first.</p>
            <Button onClick={() => setLocation('/transport/bus')} className="bg-kumbh-orange text-white hover:bg-kumbh-deep">
              Back to Bus Search
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Button onClick={() => setLocation('/transport/bus')} variant="outline" className="mb-4">
            Back to Bus Search
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-2">Bus to Nashik Booking</h1>
          <p className="text-gray-600">Book intercity buses for reaching Nashik.</p>
        </div>

        {bookingConfirmed ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Request Created</h2>
            <p className="text-gray-700 mb-6">
              Booking ID: <span className="font-semibold">{bookingId}</span>
            </p>
            <div className="mx-auto mb-6 max-w-xl rounded-lg bg-green-50 p-4 text-left text-sm">
              <div><span className="font-semibold">Bus:</span> {selectedBus.operator} - {selectedBus.busNumber}</div>
              <div><span className="font-semibold">Route:</span> {selectedBus.from} to {selectedBus.to}</div>
              <div><span className="font-semibold">Date:</span> {bookingData.travelDate}</div>
              <div><span className="font-semibold">Time:</span> {selectedBus.departure} - {selectedBus.arrival}</div>
              <div><span className="font-semibold">Passengers:</span> {passengerCount}</div>
              <div><span className="font-semibold">Amount:</span> Rs {totalFare}</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => setLocation('/my-bookings?filter=upcoming')} className="bg-kumbh-orange text-white hover:bg-kumbh-deep">
                View My Bookings
              </Button>
              <Button onClick={() => setLocation('/transport/bus')} variant="outline">
                Book Another Bus
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-kumbh-text">{selectedBus.operator}</h2>
                  <p className="text-sm text-gray-600">{selectedBus.busNumber} | {selectedBus.type}</p>
                </div>
                <Badge variant="secondary">{selectedBus.available || '-'} seats left</Badge>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-600">From</div>
                    <div className="font-semibold">{selectedBus.from}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">To</div>
                    <div className="font-semibold">{selectedBus.to}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-600">Departure</div>
                    <div className="font-semibold">{selectedBus.departure}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Arrival</div>
                    <div className="font-semibold">{selectedBus.arrival}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-600">Duration</div>
                    <div className="font-semibold">{selectedBus.duration}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Fare</div>
                    <div className="font-semibold text-kumbh-orange">Rs {farePerPerson} per passenger</div>
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Amenities</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedBus.amenities || []).map((amenity) => (
                      <Badge key={amenity} variant="secondary">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-kumbh-text mb-4">Passenger Details</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <Input value={bookingData.passengerName} onChange={(e) => updateBookingField('passengerName', e.target.value)} placeholder="Enter full name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <Input type="tel" value={bookingData.phoneNumber} onChange={(e) => updateBookingField('phoneNumber', e.target.value)} placeholder="Enter phone number" required />
                  </div>
                  <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <Input type="email" value={bookingData.email} onChange={(e) => updateBookingField('email', e.target.value)} placeholder="Enter email" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Date *</label>
                    <Input type="date" min={getToday()} value={bookingData.travelDate} onChange={(e) => updateBookingField('travelDate', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Passengers</label>
                    <Select value={bookingData.passengers} onValueChange={updatePassengerCount}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={String(num)}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <Select value={bookingData.paymentMethod} onValueChange={(value) => updateBookingField('paymentMethod', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pay-at-counter">Pay at Counter</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-kumbh-text">Passenger Information</h3>
                  {bookingData.passengerDetails.map((passenger, index) => (
                    <div key={index} className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 font-semibold">Passenger {index + 1}</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input value={passenger.name} onChange={(e) => updatePassenger(index, 'name', e.target.value)} placeholder="Name" required />
                        <Input type="number" min="1" value={passenger.age} onChange={(e) => updatePassenger(index, 'age', e.target.value)} placeholder="Age" required />
                        <Select value={passenger.gender} onValueChange={(value) => updatePassenger(index, 'gender', value)}>
                          <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={passenger.idProof} onValueChange={(value) => updatePassenger(index, 'idProof', value)}>
                          <SelectTrigger><SelectValue placeholder="ID proof" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aadhar">Aadhar Card</SelectItem>
                            <SelectItem value="pan">PAN Card</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="driving-license">Driving License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                  <div className="flex items-center justify-between text-lg font-bold text-kumbh-text">
                    <span>Total Amount</span>
                    <span>Rs {totalFare}</span>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep">
                  {isSubmitting ? 'Creating Booking...' : 'Confirm Bus to Nashik Booking'}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
