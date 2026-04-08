import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// API base URL
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function TransportInCity() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedTransport, setSelectedTransport] = useState('');
  const [routeFilters, setRouteFilters] = useState({
    from: '',
    to: '',
    time: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const busResultsRef = useRef(null);
  const walkingRoutesRef = useRef(null);
  const [parkingData, setParkingData] = useState([]);
  const [nearbyParking, setNearbyParking] = useState([]);
  const [userLocationForParking, setUserLocationForParking] = useState(null);
  const [parkingLocationLoading, setParkingLocationLoading] = useState(false);
  const parkingResultsRef = useRef(null);
  const [selectedParking, setSelectedParking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    parkingId: null,
    vehicleNumber: '',
    vehicleType: 'car',
    startDate: '',
    startTime: '',
    duration: '1',
    name: '',
    phone: '',
    email: ''
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [selectedShuttleService, setSelectedShuttleService] = useState(null);
  const [showShuttleBookingModal, setShowShuttleBookingModal] = useState(false);
  const [shuttleBookingDetails, setShuttleBookingDetails] = useState({
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

  // Handle shuttle service selection
  const handleShuttleServiceSelect = (serviceType, serviceName) => {
    setSelectedShuttleService({ type: serviceType, name: serviceName });
    setShuttleBookingDetails({
      ...shuttleBookingDetails,
      serviceType: serviceType
    });
    
    // For Ola/Uber, open their websites directly
    if (serviceType === 'ola') {
      window.open('https://www.olacabs.com/', '_blank');
      return;
    }
    if (serviceType === 'uber') {
      window.open('https://www.uber.com/in/en/', '_blank');
      return;
    }
    
    // For other services, show booking modal
    setShowShuttleBookingModal(true);
  };

  // Handle shuttle booking submission
  const handleShuttleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!shuttleBookingDetails.from || !shuttleBookingDetails.to || !shuttleBookingDetails.date || !shuttleBookingDetails.time || !shuttleBookingDetails.name || !shuttleBookingDetails.phone) {
      alert('Please fill all required fields');
      return;
    }

    // Calculate fare based on service type and distance
    const baseFares = {
      'auto': { base: 25, perKm: 12 },
      'taxi': { base: 70, perKm: 15 },
      'car-rental': { base: 2000, perKm: 0 }
    };
    
    const fare = baseFares[shuttleBookingDetails.serviceType] || { base: 50, perKm: 10 };
    const estimatedDistance = 5; // Assume average distance in km
    const totalFare = fare.base + (fare.perKm * estimatedDistance * parseInt(shuttleBookingDetails.passengers || 1));

    // Generate booking ID
    const newBookingId = 'SHUTTLE' + Date.now();

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('shuttleBookings') || '[]');
    bookings.push({
      id: newBookingId,
      ...shuttleBookingDetails,
      totalFare,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    });
    localStorage.setItem('shuttleBookings', JSON.stringify(bookings));

    // Show confirmation
    alert(`Booking Confirmed!\nBooking ID: ${newBookingId}\nTotal Fare: ₹${totalFare}\n\nYou will receive a confirmation call shortly.`);
    
    // Close modal
    closeShuttleBookingModal();
  };

  // Close shuttle booking modal
  const closeShuttleBookingModal = () => {
    setShowShuttleBookingModal(false);
    setSelectedShuttleService(null);
    setShuttleBookingDetails({
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

  // Load parking data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/parking`);
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        // Transform API data to match the expected format
        const transformedData = (data || []).map((parking, idx) => ({
          id: parking._id || idx,
          name: parking.name || '',
          nameHindi: parking.nameHindi || '',
          address: parking.address || '',
          coordinates: parking.location?.coordinates 
            ? { lat: parking.location.coordinates[1], lng: parking.location.coordinates[0] }
            : { lat: 19.9975, lng: 73.7898 }, // Default to Nashik if no coordinates
          capacity: parking.capacity || 0,
          totalSpaces: parking.total_spaces || 0,
          availableSpaces: parking.available_spaces || 0,
          pricePerHour: parking.price_per_hour || 0,
          pricePerDay: parking.price_per_day || 0,
          openingHours: parking.opening_hours || '',
          phone: parking.phone || '',
          verified: parking.verified || false
        }));
        setParkingData(transformedData);
      } catch (error) {
        console.error('Error loading parking data:', error);
        setParkingData([]);
      }
    };
    loadData();
  }, []);

  const transportOptions = [
    {
      id: 'parking',
      name: 'Parking',
      nameHindi: 'पार्किंग',
      icon: '🅿️',
      description: 'Find nearby parking spaces',
      color: 'bg-red-500',
      status: '🟢 Available',
      features: ['Real-time availability', 'Location-based', 'Price information']
    },
    {
      id: 'bus',
      name: 'City Buses',
      nameHindi: 'शहर की बसें',
      icon: '🚍',
      description: 'Local bus services around Nashik',
      color: 'bg-blue-500',
      status: '🟢 Running',
      features: ['Affordable fares', 'Wide coverage', 'Frequent service']
    },
    {
      id: 'shuttle',
      name: 'Shuttle Services',
      nameHindi: 'शटल सेवाएं',
      icon: '🚌',
      description: 'Shuttles, Auto Rickshaws, Ola/Uber',
      color: 'bg-yellow-500',
      status: '🟢 Active',
      features: ['Auto rickshaws', 'Ola/Uber', 'Multiple options']
    },
    {
      id: 'walking',
      name: 'Walking Routes',
      nameHindi: 'पैदल मार्ग',
      icon: '🚶',
      description: 'Guided walking paths with GPS',
      color: 'bg-purple-500',
      status: '📍 Live GPS',
      features: ['Health benefits', 'Scenic routes', 'Free navigation']
    }
  ];



  // Walking routes data
  const walkingRoutes = [
    {
      id: 'temple-tour',
      name: 'Temple Circuit',
      nameHindi: 'मंदिर सर्किट',
      category: 'temples',
      distance: '4.2 km',
      duration: '1h 30m',
      difficulty: 'Easy',
      description: 'Visit major temples in Nashik city',
      descriptionHindi: 'नासिक शहर के प्रमुख मंदिरों का दौरा',
      landmarks: [
        { name: 'Kala Ram Temple', nameHindi: 'काला राम मंदिर', type: 'temple', time: '0 min' },
        { name: 'Sundarnarayan Temple', nameHindi: 'सुंदरनारायण मंदिर', type: 'temple', time: '15 min' },
        { name: 'Kapaleshwar Temple', nameHindi: 'कपालेश्वर मंदिर', type: 'temple', time: '35 min' },
        { name: 'Naroshankar Temple', nameHindi: 'नरोशंकर मंदिर', type: 'temple', time: '55 min' },
        { name: 'Mukti Dham', nameHindi: 'मुक्ति धाम', type: 'temple', time: '1h 15m' }
      ],
      highlights: ['Spiritual experience', 'Architectural beauty', 'Peaceful atmosphere'],
      tips: ['Wear comfortable shoes', 'Carry water bottle', 'Respect temple etiquette'],
      startPoint: { lat: 19.9975, lng: 73.7898, name: 'Kala Ram Temple' },
      endPoint: { lat: 19.9950, lng: 73.7850, name: 'Mukti Dham' }
    },
    {
      id: 'ghat-walk',
      name: 'Ghat Walking Tour',
      nameHindi: 'घाट वॉकिंग टूर',
      category: 'ghats',
      distance: '3.8 km',
      duration: '1h 15m',
      difficulty: 'Easy',
      description: 'Explore the sacred ghats along Godavari river',
      descriptionHindi: 'गोदावरी नदी के किनारे पवित्र घाटों का अन्वेषण',
      landmarks: [
        { name: 'Ramkund Ghat', nameHindi: 'रामकुंड घाट', type: 'ghat', time: '0 min' },
        { name: 'Godavari Ghat', nameHindi: 'गोदावरी घाट', type: 'ghat', time: '10 min' },
        { name: 'Ahilyabai Holkar Ghat', nameHindi: 'अहिल्याबाई होलकर घाट', type: 'ghat', time: '25 min' },
        { name: 'Gangapur Ghat', nameHindi: 'गंगापुर घाट', type: 'ghat', time: '45 min' },
        { name: 'Muktidham Ghat', nameHindi: 'मुक्तिधाम घाट', type: 'ghat', time: '1h 5m' }
      ],
      highlights: ['Riverside views', 'Spiritual significance', 'Cultural heritage'],
      tips: ['Best time: Early morning', 'Carry camera', 'Respect local customs'],
      startPoint: { lat: 19.9975, lng: 73.7898, name: 'Ramkund Ghat' },
      endPoint: { lat: 19.9950, lng: 73.7850, name: 'Muktidham Ghat' }
    },
    {
      id: 'market-tour',
      name: 'Market & Shopping Walk',
      nameHindi: 'बाजार और खरीदारी वॉक',
      category: 'markets',
      distance: '2.5 km',
      duration: '2h 0m',
      difficulty: 'Easy',
      description: 'Explore local markets and shopping areas',
      descriptionHindi: 'स्थानीय बाजारों और खरीदारी क्षेत्रों का अन्वेषण',
      landmarks: [
        { name: 'Saraf Bazaar', nameHindi: 'सराफ बाजार', type: 'market', time: '0 min' },
        { name: 'Jewelry Market', nameHindi: 'ज्वैलरी मार्केट', type: 'market', time: '20 min' },
        { name: 'Spice Market', nameHindi: 'मसाला बाजार', type: 'market', time: '40 min' },
        { name: 'Textile Market', nameHindi: 'टेक्सटाइल मार्केट', type: 'market', time: '1h 10m' },
        { name: 'Fruit Market', nameHindi: 'फल बाजार', type: 'market', time: '1h 40m' }
      ],
      highlights: ['Local shopping', 'Cultural experience', 'Street food'],
      tips: ['Bargain politely', 'Carry cash', 'Try local snacks'],
      startPoint: { lat: 19.9975, lng: 73.7898, name: 'Saraf Bazaar' },
      endPoint: { lat: 19.9950, lng: 73.7850, name: 'Fruit Market' }
    },
    {
      id: 'heritage-walk',
      name: 'Heritage & History Walk',
      nameHindi: 'विरासत और इतिहास वॉक',
      category: 'heritage',
      distance: '5.1 km',
      duration: '2h 30m',
      difficulty: 'Moderate',
      description: 'Discover Nashik\'s rich historical heritage',
      descriptionHindi: 'नासिक की समृद्ध ऐतिहासिक विरासत की खोज',
      landmarks: [
        { name: 'Pandavleni Caves', nameHindi: 'पांडवलेनी गुफाएं', type: 'heritage', time: '0 min' },
        { name: 'Sita Gufa', nameHindi: 'सीता गुफा', type: 'heritage', time: '30 min' },
        { name: 'Panchavati', nameHindi: 'पंचवटी', type: 'heritage', time: '1h 0m' },
        { name: 'Saptashrungi Temple', nameHindi: 'सप्तश्रृंगी मंदिर', type: 'heritage', time: '1h 45m' },
        { name: 'Trimbakeshwar Temple', nameHindi: 'त्रिम्बकेश्वर मंदिर', type: 'heritage', time: '2h 15m' }
      ],
      highlights: ['Historical sites', 'Ancient architecture', 'Mythological significance'],
      tips: ['Wear comfortable clothes', 'Carry water', 'Learn about history'],
      startPoint: { lat: 19.9975, lng: 73.7898, name: 'Pandavleni Caves' },
      endPoint: { lat: 19.9950, lng: 73.7850, name: 'Trimbakeshwar Temple' }
    },
    {
      id: 'nature-walk',
      name: 'Nature & Parks Walk',
      nameHindi: 'प्रकृति और पार्क वॉक',
      category: 'nature',
      distance: '3.5 km',
      duration: '1h 45m',
      difficulty: 'Easy',
      description: 'Enjoy nature and green spaces in Nashik',
      descriptionHindi: 'नासिक में प्रकृति और हरे स्थानों का आनंद लें',
      landmarks: [
        { name: 'Gandhi Park', nameHindi: 'गांधी पार्क', type: 'park', time: '0 min' },
        { name: 'Sardar Patel Garden', nameHindi: 'सरदार पटेल गार्डन', type: 'park', time: '25 min' },
        { name: 'Nehru Garden', nameHindi: 'नेहरू गार्डन', type: 'park', time: '50 min' },
        { name: 'Children\'s Park', nameHindi: 'बाल पार्क', type: 'park', time: '1h 15m' },
        { name: 'Botanical Garden', nameHindi: 'वनस्पति उद्यान', type: 'park', time: '1h 35m' }
      ],
      highlights: ['Green spaces', 'Fresh air', 'Family friendly'],
      tips: ['Perfect for families', 'Carry snacks', 'Enjoy bird watching'],
      startPoint: { lat: 19.9975, lng: 73.7898, name: 'Gandhi Park' },
      endPoint: { lat: 19.9950, lng: 73.7850, name: 'Botanical Garden' }
    }
  ];

  const routeCategories = [
    { id: 'all', name: 'All Routes', nameHindi: 'सभी मार्ग', icon: '🗺️' },
    { id: 'temples', name: 'Temples', nameHindi: 'मंदिर', icon: '🛕' },
    { id: 'ghats', name: 'Ghats', nameHindi: 'घाट', icon: '🏞️' },
    { id: 'markets', name: 'Markets', nameHindi: 'बाजार', icon: '🛍️' },
    { id: 'heritage', name: 'Heritage', nameHindi: 'विरासत', icon: '🏛️' },
    { id: 'nature', name: 'Nature', nameHindi: 'प्रकृति', icon: '🌳' }
  ];

  const handleTransportSelect = (transportId) => {
    // Navigate to dedicated parking page when parking is selected
    if (transportId === 'parking') {
      setLocation('/parking');
      return;
    }
    
    // Navigate to walking routes page when walking is selected
    if (transportId === 'walking') {
      setLocation('/walking-routes');
      return;
    }
    
    // Navigate to city bus page when bus is selected
    if (transportId === 'bus') {
      setLocation('/citybus');
      return;
    }
    
    // Navigate to shuttle services page when shuttle is selected
    if (transportId === 'shuttle') {
      setLocation('/shuttleservices');
      return;
    }
    
    setSelectedTransport(transportId);
  };

  const handleRoutePlan = (e) => {
    e.preventDefault();
    console.log('Planning route:', { transport: selectedTransport, filters: routeFilters });
    // Implement route planning logic
    
    // Auto-scroll to walking routes
    setTimeout(() => {
      if (walkingRoutesRef.current) {
        walkingRoutesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Walking routes functions
  const getFilteredRoutes = () => {
    if (selectedCategory === 'all') {
      return walkingRoutes;
    }
    return walkingRoutes.filter(route => route.category === selectedCategory);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setShowRouteDetails(true);
  };

  const handleStartNavigation = () => {
    if (!userLocation) {
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setIsNavigating(true);
          },
          (error) => {
            alert('Unable to get your location. Please enable location services.');
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    } else {
      setIsNavigating(true);
    }
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          alert('Location obtained! You can now start navigation.');
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Nashik City Bus Routes Data based on the provided schedule
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

  // Get user's location for parking
  const getParkingUserLocation = async () => {
    setParkingLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            setUserLocationForParking({ lat: userLat, lng: userLng });
            
            // Fetch nearby parking from API
            const res = await fetch(`${API_BASE}/api/parking/nearby?lat=${userLat}&lng=${userLng}&radiusKm=15`);
            if (!res.ok) {
              throw new Error(`API error: ${res.status}`);
            }
            const data = await res.json();
            
            // Transform API data to match the expected format
            const transformedData = (data || []).map((parking, idx) => ({
              id: parking._id || idx,
              name: parking.name || '',
              nameHindi: parking.nameHindi || '',
              address: parking.address || '',
              coordinates: parking.location?.coordinates 
                ? { lat: parking.location.coordinates[1], lng: parking.location.coordinates[0] }
                : { lat: userLat, lng: userLng },
              capacity: parking.capacity || 0,
              totalSpaces: parking.total_spaces || 0,
              availableSpaces: parking.available_spaces || 0,
              pricePerHour: parking.price_per_hour || 0,
              pricePerDay: parking.price_per_day || 0,
              openingHours: parking.opening_hours || '',
              phone: parking.phone || '',
              verified: parking.verified || false,
              distanceFromUser: parking.distanceMeters ? (parking.distanceMeters / 1000).toFixed(1) : 0
            }));
            
            setNearbyParking(transformedData);
            setParkingLocationLoading(false);
            
            // Auto-scroll to parking results
            setTimeout(() => {
              if (parkingResultsRef.current) {
                parkingResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          } catch (error) {
            console.error('Error fetching nearby parking:', error);
            setParkingLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setParkingLocationLoading(false);
        }
      );
    } else {
      setParkingLocationLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateParkingDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle parking selection for booking
  const handleParkingSelect = (parking) => {
    setSelectedParking(parking);
    setBookingDetails({
      ...bookingDetails,
      parkingId: parking.id
    });
    setShowBookingModal(true);
    setBookingConfirmed(false);
    setBookingId(null);
  };

  // Handle booking submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingDetails.vehicleNumber || !bookingDetails.startDate || !bookingDetails.startTime || !bookingDetails.name || !bookingDetails.phone) {
      alert('Please fill all required fields');
      return;
    }

    // Calculate total cost
    const hours = parseInt(bookingDetails.duration);
    const totalCost = selectedParking.pricePerHour * hours;

    // Generate booking ID
    const newBookingId = 'PARK' + Date.now();
    setBookingId(newBookingId);

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('parkingBookings') || '[]');
    bookings.push({
      id: newBookingId,
      parkingId: selectedParking.id,
      parkingName: selectedParking.name,
      ...bookingDetails,
      totalCost,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    });
    localStorage.setItem('parkingBookings', JSON.stringify(bookings));

    // Simulate booking confirmation
    setBookingConfirmed(true);

    // Update available spaces (in real app, this would be done via API)
    setParkingData(prevData =>
      prevData.map(parking =>
        parking.id === selectedParking.id
          ? { ...parking, availableSpaces: Math.max(0, parking.availableSpaces - 1) }
          : parking
      )
    );
  };

  // Close booking modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedParking(null);
    setBookingConfirmed(false);
    setBookingId(null);
    setBookingDetails({
      parkingId: null,
      vehicleNumber: '',
      vehicleType: 'car',
      startDate: '',
      startTime: '',
      duration: '1',
      name: '',
      phone: '',
      email: ''
    });
  };

  const renderTransportDetails = () => {
    if (!selectedTransport) return null;

    const transport = transportOptions.find(t => t.id === selectedTransport);
    
    // Don't show transport details for city buses, parking, or shuttle - they have their own sections
    if (selectedTransport === 'bus' || selectedTransport === 'parking' || selectedTransport === 'shuttle') {
      return null;
    }
    
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
              <div className="mt-2">
                <span className="text-green-600 text-sm font-semibold">{transport.status}</span>
              </div>
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
            Transport in Nashik
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक में परिवहन
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Navigate within Nashik city using various local transport options
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
                <h3 className="text-lg font-bold text-kumbh-text mb-2">
                  {transport.name}
                </h3>
                <p className="font-devanagari text-kumbh-orange font-semibold mb-2 text-sm">
                  {transport.nameHindi}
                </p>
                <p className="text-gray-600 text-xs mb-3">
                  {transport.description}
                </p>
                <div className="mb-3">
                  <span className="text-green-600 text-xs font-semibold">{transport.status}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

        {/* Parking Section */}
        {selectedTransport === 'parking' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-kumbh-text mb-6">
                Parking Spaces | पार्किंग स्थान
              </h2>
              
              {/* Location Services */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                  Find Nearby Parking | पास की पार्किंग खोजें
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Enable location services to find parking near your current location
                    </p>
                    {userLocationForParking ? (
                      <p className="text-sm text-green-600">
                        ✅ Location enabled: {userLocationForParking.lat.toFixed(4)}, {userLocationForParking.lng.toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        📍 Location not enabled
                      </p>
                    )}
                    {nearbyParking.length > 0 && (
                      <p className="text-sm text-blue-600 mt-1">
                        Found {nearbyParking.length} nearby parking spaces
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={getParkingUserLocation}
                    disabled={parkingLocationLoading}
                    className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                  >
                    {parkingLocationLoading ? 'Getting Location...' : 'Find Nearby Parking'}
                  </Button>
                </div>
              </div>

              {/* View All Parking Button */}
              <div className="mb-6 text-center">
                <Button
                  onClick={() => setLocation('/parking')}
                  variant="outline"
                  className="border-2 border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white font-semibold"
                >
                  🅿️ View All Parking Options & Book | सभी पार्किंग विकल्प देखें और बुक करें
                </Button>
              </div>

              {/* Parking Results */}
              <div ref={parkingResultsRef}>
                <h3 className="text-lg font-semibold text-kumbh-text mb-4">
                  {nearbyParking.length > 0 ? 'Nearby Parking | पास की पार्किंग' : 'All Parking Spaces | सभी पार्किंग स्थान'}
                </h3>
                {parkingData.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(nearbyParking.length > 0 ? nearbyParking : parkingData).map((parking) => (
                      <Card key={parking.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-kumbh-text">
                              {parking.name}
                            </h3>
                            <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                              {parking.nameHindi}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {parking.address}
                            </p>
                          </div>
                          <div className="text-right">
                            {parking.distanceFromUser && (
                              <Badge variant="secondary" className="text-xs mb-2">
                                {parking.distanceFromUser.toFixed(1)} km away
                              </Badge>
                            )}
                            {parking.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Capacity</div>
                            <div className="font-semibold">{parking.capacity} spaces</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Available</div>
                            <div className="font-semibold text-green-600">{parking.availableSpaces} spaces</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Per Hour</div>
                            <div className="font-semibold text-kumbh-orange">₹{parking.pricePerHour}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Per Day</div>
                            <div className="font-semibold text-kumbh-orange">₹{parking.pricePerDay}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">Opening Hours</div>
                          <div className="font-semibold text-sm">{parking.openingHours}</div>
                        </div>

                        {parking.phone && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Contact</div>
                            <div className="font-semibold text-sm">{parking.phone}</div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleParkingSelect(parking)}
                            disabled={parking.availableSpaces === 0}
                            className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep disabled:bg-gray-400"
                          >
                            {parking.availableSpaces > 0 ? 'Book Slot | स्लॉट बुक करें' : 'No Slots Available'}
                          </Button>
                          <Button
                            onClick={() => {
                              const url = `https://www.google.com/maps/search/?api=1&query=${parking.coordinates.lat},${parking.coordinates.lng}`;
                              window.open(url, '_blank');
                            }}
                            variant="outline"
                            className="flex-1 border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white"
                          >
                            Directions | दिशा
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading parking data...</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* City Bus Routes Section */}
        {selectedTransport === 'bus' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-kumbh-text mb-6">
                Nashik City Bus Routes | नासिक शहर बस मार्ग
              </h2>
              
              {/* Station Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Station | प्रस्थान स्टेशन
                  </label>
                  <Select value={routeFilters.from} onValueChange={(value) => setRouteFilters({...routeFilters, from: value})}>
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
                  <Select value={routeFilters.to} onValueChange={(value) => setRouteFilters({...routeFilters, to: value})}>
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

              {/* Search Button */}
              <div className="flex justify-center mb-6">
                <Button 
                  onClick={() => {
                    console.log('Search clicked with:', routeFilters.from, routeFilters.to);
                    
                    if (routeFilters.from && routeFilters.to) {
                      // Filter routes based on selected stations using the actual schedule data
                      const filteredRoutes = nashikCityBusRoutes.filter(route => {
                        // Check if the selected stations match the route's from/to or via points
                        const fromStation = routeFilters.from.toLowerCase();
                        const toStation = routeFilters.to.toLowerCase();
                        
                        // Check if from station matches route's from or via points
                        const fromMatch = route.from.toLowerCase().includes(fromStation) || 
                                        route.via.toLowerCase().includes(fromStation) ||
                                        fromStation.includes(route.from.toLowerCase()) ||
                                        fromStation.includes(route.via.toLowerCase());
                        
                        // Check if to station matches route's to or via points
                        const toMatch = route.to.toLowerCase().includes(toStation) || 
                                      route.via.toLowerCase().includes(toStation) ||
                                      toStation.includes(route.to.toLowerCase()) ||
                                      toStation.includes(route.via.toLowerCase());
                        
                        console.log(`Route ${route.routeNumber}: fromMatch=${fromMatch}, toMatch=${toMatch}`, {
                          routeFrom: route.from,
                          routeTo: route.to,
                          routeVia: route.via,
                          selectedFrom: fromStation,
                          selectedTo: toStation
                        });
                        
                        return fromMatch && toMatch;
                      });
                      
                      console.log('Filtered routes:', filteredRoutes);
                      
                      // If no routes found, show all routes as fallback
                      if (filteredRoutes.length === 0) {
                        console.log('No routes found, showing all routes as fallback');
                        setSearchResults(nashikCityBusRoutes);
                      } else {
                        setSearchResults(filteredRoutes);
                      }
                    } else {
                      // If no stations selected, show all routes
                      console.log('No stations selected, showing all routes');
                      setSearchResults(nashikCityBusRoutes);
                    }
                    
                    // Auto-scroll to bus results
                    setTimeout(() => {
                      if (busResultsRef.current) {
                        busResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 300);
                  }}
                  className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-3"
                >
                  Search Buses | बस खोजें
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="mb-6" ref={busResultsRef}>
                  <h3 className="text-lg font-semibold text-kumbh-text mb-4">
                    Available Routes | उपलब्ध मार्ग ({searchResults.length} found)
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchResults.map((route) => (
                      <Card key={route.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-kumbh-text">
                              Route {route.routeNumber}
                            </h3>
                            <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                              {route.routeNameHindi}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {route.routeName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{route.frequency}</div>
                            <div className="text-lg font-bold text-kumbh-orange">{route.price}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Route</div>
                            <div className="font-semibold">{route.from} → {route.to}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Via: {route.via}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Departure Times</div>
                            <div className="font-semibold text-sm">
                              {route.departureTimes.slice(0, 3).join(', ')}
                              {route.departureTimes.length > 3 && ` +${route.departureTimes.length - 3} more`}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600">Return Times</div>
                          <div className="font-semibold text-sm">
                            {route.returnTimes.slice(0, 3).join(', ')}
                            {route.returnTimes.length > 3 && ` +${route.returnTimes.length - 3} more`}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <div>From: {route.fromHindi}</div>
                            <div>To: {route.toHindi}</div>
                            <div>Via: {route.viaHindi}</div>
                          </div>
                          <Button
                            onClick={() => {
                              // Book Now logic
                              const bookingData = {
                                routeNumber: route.routeNumber,
                                routeName: route.routeName,
                                from: route.from,
                                to: route.to,
                                via: route.via,
                                price: route.price,
                                departureTimes: route.departureTimes,
                                returnTimes: route.returnTimes,
                                frequency: route.frequency
                              };
                              
                              // Store booking data in localStorage for the booking page
                              localStorage.setItem('selectedBusRoute', JSON.stringify(bookingData));
                              
                              // Navigate to booking page
                              setLocation('/transport/bus-booking');
                            }}
                            className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                          >
                            Book Now | अभी बुक करें
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 text-center py-8">
                  <div className="text-gray-500 text-lg mb-4">
                    No routes found for the selected stations
                  </div>
                  <div className="text-gray-400 text-sm mb-4">
                    Try selecting different stations or check all available routes below
                  </div>
                  <Button
                    onClick={() => setSearchResults(nashikCityBusRoutes)}
                    className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-6 py-2"
                  >
                    Show All Routes | सभी मार्ग दिखाएं
                  </Button>
                </div>
              )}

              {/* Bus Information */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                  Bus Information | बस की जानकारी
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚌</div>
                    <div className="font-semibold text-kumbh-text">Operator</div>
                    <div className="text-sm text-gray-600">Nashik CitilinkCity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-semibold text-kumbh-text">Fare Range</div>
                    <div className="text-sm text-gray-600">₹15-30 per trip</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <div className="font-semibold text-kumbh-text">Operating Hours</div>
                    <div className="text-sm text-gray-600">5:30 AM - 11:45 PM</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Shuttle Services Section */}
        {selectedTransport === 'shuttle' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-kumbh-text mb-6">
                Shuttle Services | शटल सेवाएं
              </h2>
              <p className="text-gray-600 mb-6">
                Book shuttles, auto rickshaws, Ola, Uber and other transport services within Nashik
              </p>

              {/* Shuttle Services Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Auto Rickshaw */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="bg-green-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                      🛺
                    </div>
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      Auto Rickshaw
                    </h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold mb-3 text-sm">
                      ऑटो रिक्शा
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Short distance travel within city. Book directly with drivers.
                    </p>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Starting Fare</div>
                      <div className="text-lg font-bold text-kumbh-orange">₹15-30</div>
                    </div>
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Door-to-door service</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Flexible routes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Quick service</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      onClick={() => handleShuttleServiceSelect('auto', 'Auto Rickshaw')}
                    >
                      Book Auto | ऑटो बुक करें
                    </Button>
                  </div>
                </Card>

                {/* Ola */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="bg-yellow-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                      🚕
                    </div>
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      Ola Cabs
                    </h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold mb-3 text-sm">
                      ओला कैब
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Book Ola cabs through the app for convenient travel
                    </p>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Starting Fare</div>
                      <div className="text-lg font-bold text-kumbh-orange">₹50-100</div>
                    </div>
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Multiple cab types</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Real-time tracking</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Cash/Card payment</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      onClick={() => handleShuttleServiceSelect('ola', 'Ola Cabs')}
                    >
                      Book Ola | ओला बुक करें
                    </Button>
                  </div>
                </Card>

                {/* Uber */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="bg-black text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                      🚗
                    </div>
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      Uber
                    </h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold mb-3 text-sm">
                      उबर
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Book Uber cabs through the app for reliable rides
                    </p>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Starting Fare</div>
                      <div className="text-lg font-bold text-kumbh-orange">₹50-100</div>
                    </div>
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Multiple vehicle options</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Estimated arrival time</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Secure payment</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      onClick={() => handleShuttleServiceSelect('uber', 'Uber')}
                    >
                      Book Uber | उबर बुक करें
                    </Button>
                  </div>
                </Card>

                {/* Shuttle Buses */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="bg-yellow-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                      🚌
                    </div>
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      Shuttle Buses
                    </h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold mb-3 text-sm">
                      शटल बसें
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Free shuttles between major ghats during Kumbh Mela
                    </p>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Fare</div>
                      <div className="text-lg font-bold text-green-600">FREE</div>
                    </div>
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Free service</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Regular intervals</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Multiple routes</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      onClick={() => handleShuttleServiceSelect('shuttle-bus', 'Shuttle Buses')}
                    >
                      View Schedule | अनुसूची देखें
                    </Button>
                  </div>
                </Card>

                {/* Local Taxis */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="bg-blue-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                      🚖
                    </div>
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      Local Taxis
                    </h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold mb-3 text-sm">
                      स्थानीय टैक्सी
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Book local taxi services for convenient city travel
                    </p>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Starting Fare</div>
                      <div className="text-lg font-bold text-kumbh-orange">₹40-80</div>
                    </div>
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Pre-booking available</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Local knowledge</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Fixed rates</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      onClick={() => handleShuttleServiceSelect('taxi', 'Local Taxis')}
                    >
                      Book Taxi | टैक्सी बुक करें
                    </Button>
                  </div>
                </Card>

                {/* Car Rental */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="bg-purple-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                      🚙
                    </div>
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      Car Rental
                    </h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold mb-3 text-sm">
                      कार किराया
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Rent a car with or without driver for flexible travel
                    </p>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Starting Rate</div>
                      <div className="text-lg font-bold text-kumbh-orange">₹2000/day</div>
                    </div>
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Self-drive option</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Chauffeur available</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span>Multiple car options</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      onClick={() => handleShuttleServiceSelect('car-rental', 'Car Rental')}
                    >
                      Rent Car | कार किराया करें
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Quick Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-semibold text-kumbh-text mb-2">Book via Apps</h3>
                  <p className="text-sm text-gray-600">Use Ola/Uber apps for instant booking</p>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-semibold text-kumbh-text mb-2">Flexible Payment</h3>
                  <p className="text-sm text-gray-600">Pay via cash, card, or digital wallets</p>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <h3 className="font-semibold text-kumbh-text mb-2">24/7 Available</h3>
                  <p className="text-sm text-gray-600">Services available round the clock</p>
                </Card>
              </div>
            </Card>
          </div>
        )}

        {/* Shuttle Booking Modal */}
        {showShuttleBookingModal && selectedShuttleService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book {selectedShuttleService.name} | {selectedShuttleService.name} बुक करें
                  </h2>
                  <Button
                    onClick={closeShuttleBookingModal}
                    variant="outline"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleShuttleBookingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type | सेवा प्रकार
                      </label>
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="font-semibold text-kumbh-text">{selectedShuttleService.name}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Location * | प्रस्थान स्थान *
                      </label>
                      <Input
                        type="text"
                        value={shuttleBookingDetails.from}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, from: e.target.value})}
                        placeholder="Enter pickup location"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Location * | गंतव्य स्थान *
                      </label>
                      <Input
                        type="text"
                        value={shuttleBookingDetails.to}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, to: e.target.value})}
                        placeholder="Enter destination"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date * | दिनांक *
                      </label>
                      <Input
                        type="date"
                        value={shuttleBookingDetails.date}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time * | समय *
                      </label>
                      <Input
                        type="time"
                        value={shuttleBookingDetails.time}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, time: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passengers * | यात्री *
                      </label>
                      <Select
                        value={shuttleBookingDetails.passengers}
                        onValueChange={(value) => setShuttleBookingDetails({...shuttleBookingDetails, passengers: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger | 1 यात्री</SelectItem>
                          <SelectItem value="2">2 Passengers | 2 यात्री</SelectItem>
                          <SelectItem value="3">3 Passengers | 3 यात्री</SelectItem>
                          <SelectItem value="4">4 Passengers | 4 यात्री</SelectItem>
                          <SelectItem value="5">5+ Passengers | 5+ यात्री</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedShuttleService.type === 'car-rental' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rental Type | किराया प्रकार
                        </label>
                        <Select
                          value={shuttleBookingDetails.vehicleType}
                          onValueChange={(value) => setShuttleBookingDetails({...shuttleBookingDetails, vehicleType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard Car | मानक कार</SelectItem>
                            <SelectItem value="suv">SUV | एसयूवी</SelectItem>
                            <SelectItem value="luxury">Luxury Car | लक्जरी कार</SelectItem>
                            <SelectItem value="self-drive">Self Drive | सेल्फ ड्राइव</SelectItem>
                            <SelectItem value="with-driver">With Driver | ड्राइवर के साथ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name * | आपका नाम *
                      </label>
                      <Input
                        type="text"
                        value={shuttleBookingDetails.name}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, name: e.target.value})}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number * | फोन नंबर *
                      </label>
                      <Input
                        type="tel"
                        value={shuttleBookingDetails.phone}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, phone: e.target.value})}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Optional) | ईमेल (वैकल्पिक)
                      </label>
                      <Input
                        type="email"
                        value={shuttleBookingDetails.email}
                        onChange={(e) => setShuttleBookingDetails({...shuttleBookingDetails, email: e.target.value})}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <Button
                      type="button"
                      onClick={closeShuttleBookingModal}
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

        {/* Walking Routes Section */}
        {selectedTransport === 'walking' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-kumbh-text mb-6">
                Walking Routes | पैदल मार्ग
              </h2>
              
              {/* Zone-Based Walking Routes Access */}
              <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-kumbh-orange">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-kumbh-text mb-2">
                      🚶 Zone-Based Walking Routes
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Access walking routes available only in Zone 2 (Inner City) and Zone 3 (Ghat Core)
                    </p>
                    <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                      ज़ोन 2 और ज़ोन 3 में उपलब्ध पैदल मार्ग
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge className="bg-orange-500 text-white">Zone 2: Within 7.5 km</Badge>
                      <Badge className="bg-red-500 text-white">Zone 3: Within 2 km</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLocation('/walking-routes')}
                    className="bg-kumbh-orange text-white hover:bg-kumbh-deep px-8 py-6 text-lg font-semibold ml-4"
                  >
                    Access Walking Routes →
                  </Button>
                </div>
              </div>
              
              {/* GPS Navigation */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                  GPS Navigation | जीपीएस नेविगेशन
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Enable location services for turn-by-turn navigation
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
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleGetUserLocation}
                      variant="outline"
                      className="border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white"
                    >
                      {userLocation ? 'Update Location' : 'Enable Location'}
                    </Button>
                    <Button
                      onClick={() => setLocation('/navigation')}
                      className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                    >
                      Start Navigation | नेविगेशन शुरू करें
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                  Choose Route Category | मार्ग श्रेणी चुनें
                </h3>
                <div className="flex flex-wrap gap-2">
                  {routeCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        // Auto-scroll to walking routes after category selection
                        setTimeout(() => {
                          if (walkingRoutesRef.current) {
                            walkingRoutesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 300);
                      }}
                      className={`flex items-center space-x-2 ${
                        selectedCategory === category.id
                          ? 'bg-kumbh-orange text-white'
                          : 'border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Routes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={walkingRoutesRef}>
                {getFilteredRoutes().map((route) => (
                  <Card key={route.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleRouteSelect(route)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-kumbh-text">
                          {route.name}
                        </h3>
                        <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                          {route.nameHindi}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{route.distance}</div>
                        <div className="text-sm text-gray-600">{route.duration}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {route.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          route.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          route.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {route.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {route.landmarks.length} stops
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                        onClick={() => setLocation('/walking-routes')}
                      >
                        Start Navigation
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

            </Card>
          </div>
        )}

        {/* Route Details Modal */}
        {showRouteDetails && selectedRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    {selectedRoute.name} | {selectedRoute.nameHindi}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowRouteDetails(false)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Route Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">📏</div>
                    <div className="font-semibold text-kumbh-text">Distance</div>
                    <div className="text-kumbh-orange font-bold">{selectedRoute.distance}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">⏱️</div>
                    <div className="font-semibold text-kumbh-text">Duration</div>
                    <div className="text-kumbh-orange font-bold">{selectedRoute.duration}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🚶</div>
                    <div className="font-semibold text-kumbh-text">Difficulty</div>
                    <div className="text-kumbh-orange font-bold">{selectedRoute.difficulty}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-kumbh-text mb-2">
                    Description | विवरण
                  </h3>
                  <p className="text-gray-700 mb-2">{selectedRoute.description}</p>
                  <p className="font-devanagari text-kumbh-orange font-semibold">
                    {selectedRoute.descriptionHindi}
                  </p>
                </div>

                {/* Landmarks */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                    Route Landmarks | मार्ग के स्थल
                  </h3>
                  <div className="space-y-3">
                    {selectedRoute.landmarks.map((landmark, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-kumbh-orange text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-kumbh-text">{landmark.name}</div>
                          <div className="font-devanagari text-kumbh-orange text-sm">
                            {landmark.nameHindi}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {landmark.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights and Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                      Highlights | मुख्य आकर्षण
                    </h3>
                    <div className="space-y-2">
                      {selectedRoute.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-kumbh-orange rounded-full"></div>
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                      Tips | सुझाव
                    </h3>
                    <div className="space-y-2">
                      {selectedRoute.tips.map((tip, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Navigation Actions */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowRouteDetails(false)}
                  >
                    Close | बंद करें
                  </Button>
                  <div className="space-x-3">
                    <Button
                      onClick={() => setLocation('/navigation')}
                      className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                    >
                      Open Navigation Map
                    </Button>
                    <Button
                      onClick={() => {
                        // Share route functionality
                        if (navigator.share) {
                          navigator.share({
                            title: selectedRoute.name,
                            text: `Check out this walking route: ${selectedRoute.name}`,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Route link copied to clipboard!');
                        }
                      }}
                      variant="outline"
                    >
                      Share Route
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold text-kumbh-text mb-2">Live Navigation</h3>
            <p className="text-sm text-gray-600">Real-time GPS tracking and directions</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-kumbh-text mb-2">Transparent Pricing</h3>
            <p className="text-sm text-gray-600">Clear fare information upfront</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <h3 className="font-semibold text-kumbh-text mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">Live schedules and delays</p>
          </Card>
        </div>
      </div>

      {/* Parking Booking Modal */}
      {showBookingModal && selectedParking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {!bookingConfirmed ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-kumbh-text">
                      Book Parking Slot | पार्किंग स्लॉट बुक करें
                    </h2>
                    <Button
                      onClick={closeBookingModal}
                      variant="outline"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Parking Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-kumbh-text mb-2">{selectedParking.name}</h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold text-sm mb-2">{selectedParking.nameHindi}</p>
                    <p className="text-sm text-gray-600 mb-2">{selectedParking.address}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-gray-600">Available Spaces</div>
                        <div className="font-semibold text-green-600">{selectedParking.availableSpaces}/{selectedParking.capacity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Price per Hour</div>
                        <div className="font-semibold text-kumbh-orange">₹{selectedParking.pricePerHour}</div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <form onSubmit={handleBookingSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Number * | वाहन संख्या *
                        </label>
                        <Input
                          type="text"
                          value={bookingDetails.vehicleNumber}
                          onChange={(e) => setBookingDetails({...bookingDetails, vehicleNumber: e.target.value})}
                          placeholder="MH 15 AB 1234"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Type * | वाहन प्रकार *
                        </label>
                        <Select
                          value={bookingDetails.vehicleType}
                          onValueChange={(value) => setBookingDetails({...bookingDetails, vehicleType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Car | कार</SelectItem>
                            <SelectItem value="bike">Bike | बाइक</SelectItem>
                            <SelectItem value="auto">Auto Rickshaw | ऑटो रिक्शा</SelectItem>
                            <SelectItem value="suv">SUV | एसयूवी</SelectItem>
                            <SelectItem value="truck">Truck | ट्रक</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date * | प्रारंभ दिनांक *
                        </label>
                        <Input
                          type="date"
                          value={bookingDetails.startDate}
                          onChange={(e) => setBookingDetails({...bookingDetails, startDate: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time * | प्रारंभ समय *
                        </label>
                        <Input
                          type="time"
                          value={bookingDetails.startTime}
                          onChange={(e) => setBookingDetails({...bookingDetails, startTime: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (Hours) * | अवधि (घंटे) *
                        </label>
                        <Select
                          value={bookingDetails.duration}
                          onValueChange={(value) => setBookingDetails({...bookingDetails, duration: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour | 1 घंटा</SelectItem>
                            <SelectItem value="2">2 Hours | 2 घंटे</SelectItem>
                            <SelectItem value="3">3 Hours | 3 घंटे</SelectItem>
                            <SelectItem value="6">6 Hours | 6 घंटे</SelectItem>
                            <SelectItem value="12">12 Hours | 12 घंटे</SelectItem>
                            <SelectItem value="24">24 Hours (Full Day) | 24 घंटे (पूरा दिन)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Cost | कुल लागत
                        </label>
                        <div className="p-2 bg-gray-50 rounded border">
                          <div className="text-lg font-bold text-kumbh-orange">
                            ₹{selectedParking.pricePerHour * parseInt(bookingDetails.duration || 1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ₹{selectedParking.pricePerHour} × {bookingDetails.duration || 1} hour(s)
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name * | आपका नाम *
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number * | फोन नंबर *
                        </label>
                        <Input
                          type="tel"
                          value={bookingDetails.phone}
                          onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email (Optional) | ईमेल (वैकल्पिक)
                        </label>
                        <Input
                          type="email"
                          value={bookingDetails.email}
                          onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 mt-6">
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
                        disabled={selectedParking.availableSpaces === 0}
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
                    <h2 className="text-2xl font-bold text-kumbh-text mb-2">
                      Booking Confirmed! | बुकिंग पुष्टि हुई!
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Your parking slot has been booked successfully
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Booking ID:</span>
                          <span className="ml-2 font-semibold">{bookingId}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Parking:</span>
                          <span className="ml-2 font-semibold">{selectedParking.name}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Vehicle Number:</span>
                          <span className="ml-2 font-semibold">{bookingDetails.vehicleNumber}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Date & Time:</span>
                          <span className="ml-2 font-semibold">{bookingDetails.startDate} at {bookingDetails.startTime}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="ml-2 font-semibold">{bookingDetails.duration} hour(s)</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Total Cost:</span>
                          <span className="ml-2 font-bold text-kumbh-orange">₹{selectedParking.pricePerHour * parseInt(bookingDetails.duration)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        onClick={closeBookingModal}
                        className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep"
                      >
                        Done | हो गया
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
