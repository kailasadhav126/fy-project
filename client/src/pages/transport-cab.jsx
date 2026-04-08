import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransportCab() {
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
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    pickupAddress: '',
    dropAddress: ''
  });
  const [bookingStep, setBookingStep] = useState(1);

  // Mock cab data
  const mockCabs = [
    {
      id: 1,
      operator: 'Ola',
      operatorHindi: 'ओला',
      type: 'Ola Sedan',
      typeHindi: 'ओला सेडान',
      carModel: 'Honda City',
      seats: 4,
      price: 3200,
      estimatedTime: '4h 30m',
      distance: '180 km',
      features: ['AC', 'Music System', 'Charging Point', 'GPS'],
      featuresHindi: ['एसी', 'म्यूजिक सिस्टम', 'चार्जिंग पॉइंट', 'जीपीएस'],
      rating: 4.3,
      reviews: 1247,
      driver: {
        name: 'Rajesh Kumar',
        rating: 4.5,
        experience: '5 years',
        phone: '+91 98765 43210'
      }
    },
    {
      id: 2,
      operator: 'Uber',
      operatorHindi: 'उबर',
      type: 'Uber XL',
      typeHindi: 'उबर एक्सएल',
      carModel: 'Toyota Innova',
      seats: 7,
      price: 4500,
      estimatedTime: '4h 30m',
      distance: '180 km',
      features: ['AC', 'Music System', 'Charging Point', 'GPS', 'WiFi'],
      featuresHindi: ['एसी', 'म्यूजिक सिस्टम', 'चार्जिंग पॉइंट', 'जीपीएस', 'वाईफाई'],
      rating: 4.1,
      reviews: 892,
      driver: {
        name: 'Amit Singh',
        rating: 4.2,
        experience: '3 years',
        phone: '+91 98765 43211'
      }
    },
    {
      id: 3,
      operator: 'Local Taxi',
      operatorHindi: 'स्थानीय टैक्सी',
      type: 'Standard Taxi',
      typeHindi: 'स्टैंडर्ड टैक्सी',
      carModel: 'Maruti Swift Dzire',
      seats: 4,
      price: 2800,
      estimatedTime: '4h 45m',
      distance: '180 km',
      features: ['AC', 'Music System'],
      featuresHindi: ['एसी', 'म्यूजिक सिस्टम'],
      rating: 3.8,
      reviews: 456,
      driver: {
        name: 'Vikram Patil',
        rating: 4.0,
        experience: '8 years',
        phone: '+91 98765 43212'
      }
    },
    {
      id: 4,
      operator: 'Meru Cabs',
      operatorHindi: 'मेरू कैब्स',
      type: 'Meru Plus',
      typeHindi: 'मेरू प्लस',
      carModel: 'Hyundai Creta',
      seats: 5,
      price: 3800,
      estimatedTime: '4h 30m',
      distance: '180 km',
      features: ['AC', 'Music System', 'Charging Point', 'GPS', 'Water Bottle'],
      featuresHindi: ['एसी', 'म्यूजिक सिस्टम', 'चार्जिंग पॉइंट', 'जीपीएस', 'पानी की बोतल'],
      rating: 4.4,
      reviews: 678,
      driver: {
        name: 'Suresh Yadav',
        rating: 4.6,
        experience: '6 years',
        phone: '+91 98765 43213'
      }
    },
    {
      id: 5,
      operator: 'Savaari',
      operatorHindi: 'सवारी',
      type: 'Savaari Sedan',
      typeHindi: 'सवारी सेडान',
      carModel: 'Nissan Sunny',
      seats: 4,
      price: 3500,
      estimatedTime: '4h 30m',
      distance: '180 km',
      features: ['AC', 'Music System', 'Charging Point', 'GPS', 'WiFi', 'Snacks'],
      featuresHindi: ['एसी', 'म्यूजिक सिस्टम', 'चार्जिंग पॉइंट', 'जीपीएस', 'वाईफाई', 'नाश्ता'],
      rating: 4.2,
      reviews: 543,
      driver: {
        name: 'Ramesh Kumar',
        rating: 4.3,
        experience: '4 years',
        phone: '+91 98765 43214'
      }
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
    if (searchFilters.from && searchFilters.to && searchFilters.date && searchFilters.time) {
      // Filter cabs based on search criteria
      const filteredCabs = mockCabs.filter(cab => 
        cab.type.toLowerCase().includes('sedan') || 
        cab.type.toLowerCase().includes('xl') ||
        cab.type.toLowerCase().includes('taxi') ||
        cab.type.toLowerCase().includes('plus')
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
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (bookingDetails.name && bookingDetails.phone && bookingDetails.email && bookingDetails.pickupAddress && bookingDetails.dropAddress) {
      // Simulate booking process
      alert(`Booking confirmed! Cab: ${selectedCab.operator} ${selectedCab.type}\nDriver: ${selectedCab.driver.name}\nPhone: ${selectedCab.driver.phone}\nPickup: ${bookingDetails.pickupAddress}\nDrop: ${bookingDetails.dropAddress}\nTotal: ₹${selectedCab.price}`);
      setShowBooking(false);
      setSelectedCab(null);
      setBookingDetails({ name: '', phone: '', email: '', pickupAddress: '', dropAddress: '' });
      setBookingStep(1);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
            Cab Booking to Nashik
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक तक कैब बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book comfortable cab rides to Nashik with verified drivers and real-time tracking
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Cabs | कैब खोजें
          </h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-sm font-medium text-kumbh-text mb-2">
                Passengers | यात्री
              </label>
              <Select onValueChange={(value) => setSearchFilters({...searchFilters, passengers: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-5 flex justify-center">
              <Button type="submit" className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8">
                Search Cabs | कैब खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={cabResultsRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-4">
              Available Cabs | उपलब्ध कैब
            </h2>
            <div className="space-y-4">
              {searchResults.map((cab) => (
                <Card key={cab.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Cab Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-kumbh-text">
                          {cab.operator} - {cab.type}
                        </h3>
                        <Badge variant="outline" className="text-kumbh-orange border-kumbh-orange">
                          {cab.carModel}
                        </Badge>
                      </div>
                      <p className="font-devanagari text-kumbh-orange font-semibold mb-2">
                        {cab.operatorHindi} - {cab.typeHindi}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>⭐ {cab.rating} ({cab.reviews} reviews)</span>
                        <span>👥 {cab.seats} seats</span>
                        <span>🚗 {cab.distance}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Driver: {cab.driver.name} (⭐ {cab.driver.rating}, {cab.driver.experience} exp)
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-kumbh-text mb-2">
                        Features | सुविधाएं
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {cab.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Estimated Time: {cab.estimatedTime}</div>
                        <div>Driver Phone: {cab.driver.phone}</div>
                      </div>
                    </div>

                    {/* Price & Booking */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-kumbh-orange mb-2">
                        ₹{cab.price}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        one way
                      </div>
                      <Button
                        onClick={() => handleCabSelect(cab)}
                        className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      >
                        Book Now | बुक करें
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBooking && selectedCab && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Cab | कैब बुक करें
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowBooking(false)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      bookingStep >= 1 ? 'bg-kumbh-orange text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div className={`w-16 h-1 ${bookingStep >= 2 ? 'bg-kumbh-orange' : 'bg-gray-300'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      bookingStep >= 2 ? 'bg-kumbh-orange text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      2
                    </div>
                    <div className={`w-16 h-1 ${bookingStep >= 3 ? 'bg-kumbh-orange' : 'bg-gray-300'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      bookingStep >= 3 ? 'bg-kumbh-orange text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      3
                    </div>
                  </div>
                </div>

                {/* Step 1: Cab Details */}
                {bookingStep === 1 && (
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedCab.operator} - {selectedCab.type}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Car:</span> {selectedCab.carModel}
                        </div>
                        <div>
                          <span className="text-gray-600">Seats:</span> {selectedCab.seats}
                        </div>
                        <div>
                          <span className="text-gray-600">Driver:</span> {selectedCab.driver.name}
                        </div>
                        <div>
                          <span className="text-gray-600">Rating:</span> ⭐ {selectedCab.driver.rating}
                        </div>
                        <div>
                          <span className="text-gray-600">Distance:</span> {selectedCab.distance}
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span> {selectedCab.estimatedTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={() => setBookingStep(2)}
                        className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8"
                      >
                        Continue | जारी रखें
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Address Details */}
                {bookingStep === 2 && (
                  <div>
                    <h3 className="text-lg font-semibold text-kumbh-text mb-4">
                      Pickup & Drop Details | पिकअप और ड्रॉप विवरण
                    </h3>
                    <form onSubmit={(e) => { e.preventDefault(); setBookingStep(3); }}>
                      <div className="space-y-4 mb-6">
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
                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBookingStep(1)}
                          className="flex-1"
                        >
                          Back | वापस
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep"
                        >
                          Continue | जारी रखें
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: Personal Details & Booking */}
                {bookingStep === 3 && (
                  <div>
                    <h3 className="text-lg font-semibold text-kumbh-text mb-4">
                      Personal Details | व्यक्तिगत विवरण
                    </h3>
                    <form onSubmit={handleBooking}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                        <div className="md:col-span-2">
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
                      </div>

                      <div className="bg-kumbh-light p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-lg mb-2">Booking Summary | बुकिंग सारांश</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Price:</span>
                            <span>₹{selectedCab.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service Tax:</span>
                            <span>₹{Math.round(selectedCab.price * 0.12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Driver Charges:</span>
                            <span>₹{Math.round(selectedCab.price * 0.05)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>₹{Math.round(selectedCab.price * 1.17)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBookingStep(2)}
                          className="flex-1"
                        >
                          Back | वापस
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
              { tip: 'Share your live location with family', icon: '📍' },
              { tip: 'Verify driver details before boarding', icon: '🆔' },
              { tip: 'Keep emergency contact numbers handy', icon: '📞' },
              { tip: 'Check cab condition before starting', icon: '🔍' },
              { tip: 'Carry cash for toll and parking charges', icon: '💰' }
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
