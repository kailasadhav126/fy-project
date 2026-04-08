import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireLoginForBooking } from '@/lib/booking-flow';
// Switched to backend API; CSV loader removed

export default function HotelBooking() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  // Get default dates (today and tomorrow)
  const getDefaultCheckIn = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const getDefaultCheckOut = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [searchFilters, setSearchFilters] = useState({
    location: 'Nashik',
    checkIn: getDefaultCheckIn(),
    checkOut: getDefaultCheckOut(),
    guests: '1',
    rooms: '1'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    guestDetails: [],
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    rating: 0,
    amenities: []
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const hotelsListRef = useRef(null);
  const [nashikHotels, setNashikHotels] = useState([]);

  // Load hotels data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/hotels`);
        const data = await res.json();
        const transformedData = (data || []).map((hotel, idx) => ({
          id: hotel._id || idx,
          name: hotel.name,
          nameHindi: hotel.nameHindi || '',
          location: 'Nashik',
          address: hotel.address || '',
          coordinates: hotel.location && hotel.location.coordinates ? { lat: hotel.location.coordinates[1], lng: hotel.location.coordinates[0] } : null,
          image: hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
          rating: hotel.rating || 4.2,
          reviews: hotel.reviews || 0,
          price: hotel.price || 2500,
          originalPrice: ((hotel.price || 2500) * 1.2),
          discount: 17,
          amenities: hotel.amenities || [],
          rooms: [
            { type: 'Standard Room', price: (hotel.price || 2500), available: 5, maxGuests: 2 },
            { type: 'Deluxe Room', price: (hotel.price || 2500) * 1.4, available: 3, maxGuests: 3 }
          ],
          distance: '',
          description: `${hotel.name} - Comfortable accommodation with modern amenities`,
          verified: hotel.verified ?? true
        }));
        setNashikHotels(transformedData);
        setSearchResults(transformedData);
      } catch (error) {
        console.error('Error loading hotels API:', error);
        setNashikHotels([]);
        setSearchResults([]);
      }
    };
    loadData();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    setLocationLoading(true);
    setUserLocation(null); // Clear previous location
    setNearbyHotels([]); // Clear previous nearby hotels
    
    if (navigator.geolocation) {
      // Use high accuracy and no caching to get fresh location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            console.log('Got fresh location:', userLat, userLng);
            setUserLocation({ lat: userLat, lng: userLng });
            
            const res = await fetch(`${API_BASE}/api/hotels/nearby?lat=${userLat}&lng=${userLng}&radiusKm=10`);
            if (!res.ok) {
              throw new Error(`API error: ${res.status}`);
            }
            const data = await res.json();
            // Handle both array response and error response with hotels array
            const hotelsArray = Array.isArray(data) ? data : (data.hotels || []);
            const transformed = (hotelsArray || []).map((hotel, idx) => ({
              id: hotel._id || idx,
              name: hotel.name,
              nameHindi: hotel.nameHindi || '',
              location: 'Nashik',
              address: hotel.address || '',
              coordinates: hotel.location && hotel.location.coordinates ? { lat: hotel.location.coordinates[1], lng: hotel.location.coordinates[0] } : null,
              image: hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
              rating: hotel.rating || 4.2,
              reviews: hotel.reviews || 0,
              price: hotel.price || 2500,
              originalPrice: ((hotel.price || 2500) * 1.2),
              discount: 17,
              amenities: hotel.amenities || [],
              rooms: [
                { type: 'Standard Room', price: (hotel.price || 2500), available: 5, maxGuests: 2 },
                { type: 'Deluxe Room', price: (hotel.price || 2500) * 1.4, available: 3, maxGuests: 3 }
              ],
              distanceFromUser: hotel.distanceMeters ? (hotel.distanceMeters / 1000) : undefined,
              description: `${hotel.name} - Comfortable accommodation with modern amenities`,
              verified: hotel.verified ?? true,
              isNearby: true // Mark as nearby hotel
            }));
            setNearbyHotels(transformed);
            
            // Get IDs of nearby hotels to filter them out from other hotels
            const nearbyHotelIds = transformed.map(h => h.id);
            
            // Get other hotels (not in nearby list)
            const otherHotels = nashikHotels
              .filter(hotel => !nearbyHotelIds.includes(hotel.id))
              .map(hotel => ({ ...hotel, isNearby: false }));
            
            // Combine: nearby hotels first, then other hotels
            const combinedResults = [...transformed, ...otherHotels];
            setSearchResults(combinedResults);
          } catch (err) {
            console.error('Nearby hotels API error:', err);
            alert('Could not fetch nearby hotels. Showing all hotels instead.');
            setSearchResults(nashikHotels);
          } finally {
            setLocationLoading(false);
            setTimeout(() => {
              if (hotelsListRef.current) {
                hotelsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMsg = 'Could not get your location. ';
          if (error.code === 1) {
            errorMsg += 'Please allow location access in your browser settings.';
          } else if (error.code === 2) {
            errorMsg += 'Location unavailable. Please check your device settings.';
          } else if (error.code === 3) {
            errorMsg += 'Location request timed out. Please try again.';
          }
          alert(errorMsg);
          setSearchResults(nashikHotels);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Don't use cached location
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setSearchResults(nashikHotels);
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
    if (searchFilters.checkIn && searchFilters.checkOut) {
      let filteredHotels = nashikHotels.filter(hotel => 
        hotel.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      );

      // Apply filters
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.price >= filters.priceRange[0] && hotel.price <= filters.priceRange[1]
        );
      }

      if (filters.rating > 0) {
        filteredHotels = filteredHotels.filter(hotel => hotel.rating >= filters.rating);
      }

      if (filters.amenities.length > 0) {
        filteredHotels = filteredHotels.filter(hotel => 
          filters.amenities.every(amenity => hotel.amenities.includes(amenity))
        );
      }

      setSearchResults(filteredHotels);
      
      // Auto-scroll to hotels list
      setTimeout(() => {
        if (hotelsListRef.current) {
          hotelsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  const handleHotelSelect = (hotel) => {
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book a hotel. After login, you will come back to this booking page.'
    })) {
      return;
    }
    
    setSelectedHotel(hotel);
    setShowBooking(true);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
    // Initialize guest details based on the number of guests selected in search filters
    const guestCount = parseInt(searchFilters.guests);
    setBookingDetails(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      guestDetails: Array.from({ length: guestCount }, () => ({ name: '', age: '', gender: '', idProof: '' }))
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to complete this hotel booking. After login, you will come back here.'
    })) {
      return;
    }
    
    if (bookingStep === 1) {
      const guestCount = parseInt(searchFilters.guests);
      if (bookingDetails.guestDetails.length !== guestCount) {
        alert(`Please fill details for all ${guestCount} guests`);
        return;
      }
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!paymentMethod) {
        alert('Please select a payment method');
        return;
      }
      setBookingStep(3);
      
      // Save booking to database
      try {
        // Validate dates
        if (!searchFilters.checkIn || !searchFilters.checkOut) {
          alert('Please select check-in and check-out dates');
          setBookingStep(1);
          return;
        }

        const token = getToken();
        const bookingData = {
          bookingType: 'hotel',
          hotelDetails: {
            hotelId: selectedHotel.id,
            hotelName: selectedHotel.name,
            hotelAddress: selectedHotel.address,
            checkIn: new Date(searchFilters.checkIn),
            checkOut: new Date(searchFilters.checkOut),
            guests: parseInt(searchFilters.guests),
            rooms: parseInt(searchFilters.rooms),
            roomType: selectedHotel.rooms[0].type,
            totalPrice: calculateTotalPrice(selectedHotel, selectedHotel.rooms[0].type)
          },
          guestDetails: bookingDetails.guestDetails,
          contactDetails: {
            name: bookingDetails.name,
            phone: bookingDetails.phone,
            email: bookingDetails.email
          },
          specialRequests: bookingDetails.specialRequests,
          paymentMethod: paymentMethod,
          status: 'pending',
          amount: calculateTotalPrice(selectedHotel, selectedHotel.rooms[0].type)
        };

        const response = await fetch(`${API_BASE}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookingData)
        });

        const data = await response.json();
        
        console.log('Booking response:', data);

        if (data.success) {
          setBookingConfirmed(true);
          setBookingId(data.booking.bookingId);
        } else {
          const errorMsg = data.message || 'Failed to create booking. Please try again.';
          console.error('Booking failed:', errorMsg);
          alert(errorMsg);
          setBookingStep(2);
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Network error. Please check your connection and try again.');
        setBookingStep(2);
      }
    }
  };

  const handleGuestDetailChange = (index, field, value) => {
    const updatedDetails = [...bookingDetails.guestDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setBookingDetails({ ...bookingDetails, guestDetails: updatedDetails });
  };

  const addGuestDetail = () => {
    const guestCount = parseInt(searchFilters.guests);
    if (bookingDetails.guestDetails.length < guestCount) {
      setBookingDetails({
        ...bookingDetails,
        guestDetails: [
          ...bookingDetails.guestDetails,
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
    setSelectedHotel(null);
    setBookingDetails({ name: '', phone: '', email: '', guestDetails: [], specialRequests: '' });
    setPaymentMethod('');
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateNights = () => {
    if (searchFilters.checkIn && searchFilters.checkOut) {
      const checkIn = new Date(searchFilters.checkIn);
      const checkOut = new Date(searchFilters.checkOut);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 1;
  };

  const calculateTotalPrice = (hotel, roomType) => {
    const nights = calculateNights();
    const room = hotel.rooms.find(r => r.type === roomType);
    return (room ? room.price : hotel.price) * nights * parseInt(searchFilters.rooms);
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
            Hotel Booking | होटल बुकिंग
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            होटल बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and book the perfect accommodation for your Kumbh Mela visit
          </p>
        </div>

        {/* Location Services */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Find Nearby Hotels | पास के होटल खोजें
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Enable location services to find hotels near your current location
              </p>
              {userLocation ? (
                <div className="space-y-1">
                  <p className="text-sm text-green-600 font-semibold">
                    ✅ Location enabled: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                  {nearbyHotels.length > 0 && (
                    <p className="text-sm text-blue-600 font-semibold">
                      🎯 Found {nearbyHotels.length} nearby hotels (shown at top)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Nearby hotels are highlighted with green border and shown first. Scroll down to see all {nashikHotels.length} hotels.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  📍 Location not enabled - Click button to find nearby hotels
                </p>
              )}
            </div>
            <Button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="bg-kumbh-orange text-white hover:bg-kumbh-deep ml-4"
            >
              {locationLoading ? 'Getting Location...' : userLocation ? '🔄 Refresh Location' : '📍 Find Nearby Hotels'}
            </Button>
          </div>
        </Card>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Hotels | होटल खोजें
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <SelectItem value="Trimbak">Trimbak</SelectItem>
                    <SelectItem value="Sinnar">Sinnar</SelectItem>
                    <SelectItem value="Igatpuri">Igatpuri</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check-in | चेक-इन
                </label>
                <Input 
                  type="date" 
                  value={searchFilters.checkIn}
                  min={getCurrentDate()}
                  onChange={(e) => setSearchFilters({...searchFilters, checkIn: e.target.value})}
                  required
                />
              </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check-out | चेक-आउट
              </label>
              <Input 
                type="date" 
                  value={searchFilters.checkOut}
                  min={searchFilters.checkIn || getCurrentDate()}
                  onChange={(e) => setSearchFilters({...searchFilters, checkOut: e.target.value})}
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guests | मेहमान
              </label>
              <Select value={searchFilters.guests} onValueChange={(value) => setSearchFilters({...searchFilters, guests: value})}>
                  <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rooms | कमरे
                </label>
                <Select value={searchFilters.rooms} onValueChange={(value) => setSearchFilters({...searchFilters, rooms: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Room</SelectItem>
                    <SelectItem value="2">2 Rooms</SelectItem>
                    <SelectItem value="3">3 Rooms</SelectItem>
                    <SelectItem value="4">4 Rooms</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
              >
                Search Hotels | होटल खोजें
              </Button>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={hotelsListRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Available Hotels | उपलब्ध होटल
              {nearbyHotels.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({nearbyHotels.length} nearby, {searchResults.length - nearbyHotels.length} more hotels)
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((hotel) => (
                <Card key={hotel.id} className={`p-6 hover:shadow-lg transition-shadow ${hotel.isNearby ? 'border-2 border-green-500' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-kumbh-text">
                          {hotel.name}
                        </h3>
                        {hotel.isNearby && (
                          <Badge className="bg-green-500 text-white text-xs">
                            📍 Nearby
                          </Badge>
                        )}
                      </div>
                      <p className="font-devanagari text-kumbh-orange font-semibold">
                        {hotel.nameHindi}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {hotel.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{hotel.rating}</span>
                        <span className="text-gray-500 text-sm">({hotel.reviews})</span>
                      </div>
                      {hotel.distanceFromUser && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          {hotel.distanceFromUser.toFixed(1)} km away
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Hotel Image */}
                  <div className="w-full h-56 md:h-64 rounded-lg mb-4 overflow-hidden bg-gray-100">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-gray-500">Hotel Image</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Starting Price</div>
                      <div className="text-lg font-bold text-kumbh-orange">₹{hotel.price}</div>
                      <div className="text-sm text-gray-500 line-through">₹{hotel.originalPrice}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Discount</div>
                      <div className="text-lg font-bold text-green-600">{hotel.discount}% OFF</div>
                    </div>
        </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{hotel.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleHotelSelect(hotel)}
                      className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                    >
                      Book Now | बुक करें
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Hotel Booking Modal */}
        {showBooking && selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Hotel | होटल बुक करें
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
                  <div className={`text-center ${bookingStep >= 1 ? 'text-kumbh-orange font-bold' : 'text-gray-500'}`}>
                    1. Details
                  </div>
                  <div className={`text-center ${bookingStep >= 2 ? 'text-kumbh-orange font-bold' : 'text-gray-500'}`}>
                    2. Payment
                  </div>
                  <div className={`text-center ${bookingStep >= 3 ? 'text-kumbh-orange font-bold' : 'text-gray-500'}`}>
                    3. Confirmation
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedHotel.image} 
                      alt={selectedHotel.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-kumbh-text">{selectedHotel.name}</h3>
                      <p className="font-devanagari text-kumbh-orange font-semibold">{selectedHotel.nameHindi}</p>
                      <p className="text-gray-600 text-sm">{selectedHotel.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{selectedHotel.rating}</span>
                          <span className="text-gray-500 text-sm">({selectedHotel.reviews})</span>
                        </div>
                        <div className="text-lg font-bold text-kumbh-orange">₹{selectedHotel.price}/night</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1: Guest Details */}
                {bookingStep === 1 && (
                  <form onSubmit={handleBooking}>
                    <h3 className="text-xl font-bold text-kumbh-text mb-4">
                      Guest Details | अतिथि विवरण
                    </h3>
                    
                    {/* Stay Duration */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h4 className="text-lg font-semibold text-kumbh-text mb-3">
                        Stay Duration | ठहरने की अवधि
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-kumbh-text mb-2">
                            Check-in Date | चेक-इन तिथि
                          </label>
                          <Input
                            type="date"
                            value={searchFilters.checkIn}
                            min={getCurrentDate()}
                            onChange={(e) => setSearchFilters({...searchFilters, checkIn: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-kumbh-text mb-2">
                            Check-out Date | चेक-आउट तिथि
                          </label>
                          <Input
                            type="date"
                            value={searchFilters.checkOut}
                            min={searchFilters.checkIn || getCurrentDate()}
                            onChange={(e) => setSearchFilters({...searchFilters, checkOut: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="bg-white p-3 rounded-lg border-2 border-kumbh-orange w-full">
                            <div className="text-sm text-gray-600">Total Nights</div>
                            <div className="text-2xl font-bold text-kumbh-orange">
                              {calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ₹{calculateTotalPrice(selectedHotel, selectedHotel.rooms[0].type).toLocaleString()} total
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Information */}
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
                          Email Address | ईमेल पता
                        </label>
                        <Input
                          type="email"
                          value={bookingDetails.email}
                          onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    {/* Guest Details */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-kumbh-text">
                          Guest Information | अतिथि जानकारी
                        </h4>
                        <Button
                          type="button"
                          onClick={addGuestDetail}
                          variant="outline"
                          className="border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white"
                        >
                          Add Guest | अतिथि जोड़ें
                        </Button>
                      </div>
                      
                      {bookingDetails.guestDetails.map((guest, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg bg-white">
                          <div className="col-span-full flex justify-between items-center">
                            <h5 className="font-semibold text-kumbh-text">Guest {index + 1}</h5>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedDetails = bookingDetails.guestDetails.filter((_, i) => i !== index);
                                setBookingDetails({...bookingDetails, guestDetails: updatedDetails});
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <Input
                              type="text"
                              value={guest.name}
                              onChange={(e) => handleGuestDetailChange(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                            <Input
                              type="number"
                              value={guest.age}
                              onChange={(e) => handleGuestDetailChange(index, 'age', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <Select value={guest.gender} onValueChange={(value) => handleGuestDetailChange(index, 'gender', value)} required>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof</label>
                            <Select value={guest.idProof} onValueChange={(value) => handleGuestDetailChange(index, 'idProof', value)} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
                                <SelectItem value="PAN Card">PAN Card</SelectItem>
                                <SelectItem value="Passport">Passport</SelectItem>
                                <SelectItem value="Driving License">Driving License</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special Requests */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-kumbh-text mb-2">
                        Special Requests | विशेष अनुरोध
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kumbh-orange focus:border-transparent"
                        rows="3"
                        value={bookingDetails.specialRequests}
                        onChange={(e) => setBookingDetails({...bookingDetails, specialRequests: e.target.value})}
                        placeholder="Any special requests or requirements..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
                      >
                        Proceed to Payment | भुगतान के लिए आगे बढ़ें
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 2: Payment */}
                {bookingStep === 2 && (
                  <form onSubmit={handleBooking}>
                    <h3 className="text-xl font-bold text-kumbh-text mb-4">
                      Payment Method | भुगतान विधि
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          id="upi"
                          name="paymentMethod"
                          value="UPI"
                          checked={paymentMethod === 'UPI'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <label htmlFor="upi" className="flex items-center space-x-3 cursor-pointer">
                          <span className="text-2xl">📱</span>
                          <div>
                            <div className="font-semibold">UPI Payment</div>
                            <div className="text-sm text-gray-600">Pay using UPI apps like PhonePe, Google Pay</div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          id="creditCard"
                          name="paymentMethod"
                          value="Credit Card"
                          checked={paymentMethod === 'Credit Card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <label htmlFor="creditCard" className="flex items-center space-x-3 cursor-pointer">
                          <span className="text-2xl">💳</span>
                          <div>
                            <div className="font-semibold">Credit/Debit Card</div>
                            <div className="text-sm text-gray-600">Visa, Mastercard, RuPay accepted</div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          id="netBanking"
                          name="paymentMethod"
                          value="Net Banking"
                          checked={paymentMethod === 'Net Banking'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <label htmlFor="netBanking" className="flex items-center space-x-3 cursor-pointer">
                          <span className="text-2xl">🏦</span>
                          <div>
                            <div className="font-semibold">Net Banking</div>
                            <div className="text-sm text-gray-600">Direct bank transfer</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-kumbh-text mb-3">Booking Summary | बुकिंग सारांश</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hotel:</span>
                          <span className="font-semibold">{selectedHotel.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-in:</span>
                          <span>{searchFilters.checkIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-out:</span>
                          <span>{searchFilters.checkOut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span>{searchFilters.guests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rooms:</span>
                          <span>{searchFilters.rooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nights:</span>
                          <span>{calculateNights()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="text-kumbh-orange">₹{calculateTotalPrice(selectedHotel, selectedHotel.rooms[0].type)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBookingStep(1)}
                      >
                        ← Back to Details
                      </Button>
                      <Button
                        type="submit"
                        className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
                      >
                        Confirm Booking | बुकिंग की पुष्टि करें
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 3: Confirmation */}
                {bookingStep === 3 && bookingConfirmed && (
                  <div className="text-center">
                    <div className="text-6xl text-green-500 mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-4">
                      Booking Confirmed! | बुकिंग की पुष्टि हो गई!
                    </h3>
                    <p className="text-lg text-gray-700 mb-2">
                      Your Booking ID: <span className="font-bold text-kumbh-orange">{bookingId}</span>
                    </p>
                    <p className="text-gray-600 mb-6">
                      A confirmation email has been sent to <strong>{bookingDetails.email}</strong>
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                      <h4 className="font-semibold text-kumbh-text mb-3">Booking Details | बुकिंग विवरण</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Hotel:</strong> {selectedHotel.name}</div>
                        <div><strong>Address:</strong> {selectedHotel.address}</div>
                        <div><strong>Check-in:</strong> {new Date(searchFilters.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div><strong>Check-out:</strong> {new Date(searchFilters.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div><strong>Duration:</strong> {calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'}</div>
                        <div><strong>Guests:</strong> {searchFilters.guests}</div>
                        <div><strong>Rooms:</strong> {searchFilters.rooms}</div>
                        <div className="pt-2 border-t">
                          <strong>Price Breakdown:</strong>
                          <div className="ml-4 mt-1 text-gray-600">
                            <div>₹{selectedHotel.rooms[0].price.toLocaleString()} × {calculateNights()} nights × {searchFilters.rooms} {searchFilters.rooms === '1' ? 'room' : 'rooms'}</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-kumbh-orange pt-2 border-t"><strong>Total Amount:</strong> ₹{calculateTotalPrice(selectedHotel, selectedHotel.rooms[0].type).toLocaleString()}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowBooking(false)}
                      className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
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
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Hotel Booking Tips | होटल बुकिंग सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book hotels 3-6 months in advance for Kumbh Mela', icon: '📅' },
              { tip: 'Check hotel policies for cancellation and refund', icon: '📋' },
              { tip: 'Read guest reviews before booking', icon: '⭐' },
              { tip: 'Confirm check-in/check-out times with hotel', icon: '⏰' },
              { tip: 'Keep booking confirmation and ID ready', icon: '📄' },
              { tip: 'Check hotel amenities and facilities', icon: '🏨' }
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
