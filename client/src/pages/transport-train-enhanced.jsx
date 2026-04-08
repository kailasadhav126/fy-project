import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransportTrainEnhanced() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: 'Nashik Road',
    date: '',
    class: 'SL',
    passengers: '1'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const trainResultsRef = useRef(null);
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

  // Mock train data
  const mockTrains = [
    {
      id: 1,
      number: '11013',
      name: 'Mumbai CSMT - Nashik Road Express',
      nameHindi: 'मुंबई सीएसएमटी - नासिक रोड एक्सप्रेस',
      from: 'Mumbai CSMT',
      to: 'Nashik Road',
      departure: '06:15',
      arrival: '10:45',
      duration: '4h 30m',
      classes: {
        '1A': { price: 1200, available: 2 },
        '2A': { price: 750, available: 8 },
        '3A': { price: 550, available: 15 },
        'SL': { price: 180, available: 45 },
        'CC': { price: 320, available: 12 }
      },
      amenities: ['AC', 'Bedding', 'Meals', 'Charging Point'],
      amenitiesHindi: ['एसी', 'बिस्तर', 'भोजन', 'चार्जिंग पॉइंट'],
      rating: 4.3,
      reviews: 234
    },
    {
      id: 2,
      number: '11014',
      name: 'Pune - Nashik Road Intercity',
      nameHindi: 'पुणे - नासिक रोड इंटरसिटी',
      from: 'Pune',
      to: 'Nashik Road',
      departure: '08:30',
      arrival: '13:00',
      duration: '4h 30m',
      classes: {
        '2A': { price: 650, available: 5 },
        '3A': { price: 450, available: 12 },
        'SL': { price: 150, available: 35 },
        'CC': { price: 280, available: 8 }
      },
      amenities: ['AC', 'Bedding'],
      amenitiesHindi: ['एसी', 'बिस्तर'],
      rating: 4.1,
      reviews: 156
    },
    {
      id: 3,
      number: '12951',
      name: 'Mumbai Central - Delhi Rajdhani',
      nameHindi: 'मुंबई सेंट्रल - दिल्ली राजधानी',
      from: 'Mumbai Central',
      to: 'Nashik Road',
      departure: '16:35',
      arrival: '21:05',
      duration: '4h 30m',
      classes: {
        '1A': { price: 1500, available: 1 },
        '2A': { price: 950, available: 3 },
        '3A': { price: 700, available: 8 }
      },
      amenities: ['AC', 'Bedding', 'Meals', 'WiFi', 'Charging Point'],
      amenitiesHindi: ['एसी', 'बिस्तर', 'भोजन', 'वाईफाई', 'चार्जिंग पॉइंट'],
      rating: 4.6,
      reviews: 445
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Initialize search results
  useEffect(() => {
    setSearchResults(mockTrains);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchFilters.from && searchFilters.date) {
      const filteredTrains = mockTrains.filter(train => 
        train.from.toLowerCase().includes(searchFilters.from.toLowerCase()) &&
        train.to.toLowerCase().includes(searchFilters.to.toLowerCase())
      );
      setSearchResults(filteredTrains);
      
      // Auto-scroll to train results
      setTimeout(() => {
        if (trainResultsRef.current) {
          trainResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
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
        setBookingId('TRAIN' + Date.now());
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
          { name: '', age: '', gender: '', idProof: '', berthPreference: '' }
        ]
      });
    }
  };

  const resetBooking = () => {
    setShowBooking(false);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
    setSelectedTrain(null);
    setBookingDetails({ name: '', phone: '', email: '', seats: [], passengerDetails: [] });
    setPaymentMethod('');
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getClassInfo = (className) => {
    const classNames = {
      '1A': 'First AC',
      '2A': 'Second AC',
      '3A': 'Third AC',
      'SL': 'Sleeper',
      'CC': 'Chair Car'
    };
    return classNames[className] || className;
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
            Train Booking | ट्रेन बुकिंग
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            ट्रेन बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book your train tickets to Nashik for Maha Kumbh 2026 with Indian Railways
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Trains | ट्रेन खोजें
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From | से
                </label>
                <Select value={searchFilters.from} onValueChange={(value) => setSearchFilters({...searchFilters, from: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai CSMT">Mumbai CSMT</SelectItem>
                    <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
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
                  Class | क्लास
                </label>
                <Select value={searchFilters.class} onValueChange={(value) => setSearchFilters({...searchFilters, class: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1A">1A - First AC</SelectItem>
                    <SelectItem value="2A">2A - Second AC</SelectItem>
                    <SelectItem value="3A">3A - Third AC</SelectItem>
                    <SelectItem value="SL">SL - Sleeper</SelectItem>
                    <SelectItem value="CC">CC - Chair Car</SelectItem>
                  </SelectContent>
                </Select>
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
                Search Trains | ट्रेन खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={trainResultsRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Available Trains | उपलब्ध ट्रेनें
            </h2>
            <div className="space-y-6">
              {searchResults.map((train) => (
                <Card key={train.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-kumbh-text">
                        {train.name}
                      </h3>
                      <p className="font-devanagari text-kumbh-orange font-semibold">
                        {train.nameHindi}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Train No: {train.number}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{train.rating}</span>
                        <span className="text-gray-500 text-sm">({train.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Route</div>
                      <div className="font-semibold">{train.from} → {train.to}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Departure</div>
                      <div className="font-semibold">{train.departure}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Arrival</div>
                      <div className="font-semibold">{train.arrival}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">{train.duration}</div>
                    </div>
                  </div>

                  {/* Class Options */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-kumbh-text mb-3">
                      Available Classes | उपलब्ध क्लास
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.entries(train.classes).map(([className, classInfo]) => (
                        <div
                          key={className}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            searchFilters.class === className
                              ? 'border-kumbh-orange bg-kumbh-light'
                              : 'border-gray-300 hover:border-kumbh-orange'
                          }`}
                          onClick={() => setSearchFilters({...searchFilters, class: className})}
                        >
                          <div className="text-center">
                            <div className="font-semibold text-sm">{className}</div>
                            <div className="text-xs text-gray-600 mb-1">{getClassInfo(className)}</div>
                            <div className="text-lg font-bold text-kumbh-orange">₹{classInfo.price}</div>
                            <div className="text-xs text-gray-500">{classInfo.available} seats</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-kumbh-orange">
                          ₹{train.classes[searchFilters.class]?.price || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          per person
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {train.classes[searchFilters.class]?.available || 0} seats left
                      </Badge>
                    </div>
                    <Button
                      onClick={() => {
                        // Store train data for booking
                        const trainData = {
                          id: train.id,
                          name: train.name,
                          from: train.from,
                          to: train.to,
                          departureTime: train.departureTime,
                          arrivalTime: train.arrivalTime,
                          duration: train.duration,
                          classes: train.classes,
                          selectedClass: searchFilters.class,
                          amenities: train.amenities,
                          timestamp: new Date().toISOString()
                        };
                        
                        localStorage.setItem('selectedTrain', JSON.stringify(trainData));
                        setLocation('/transport/train-booking');
                      }}
                      className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                    >
                      Book Now | बुक करें
                    </Button>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-kumbh-text mb-2">
                      Amenities | सुविधाएं
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {train.amenities.map((amenity, index) => (
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
        {showBooking && selectedTrain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Train | ट्रेन बुक करें
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

                {/* Train Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedTrain.name} - {getClassInfo(searchFilters.class)}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Route:</span> {selectedTrain.from} → {selectedTrain.to}
                    </div>
                    <div>
                      <span className="text-gray-600">Timing:</span> {selectedTrain.departure} - {selectedTrain.arrival}
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span> {selectedTrain.duration}
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span> ₹{selectedTrain.classes[searchFilters.class]?.price} per person
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
                              <div>
                                <label className="block text-sm font-medium text-kumbh-text mb-2">
                                  Berth Preference | बर्थ प्राथमिकता
                                </label>
                                <Select
                                  value={passenger.berthPreference || ''}
                                  onValueChange={(value) => handlePassengerDetailChange(index, 'berthPreference', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select berth preference" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lower">Lower | निचला</SelectItem>
                                    <SelectItem value="middle">Middle | मध्य</SelectItem>
                                    <SelectItem value="upper">Upper | ऊपरी</SelectItem>
                                    <SelectItem value="side">Side | साइड</SelectItem>
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
                              <span>Train:</span>
                              <span className="font-medium">{selectedTrain.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Class:</span>
                              <span className="font-medium">{getClassInfo(searchFilters.class)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Route:</span>
                              <span className="font-medium">{selectedTrain.from} → {selectedTrain.to}</span>
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
                              <span className="font-medium">₹{selectedTrain.classes[searchFilters.class]?.price}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-kumbh-orange">₹{(selectedTrain.classes[searchFilters.class]?.price || 0) * parseInt(searchFilters.passengers)}</span>
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
                          Your train ticket has been booked successfully
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
                              <span className="font-medium">Train:</span>
                              <span>{selectedTrain.name} ({selectedTrain.number})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Class:</span>
                              <span>{getClassInfo(searchFilters.class)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Route:</span>
                              <span>{selectedTrain.from} → {selectedTrain.to}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Date:</span>
                              <span>{searchFilters.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Time:</span>
                              <span>{selectedTrain.departure} - {selectedTrain.arrival}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Passengers:</span>
                              <span>{searchFilters.passengers}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total Paid:</span>
                              <span className="text-kumbh-orange">₹{(selectedTrain.classes[searchFilters.class]?.price || 0) * parseInt(searchFilters.passengers)}</span>
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
            Train Travel Tips | ट्रेन यात्रा सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book tickets 120 days in advance for best rates', icon: '📅' },
              { tip: 'Check PNR status regularly before journey', icon: '🔍' },
              { tip: 'Arrive at station 30 minutes before departure', icon: '⏰' },
              { tip: 'Carry valid ID proof for ticket verification', icon: '🆔' },
              { tip: 'Download IRCTC app for easy management', icon: '📱' },
              { tip: 'Check train running status on day of travel', icon: '🚂' }
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
