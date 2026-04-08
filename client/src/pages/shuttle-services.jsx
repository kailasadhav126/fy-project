import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ShuttleServices() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    serviceType: '',
    from: '',
    to: '',
    date: '',
    time: '',
    passengers: '1',
    vehicleType: 'standard',
    name: '',
    phone: '',
    email: ''
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const shuttleServices = [
    {
      id: 'auto',
      icon: '🛺',
      name: 'Auto Rickshaw',
      nameHindi: 'ऑटो रिक्शा',
      description: 'Short distance travel within city. Book directly with drivers.',
      descriptionHindi: 'शहर के भीतर छोटी दूरी की यात्रा। ड्राइवरों के साथ सीधे बुक करें।',
      startingFare: '₹15-30',
      features: ['Door-to-door service', 'Flexible routes', 'Quick service'],
      featuresHindi: ['डोर-टू-डोर सेवा', 'लचीले मार्ग', 'त्वरित सेवा'],
      buttonText: 'Book Auto | ऑटो बुक करें',
      color: 'bg-yellow-500'
    },
    {
      id: 'ola',
      icon: '🚕',
      name: 'Ola Cabs',
      nameHindi: 'ओला कैब',
      description: 'Book Ola cabs through the app for convenient travel',
      descriptionHindi: 'सुविधाजनक यात्रा के लिए ऐप के माध्यम से ओला कैब बुक करें',
      startingFare: '₹50-100',
      features: ['Multiple cab types', 'Real-time tracking', 'Cash/Card payment'],
      featuresHindi: ['कई कैब प्रकार', 'रीयल-टाइम ट्रैकिंग', 'नकद/कार्ड भुगतान'],
      buttonText: 'Book Ola | ओला बुक करें',
      color: 'bg-green-500',
      externalLink: 'https://www.olacabs.com/'
    },
    {
      id: 'uber',
      icon: '🚗',
      name: 'Uber',
      nameHindi: 'उबर',
      description: 'Book Uber cabs through the app for reliable rides',
      descriptionHindi: 'विश्वसनीय सवारी के लिए ऐप के माध्यम से उबर कैब बुक करें',
      startingFare: '₹50-100',
      features: ['Multiple vehicle options', 'Estimated arrival time', 'Secure payment'],
      featuresHindi: ['कई वाहन विकल्प', 'अनुमानित आगमन समय', 'सुरक्षित भुगतान'],
      buttonText: 'Book Uber | उबर बुक करें',
      color: 'bg-black',
      externalLink: 'https://www.uber.com/in/en/'
    },
    {
      id: 'shuttle-bus',
      icon: '🚌',
      name: 'Shuttle Buses',
      nameHindi: 'शटल बसें',
      description: 'Free shuttles between major ghats during Kumbh Mela',
      descriptionHindi: 'कुंभ मेला के दौरान प्रमुख घाटों के बीच मुफ्त शटल',
      startingFare: 'FREE',
      features: ['Free service', 'Regular intervals', 'Multiple routes'],
      featuresHindi: ['मुफ्त सेवा', 'नियमित अंतराल', 'कई मार्ग'],
      buttonText: 'View Schedule | अनुसूची देखें',
      color: 'bg-blue-500'
    },
    {
      id: 'taxi',
      icon: '🚖',
      name: 'Local Taxis',
      nameHindi: 'स्थानीय टैक्सी',
      description: 'Book local taxi services for convenient city travel',
      descriptionHindi: 'सुविधाजनक शहर यात्रा के लिए स्थानीय टैक्सी सेवाएं बुक करें',
      startingFare: '₹40-80',
      features: ['Pre-booking available', 'Local knowledge', 'Fixed rates'],
      featuresHindi: ['पूर्व-बुकिंग उपलब्ध', 'स्थानीय ज्ञान', 'निश्चित दरें'],
      buttonText: 'Book Taxi | टैक्सी बुक करें',
      color: 'bg-yellow-600'
    },
    {
      id: 'car-rental',
      icon: '🚙',
      name: 'Car Rental',
      nameHindi: 'कार किराया',
      description: 'Rent a car with or without driver for flexible travel',
      descriptionHindi: 'लचीली यात्रा के लिए ड्राइवर के साथ या बिना कार किराए पर लें',
      startingFare: '₹2000/day',
      features: ['Self-drive option', 'Chauffeur available', 'Multiple car options'],
      featuresHindi: ['स्व-ड्राइव विकल्प', 'चालक उपलब्ध', 'कई कार विकल्प'],
      buttonText: 'Rent Car | कार किराया करें',
      color: 'bg-purple-500'
    }
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    
    // For Ola/Uber, open their websites directly
    if (service.externalLink) {
      window.open(service.externalLink, '_blank');
      return;
    }
    
    // For shuttle bus, show schedule
    if (service.id === 'shuttle-bus') {
      alert('Shuttle Bus Schedule:\n\nRoute 1: Railway Station → Ramkund Ghat\nTiming: Every 15 minutes (6:00 AM - 10:00 PM)\n\nRoute 2: Bus Stand → Panchavati\nTiming: Every 20 minutes (6:00 AM - 10:00 PM)\n\nRoute 3: Airport → Tapovan\nTiming: Every 30 minutes (6:00 AM - 10:00 PM)');
      return;
    }
    
    // For other services, show booking modal
    setBookingDetails({
      ...bookingDetails,
      serviceType: service.id
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingDetails.from || !bookingDetails.to || !bookingDetails.date || !bookingDetails.time || !bookingDetails.name || !bookingDetails.phone) {
      alert('Please fill all required fields');
      return;
    }

    // Calculate fare based on service type
    const baseFares = {
      'auto': { base: 25, perKm: 12 },
      'taxi': { base: 70, perKm: 15 },
      'car-rental': { base: 2000, perKm: 0 }
    };
    
    const fare = baseFares[bookingDetails.serviceType] || { base: 50, perKm: 10 };
    const estimatedDistance = 5; // Assume average distance in km
    const totalFare = fare.base + (fare.perKm * estimatedDistance * parseInt(bookingDetails.passengers || 1));

    // Generate booking ID
    const newBookingId = 'SHUTTLE' + Date.now();

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('shuttleBookings') || '[]');
    bookings.push({
      id: newBookingId,
      serviceName: selectedService.name,
      ...bookingDetails,
      totalFare,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    });
    localStorage.setItem('shuttleBookings', JSON.stringify(bookings));

    // Show confirmation
    alert(`Booking Confirmed!\n\nBooking ID: ${newBookingId}\nService: ${selectedService.name}\nFrom: ${bookingDetails.from}\nTo: ${bookingDetails.to}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nPassengers: ${bookingDetails.passengers}\nEstimated Fare: ₹${totalFare}\n\nYou will receive a confirmation call shortly.`);
    
    // Close modal
    closeBookingModal();
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingDetails({
      serviceType: '',
      from: '',
      to: '',
      date: '',
      time: '',
      passengers: '1',
      vehicleType: 'standard',
      name: '',
      phone: '',
      email: ''
    });
  };

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button 
              onClick={() => setLocation('/transport/in-city')}
              variant="outline"
              className="mr-4"
            >
              ← Back to Transport
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-2">
            Shuttle Services
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            शटल सेवाएं
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book shuttles, auto rickshaws, Ola, Uber and other transport services within Nashik
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {shuttleServices.map((service) => (
            <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className={`${service.color} text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-3xl`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-kumbh-text mb-2">
                  {service.name}
                </h3>
                <p className="font-devanagari text-kumbh-orange font-semibold mb-3">
                  {service.nameHindi}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {service.description}
                </p>
                <p className="font-devanagari text-gray-500 text-xs mb-4">
                  {service.descriptionHindi}
                </p>
              </div>

              <div className="mb-4">
                <div className="text-center mb-3">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    Starting Fare
                  </Badge>
                  <div className="text-2xl font-bold text-kumbh-orange mt-2">
                    {service.startingFare}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Features:</div>
                <ul className="space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleServiceSelect(service)}
                className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
              >
                {service.buttonText}
              </Button>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-bold text-kumbh-text mb-2">Book via Apps</h3>
            <p className="text-gray-600 text-sm">Use Ola/Uber apps for instant booking</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-bold text-kumbh-text mb-2">Flexible Payment</h3>
            <p className="text-gray-600 text-sm">Pay via cash, card, or digital wallets</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="text-lg font-bold text-kumbh-text mb-2">24/7 Available</h3>
            <p className="text-gray-600 text-sm">Services available round the clock</p>
          </Card>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-kumbh-text">
                      Book {selectedService.name}
                    </h2>
                    <p className="font-devanagari text-kumbh-orange font-semibold">
                      {selectedService.nameHindi} बुक करें
                    </p>
                  </div>
                  <Button
                    onClick={closeBookingModal}
                    variant="outline"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Location | से *
                      </label>
                      <Input
                        type="text"
                        value={bookingDetails.from}
                        onChange={(e) => setBookingDetails({...bookingDetails, from: e.target.value})}
                        placeholder="Enter pickup location"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        To Location | तक *
                      </label>
                      <Input
                        type="text"
                        value={bookingDetails.to}
                        onChange={(e) => setBookingDetails({...bookingDetails, to: e.target.value})}
                        placeholder="Enter drop location"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date | तारीख *
                      </label>
                      <Input
                        type="date"
                        value={bookingDetails.date}
                        onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time | समय *
                      </label>
                      <Input
                        type="time"
                        value={bookingDetails.time}
                        onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Passengers | यात्री संख्या *
                      </label>
                      <Select value={bookingDetails.passengers} onValueChange={(value) => setBookingDetails({...bookingDetails, passengers: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger</SelectItem>
                          <SelectItem value="2">2 Passengers</SelectItem>
                          <SelectItem value="3">3 Passengers</SelectItem>
                          <SelectItem value="4">4 Passengers</SelectItem>
                          <SelectItem value="5">5+ Passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle Type | वाहन प्रकार
                      </label>
                      <Select value={bookingDetails.vehicleType} onValueChange={(value) => setBookingDetails({...bookingDetails, vehicleType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="xl">XL (Large)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-kumbh-text mb-4">
                      Contact Details | संपर्क विवरण
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name | नाम *
                        </label>
                        <Input
                          type="text"
                          value={bookingDetails.name}
                          onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone | फोन *
                        </label>
                        <Input
                          type="tel"
                          value={bookingDetails.phone}
                          onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email | ईमेल (Optional)
                      </label>
                      <Input
                        type="email"
                        value={bookingDetails.email}
                        onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={closeBookingModal}
                      variant="outline"
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
      </div>
    </div>
  );
}
