import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransportCabEnhanced() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: 'Nashik',
    date: '',
    time: '',
    passengers: '1'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCab, setSelectedCab] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const cabResultsRef = useRef(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    pickupAddress: '',
    dropAddress: '',
    passengerDetails: []
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Mock cab data
  const mockCabs = [
    {
      id: 1,
      operator: 'Ola',
      operatorHindi: 'ओला',
      type: 'Sedan',
      typeHindi: 'सेडान',
      model: 'Honda City',
      from: 'Mumbai',
      to: 'Nashik',
      basePrice: 2500,
      perKm: 12,
      estimatedDistance: 180,
      estimatedDuration: '4h 30m',
      features: ['AC', 'Music', 'Charging Point', 'Driver'],
      featuresHindi: ['एसी', 'संगीत', 'चार्जिंग पॉइंट', 'ड्राइवर'],
      rating: 4.5,
      reviews: 1234,
      available: true,
      driver: {
        name: 'Rajesh Kumar',
        rating: 4.8,
        experience: '5 years',
        phone: '+91 98765 43210'
      }
    },
    {
      id: 2,
      operator: 'Uber',
      operatorHindi: 'उबर',
      type: 'SUV',
      typeHindi: 'एसयूवी',
      model: 'Toyota Innova',
      from: 'Pune',
      to: 'Nashik',
      basePrice: 3200,
      perKm: 15,
      estimatedDistance: 220,
      estimatedDuration: '5h 00m',
      features: ['AC', 'Music', 'Charging Point', 'Driver', 'WiFi'],
      featuresHindi: ['एसी', 'संगीत', 'चार्जिंग पॉइंट', 'ड्राइवर', 'वाईफाई'],
      rating: 4.7,
      reviews: 2156,
      available: true,
      driver: {
        name: 'Amit Sharma',
        rating: 4.9,
        experience: '7 years',
        phone: '+91 98765 43211'
      }
    },
    {
      id: 3,
      operator: 'Local Taxi',
      operatorHindi: 'स्थानीय टैक्सी',
      type: 'Hatchback',
      typeHindi: 'हैचबैक',
      model: 'Maruti Swift',
      from: 'Delhi',
      to: 'Nashik',
      basePrice: 1800,
      perKm: 10,
      estimatedDistance: 1400,
      estimatedDuration: '18h 00m',
      features: ['AC', 'Music', 'Driver'],
      featuresHindi: ['एसी', 'संगीत', 'ड्राइवर'],
      rating: 4.2,
      reviews: 456,
      available: true,
      driver: {
        name: 'Vikram Singh',
        rating: 4.5,
        experience: '3 years',
        phone: '+91 98765 43212'
      }
    },
    {
      id: 4,
      operator: 'Meru Cabs',
      operatorHindi: 'मेरू कैब्स',
      type: 'Luxury Sedan',
      typeHindi: 'लक्जरी सेडान',
      model: 'Toyota Camry',
      from: 'Bangalore',
      to: 'Nashik',
      basePrice: 4500,
      perKm: 18,
      estimatedDistance: 850,
      estimatedDuration: '12h 00m',
      features: ['AC', 'Music', 'Charging Point', 'Driver', 'WiFi', 'Refreshments'],
      featuresHindi: ['एसी', 'संगीत', 'चार्जिंग पॉइंट', 'ड्राइवर', 'वाईफाई', 'ताज़गी'],
      rating: 4.8,
      reviews: 892,
      available: true,
      driver: {
        name: 'Suresh Patel',
        rating: 4.9,
        experience: '8 years',
        phone: '+91 98765 43213'
      }
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Initialize search results
  useEffect(() => {
    setSearchResults(mockCabs);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchFilters.from && searchFilters.date) {
      const filteredCabs = mockCabs.filter(cab => 
        cab.from.toLowerCase().includes(searchFilters.from.toLowerCase()) &&
        cab.to.toLowerCase().includes(searchFilters.to.toLowerCase())
      );
      setSearchResults(filteredCabs);
      
      // Auto-scroll to cab results
      setTimeout(() => {
        if (cabResultsRef.current) {
          cabResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  const handleCabSelect = (cab) => {
    setSelectedCab(cab);
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
        setBookingId('CAB' + Date.now());
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
    setSelectedCab(null);
    setBookingDetails({ name: '', phone: '', email: '', pickupAddress: '', dropAddress: '', passengerDetails: [] });
    setPaymentMethod('');
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateTotalPrice = (cab) => {
    const basePrice = cab.basePrice;
    const distancePrice = cab.estimatedDistance * cab.perKm;
    return basePrice + distancePrice;
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
            Cab Booking | कैब बुकिंग
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            कैब बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book your cab to Nashik for Maha Kumbh 2026 with the best operators
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Cabs | कैब खोजें
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From | से
                </label>
                <Select value={searchFilters.from} onValueChange={(value) => setSearchFilters({...searchFilters, from: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To | तक
                </label>
                <Input 
                  value={searchFilters.to}
                  readOnly
                  className="bg-gray-100"
                />
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
                  Time | समय
                </label>
                <Input 
                  type="time" 
                  value={searchFilters.time}
                  onChange={(e) => setSearchFilters({...searchFilters, time: e.target.value})}
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
                    <SelectItem value="6">6 Passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
              >
                Search Cabs | कैब खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={cabResultsRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Available Cabs | उपलब्ध कैब
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((cab) => (
                <Card key={cab.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-kumbh-text">
                        {cab.operator}
                      </h3>
                      <p className="font-devanagari text-kumbh-orange font-semibold">
                        {cab.operatorHindi}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {cab.model} • {cab.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{cab.rating}</span>
                        <span className="text-gray-500 text-sm">({cab.reviews})</span>
                      </div>
                      <Badge variant={cab.available ? "default" : "secondary"} className="text-xs">
                        {cab.available ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Route</div>
                      <div className="font-semibold">{cab.from} → {cab.to}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Distance</div>
                      <div className="font-semibold">{cab.estimatedDistance} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">{cab.estimatedDuration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Driver Rating</div>
                      <div className="font-semibold">{cab.driver.rating} ⭐</div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-kumbh-text mb-2">
                      Driver Information | ड्राइवर जानकारी
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span> {cab.driver.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Experience:</span> {cab.driver.experience}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-kumbh-orange">
                        ₹{calculateTotalPrice(cab)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Base: ₹{cab.basePrice} + Distance: ₹{cab.estimatedDistance * cab.perKm}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        // Store cab data for booking
                        const cabData = {
                          id: cab.id,
                          name: cab.name,
                          type: cab.type,
                          basePrice: cab.basePrice,
                          perKm: cab.perKm,
                          estimatedDistance: cab.estimatedDistance,
                          totalPrice: calculateTotalPrice(cab),
                          features: cab.features,
                          available: cab.available,
                          estimatedTime: cab.estimatedTime,
                          timestamp: new Date().toISOString()
                        };
                        
                        localStorage.setItem('selectedCab', JSON.stringify(cabData));
                        setLocation('/transport/cab-booking');
                      }}
                      disabled={!cab.available}
                      className="bg-kumbh-orange text-white hover:bg-kumbh-deep disabled:bg-gray-400"
                    >
                      Book Now | बुक करें
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-kumbh-text mb-2">
                      Features | सुविधाएं
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cab.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
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
        {showBooking && selectedCab && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Cab | कैब बुक करें
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

                {/* Cab Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedCab.operator} - {selectedCab.model}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Route:</span> {selectedCab.from} → {selectedCab.to}
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span> {selectedCab.estimatedDistance} km
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span> {selectedCab.estimatedDuration}
                    </div>
                    <div>
                      <span className="text-gray-600">Driver:</span> {selectedCab.driver.name}
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

                      {/* Address Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-kumbh-text mb-2">
                            Pickup Address | पिकअप पता
                          </label>
                          <Input
                            type="text"
                            value={bookingDetails.pickupAddress}
                            onChange={(e) => setBookingDetails({...bookingDetails, pickupAddress: e.target.value})}
                            placeholder="Enter pickup address"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-kumbh-text mb-2">
                            Drop Address | ड्रॉप पता
                          </label>
                          <Input
                            type="text"
                            value={bookingDetails.dropAddress}
                            onChange={(e) => setBookingDetails({...bookingDetails, dropAddress: e.target.value})}
                            placeholder="Enter drop address"
                            required
                          />
                        </div>
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
                              { id: 'wallet', name: 'Digital Wallet', icon: '💰' },
                              { id: 'cash', name: 'Cash Payment', icon: '💵' }
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
                              <span>Cab Operator:</span>
                              <span className="font-medium">{selectedCab.operator}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vehicle:</span>
                              <span className="font-medium">{selectedCab.model}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Route:</span>
                              <span className="font-medium">{selectedCab.from} → {selectedCab.to}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Distance:</span>
                              <span className="font-medium">{selectedCab.estimatedDistance} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Date & Time:</span>
                              <span className="font-medium">{searchFilters.date} at {searchFilters.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passengers:</span>
                              <span className="font-medium">{searchFilters.passengers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Base Price:</span>
                              <span className="font-medium">₹{selectedCab.basePrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Distance Price:</span>
                              <span className="font-medium">₹{selectedCab.estimatedDistance * selectedCab.perKm}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-kumbh-orange">₹{calculateTotalPrice(selectedCab)}</span>
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
                          Your cab has been booked successfully
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
                              <span className="font-medium">Cab:</span>
                              <span>{selectedCab.operator} - {selectedCab.model}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Driver:</span>
                              <span>{selectedCab.driver.name} ({selectedCab.driver.phone})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Route:</span>
                              <span>{selectedCab.from} → {selectedCab.to}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Date & Time:</span>
                              <span>{searchFilters.date} at {searchFilters.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Pickup:</span>
                              <span>{bookingDetails.pickupAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Drop:</span>
                              <span>{bookingDetails.dropAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Passengers:</span>
                              <span>{searchFilters.passengers}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total Paid:</span>
                              <span className="text-kumbh-orange">₹{calculateTotalPrice(selectedCab)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={resetBooking}
                            className="bg-kumbh-orange text-white hover:bg-kumbh-deep w-full"
                          >
                            Book Another Cab | एक और कैब बुक करें
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
            Cab Travel Tips | कैब यात्रा सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book cabs in advance for better rates', icon: '📅' },
              { tip: 'Confirm pickup location with driver', icon: '📍' },
              { tip: 'Keep driver contact number handy', icon: '📞' },
              { tip: 'Check vehicle condition before boarding', icon: '🚗' },
              { tip: 'Share trip details with family/friends', icon: '👥' },
              { tip: 'Carry cash for tolls and tips', icon: '💰' }
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
