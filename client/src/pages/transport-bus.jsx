import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransportBus() {
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

  // Mock bus data
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
      operator: 'RedBus',
      operatorHindi: 'रेडबस',
      busNumber: 'RB-5678',
      type: 'Non-AC Semi Sleeper',
      typeHindi: 'नॉन-एसी सेमी स्लीपर',
      from: 'Mumbai',
      to: 'Nashik',
      departure: '08:15',
      arrival: '13:00',
      duration: '4h 45m',
      price: 320,
      seats: 50,
      available: 8,
      amenities: ['Water Bottle', 'Charging Point'],
      amenitiesHindi: ['पानी की बोतल', 'चार्जिंग पॉइंट'],
      rating: 3.8,
      reviews: 89
    },
    {
      id: 3,
      operator: 'VRL Travels',
      operatorHindi: 'वीआरएल ट्रैवल्स',
      busNumber: 'VRL-9012',
      type: 'AC Multi-Axle',
      typeHindi: 'एसी मल्टी-एक्सल',
      from: 'Mumbai',
      to: 'Nashik',
      departure: '14:30',
      arrival: '19:15',
      duration: '4h 45m',
      price: 520,
      seats: 40,
      available: 15,
      amenities: ['AC', 'Water Bottle', 'Blanket', 'Charging Point', 'WiFi'],
      amenitiesHindi: ['एसी', 'पानी की बोतल', 'कंबल', 'चार्जिंग पॉइंट', 'वाईफाई'],
      rating: 4.5,
      reviews: 234
    },
    {
      id: 4,
      operator: 'MSRTC',
      operatorHindi: 'महाराष्ट्र राज्य परिवहन',
      busNumber: 'MH-12-CD-5678',
      type: 'Ordinary',
      typeHindi: 'सामान्य',
      from: 'Mumbai',
      to: 'Nashik',
      departure: '16:45',
      arrival: '22:30',
      duration: '5h 45m',
      price: 180,
      seats: 55,
      available: 25,
      amenities: ['Water Bottle'],
      amenitiesHindi: ['पानी की बोतल'],
      rating: 3.5,
      reviews: 67
    },
    {
      id: 5,
      operator: 'Orange Tours',
      operatorHindi: 'ऑरेंज टूर्स',
      busNumber: 'OT-3456',
      type: 'AC Sleeper',
      typeHindi: 'एसी स्लीपर',
      from: 'Mumbai',
      to: 'Nashik',
      departure: '20:00',
      arrival: '01:00',
      duration: '5h 00m',
      price: 480,
      seats: 35,
      available: 6,
      amenities: ['AC', 'Water Bottle', 'Blanket', 'Charging Point', 'WiFi', 'Snacks'],
      amenitiesHindi: ['एसी', 'पानी की बोतल', 'कंबल', 'चार्जिंग पॉइंट', 'वाईफाई', 'नाश्ता'],
      rating: 4.3,
      reviews: 178
    }
  ];

  const cities = [
    { name: 'Mumbai', nameHindi: 'मुंबई', distance: '180 km' },
    { name: 'Pune', nameHindi: 'पुणे', distance: '220 km' },
    { name: 'Delhi', nameHindi: 'दिल्ली', distance: '1,400 km' },
    { name: 'Bangalore', nameHindi: 'बैंगलोर', distance: '850 km' },
    { name: 'Hyderabad', nameHindi: 'हैदराबाद', distance: '650 km' },
    { name: 'Ahmedabad', nameHindi: 'अहमदाबाद', distance: '450 km' },
    { name: 'Nagpur', nameHindi: 'नागपुर', distance: '350 km' },
    { name: 'Indore', nameHindi: 'इंदौर', distance: '280 km' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchFilters.from && searchFilters.to && searchFilters.date) {
      // Filter buses based on search criteria
      const filteredBuses = mockBuses.filter(bus => 
        bus.from.toLowerCase().includes(searchFilters.from.toLowerCase()) &&
        bus.to.toLowerCase().includes(searchFilters.to.toLowerCase())
      );
      setSearchResults(filteredBuses);
      
      // Auto-scroll to bus results
      setTimeout(() => {
        if (busResultsRef.current) {
          busResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
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
      if (Math.random() > 0.3) { // 70% chance seat is available
        seats.push(i);
      }
    }
    return seats.slice(0, bus.available);
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
            Bus Booking to Nashik
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक तक बस बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book comfortable bus journeys to Nashik with verified operators and real-time tracking
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Buses | बस खोजें
          </h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-kumbh-text mb-2">
                From | से
              </label>
              <Select onValueChange={(value) => setSearchFilters({...searchFilters, from: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.distance})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-kumbh-text mb-2">
                To | तक
              </label>
              <Select onValueChange={(value) => setSearchFilters({...searchFilters, to: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nashik">Nashik (0 km)</SelectItem>
                  {cities.filter(city => city.name !== 'Nashik').map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.distance})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-kumbh-text mb-2">
                Date | तारीख
              </label>
              <Input
                type="date"
                min={getCurrentDate()}
                value={searchFilters.date}
                onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-kumbh-text mb-2">
                Passengers | यात्री
              </label>
              <Select onValueChange={(value) => setSearchFilters({...searchFilters, passengers: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-4 flex justify-center">
              <Button type="submit" className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8">
                Search Buses | बस खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={busResultsRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-4">
              Available Buses | उपलब्ध बसें
            </h2>
            <div className="space-y-4">
              {searchResults.map((bus) => (
                <Card key={bus.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Bus Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-kumbh-text">
                          {bus.operator}
                        </h3>
                        <Badge variant="outline" className="text-kumbh-orange border-kumbh-orange">
                          {bus.type}
                        </Badge>
                      </div>
                      <p className="font-devanagari text-kumbh-orange font-semibold mb-2">
                        {bus.operatorHindi}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Bus Number: {bus.busNumber}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>⭐ {bus.rating} ({bus.reviews} reviews)</span>
                        <span>🪑 {bus.available} seats available</span>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-kumbh-text mb-1">
                        {bus.departure}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {bus.from} → {bus.to}
                      </div>
                      <div className="text-lg font-semibold text-kumbh-orange">
                        {bus.arrival}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {bus.duration}
                      </div>
                    </div>

                    {/* Price & Booking */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-kumbh-orange mb-2">
                        ₹{bus.price}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        per person
                      </div>
                      <Button
                        onClick={() => handleBusSelect(bus)}
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

        {/* Booking Modal */}
        {showBooking && selectedBus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Bus | बस बुक करें
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowBooking(false)}
                  >
                    ✕
                  </Button>
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

                {/* Booking Form */}
                <form onSubmit={handleBooking}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  
                  <div className="mb-4">
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

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-kumbh-text mb-2">
                      Select Seats | सीट चुनें
                    </label>
                    <div className="grid grid-cols-10 gap-2">
                      {getAvailableSeats(selectedBus).map((seat) => (
                        <Button
                          key={seat}
                          type="button"
                          variant={bookingDetails.seats.includes(seat) ? "default" : "outline"}
                          className={`w-12 h-12 ${
                            bookingDetails.seats.includes(seat) 
                              ? 'bg-kumbh-orange text-white' 
                              : 'border-gray-300'
                          }`}
                          onClick={() => {
                            if (bookingDetails.seats.includes(seat)) {
                              setBookingDetails({
                                ...bookingDetails,
                                seats: bookingDetails.seats.filter(s => s !== seat)
                              });
                            } else if (bookingDetails.seats.length < parseInt(searchFilters.passengers)) {
                              setBookingDetails({
                                ...bookingDetails,
                                seats: [...bookingDetails.seats, seat]
                              });
                            }
                          }}
                        >
                          {seat}
                        </Button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {bookingDetails.seats.length} / {searchFilters.passengers} seats
                    </p>
                  </div>

                  <div className="bg-kumbh-light p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-2">Booking Summary | बुकिंग सारांश</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>₹{selectedBus.price} × {bookingDetails.seats.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Tax:</span>
                        <span>₹{Math.round(selectedBus.price * bookingDetails.seats.length * 0.12)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹{Math.round(selectedBus.price * bookingDetails.seats.length * 1.12)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBooking(false)}
                      className="flex-1"
                    >
                      Cancel | रद्द करें
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep"
                    >
                      Confirm Booking | बुकिंग की पुष्टि करें
                    </Button>
                  </div>
                </form>
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
