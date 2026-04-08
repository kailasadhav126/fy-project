import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransportTrain() {
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
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    berth: ''
  });

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
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      rating: 4.1,
      reviews: 234
    },
    {
      id: 2,
      number: '22107',
      name: 'Mumbai - Nashik Vande Bharat Express',
      nameHindi: 'मुंबई - नासिक वंदे भारत एक्सप्रेस',
      from: 'Mumbai CSMT',
      to: 'Nashik Road',
      departure: '14:30',
      arrival: '18:00',
      duration: '3h 30m',
      classes: {
        'CC': { price: 450, available: 20 }
      },
      days: ['Mon', 'Wed', 'Fri', 'Sun'],
      rating: 4.6,
      reviews: 189
    },
    {
      id: 3,
      number: '11015',
      name: 'Mumbai - Nashik Passenger',
      nameHindi: 'मुंबई - नासिक पैसेंजर',
      from: 'Mumbai CSMT',
      to: 'Nashik Road',
      departure: '16:45',
      arrival: '22:30',
      duration: '5h 45m',
      classes: {
        'SL': { price: 120, available: 60 },
        'CC': { price: 280, available: 25 }
      },
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      rating: 3.8,
      reviews: 156
    },
    {
      id: 4,
      number: '22109',
      name: 'Mumbai - Nashik Shatabdi Express',
      nameHindi: 'मुंबई - नासिक शताब्दी एक्सप्रेस',
      from: 'Mumbai CSMT',
      to: 'Nashik Road',
      departure: '08:00',
      arrival: '12:15',
      duration: '4h 15m',
      classes: {
        'CC': { price: 380, available: 18 }
      },
      days: ['Tue', 'Thu', 'Sat'],
      rating: 4.3,
      reviews: 98
    }
  ];

  const cities = [
    { name: 'Mumbai CSMT', nameHindi: 'मुंबई सीएसएमटी', code: 'CSMT' },
    { name: 'Mumbai Central', nameHindi: 'मुंबई सेंट्रल', code: 'BCT' },
    { name: 'Pune', nameHindi: 'पुणे', code: 'PUNE' },
    { name: 'Delhi', nameHindi: 'दिल्ली', code: 'NDLS' },
    { name: 'Bangalore', nameHindi: 'बैंगलोर', code: 'SBC' },
    { name: 'Hyderabad', nameHindi: 'हैदराबाद', code: 'HYB' },
    { name: 'Ahmedabad', nameHindi: 'अहमदाबाद', code: 'ADI' },
    { name: 'Nagpur', nameHindi: 'नागपुर', code: 'NGP' }
  ];

  const trainClasses = [
    { code: '1A', name: 'First AC', nameHindi: 'प्रथम एसी', description: 'Most luxurious with 2-berth compartments' },
    { code: '2A', name: 'Second AC', nameHindi: 'द्वितीय एसी', description: 'Air-conditioned with 4-berth compartments' },
    { code: '3A', name: 'Third AC', nameHindi: 'तृतीय एसी', description: 'Air-conditioned with 6-berth compartments' },
    { code: 'SL', name: 'Sleeper', nameHindi: 'स्लीपर', description: 'Non-AC with 6-berth compartments' },
    { code: 'CC', name: 'AC Chair Car', nameHindi: 'एसी चेयर कार', description: 'Air-conditioned seating' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchFilters.from && searchFilters.to && searchFilters.date) {
      // Filter trains based on search criteria
      const filteredTrains = mockTrains.filter(train => 
        train.from.toLowerCase().includes(searchFilters.from.toLowerCase()) &&
        train.to.toLowerCase().includes(searchFilters.to.toLowerCase()) &&
        train.classes[searchFilters.class]
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
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (bookingDetails.name && bookingDetails.phone && bookingDetails.email && bookingDetails.age && bookingDetails.gender) {
      // Simulate booking process
      const selectedClass = trainClasses.find(c => c.code === searchFilters.class);
      const price = selectedTrain.classes[searchFilters.class].price;
      alert(`Booking confirmed! Train: ${selectedTrain.number} ${selectedTrain.name}\nPassenger: ${bookingDetails.name}\nClass: ${selectedClass.name}\nBerth: ${bookingDetails.berth}\nTotal: ₹${price}`);
      setShowBooking(false);
      setSelectedTrain(null);
      setBookingDetails({ name: '', phone: '', email: '', age: '', gender: '', berth: '' });
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getAvailableBerths = (train, classCode) => {
    const berths = [];
    const berthTypes = ['LB', 'MB', 'UB', 'SL', 'SU', 'LB', 'MB', 'UB'];
    for (let i = 1; i <= train.classes[classCode].available; i++) {
      berths.push(`${i}${berthTypes[i % berthTypes.length]}`);
    }
    return berths;
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
            Train Booking to Nashik
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक तक ट्रेन बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book comfortable train journeys to Nashik with Indian Railways and premium services
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Trains | ट्रेन खोजें
          </h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-kumbh-text mb-2">
                From | से
              </label>
              <Select onValueChange={(value) => setSearchFilters({...searchFilters, from: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.code})
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
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nashik Road">Nashik Road (NK)</SelectItem>
                  {cities.filter(city => city.name !== 'Nashik Road').map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.code})
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
                Class | श्रेणी
              </label>
              <Select onValueChange={(value) => setSearchFilters({...searchFilters, class: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {trainClasses.map((cls) => (
                    <SelectItem key={cls.code} value={cls.code}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            
            <div className="md:col-span-5 flex justify-center">
              <Button type="submit" className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8">
                Search Trains | ट्रेन खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={trainResultsRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-4">
              Available Trains | उपलब्ध ट्रेनें
            </h2>
            <div className="space-y-4">
              {searchResults.map((train) => (
                <Card key={train.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Train Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-kumbh-text">
                          {train.number} - {train.name}
                        </h3>
                        <Badge variant="outline" className="text-kumbh-orange border-kumbh-orange">
                          {train.days.join(', ')}
                        </Badge>
                      </div>
                      <p className="font-devanagari text-kumbh-orange font-semibold mb-2">
                        {train.nameHindi}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>⭐ {train.rating} ({train.reviews} reviews)</span>
                        <span>🚂 {train.from} → {train.to}</span>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-kumbh-text mb-1">
                        {train.departure}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Departure | प्रस्थान
                      </div>
                      <div className="text-lg font-semibold text-kumbh-orange">
                        {train.arrival}
                      </div>
                      <div className="text-sm text-gray-600">
                        Arrival | आगमन
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Duration: {train.duration}
                      </div>
                    </div>

                    {/* Classes & Booking */}
                    <div>
                      <h4 className="font-semibold text-kumbh-text mb-3">
                        Available Classes | उपलब्ध श्रेणियां
                      </h4>
                      <div className="space-y-2 mb-4">
                        {Object.entries(train.classes).map(([classCode, classInfo]) => {
                          const classDetails = trainClasses.find(c => c.code === classCode);
                          return (
                            <div key={classCode} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-semibold text-sm">{classDetails.name}</div>
                                <div className="text-xs text-gray-600">{classInfo.available} available</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-kumbh-orange">₹{classInfo.price}</div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSearchFilters({...searchFilters, class: classCode});
                                    handleTrainSelect(train);
                                  }}
                                  className="text-xs"
                                >
                                  Book
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBooking && selectedTrain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Train | ट्रेन बुक करें
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowBooking(false)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Train Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedTrain.number} - {selectedTrain.name}
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
                      <span className="text-gray-600">Class:</span> {trainClasses.find(c => c.code === searchFilters.class)?.name}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    <div>
                      <label className="block text-sm font-medium text-kumbh-text mb-2">
                        Age | आयु
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={bookingDetails.age}
                        onChange={(e) => setBookingDetails({...bookingDetails, age: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-kumbh-text mb-2">
                        Gender | लिंग
                      </label>
                      <Select onValueChange={(value) => setBookingDetails({...bookingDetails, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male | पुरुष</SelectItem>
                          <SelectItem value="Female">Female | महिला</SelectItem>
                          <SelectItem value="Other">Other | अन्य</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kumbh-text mb-2">
                        Berth Preference | बर्थ प्राथमिकता
                      </label>
                      <Select onValueChange={(value) => setBookingDetails({...bookingDetails, berth: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select berth" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableBerths(selectedTrain, searchFilters.class).map((berth) => (
                            <SelectItem key={berth} value={berth}>
                              {berth}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-kumbh-light p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-2">Booking Summary | बुकिंग सारांश</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>₹{selectedTrain.classes[searchFilters.class].price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IRCTC Service Charge:</span>
                        <span>₹{Math.round(selectedTrain.classes[searchFilters.class].price * 0.05)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (5%):</span>
                        <span>₹{Math.round(selectedTrain.classes[searchFilters.class].price * 0.05)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹{Math.round(selectedTrain.classes[searchFilters.class].price * 1.10)}</span>
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
            Train Travel Tips | ट्रेन यात्रा सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book tickets 120 days in advance for best rates', icon: '📅' },
              { tip: 'Arrive at station 30 minutes before departure', icon: '⏰' },
              { tip: 'Carry valid ID proof and ticket printout', icon: '🆔' },
              { tip: 'Check PNR status regularly for updates', icon: '📱' },
              { tip: 'Use IRCTC app for easy booking and cancellation', icon: '📲' },
              { tip: 'Pack light and secure your luggage properly', icon: '🎒' }
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
