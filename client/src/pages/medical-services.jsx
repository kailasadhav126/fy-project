import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';
// Switched to backend API; CSV loader removed

export default function MedicalServices() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
    const [searchFilters, setSearchFilters] = useState({
      service: 'all',
      location: 'Nashik',
      emergency: false
    });
    
    const [searchResults, setSearchResults] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [bookingDetails, setBookingDetails] = useState({
      name: '',
      phone: '',
      email: '',
      age: '',
      gender: '',
      symptoms: '',
      urgency: 'Normal'
    });
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [nearbyServices, setNearbyServices] = useState([]);
    const [nashikMedicalServices, setNashikMedicalServices] = useState([]);
    const servicesResultsRef = useRef(null);

  // Load medical services data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/medical`);
        const data = await res.json();
        const transformed = (data || []).map((service, idx) => ({
          id: service._id || idx,
          name: service.name,
          nameHindi: service.nameHindi || '',
          type: service.type || 'Hospital',
          typeHindi: service.typeHindi || '',
          category: service.category || '',
          categoryHindi: service.categoryHindi || '',
          location: 'Nashik',
          address: service.address || '',
          coordinates: service.location && service.location.coordinates ? { lat: service.location.coordinates[1], lng: service.location.coordinates[0] } : null,
          image: service.image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          rating: service.rating || 4.3,
          reviews: service.reviews || 0,
          services: service.services || [],
          servicesHindi: service.servicesHindi || [],
          emergency: !!service.emergency,
          open24x7: !!service.open24x7,
          phone: service.phone || '',
          distance: ''
        }));
        setNashikMedicalServices(transformed);
        setSearchResults(transformed);
      } catch (error) {
        console.error('Error loading medical services API:', error);
        setNashikMedicalServices([]);
        setSearchResults([]);
      }
    };
    loadData();
  }, []);

    // Legacy hardcoded data removed - now using CSV

    // Scroll to top when component mounts
    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    // Initialize search results when data is loaded
    useEffect(() => {
      if (nashikMedicalServices.length > 0) {
        setSearchResults(nashikMedicalServices);
      }
    }, [nashikMedicalServices]);

    // Get user's current location
  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            setUserLocation({ lat: userLat, lng: userLng });
            const res = await fetch(`${API_BASE}/api/medical/nearby?lat=${userLat}&lng=${userLng}&radiusKm=15`);
            const data = await res.json();
            const transformed = (data || []).map((service, idx) => ({
              id: service._id || idx,
              name: service.name,
              nameHindi: service.nameHindi || '',
              type: service.type || 'Hospital',
              category: service.category || '',
              location: 'Nashik',
              address: service.address || '',
              coordinates: service.location && service.location.coordinates ? { lat: service.location.coordinates[1], lng: service.location.coordinates[0] } : null,
              image: service.image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
              rating: service.rating || 4.3,
              reviews: service.reviews || 0,
              services: service.services || [],
              emergency: !!service.emergency,
              open24x7: !!service.open24x7,
              phone: service.phone || '',
              distanceFromUser: service.distanceMeters ? (service.distanceMeters / 1000) : undefined
            }));
            setNearbyServices(transformed);
            setSearchResults(transformed.length > 0 ? transformed : nashikMedicalServices);
          } catch (err) {
            console.error('Nearby API error:', err);
            setSearchResults(nashikMedicalServices);
          } finally {
            setLocationLoading(false);
            setTimeout(() => {
              if (servicesResultsRef.current) {
                servicesResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setSearchResults(nashikMedicalServices);
          setLocationLoading(false);
        }
      );
    } else {
      setSearchResults(nashikMedicalServices);
      setLocationLoading(false);
    }
  };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

    const handleSearch = (e) => {
    e.preventDefault();
    let filteredServices = nashikMedicalServices;

    // Filter by service type
    if (searchFilters.service && searchFilters.service !== 'all') {
      filteredServices = filteredServices.filter(service => 
        service.type.toLowerCase().includes(searchFilters.service.toLowerCase()) ||
        service.category.toLowerCase().includes(searchFilters.service.toLowerCase())
      );
    }

    // Filter by location
    if (searchFilters.location) {
      filteredServices = filteredServices.filter(service => 
        service.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    // Filter by emergency services
    if (searchFilters.emergency) {
      filteredServices = filteredServices.filter(service => service.emergency);
    }

    setSearchResults(filteredServices);
    
    // Auto-scroll to services list
    setTimeout(() => {
      if (servicesResultsRef.current) {
        servicesResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

    const handleServiceSelect = (service) => {
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book a medical appointment. After login, you will return to this page.'
    })) {
      return;
    }

    setSelectedService(service);
    setShowBooking(true);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
    setBookingDetails((prev) => ({
      ...prev,
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    }));
  };

    const handleBooking = async (e) => {
    e.preventDefault();
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to complete this medical booking. After login, you will return to this page.'
    })) {
      return;
    }

    if (bookingStep === 1) {
      // Validate booking details
      if (!bookingDetails.name || !bookingDetails.phone || !bookingDetails.symptoms) {
        alert('Please fill in all required fields.');
        return;
      }

      try {
        const booking = await createBookingRecord({
          API_BASE,
          token: getToken(),
          bookingData: {
            bookingType: 'medical',
            status: 'pending',
            medicalDetails: {
              serviceId: selectedService.id,
              serviceName: selectedService.name,
              serviceType: selectedService.type,
              address: selectedService.address,
              phone: selectedService.phone,
              patientName: bookingDetails.name,
              age: Number(bookingDetails.age) || undefined,
              gender: bookingDetails.gender,
              symptoms: bookingDetails.symptoms,
              urgency: bookingDetails.urgency
            },
            contactDetails: {
              name: bookingDetails.name,
              phone: bookingDetails.phone,
              email: bookingDetails.email
            },
            amount: 0,
            bookingDetails: {
              source: 'medical-services-page',
              emergency: Boolean(selectedService.emergency),
              open24x7: Boolean(selectedService.open24x7)
            }
          }
        });

        setBookingId(booking.bookingId);
        setBookingConfirmed(true);
        setBookingStep(2);
      } catch (error) {
        console.error('Medical booking error:', error);
        alert(error.message || 'Failed to create medical booking. Please try again.');
      }
    }
  };

    const resetBooking = () => {
    setShowBooking(false);
    setSelectedService(null);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
    setBookingDetails({
      name: '',
      phone: '',
      email: '',
      age: '',
      gender: '',
      symptoms: '',
      urgency: 'Normal'
    });
  };

    const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Medical Services | चिकित्सा सेवाएं
          </h1>
          <p className="font-devanagari text-xl text-orange-600 font-semibold mb-4">
            चिकित्सा सेवाएं
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find hospitals, clinics, and wellness centers near you for your health needs during Kumbh Mela
          </p>
        </div>

        {/* Location Services */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Find Nearby Medical Services | पास की चिकित्सा सेवाएं खोजें
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Enable location services to find medical services near your current location
              </p>
              {userLocation ? (
                <p className="text-sm text-green-600">
                  ✅ Location enabled: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  📍 Location not enabled
                </p>
              )}
              {nearbyServices.length > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  Found {nearbyServices.length} nearby medical services
                </p>
              )}
            </div>
                <Button 
              onClick={getUserLocation}
              disabled={locationLoading}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {locationLoading ? 'Getting Location...' : 'Find Nearby Services'}
                </Button>
          </div>
        </Card>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Search Medical Services | चिकित्सा सेवाएं खोजें
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type | सेवा प्रकार
                </label>
                <Select value={searchFilters.service} onValueChange={(value) => setSearchFilters({...searchFilters, service: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="Clinic">Clinic</SelectItem>
                    <SelectItem value="Wellness">Wellness Center</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Specialty">Specialty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location | स्थान
                </label>
                <Select value={searchFilters.location} onValueChange={(value) => setSearchFilters({...searchFilters, location: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nashik">Nashik</SelectItem>
                    <SelectItem value="Trimbakeshwar">Trimbakeshwar</SelectItem>
                    <SelectItem value="Panchavati">Panchavati</SelectItem>
                    <SelectItem value="Dwarka">Dwarka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Emergency Only | केवल आपातकालीन
                </label>
                <Select value={searchFilters.emergency ? 'true' : 'false'} onValueChange={(value) => setSearchFilters({...searchFilters, emergency: value === 'true'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">All Services</SelectItem>
                    <SelectItem value="true">Emergency Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
        </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3"
              >
                Search Services | सेवाएं खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={servicesResultsRef}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Available Medical Services | उपलब्ध चिकित्सा सेवाएं
          </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((service) => (
                <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {service.name}
                      </h3>
                      <p className="font-devanagari text-orange-600 font-semibold">
                        {service.nameHindi}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {service.type} • {service.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-gray-500 text-sm">({service.reviews})</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {service.distanceFromUser ? `${service.distanceFromUser.toFixed(1)} km away` : service.distance}
                      </Badge>
                    </div>
                  </div>

                  {/* Service Image */}
                  <div className="w-full h-56 md:h-64 rounded-lg mb-4 overflow-hidden bg-gray-100">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-gray-500">Service Image</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="font-semibold">{service.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Category</div>
                      <div className="font-semibold">{service.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Emergency</div>
                      <div className="font-semibold text-red-600">{service.emergency ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">24x7</div>
                      <div className="font-semibold text-green-600">{service.open24x7 ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {service.services.slice(0, 3).map((srv, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {srv}
                        </Badge>
                      ))}
                      {service.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{service.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleServiceSelect(service)}
                      className="bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Book Appointment | अपॉइंटमेंट बुक करें
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Medical Services Booking Modal */}
        {showBooking && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Book Medical Service | चिकित्सा सेवा बुक करें
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowBooking(false)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Booking Steps */}
                <div className="flex justify-around mb-6">
                  <div className={`text-center ${bookingStep >= 1 ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                    1. Details
                  </div>
                  <div className={`text-center ${bookingStep >= 2 ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                    2. Confirmation
                  </div>
                </div>

                {/* Service Details */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedService.name}</h3>
                      <p className="font-devanagari text-orange-600 font-semibold">{selectedService.nameHindi}</p>
                      <p className="text-gray-600 text-sm">{selectedService.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{selectedService.rating}</span>
                          <span className="text-gray-500 text-sm">({selectedService.reviews})</span>
                        </div>
                        <div className="text-sm text-gray-600">Phone: {selectedService.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1: Patient Details */}
                {bookingStep === 1 && (
                  <form onSubmit={handleBooking}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Patient Details | रोगी विवरण
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name | पूरा नाम *
                        </label>
                        <Input
                          type="text"
                          value={bookingDetails.name}
                          onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number | फोन नंबर *
                        </label>
                        <Input
                          type="tel"
                          value={bookingDetails.phone}
                          onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address | ईमेल पता
                        </label>
                        <Input
                          type="email"
                          value={bookingDetails.email}
                          onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age | आयु
                        </label>
                        <Input
                          type="number"
                          value={bookingDetails.age}
                          onChange={(e) => setBookingDetails({...bookingDetails, age: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender | लिंग
                        </label>
                        <Select value={bookingDetails.gender} onValueChange={(value) => setBookingDetails({...bookingDetails, gender: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Urgency | तात्कालिकता
                        </label>
                        <Select value={bookingDetails.urgency} onValueChange={(value) => setBookingDetails({...bookingDetails, urgency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptoms/Reason for Visit | लक्षण/दौरे का कारण *
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                        rows="4"
                        value={bookingDetails.symptoms}
                        onChange={(e) => setBookingDetails({...bookingDetails, symptoms: e.target.value})}
                        placeholder="Describe your symptoms or reason for the visit..."
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3"
                      >
                        Book Appointment | अपॉइंटमेंट बुक करें
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 2: Confirmation */}
                {bookingStep === 2 && bookingConfirmed && (
                  <div className="text-center">
                    <div className="text-6xl text-green-500 mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-4">
                      Appointment Booked! | अपॉइंटमेंट बुक हो गया!
                    </h3>
                    <p className="text-lg text-gray-700 mb-2">
                      Your Booking ID: <span className="font-bold text-orange-600">{bookingId}</span>
                    </p>
                    <p className="text-gray-600 mb-6">
                      The medical service will contact you shortly to confirm your appointment.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                      <h4 className="font-semibold text-gray-800 mb-3">Appointment Details | अपॉइंटमेंट विवरण</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Service:</strong> {selectedService.name}</div>
                        <div><strong>Address:</strong> {selectedService.address}</div>
                        <div><strong>Phone:</strong> {selectedService.phone}</div>
                        <div><strong>Patient:</strong> {bookingDetails.name}</div>
                        <div><strong>Phone:</strong> {bookingDetails.phone}</div>
                        <div><strong>Urgency:</strong> {bookingDetails.urgency}</div>
                        <div><strong>Symptoms:</strong> {bookingDetails.symptoms}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowBooking(false)}
                      className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3"
                    >
                      Done | हो गया
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Quick Tips */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Medical Services Tips | चिकित्सा सेवा सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Keep emergency contact numbers handy during Kumbh Mela', icon: '🚨' },
              { tip: 'Carry your medical records and prescriptions', icon: '📋' },
              { tip: 'Stay hydrated and take regular breaks', icon: '💧' },
              { tip: 'Know the location of nearest emergency services', icon: '🏥' },
              { tip: 'Inform medical staff about any allergies', icon: '⚠️' },
              { tip: 'Keep first aid kit and basic medicines ready', icon: '🩹' }
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
