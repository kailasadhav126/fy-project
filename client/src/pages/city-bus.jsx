import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

export default function CityBus() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const [routeFilters, setRouteFilters] = useState({
    from: '',
    to: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [validationError, setValidationError] = useState('');
  const busResultsRef = useRef(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    passengers: '1',
    date: '',
    time: '',
    tripType: 'oneway'
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    setBookingDetails((prev) => ({
      ...prev,
      email: prev.email || user.email
    }));
  }, [user?.email]);

  // Nashik City Bus Routes Data
  const nashikCityBusRoutes = [
    {
      id: 'route-104A',
      routeNumber: '104A',
      routeName: 'Nimani To Pathardi Gaon Via Dwarka Nagji Indira Nagar',
      routeNameHindi: 'निमाणी से पथार्डी गांव (द्वारका नागजी इंदिरा नगर के माध्यम से)',
      from: 'Nimani',
      to: 'Pathardi Gaon',
      fromHindi: 'निमाणी',
      toHindi: 'पथार्डी गांव',
      departureTimes: ['09:50'],
      returnTimes: ['06:30', '06:45', '07:00', '07:15', '07:45', '08:05', '08:20', '08:35', '08:50', '09:05', '09:20', '09:35', '09:55', '10:10', '10:25', '10:40', '10:55', '11:10', '11:35', '12:15', '12:30', '13:00', '13:15', '13:30', '13:45', '14:10', '14:40', '14:55', '15:10', '15:25', '15:40', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:50', '18:05', '18:35', '18:50', '19:05', '19:20'],
      via: 'Dwarka Nagji Indira Nagar',
      viaHindi: 'द्वारका नागजी इंदिरा नगर',
      frequency: 'Regular',
      price: '₹15-25'
    },
    {
      id: 'route-201',
      routeNumber: '201',
      routeName: 'Nashik Road To Bardan Phata Via Dwarka Civil Satpur Ashok Nagar',
      routeNameHindi: 'नासिक रोड से बारदान फाटा (द्वारका सिविल सतपुर अशोक नगर के माध्यम से)',
      from: 'Nashik Road Railway Station',
      to: 'Bardan Phata',
      fromHindi: 'नासिक रोड रेलवे स्टेशन',
      toHindi: 'बारदान फाटा',
      departureTimes: ['00:50', '03:10', '06:30', '07:00', '07:20', '08:00', '08:20', '08:30', '08:50', '09:00', '09:20', '09:30', '09:50', '10:00', '10:20', '10:30', '10:50', '11:00', '11:20', '11:30', '11:30', '11:50', '12:10', '13:00', '13:20', '14:30', '16:20', '16:40', '17:00', '17:20', '17:30', '17:50', '18:10', '18:30', '18:50', '19:20', '20:00', '21:45'],
      returnTimes: ['02:00', '06:40', '06:50', '07:10', '07:20', '07:20', '07:40', '07:50', '08:10', '08:20', '08:40', '08:50', '09:10', '09:20', '09:40', '09:50', '10:10', '10:20', '10:50', '11:40', '11:50', '14:50', '15:20', '15:40', '15:50', '15:55', '16:10', '16:20', '16:40', '16:50', '17:10', '17:20', '17:40', '17:50', '18:10', '18:20', '23:40'],
      via: 'Dwarka Civil Satpur Ashok Nagar',
      viaHindi: 'द्वारका सिविल सतपुर अशोक नगर',
      frequency: 'High',
      price: '₹15-25'
    },
    {
      id: 'route-203',
      routeNumber: '203',
      routeName: 'Nashik Road To Symbiosis College Via C.B.S Pawan Nagar Uttam Nagar',
      routeNameHindi: 'नासिक रोड से सिम्बायोसिस कॉलेज (सी.बी.एस पवन नगर उत्तम नगर के माध्यम से)',
      from: 'Nashik Road Railway Station',
      to: 'Symbiosis College',
      fromHindi: 'नासिक रोड रेलवे स्टेशन',
      toHindi: 'सिम्बायोसिस कॉलेज',
      departureTimes: ['02:10', '02:10', '04:45', '07:45', '08:15', '08:45', '09:15', '09:30', '10:00', '10:15', '10:30', '10:45', '11:00', '11:45', '12:15', '12:30', '13:00', '13:15', '13:30', '13:45', '17:00', '17:30', '18:15', '18:30', '18:45', '18:55', '19:15', '19:30', '19:45', '20:00', '20:30', '21:45', '21:50'],
      returnTimes: ['01:00', '03:15', '06:15', '06:45', '07:15', '07:45', '08:00', '08:30', '08:45', '09:00', '09:15', '09:30', '10:15', '10:45', '11:00', '11:30', '11:45', '12:00', '12:15', '15:30', '15:45', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '19:00', '20:15'],
      via: 'C.B.S Pawan Nagar Uttam Nagar',
      viaHindi: 'सी.बी.एस पवन नगर उत्तम नगर',
      frequency: 'High',
      price: '₹15-25'
    },
    {
      id: 'route-207',
      routeNumber: '207',
      routeName: 'Nashik Road To Ambad Gaon Via Dwarka Govind Nagar Lekha nagar Garware',
      routeNameHindi: 'नासिक रोड से अंबाड गांव (द्वारका गोविंद नगर लेखा नगर गारवेयर के माध्यम से)',
      from: 'Nashik Road Railway Station',
      to: 'Ambad Gaon',
      fromHindi: 'नासिक रोड रेलवे स्टेशन',
      toHindi: 'अंबाड गांव',
      departureTimes: ['00:15', '02:35', '06:50', '07:10', '07:30', '07:50', '08:10', '08:30', '08:50', '09:30', '09:50', '10:10', '10:30', '10:50', '11:10', '11:30', '14:30', '14:50', '15:10', '15:50', '16:10', '16:50', '17:10', '17:30', '17:50', '18:10', '18:30', '18:50', '19:30', '20:00', '20:30', '21:50'],
      returnTimes: ['01:25', '05:40', '06:00', '06:20', '06:40', '07:00', '07:20', '07:40', '08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '13:20', '13:40', '14:00', '14:40', '15:00', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '22:55'],
      via: 'Dwarka Govind Nagar Lekha nagar Garware',
      viaHindi: 'द्वारका गोविंद नगर लेखा नगर गारवेयर',
      frequency: 'High',
      price: '₹15-25'
    },
    {
      id: 'route-245',
      routeNumber: '245',
      routeName: 'Nashik Road To Trimbakeshwar Via Nimani Mela Stand Satpur',
      routeNameHindi: 'नासिक रोड से त्र्यंबकेश्वर (निमाणी मेला स्टैंड सतपुर के माध्यम से)',
      from: 'Nashik Road Railway Station',
      to: 'Trimbakeshwar',
      fromHindi: 'नासिक रोड रेलवे स्टेशन',
      toHindi: 'त्र्यंबकेश्वर',
      departureTimes: ['07:55', '08:00', '08:40', '08:55', '09:40', '09:50', '09:55', '10:10', '10:45', '10:50', '11:30', '12:20', '13:00', '16:10', '17:30', '17:40', '18:20'],
      returnTimes: ['07:00', '07:30', '07:50', '07:55', '08:10', '08:35', '08:50', '09:30', '10:20', '11:00', '14:10', '14:55', '15:00', '15:20', '15:45', '15:50', '16:05', '16:10', '16:50', '17:15', '17:30', '18:20', '19:00'],
      via: 'Nimani Mela Stand Satpur',
      viaHindi: 'निमाणी मेला स्टैंड सतपुर',
      frequency: 'Regular',
      price: '₹20-30'
    },
    {
      id: 'route-251',
      routeNumber: '251',
      routeName: 'Nashik Road To Nimani',
      routeNameHindi: 'नासिक रोड से निमाणी',
      from: 'Nashik Road Railway Station',
      to: 'Nimani',
      fromHindi: 'नासिक रोड रेलवे स्टेशन',
      toHindi: 'निमाणी',
      departureTimes: ['06:15', '07:15', '07:45', '09:00', '09:30', '10:30', '11:00', '18:30', '18:45', '19:00', '19:30', '20:00', '20:15', '21:45', '21:50'],
      returnTimes: ['05:30', '06:15', '07:00', '08:00', '08:30', '09:45', '10:15', '18:00', '19:15', '19:30', '20:30', '20:45', '21:00'],
      via: 'Tapovan Nandur Naka Nadurgoan Sailanibaba Jailtaki',
      viaHindi: 'तपोवन नंदुर नाका नंदुरगांव सैलानीबाबा जेलताकी',
      frequency: 'Regular',
      price: '₹15-25'
    },
    {
      id: 'route-266A',
      routeNumber: '266A',
      routeName: 'Nashik Road To Nimani Via Dwarka C.B.S. Shalimar',
      routeNameHindi: 'नासिक रोड से निमाणी (द्वारका सी.बी.एस. शालीमार के माध्यम से)',
      from: 'Nashik Road Railway Station',
      to: 'Nimani',
      fromHindi: 'नासिक रोड रेलवे स्टेशन',
      toHindi: 'निमाणी',
      departureTimes: ['01:30', '02:30', '03:30', '04:30', '07:35', '07:40', '08:00', '08:05', '09:10', '09:35', '09:40', '10:05', '12:00', '13:05', '13:20', '14:55', '15:15', '16:17', '17:00', '17:45', '17:50', '18:00', '18:05', '18:40', '21:45', '23:55'],
      returnTimes: ['00:45', '01:35', '02:30', '03:30', '06:50', '06:55', '07:40', '08:30', '08:35', '08:55', '09:00', '10:25', '10:40', '14:00', '14:15', '15:22', '15:50', '16:10', '17:17'],
      via: 'Dwarka C.B.S. Shalimar',
      viaHindi: 'द्वारका सी.बी.एस. शालीमार',
      frequency: 'Very High',
      price: '₹15-25'
    },
    {
      id: 'route-101A',
      routeNumber: '101A',
      routeName: 'Nimani To Bardan Phata',
      routeNameHindi: 'निमाणी से बारदान फाटा',
      from: 'Nimani',
      to: 'Bardan Phata',
      fromHindi: 'निमाणी',
      toHindi: 'बारदान फाटा',
      departureTimes: ['07:45', '08:15', '08:45', '09:15', '09:45', '10:15', '10:45', '11:45', '12:15', '12:45', '12:45', '13:15', '13:15', '13:45', '13:45', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '18:15', '18:45', '19:15', '19:45', '20:45'],
      returnTimes: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
      via: 'Direct',
      viaHindi: 'सीधा',
      frequency: 'Very High',
      price: '₹15-25'
    },
    {
      id: 'route-103A',
      routeNumber: '103A',
      routeName: 'Nimani To Symbiosis College Via C.B.S Uttam Nagar',
      routeNameHindi: 'निमाणी से सिम्बायोसिस कॉलेज (सी.बी.एस उत्तम नगर के माध्यम से)',
      from: 'Nimani',
      to: 'Symbiosis College',
      fromHindi: 'निमाणी',
      toHindi: 'सिम्बायोसिस कॉलेज',
      departureTimes: ['07:00', '07:30', '07:50', '08:10', '08:20', '08:30', '08:40', '08:50', '09:10', '09:20', '09:30', '09:40', '10:00', '10:10', '10:20', '10:30', '10:40', '11:00', '11:10', '11:20', '11:40', '12:00', '12:10', '12:20', '12:30', '13:00', '13:20', '13:40', '14:00', '14:10', '14:20', '14:20', '14:30', '15:00', '15:20', '15:30', '15:50', '16:00', '16:10', '16:20', '16:30', '16:50', '17:00', '17:10', '17:20', '17:40', '17:50', '18:00', '18:10', '18:20', '18:40', '18:50', '19:00', '19:20', '19:40', '19:50', '20:00', '20:10', '20:30', '20:40', '21:00', '21:30'],
      returnTimes: ['06:00', '06:30', '06:55', '07:15', '07:25', '07:35', '07:45', '07:55', '08:15', '08:25', '08:35', '08:45', '09:05', '09:15', '09:25', '09:35', '09:45', '10:05', '10:15', '10:25', '10:35', '10:55', '11:05', '11:15', '11:25', '11:55', '12:15', '12:35', '12:55', '13:05', '13:15', '13:25', '13:55', '14:15', '14:35', '14:55', '15:05', '15:15', '15:25', '15:35', '15:55', '16:05', '16:15', '16:25', '16:45', '16:55', '17:05', '17:15', '17:25', '17:45', '17:55', '18:05', '18:15', '18:35', '18:45', '18:55', '19:05', '19:15', '19:35', '19:45', '19:55'],
      via: 'C.B.S Uttam Nagar',
      viaHindi: 'सी.बी.एस उत्तम नगर',
      frequency: 'Very High',
      price: '₹15-25'
    },
    {
      id: 'route-107A',
      routeNumber: '107A',
      routeName: 'Nimani To Ambad Gaon Via Mahamarg Lekha Nagar Garware',
      routeNameHindi: 'निमाणी से अंबाड गांव (महामार्ग लेखा नगर गारवेयर के माध्यम से)',
      from: 'Nimani',
      to: 'Ambad Gaon',
      fromHindi: 'निमाणी',
      toHindi: 'अंबाड गांव',
      departureTimes: ['07:40', '08:10', '08:40', '09:10', '09:50', '10:20', '10:50', '11:20', '12:10', '12:40', '13:10', '13:40', '14:25', '14:55', '15:25', '15:55', '15:55', '16:35', '17:05', '17:35', '18:05', '18:55', '19:25', '19:55', '20:15'],
      returnTimes: ['06:35', '07:05', '07:35', '08:05', '08:45', '09:15', '09:45', '10:15', '11:05', '11:35', '11:55', '12:35', '13:15', '13:45', '14:15', '14:45', '15:30', '16:00', '16:30', '17:00', '17:50', '18:20', '18:50', '19:10'],
      via: 'Mahamarg Lekha Nagar Garware',
      viaHindi: 'महामार्ग लेखा नगर गारवेयर',
      frequency: 'High',
      price: '₹15-25'
    }
  ];

  const handleSearch = () => {
    // Validate that both departure and destination are entered
    if (!routeFilters.from) {
      setValidationError('Please select a departure station');
      return;
    }
    
    if (!routeFilters.to) {
      setValidationError('Please select a destination station');
      return;
    }

    // Check if departure and destination are the same
    if (routeFilters.from === routeFilters.to) {
      setValidationError('Departure and destination stations cannot be the same. Please select different stations.');
      setSearchResults([]);
      return;
    }

    // Clear validation error
    setValidationError('');

    if (routeFilters.from && routeFilters.to) {
      const filteredRoutes = nashikCityBusRoutes.filter(route => {
        const fromStation = routeFilters.from.toLowerCase();
        const toStation = routeFilters.to.toLowerCase();
        
        const fromMatch = route.from.toLowerCase().includes(fromStation) || 
                        route.via.toLowerCase().includes(fromStation) ||
                        fromStation.includes(route.from.toLowerCase()) ||
                        fromStation.includes(route.via.toLowerCase());
        
        const toMatch = route.to.toLowerCase().includes(toStation) || 
                      route.via.toLowerCase().includes(toStation) ||
                      toStation.includes(route.to.toLowerCase()) ||
                      toStation.includes(route.via.toLowerCase());
        
        return fromMatch && toMatch;
      });
      
      setSearchResults(filteredRoutes.length > 0 ? filteredRoutes : nashikCityBusRoutes);
    } else {
      setSearchResults(nashikCityBusRoutes);
    }
    
    setTimeout(() => {
      if (busResultsRef.current) {
        busResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleBookNow = (route) => {
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book transport. After login, you will return to this bus booking page.'
    })) {
      return;
    }

    setSelectedRoute(route);
    setShowBookingModal(true);
    setBookingConfirmed(false);
    setBookingId(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to complete this transport booking. After login, you will return to this page.'
    })) {
      return;
    }
    
    if (!bookingDetails.name || !bookingDetails.phone || !bookingDetails.email || !bookingDetails.date || !bookingDetails.time) {
      alert('Please fill all required fields');
      return;
    }

    // Calculate fare
    const priceRange = selectedRoute.price.replace('₹', '').split('-');
    const baseFare = parseInt(priceRange[0]);
    const passengers = parseInt(bookingDetails.passengers);
    const totalFare = baseFare * passengers * (bookingDetails.tripType === 'roundtrip' ? 2 : 1);

    let newBookingId = '';
    try {
      const booking = await createBookingRecord({
        API_BASE,
        token: getToken(),
        bookingData: {
          bookingType: 'transport',
          status: 'pending',
          transportDetails: {
            type: 'city-bus',
            from: selectedRoute.from,
            to: selectedRoute.to,
            date: bookingDetails.date,
            time: bookingDetails.time,
            passengers,
            totalPrice: totalFare
          },
          contactDetails: {
            name: bookingDetails.name,
            phone: bookingDetails.phone,
            email: bookingDetails.email.trim()
          },
          amount: totalFare,
          bookingDetails: {
            source: 'city-bus-page',
            routeNumber: selectedRoute.routeNumber,
            routeName: selectedRoute.routeName,
            via: selectedRoute.via,
            tripType: bookingDetails.tripType
          }
        }
      });

      newBookingId = booking.bookingId;
      setBookingId(newBookingId);
    } catch (error) {
      console.error('Bus booking error:', error);
      alert(error.message || 'Failed to create bus booking. Please try again.');
      return;
    }

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('busBookings') || '[]');
    bookings.push({
      id: newBookingId,
      routeNumber: selectedRoute.routeNumber,
      routeName: selectedRoute.routeName,
      from: selectedRoute.from,
      to: selectedRoute.to,
      via: selectedRoute.via,
      ...bookingDetails,
      totalFare,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    });
    localStorage.setItem('busBookings', JSON.stringify(bookings));

    setBookingConfirmed(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRoute(null);
    setBookingConfirmed(false);
    setBookingId(null);
    setBookingDetails({
      name: '',
      phone: '',
      email: '',
      passengers: '1',
      date: '',
      time: '',
      tripType: 'oneway'
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
            Nashik City Bus Routes
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक शहर बस मार्ग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find bus routes and schedules for local travel within Nashik city
          </p>
        </div>

        {/* Bus Information Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🚌</div>
              <div className="text-sm text-gray-600">Operator</div>
              <div className="font-semibold">Nashik Citilink City</div>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm text-gray-600">Fare Range</div>
              <div className="font-semibold">₹15-30 per trip</div>
            </div>
            <div>
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-sm text-gray-600">Operating Hours</div>
              <div className="font-semibold">5:30 AM - 11:45 PM</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🗺️</div>
              <div className="text-sm text-gray-600">Total Routes</div>
              <div className="font-semibold">{nashikCityBusRoutes.length} Routes</div>
            </div>
          </div>
        </Card>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-6">
            Search Bus Routes | बस मार्ग खोजें
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Station | प्रस्थान स्टेशन
              </label>
              <Select value={routeFilters.from} onValueChange={(value) => { setRouteFilters({...routeFilters, from: value}); setValidationError(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select departure station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nashik-road">Nashik Road Railway Station | नासिक रोड रेलवे स्टेशन</SelectItem>
                  <SelectItem value="nimani">Nimani | निमाणी</SelectItem>
                  <SelectItem value="dwarka">Dwarka | द्वारका</SelectItem>
                  <SelectItem value="tapovan">Tapovan | तपोवन</SelectItem>
                  <SelectItem value="cbs">C.B.S | सी.बी.एस</SelectItem>
                  <SelectItem value="shalimar">Shalimar | शालीमार</SelectItem>
                  <SelectItem value="civil">Civil | सिविल</SelectItem>
                  <SelectItem value="satpur">Satpur | सतपुर</SelectItem>
                  <SelectItem value="ashok-nagar">Ashok Nagar | अशोक नगर</SelectItem>
                  <SelectItem value="pawan-nagar">Pawan Nagar | पवन नगर</SelectItem>
                  <SelectItem value="uttam-nagar">Uttam Nagar | उत्तम नगर</SelectItem>
                  <SelectItem value="govind-nagar">Govind Nagar | गोविंद नगर</SelectItem>
                  <SelectItem value="lekha-nagar">Lekha Nagar | लेखा नगर</SelectItem>
                  <SelectItem value="garware">Garware | गारवेयर</SelectItem>
                  <SelectItem value="mela-stand">Mela Stand | मेला स्टैंड</SelectItem>
                  <SelectItem value="bardan-phata">Bardan Phata | बारदान फाटा</SelectItem>
                  <SelectItem value="symbiosis">Symbiosis College | सिम्बायोसिस कॉलेज</SelectItem>
                  <SelectItem value="ambad-gaon">Ambad Gaon | अंबाड गांव</SelectItem>
                  <SelectItem value="trimbakeshwar">Trimbakeshwar | त्र्यंबकेश्वर</SelectItem>
                  <SelectItem value="pathardi-gaon">Pathardi Gaon | पथार्डी गांव</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Station | गंतव्य स्टेशन
              </label>
              <Select value={routeFilters.to} onValueChange={(value) => { setRouteFilters({...routeFilters, to: value}); setValidationError(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nashik-road">Nashik Road Railway Station | नासिक रोड रेलवे स्टेशन</SelectItem>
                  <SelectItem value="nimani">Nimani | निमाणी</SelectItem>
                  <SelectItem value="dwarka">Dwarka | द्वारका</SelectItem>
                  <SelectItem value="tapovan">Tapovan | तपोवन</SelectItem>
                  <SelectItem value="cbs">C.B.S | सी.बी.एस</SelectItem>
                  <SelectItem value="shalimar">Shalimar | शालीमार</SelectItem>
                  <SelectItem value="civil">Civil | सिविल</SelectItem>
                  <SelectItem value="satpur">Satpur | सतपुर</SelectItem>
                  <SelectItem value="ashok-nagar">Ashok Nagar | अशोक नगर</SelectItem>
                  <SelectItem value="pawan-nagar">Pawan Nagar | पवन नगर</SelectItem>
                  <SelectItem value="uttam-nagar">Uttam Nagar | उत्तम नगर</SelectItem>
                  <SelectItem value="govind-nagar">Govind Nagar | गोविंद नगर</SelectItem>
                  <SelectItem value="lekha-nagar">Lekha Nagar | लेखा नगर</SelectItem>
                  <SelectItem value="garware">Garware | गारवेयर</SelectItem>
                  <SelectItem value="mela-stand">Mela Stand | मेला स्टैंड</SelectItem>
                  <SelectItem value="bardan-phata">Bardan Phata | बारदान फाटा</SelectItem>
                  <SelectItem value="symbiosis">Symbiosis College | सिम्बायोसिस कॉलेज</SelectItem>
                  <SelectItem value="ambad-gaon">Ambad Gaon | अंबाड गांव</SelectItem>
                  <SelectItem value="trimbakeshwar">Trimbakeshwar | त्र्यंबकेश्वर</SelectItem>
                  <SelectItem value="pathardi-gaon">Pathardi Gaon | पथार्डी गांव</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              ⚠️ {validationError}
            </div>
          )}

          <div className="flex justify-center">
            <Button 
              onClick={handleSearch}
              className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
            >
              Search Buses | बस खोजें
            </Button>
          </div>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-6" ref={busResultsRef}>
            <h3 className="text-2xl font-bold text-kumbh-text mb-4">
              Available Routes | उपलब्ध मार्ग ({searchResults.length} found)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((route) => (
                <Card key={route.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-kumbh-text">
                        Route {route.routeNumber}
                      </h3>
                      <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                        {route.routeNameHindi}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {route.routeName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {route.frequency}
                      </Badge>
                      <div className="text-lg font-bold text-kumbh-orange">{route.price}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">From | से</div>
                        <div className="font-semibold">{route.from}</div>
                        <div className="font-devanagari text-xs text-gray-500">{route.fromHindi}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">To | तक</div>
                        <div className="font-semibold">{route.to}</div>
                        <div className="font-devanagari text-xs text-gray-500">{route.toHindi}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Via | के माध्यम से</div>
                    <div className="text-sm font-medium">{route.via}</div>
                    <div className="font-devanagari text-xs text-gray-500">{route.viaHindi}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Departure Times</div>
                      <div className="font-semibold text-sm">
                        {route.departureTimes.slice(0, 3).join(', ')}
                        {route.departureTimes.length > 3 && ` +${route.departureTimes.length - 3} more`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Return Times</div>
                      <div className="font-semibold text-sm">
                        {route.returnTimes.slice(0, 3).join(', ')}
                        {route.returnTimes.length > 3 && ` +${route.returnTimes.length - 3} more`}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleBookNow(route)}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      Book Now | अभी बुक करें
                    </Button>
                    <Button
                      onClick={() => {
                        alert(`Route ${route.routeNumber} Details:\n\nFrom: ${route.from}\nTo: ${route.to}\nVia: ${route.via}\n\nDeparture Times:\n${route.departureTimes.join(', ')}\n\nReturn Times:\n${route.returnTimes.join(', ')}\n\nFare: ${route.price}`);
                      }}
                      variant="outline"
                      className="flex-1 border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white"
                    >
                      View Schedule | समय सारणी
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Show all routes by default */}
        {searchResults.length === 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-kumbh-text mb-4">
              All Bus Routes | सभी बस मार्ग
            </h3>
            <p className="text-gray-600 mb-6">
              Select departure and destination stations above to search for specific routes
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {nashikCityBusRoutes.map((route) => (
                <Card key={route.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-kumbh-text">
                        Route {route.routeNumber}
                      </h3>
                      <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                        {route.routeNameHindi}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {route.routeName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {route.frequency}
                      </Badge>
                      <div className="text-lg font-bold text-kumbh-orange">{route.price}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">From | से</div>
                        <div className="font-semibold">{route.from}</div>
                        <div className="font-devanagari text-xs text-gray-500">{route.fromHindi}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">To | तक</div>
                        <div className="font-semibold">{route.to}</div>
                        <div className="font-devanagari text-xs text-gray-500">{route.toHindi}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Via | के माध्यम से</div>
                    <div className="text-sm font-medium">{route.via}</div>
                    <div className="font-devanagari text-xs text-gray-500">{route.viaHindi}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Departure Times</div>
                      <div className="font-semibold text-sm">
                        {route.departureTimes.slice(0, 3).join(', ')}
                        {route.departureTimes.length > 3 && ` +${route.departureTimes.length - 3} more`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Return Times</div>
                      <div className="font-semibold text-sm">
                        {route.returnTimes.slice(0, 3).join(', ')}
                        {route.returnTimes.length > 3 && ` +${route.returnTimes.length - 3} more`}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleBookNow(route)}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      Book Now | अभी बुक करें
                    </Button>
                    <Button
                      onClick={() => {
                        alert(`Route ${route.routeNumber} Details:\n\nFrom: ${route.from}\nTo: ${route.to}\nVia: ${route.via}\n\nDeparture Times:\n${route.departureTimes.join(', ')}\n\nReturn Times:\n${route.returnTimes.join(', ')}\n\nFare: ${route.price}`);
                      }}
                      variant="outline"
                      className="flex-1 border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white"
                    >
                      View Schedule | समय सारणी
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {!bookingConfirmed ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-kumbh-text">
                          Book Bus Ticket
                        </h2>
                        <p className="font-devanagari text-kumbh-orange font-semibold">
                          बस टिकट बुक करें
                        </p>
                      </div>
                      <button
                        onClick={closeBookingModal}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    {/* Route Details */}
                    <Card className="p-4 mb-6 bg-blue-50">
                      <h3 className="font-bold text-lg mb-2">Route {selectedRoute.routeNumber}</h3>
                      <p className="text-sm text-gray-600 mb-2">{selectedRoute.routeName}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">From:</span> <span className="font-semibold">{selectedRoute.from}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">To:</span> <span className="font-semibold">{selectedRoute.to}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Via:</span> <span className="font-semibold">{selectedRoute.via}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fare:</span> <span className="font-semibold text-kumbh-orange">{selectedRoute.price}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Booking Form */}
                    <form onSubmit={handleBookingSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name | पूरा नाम *
                          </label>
                          <Input
                            type="text"
                            value={bookingDetails.name}
                            onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number | फोन नंबर *
                          </label>
                          <Input
                            type="tel"
                            value={bookingDetails.phone}
                            onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                            placeholder="Enter phone number"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email | ईमेल
                          </label>
                          <Input
                            type="email"
                            value={bookingDetails.email}
                            onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                            placeholder="Enter email address"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Passengers | यात्रियों की संख्या *
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
                              <SelectItem value="5">5 Passengers</SelectItem>
                              <SelectItem value="6">6+ Passengers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Travel Date | यात्रा की तारीख *
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
                            Preferred Time | पसंदीदा समय *
                          </label>
                          <Select value={bookingDetails.time} onValueChange={(value) => setBookingDetails({...bookingDetails, time: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedRoute.departureTimes.map((time, idx) => (
                                <SelectItem key={idx} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Trip Type | यात्रा का प्रकार
                          </label>
                          <Select value={bookingDetails.tripType} onValueChange={(value) => setBookingDetails({...bookingDetails, tripType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oneway">One Way | एक तरफ</SelectItem>
                              <SelectItem value="roundtrip">Round Trip | दोनों तरफ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex space-x-4">
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
                          className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        >
                          Confirm Booking | बुकिंग की पुष्टि करें
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">✅</div>
                      <h2 className="text-2xl font-bold text-green-600 mb-2">
                        Booking Confirmed!
                      </h2>
                      <p className="font-devanagari text-xl text-green-600 font-semibold mb-4">
                        बुकिंग की पुष्टि हो गई!
                      </p>
                      
                      <Card className="p-6 mb-6 text-left">
                        <h3 className="font-bold text-lg mb-4">Booking Details | बुकिंग विवरण</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Booking ID:</span>
                            <span className="font-semibold">{bookingId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-semibold">{selectedRoute.routeNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-semibold">{selectedRoute.from}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-semibold">{selectedRoute.to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold">{bookingDetails.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold">{bookingDetails.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Passengers:</span>
                            <span className="font-semibold">{bookingDetails.passengers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trip Type:</span>
                            <span className="font-semibold">{bookingDetails.tripType === 'oneway' ? 'One Way' : 'Round Trip'}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-600 font-semibold">Total Fare:</span>
                            <span className="font-bold text-kumbh-orange text-lg">
                              ₹{parseInt(selectedRoute.price.replace('₹', '').split('-')[0]) * parseInt(bookingDetails.passengers) * (bookingDetails.tripType === 'roundtrip' ? 2 : 1)}
                            </span>
                          </div>
                        </div>
                      </Card>

                      <p className="text-sm text-gray-600 mb-6">
                        A confirmation message has been sent to your phone number. Please arrive at the bus stop 10 minutes before departure time.
                      </p>

                      <Button
                        onClick={closeBookingModal}
                        className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      >
                        Close | बंद करें
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
