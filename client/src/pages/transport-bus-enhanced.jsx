import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransportBusEnhanced() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: 'Nashik',
    date: '',
    passengers: '1'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const busResultsRef = useRef(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    seats: [],
    passengerDetails: []
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');


  // Mock inter-city bus data (keeping existing data for inter-city routes)
  const mockBuses = [
    {
      id: 1,
      operator: 'MSRTC',
      operatorHindi: 'महाराष्ट्र राज्य परिवहन',
      busNumber: 'MH-12-AB-1234',
      type: 'AC Sleeper',
      typeHindi: 'एसी स्लीपर',
      from: 'Mumbai',
      to: 'Nashik',
      departure: '06:00',
      arrival: '10:30',
      duration: '4h 30m',
      price: 450,
      seats: 45,
      available: 12,
      amenities: ['AC', 'Water Bottle', 'Blanket', 'Charging Point'],
      amenitiesHindi: ['एसी', 'पानी की बोतल', 'कंबल', 'चार्जिंग पॉइंट'],
      rating: 4.2,
      reviews: 156
    },
    {
      id: 2,
      operator: 'Neeta Travels',
      operatorHindi: 'नीता ट्रैवल्स',
      busNumber: 'MH-15-CD-5678',
      type: 'Non-AC Semi Sleeper',
      typeHindi: 'नॉन-एसी सेमी स्लीपर',
      from: 'Pune',
      to: 'Nashik',
      departure: '08:30',
      arrival: '13:00',
      duration: '4h 30m',
      price: 320,
      seats: 40,
      available: 8,
      amenities: ['Water Bottle', 'Blanket'],
      amenitiesHindi: ['पानी की बोतल', 'कंबल'],
      rating: 3.8,
      reviews: 89
    },
    {
      id: 3,
      operator: 'VRL Travels',
      operatorHindi: 'वीआरएल ट्रैवल्स',
      busNumber: 'MH-20-EF-9012',
      type: 'AC Seater',
      typeHindi: 'एसी सीटर',
      from: 'Delhi',
      to: 'Nashik',
      departure: '18:00',
      arrival: '08:00+1',
      duration: '14h 00m',
      price: 1200,
      seats: 35,
      available: 5,
      amenities: ['AC', 'Water Bottle', 'Blanket', 'Charging Point', 'WiFi'],
      amenitiesHindi: ['एसी', 'पानी की बोतल', 'कंबल', 'चार्जिंग पॉइंट', 'वाईफाई'],
      rating: 4.5,
      reviews: 234
    },
    {
      id: 4,
      operator: 'Orange Tours',
      operatorHindi: 'ऑरेंज टूर्स',
      busNumber: 'MH-25-GH-3456',
      type: 'AC Sleeper',
      typeHindi: 'एसी स्लीपर',
      from: 'Bangalore',
      to: 'Nashik',
      departure: '20:00',
      arrival: '12:00+1',
      duration: '16h 00m',
      price: 1800,
      seats: 30,
      available: 3,
      amenities: ['AC', 'Water Bottle', 'Blanket', 'Charging Point', 'WiFi', 'Meals'],
      amenitiesHindi: ['एसी', 'पानी की बोतल', 'कंबल', 'चार्जिंग पॉइंट', 'वाईफाई', 'भोजन'],
      rating: 4.7,
      reviews: 178
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Initialize search results
  useEffect(() => {
    setSearchResults(mockBuses);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Filter by from/to locations
    if (searchFilters.from && searchFilters.to) {
      const filteredBuses = mockBuses.filter(bus => {
        const fromMatch = bus.from.toLowerCase().includes(searchFilters.from.toLowerCase());
        const toMatch = bus.to.toLowerCase().includes(searchFilters.to.toLowerCase());
        return fromMatch && toMatch;
      });
      setSearchResults(filteredBuses);
      
      // Auto-scroll to bus results
      setTimeout(() => {
        if (busResultsRef.current) {
          busResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      setSearchResults(mockBuses);
    }
  };

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
    setShowBooking(true);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (bookingStep === 1) {
      // Validate passenger details
      const passengerCount = parseInt(searchFilters.passengers);
      if (bookingDetails.passengerDetails.length !== passengerCount) {
        alert(`Please fill details for all ${passengerCount} passengers`);
        return;
      }
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!paymentMethod) {
        alert('Please select a payment method');
        return;
      }
      setBookingStep(3);
      // Simulate payment processing
      setTimeout(() => {
        setBookingConfirmed(true);
        setBookingId('BUS' + Date.now());
      }, 2000);
    }
  };

  const handlePassengerDetailChange = (index, field, value) => {
    const updatedDetails = [...bookingDetails.passengerDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setBookingDetails({ ...bookingDetails, passengerDetails: updatedDetails });
  };

  const addPassengerDetail = () => {
    const passengerCount = parseInt(searchFilters.passengers);
    if (bookingDetails.passengerDetails.length < passengerCount) {
      setBookingDetails({
        ...bookingDetails,
        passengerDetails: [
          ...bookingDetails.passengerDetails,
          { name: '', age: '', gender: '', idProof: '' }
        ]
      });
    }
  };

  const resetBooking = () => {
    setShowBooking(false);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
    setSelectedBus(null);
    setBookingDetails({ name: '', phone: '', email: '', seats: [], passengerDetails: [] });
    setPaymentMethod('');
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getAvailableSeats = (bus) => {
    const seats = [];
    for (let i = 1; i <= bus.seats; i++) {
      seats.push({
        number: i,
        available: Math.random() > 0.3 // 70% chance of being available
      });
    }
    return seats;
  };

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button
              onClick={() => setLocation('/transport/to-city')}
              variant="outline"
              className="mr-4"
            >
              ← Back to Transport
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-2">
            Bus Booking | बस बुकिंग
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            बस बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book your bus tickets to Nashik for Maha Kumbh 2026 with the best operators
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Buses | बस खोजें
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From | से
                </label>
                <Select value={searchFilters.from} onValueChange={(value) => setSearchFilters({...searchFilters, from: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                    <SelectItem value="Indore">Indore</SelectItem>
                    <SelectItem value="Nagpur">Nagpur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To | तक
                </label>
                <Select value={searchFilters.to} onValueChange={(value) => setSearchFilters({...searchFilters, to: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nashik">Nashik</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                    <SelectItem value="Indore">Indore</SelectItem>
                    <SelectItem value="Nagpur">Nagpur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date | तारीख
                </label>
                <Input 
                  type="date" 
                  value={searchFilters.date}
                  min={getCurrentDate()}
                  onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passengers | यात्री
                </label>
                <Select value={searchFilters.passengers} onValueChange={(value) => setSearchFilters({...searchFilters, passengers: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Passenger</SelectItem>
                    <SelectItem value="2">2 Passengers</SelectItem>
                    <SelectItem value="3">3 Passengers</SelectItem>
                    <SelectItem value="4">4 Passengers</SelectItem>
                    <SelectItem value="5">5 Passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
              >
                Search Buses | बस खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={busResultsRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Available Buses | उपलब्ध बसें
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((bus) => (
                <Card key={bus.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-kumbh-text">
                        {bus.operator}
                      </h3>
                      <p className="font-devanagari text-kumbh-orange font-semibold">
                        {bus.operatorHindi}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {bus.busNumber} • {bus.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{bus.rating}</span>
                        <span className="text-gray-500 text-sm">({bus.reviews})</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {bus.available} seats left
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Route</div>
                      <div className="font-semibold">{bus.from} → {bus.to}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Timing</div>
                      <div className="font-semibold">{bus.departure} - {bus.arrival}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">{bus.duration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Available Seats</div>
                      <div className="font-semibold text-green-600">{bus.available}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-kumbh-orange">
                        ₹{bus.price}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        per person
                      </div>
                      <Button
                        onClick={() => {
                          // Store bus data for booking
                          const busData = {
                            id: bus.id,
                            operator: bus.operator,
                            busNumber: bus.busNumber,
                            type: bus.type,
                            from: bus.from,
                            to: bus.to,
                            departure: bus.departure,
                            arrival: bus.arrival,
                            price: bus.price,
                            duration: bus.duration,
                            available: bus.available,
                            amenities: bus.amenities,
                            date: searchFilters.date,
                            passengers: searchFilters.passengers,
                            timestamp: new Date().toISOString()
                          };
                          
                          localStorage.setItem('selectedBus', JSON.stringify(busData));
                          setLocation('/transport/bus-booking');
                        }}
                        className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      >
                        Book Now | बुक करें
                      </Button>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-kumbh-text mb-2">
                      Amenities | सुविधाएं
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {bus.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Booking Modal */}
        {showBooking && selectedBus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Bus | बस बुक करें
                  </h2>
                  <Button
                    variant="outline"
                    onClick={resetBooking}
                  >
                    ✕
                  </Button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      bookingStep >= 1 ? 'bg-kumbh-orange text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div className={`w-16 h-1 ${bookingStep >= 2 ? 'bg-kumbh-orange' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      bookingStep >= 2 ? 'bg-kumbh-orange text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      2
                    </div>
                    <div className={`w-16 h-1 ${bookingStep >= 3 ? 'bg-kumbh-orange' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      bookingStep >= 3 ? 'bg-kumbh-orange text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      3
                    </div>
                  </div>
                </div>

                {/* Bus Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedBus.operator} - {selectedBus.type}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Route:</span> {selectedBus.from} → {selectedBus.to}
                    </div>
                    <div>
                      <span className="text-gray-600">Timing:</span> {selectedBus.departure} - {selectedBus.arrival}
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span> {selectedBus.duration}
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span> ₹{selectedBus.price} per person
                    </div>
                  </div>
                </div>

                {/* Step 1: Passenger Details */}
                {bookingStep === 1 && (
                  <form onSubmit={handleBooking}>
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-kumbh-text">
                        Passenger Details | यात्री विवरण
                      </h3>
                      
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-kumbh-text mb-2">
                            Full Name | पूरा नाम
                          </label>
                          <Input
                            type="text"
                            value={bookingDetails.name}
                            onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-kumbh-text mb-2">
                            Phone Number | फोन नंबर
                          </label>
                          <Input
                            type="tel"
                            value={bookingDetails.phone}
                            onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-kumbh-text mb-2">
                          Email | ईमेल
                        </label>
                        <Input
                          type="email"
                          value={bookingDetails.email}
                          onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                          required
                        />
                      </div>

                      {/* Passenger Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-kumbh-text mb-3">
                          Passenger Information | यात्री जानकारी
                        </h4>
                        {bookingDetails.passengerDetails.map((passenger, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h5 className="font-medium text-kumbh-text mb-3">
                              Passenger {index + 1}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-kumbh-text mb-2">
                                  Name | नाम
                                </label>
                                <Input
                                  type="text"
                                  value={passenger.name || ''}
                                  onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-kumbh-text mb-2">
                                  Age | आयु
                                </label>
                                <Input
                                  type="number"
                                  value={passenger.age || ''}
                                  onChange={(e) => handlePassengerDetailChange(index, 'age', e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-kumbh-text mb-2">
                                  Gender | लिंग
                                </label>
                                <Select
                                  value={passenger.gender || ''}
                                  onValueChange={(value) => handlePassengerDetailChange(index, 'gender', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male | पुरुष</SelectItem>
                                    <SelectItem value="female">Female | महिला</SelectItem>
                                    <SelectItem value="other">Other | अन्य</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-kumbh-text mb-2">
                                  ID Proof | पहचान पत्र
                                </label>
                                <Select
                                  value={passenger.idProof || ''}
                                  onValueChange={(value) => handlePassengerDetailChange(index, 'idProof', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ID proof" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                                    <SelectItem value="pan">PAN Card</SelectItem>
                                    <SelectItem value="passport">Passport</SelectItem>
                                    <SelectItem value="driving">Driving License</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {bookingDetails.passengerDetails.length < parseInt(searchFilters.passengers) && (
                          <Button
                            type="button"
                            onClick={addPassengerDetail}
                            variant="outline"
                            className="w-full"
                          >
                            Add Passenger {bookingDetails.passengerDetails.length + 1}
                          </Button>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                        >
                          Continue to Payment | भुगतान के लिए जारी रखें
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Step 2: Payment */}
                {bookingStep === 2 && (
                  <form onSubmit={handleBooking}>
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-kumbh-text">
                        Payment | भुगतान
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-kumbh-text mb-4">
                            Select Payment Method | भुगतान विधि चुनें
                          </h4>
                          <div className="space-y-3">
                            {[
                              { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                              { id: 'upi', name: 'UPI Payment', icon: '📱' },
                              { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
                              { id: 'wallet', name: 'Digital Wallet', icon: '💰' }
                            ].map((method) => (
                              <div
                                key={method.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  paymentMethod === method.id
                                    ? 'border-kumbh-orange bg-kumbh-light'
                                    : 'border-gray-300 hover:border-kumbh-orange'
                                }`}
                                onClick={() => setPaymentMethod(method.id)}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{method.icon}</span>
                                  <span className="font-medium">{method.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-kumbh-text mb-4">
                            Booking Summary | बुकिंग सारांश
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span>Bus Operator:</span>
                              <span className="font-medium">{selectedBus.operator}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Route:</span>
                              <span className="font-medium">{selectedBus.from} → {selectedBus.to}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span className="font-medium">{searchFilters.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passengers:</span>
                              <span className="font-medium">{searchFilters.passengers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per person:</span>
                              <span className="font-medium">₹{selectedBus.price}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-kumbh-orange">₹{selectedBus.price * parseInt(searchFilters.passengers)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBookingStep(1)}
                        >
                          ← Back | वापस
                        </Button>
                        <Button
                          type="submit"
                          className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                        >
                          Proceed to Payment | भुगतान के लिए आगे बढ़ें
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Step 3: Confirmation */}
                {bookingStep === 3 && (
                  <div className="space-y-6">
                    {!bookingConfirmed ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kumbh-orange mx-auto mb-4"></div>
                        <h3 className="text-xl font-semibold text-kumbh-text mb-2">
                          Processing Payment | भुगतान प्रसंस्करण
                        </h3>
                        <p className="text-gray-600">
                          Please wait while we process your payment...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">
                          Booking Confirmed! | बुकिंग की पुष्टि!
                        </h3>
                        <p className="text-lg text-kumbh-text mb-4">
                          Your bus ticket has been booked successfully
                        </p>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                          <h4 className="text-lg font-semibold text-green-800 mb-4">
                            Booking Details | बुकिंग विवरण
                          </h4>
                          <div className="space-y-2 text-left">
                            <div className="flex justify-between">
                              <span className="font-medium">Booking ID:</span>
                              <span className="font-mono">{bookingId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Bus:</span>
                              <span>{selectedBus.operator} - {selectedBus.busNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Route:</span>
                              <span>{selectedBus.from} → {selectedBus.to}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Date:</span>
                              <span>{searchFilters.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Time:</span>
                              <span>{selectedBus.departure} - {selectedBus.arrival}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Passengers:</span>
                              <span>{searchFilters.passengers}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total Paid:</span>
                              <span className="text-kumbh-orange">₹{selectedBus.price * parseInt(searchFilters.passengers)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={resetBooking}
                            className="bg-kumbh-orange text-white hover:bg-kumbh-deep w-full"
                          >
                            Book Another Ticket | एक और टिकट बुक करें
                          </Button>
                          <Button
                            onClick={() => setLocation('/')}
                            variant="outline"
                            className="w-full"
                          >
                            Back to Home | होम पर वापस जाएं
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Quick Tips */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Bus Travel Tips | बस यात्रा सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book tickets in advance during peak season', icon: '🎫' },
              { tip: 'Arrive at bus stand 30 minutes early', icon: '⏰' },
              { tip: 'Carry valid ID proof for verification', icon: '🆔' },
              { tip: 'Keep emergency contact numbers handy', icon: '📞' },
              { tip: 'Check bus operator ratings before booking', icon: '⭐' },
              { tip: 'Pack light for comfortable journey', icon: '🎒' }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-2xl">{item.icon}</div>
                <p className="text-sm text-gray-700">{item.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
