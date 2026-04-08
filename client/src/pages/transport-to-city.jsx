import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function TransportToCity() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedTransport, setSelectedTransport] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: 'Nashik',
    date: '',
    passengers: '1'
  });

  const transportOptions = [
    {
      id: 'road',
      name: 'By Road',
      nameHindi: 'सड़क मार्ग से',
      icon: '🚗',
      description: 'GPS Navigation & Route Planning',
      color: 'bg-green-500',
      features: ['Real-time GPS', 'Route optimization', 'Turn-by-turn navigation']
    },
    {
      id: 'bus',
      name: 'Bus Booking',
      nameHindi: 'बस बुकिंग',
      icon: '🚌',
      description: 'State & Private Bus Services',
      color: 'bg-blue-500',
      features: ['MSRTC buses', 'Private operators', 'AC/Non-AC options']
    },
    {
      id: 'train',
      name: 'Train Booking',
      nameHindi: 'ट्रेन बुकिंग',
      icon: '🚂',
      description: 'Indian Railways to Nashik',
      color: 'bg-purple-500',
      features: ['IRCTC booking', 'Multiple classes', 'Advance booking']
    },
    {
      id: 'cab',
      name: 'Cab Booking',
      nameHindi: 'कैब बुकिंग',
      icon: '🚕',
      description: 'Ola, Uber & Local Taxis',
      color: 'bg-orange-500',
      features: ['Ola/Uber', 'Local taxis', 'Door-to-door service']
    }
  ];

  const handleTransportSelect = (transportId) => {
    setSelectedTransport(transportId);
    
    // Navigate to specific transport pages
    if (transportId === 'road') {
      setLocation('/transport/road');
    } else if (transportId === 'bus') {
      setLocation('/transport/bus');
    } else if (transportId === 'train') {
      setLocation('/transport/train');
    } else if (transportId === 'cab') {
      setLocation('/transport/cab');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching transport:', { transport: selectedTransport, filters: searchFilters });
    // Implement actual search logic
  };

  const renderTransportDetails = () => {
    if (!selectedTransport) return null;

    const transport = transportOptions.find(t => t.id === selectedTransport);
    
    return (
      <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`${transport.color} text-white p-4 rounded-full text-2xl`}>
              {transport.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-kumbh-text">{transport.name}</h3>
              <p className="font-devanagari text-kumbh-orange font-semibold">{transport.nameHindi}</p>
              <p className="text-gray-600">{transport.description}</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From | से
                </label>
                <Select value={searchFilters.from} onValueChange={(value) => setSearchFilters({...searchFilters, from: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
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
                  onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
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
                    <SelectItem value="5+">5+ Passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
              >
                Search {transport.name}
              </Button>
            </div>
          </form>

          {/* Features */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-kumbh-text mb-3">Features | विशेषताएं</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {transport.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-kumbh-orange rounded-full"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="mr-4"
            >
              ← Back to Home
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-2">
            Transport to Nashik
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक तक परिवहन
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose your preferred mode of transport to reach Nashik for Maha Kumbh 2026
          </p>
        </div>

        {/* Transport Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {transportOptions.map((transport) => (
            <Card 
              key={transport.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedTransport === transport.id 
                  ? 'ring-2 ring-kumbh-orange bg-kumbh-light' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTransportSelect(transport.id)}
            >
              <div className="text-center">
                <div className={`${transport.color} text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl`}>
                  {transport.icon}
                </div>
                <h3 className="text-xl font-bold text-kumbh-text mb-2">
                  {transport.name}
                </h3>
                <p className="font-devanagari text-kumbh-orange font-semibold mb-3">
                  {transport.nameHindi}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  {transport.description}
                </p>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedTransport === transport.id 
                    ? 'bg-kumbh-orange text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {selectedTransport === transport.id ? 'Selected' : 'Select'}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Transport Details */}
        {renderTransportDetails()}

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="font-semibold text-kumbh-text mb-2">Multiple Routes</h3>
            <p className="text-sm text-gray-600">Connect from major cities across India</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-semibold text-kumbh-text mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">Live schedules and availability</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold text-kumbh-text mb-2">Easy Booking</h3>
            <p className="text-sm text-gray-600">Secure online payment options</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
