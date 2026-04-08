import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

// Add custom CSS to style the routing control - start collapsed
const routingStyle = document.createElement('style');
routingStyle.innerHTML = `
  .leaflet-routing-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .leaflet-routing-container.leaflet-routing-container-hide {
    width: 40px;
    height: 40px;
  }
  .leaflet-routing-alt {
    padding: 10px;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('routing-style')) {
  routingStyle.id = 'routing-style';
  document.head.appendChild(routingStyle);
}

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for user and parking locations
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const parkingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function createDemoSlots(rows = 6, cols = 10) {
  const slots = [];
  const total = rows * cols;
  for (let i = 0; i < total; i += 1) {
    const index = i + 1;
    let status = 'available';
    if (index % 11 === 0) status = 'occupied';
    else if (index % 7 === 0) status = 'reserved';

    slots.push({
      id: `S${String(index).padStart(2, '0')}`,
      status,
      vehicleNumber: status === 'occupied' ? `MH15${1000 + index}` : '',
      reservedFor: status === 'reserved' ? `User ${index}` : '',
      vehicleType: status === 'reserved' || status === 'occupied' ? 'Car' : '',
      passengers: status === 'reserved' || status === 'occupied' ? 4 : '',
    });
  }
  return slots;
}

const DEMO_SLOT_VALIDITY_MS = 30 * 60 * 1000;
const demoVehicleTypes = ['Car', 'Bus', 'Truck', 'Tempo', 'Auto Rickshaw', 'Two Wheeler'];

function formatDemoSlotValidity(expiresAt) {
  if (!expiresAt) return '30 min validity';
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, '0')} left`;
}

// Component to update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Component to show routing between user and parking
function RoutingMachine({ userLocation, destination }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    // Remove existing routing control if any
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control with collapsible panel
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#FF6B35', weight: 4, opacity: 0.7 }]
      },
      createMarker: function() { return null; }, // Don't create default markers
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      collapsible: true, // Make it collapsible
      show: true, // Show the control
      autoRoute: true
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Wait for the control to be added and then collapse it
    setTimeout(() => {
      const container = routingControl.getContainer();
      if (container) {
        // Find and click the collapse button to start in collapsed state
        const collapseBtn = container.querySelector('.leaflet-routing-collapse-btn');
        if (collapseBtn && !container.classList.contains('leaflet-routing-container-hide')) {
          collapseBtn.click();
        }
      }
    }, 100);

    // Cleanup function
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, userLocation, destination]);

  return null;
}

export default function Parking() {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    location: 'Nashik',
    date: '',
    duration: '2'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleNumber: '',
    vehicleType: '',
    duration: '2' // Default 2 hours
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyParking, setNearbyParking] = useState([]);
  const parkingListRef = useRef(null);
  const [nashikParking, setNashikParking] = useState([]);
  const [mapCenter, setMapCenter] = useState([19.9975, 73.7898]); // Default to Nashik
  const [sortedParking, setSortedParking] = useState([]);
  const [selectedParkingForRoute, setSelectedParkingForRoute] = useState(null);
  const [demoSlots, setDemoSlots] = useState(() => createDemoSlots());
  const [selectedDemoSlot, setSelectedDemoSlot] = useState('');
  const [demoBooking, setDemoBooking] = useState({ name: '', vehicleNumber: '', vehicleType: '', passengers: '1' });
  const [communityParkingForm, setCommunityParkingForm] = useState({
    name: '',
    owner: '',
    phone: '',
    address: '',
    totalSpaces: '25',
    vehicleTypes: 'Car, Bus',
  });
  const [communityMessage, setCommunityMessage] = useState('');

  // Load parking data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/parking`);
        const data = await res.json();
        const transformedData = (data || []).map((parking, idx) => ({
          id: parking._id || idx,
          name: parking.name,
          nameHindi: parking.nameHindi || '',
          location: 'Nashik',
          address: parking.address || '',
          coordinates: parking.location && parking.location.coordinates ? { lat: parking.location.coordinates[1], lng: parking.location.coordinates[0] } : null,
          capacity: parking.capacity || 0,
          total_spaces: parking.total_spaces || 0,
          available_spaces: parking.available_spaces || 0,
          price_per_hour: parking.price_per_hour || 0,
          price_per_day: parking.price_per_day || 0,
          opening_hours: parking.opening_hours || '24 hours',
          phone: parking.phone || '',
          verified: parking.verified ?? true
        }));
        setNashikParking(transformedData);
        // Don't set searchResults initially - wait for user to search or get location
      } catch (error) {
        console.error('Error loading parking API:', error);
        setNashikParking([]);
      }
    };
    loadData();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Automatically get user location and show nearest parking on first visit
  useEffect(() => {
    // Only run once when component mounts and parking data is loaded
    if (nashikParking.length > 0 && !userLocation && !locationLoading) {
      getUserLocation();
    }
  }, [nashikParking]);

  // Automatically show route to nearest parking when location is obtained
  useEffect(() => {
    if (userLocation && searchResults.length > 0 && !selectedParkingForRoute) {
      // Find the nearest parking (first one in sorted list)
      const nearestParking = searchResults[0];
      if (nearestParking && nearestParking.coordinates) {
        setSelectedParkingForRoute(nearestParking);
      }
    }
  }, [userLocation, searchResults]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDemoSlots((prev) =>
        prev.map((slot) =>
          slot.status === 'reserved' && slot.bookingExpiresAt && slot.bookingExpiresAt <= Date.now()
            ? {
                ...slot,
                status: 'available',
                reservedFor: '',
                vehicleNumber: '',
                vehicleType: '',
                passengers: '',
                bookingExpiresAt: null,
              }
            : slot
        )
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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
            setMapCenter([userLat, userLng]);
            
            const res = await fetch(`${API_BASE}/api/parking/nearby?lat=${userLat}&lng=${userLng}&radiusKm=10`);
            if (!res.ok) {
              throw new Error(`API error: ${res.status}`);
            }
            const data = await res.json();
            const parkingArray = Array.isArray(data) ? data : (data.parking || []);
            const transformed = (parkingArray || []).map((parking, idx) => ({
              id: parking._id || idx,
              name: parking.name,
              nameHindi: parking.nameHindi || '',
              location: 'Nashik',
              address: parking.address || '',
              coordinates: parking.location && parking.location.coordinates ? { lat: parking.location.coordinates[1], lng: parking.location.coordinates[0] } : null,
              capacity: parking.capacity || 0,
              total_spaces: parking.total_spaces || 0,
              available_spaces: parking.available_spaces || 0,
              price_per_hour: parking.price_per_hour || 0,
              price_per_day: parking.price_per_day || 0,
              opening_hours: parking.opening_hours || '24 hours',
              phone: parking.phone || '',
              verified: parking.verified ?? true,
              distanceFromUser: parking.distanceMeters ? (parking.distanceMeters / 1000) : undefined
            }));
            
            // Sort by distance
            const sorted = transformed.sort((a, b) => {
              if (a.distanceFromUser === undefined) return 1;
              if (b.distanceFromUser === undefined) return -1;
              return a.distanceFromUser - b.distanceFromUser;
            });
            
            setNearbyParking(sorted);
            setSortedParking(sorted);
            setSearchResults(sorted.length > 0 ? sorted : nashikParking);
          } catch (err) {
            console.error('Nearby parking API error:', err);
            setSearchResults(nashikParking);
          } finally {
            setLocationLoading(false);
            setTimeout(() => {
              if (parkingListRef.current) {
                parkingListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setSearchResults(nashikParking);
          setLocationLoading(false);
        }
      );
    } else {
      setSearchResults(nashikParking);
      setLocationLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchFilters.date) {
      alert('Please select a date');
      return;
    }
    
    let filteredParking = nashikParking.filter(parking => 
      parking.location.toLowerCase().includes(searchFilters.location.toLowerCase())
    );

    setSearchResults(filteredParking);
    
    setTimeout(() => {
      if (parkingListRef.current) {
        parkingListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleParkingSelect = (parking) => {
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book parking. After login, you will return to this parking page.'
    })) {
      return;
    }

    setSelectedParking(parking);
    setShowBooking(true);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to complete this parking booking. After login, you will return to this page.'
    })) {
      return;
    }

    if (bookingStep === 1) {
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!paymentMethod) {
        alert('Please select a payment method');
        return;
      }
      try {
        const booking = await createBookingRecord({
          API_BASE,
          token: getToken(),
          bookingData: {
            bookingType: 'parking',
            status: 'pending',
            parkingDetails: {
              parkingName: selectedParking.name,
              vehicleNumber: bookingDetails.vehicleNumber,
              vehicleType: bookingDetails.vehicleType,
              reservedFor: bookingDetails.name,
              validUntil: searchFilters.date ? new Date(searchFilters.date) : undefined
            },
            contactDetails: {
              name: bookingDetails.name,
              phone: bookingDetails.phone || user?.phone || '',
              email: bookingDetails.email || user?.email || ''
            },
            amount: calculateTotalPrice(selectedParking),
            paymentMethod,
            bookingDetails: {
              source: 'main-parking-page',
              durationHours: Number(bookingDetails.duration) || 2,
              parkingAddress: selectedParking.address
            }
          }
        });

        setBookingStep(3);
        setBookingConfirmed(true);
        setBookingId(booking.bookingId);
      } catch (error) {
        console.error('Parking booking error:', error);
        alert(error.message || 'Failed to create parking booking. Please try again.');
      }
    }
  };

  const resetBooking = () => {
    setShowBooking(false);
    setBookingStep(1);
    setBookingConfirmed(false);
    setBookingId('');
    setSelectedParking(null);
    setBookingDetails({ name: '', phone: '', email: '', vehicleNumber: '', vehicleType: '', duration: '2' });
    setPaymentMethod('');
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateTotalPrice = (parking) => {
    const duration = parseInt(bookingDetails.duration) || 2;
    // If duration is 24 hours or more, use daily rate
    if (duration >= 24) {
      const days = Math.ceil(duration / 24);
      return parking.price_per_day * days;
    }
    return parking.price_per_hour * duration;
  };

  const openWazeNavigation = (parking) => {
    if (parking.coordinates) {
      const wazeUrl = `https://waze.com/ul?ll=${parking.coordinates.lat},${parking.coordinates.lng}&navigate=yes&zoom=17`;
      window.open(wazeUrl, '_blank');
    }
  };

  const openGoogleMapsNavigation = (parking) => {
    if (parking.coordinates) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parking.coordinates.lat},${parking.coordinates.lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const showRouteToParking = (parking) => {
    if (!userLocation) {
      alert('Please enable location services first to see the route');
      return;
    }
    if (parking.coordinates) {
      setSelectedParkingForRoute(parking);
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  };

  const clearRoute = () => {
    setSelectedParkingForRoute(null);
  };

  const demoCounts = demoSlots.reduce(
    (acc, slot) => {
      acc.total += 1;
      if (slot.status === 'available') acc.available += 1;
      if (slot.status === 'reserved') acc.reserved += 1;
      if (slot.status === 'occupied') acc.occupied += 1;
      return acc;
    },
    { total: 0, available: 0, reserved: 0, occupied: 0 }
  );

  const handleDemoBookSlot = (e) => {
    e.preventDefault();
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book a demo parking slot. After login, you will return to this page.'
    })) {
      return;
    }

    if (!demoBooking.name || !demoBooking.vehicleNumber || !demoBooking.vehicleType || !Number(demoBooking.passengers)) {
      alert('Please enter name, vehicle number, vehicle type, and passenger count for demo booking.');
      return;
    }

    const targetSlotId = selectedDemoSlot || demoSlots.find((slot) => slot.status === 'available')?.id;
    if (!targetSlotId) {
      alert('No available slot to reserve.');
      return;
    }

    setDemoSlots((prev) =>
      prev.map((slot) =>
        slot.id === targetSlotId && slot.status === 'available'
          ? {
              ...slot,
              status: 'reserved',
              reservedFor: demoBooking.name,
              vehicleNumber: demoBooking.vehicleNumber.toUpperCase(),
              vehicleType: demoBooking.vehicleType,
              passengers: Number(demoBooking.passengers),
              bookingExpiresAt: Date.now() + DEMO_SLOT_VALIDITY_MS,
            }
          : slot
      )
    );
    setSelectedDemoSlot('');
  };

  const handleDemoVehicleParked = () => {
    const reservedSlot = demoSlots.find((slot) => slot.status === 'reserved');
    if (!reservedSlot) {
      alert('No reserved slot found. Reserve a slot first.');
      return;
    }

    setDemoSlots((prev) =>
      prev.map((slot) =>
        slot.id === reservedSlot.id
          ? {
              ...slot,
              status: 'occupied',
              bookingExpiresAt: null,
            }
          : slot
      )
    );
  };

  const resetDemoParking = () => {
    setDemoSlots(createDemoSlots());
    setSelectedDemoSlot('');
    setDemoBooking({ name: '', vehicleNumber: '', vehicleType: '', passengers: '1' });
  };

  const onboardCommunityParking = (e) => {
    e.preventDefault();
    const name = communityParkingForm.name.trim();
    const owner = communityParkingForm.owner.trim();
    const phone = communityParkingForm.phone.trim();
    const address = communityParkingForm.address.trim();
    const totalSpaces = Number(communityParkingForm.totalSpaces);
    const vehicleTypes = communityParkingForm.vehicleTypes.trim();

    if (!name || !owner || !phone || !address || !totalSpaces || totalSpaces < 1) {
      alert('Please enter community space name, owner, phone, address, and valid slot count.');
      return;
    }

    const communityParking = {
      id: `community-${Date.now()}`,
      name,
      nameHindi: 'Community Parking',
      location: 'Nashik',
      address,
      coordinates: null,
      capacity: totalSpaces,
      total_spaces: totalSpaces,
      available_spaces: totalSpaces,
      price_per_hour: 0,
      price_per_day: 0,
      opening_hours: 'Community managed',
      phone,
      verified: false,
      communitySpace: true,
      owner,
      vehicleTypes,
    };

    setNashikParking((prev) => [communityParking, ...prev]);
    setSearchResults((prev) => [communityParking, ...prev]);
    setCommunityMessage(`${name} onboarded as a community parking space with ${totalSpaces} slots.`);
    setCommunityParkingForm({ name: '', owner: '', phone: '', address: '', totalSpaces: '25', vehicleTypes: 'Car, Bus' });
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
            Parking Booking | पार्किंग बुकिंग
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            पार्किंग बुकिंग
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and book parking spaces near Kumbh Mela venues
          </p>
        </div>

        {/* Community parking onboarding */}
        <Card className="p-6 mb-8 border-2 border-green-100">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-kumbh-text">Onboard Community Space as Parking</h2>
            <p className="text-sm text-gray-600">
              Add society grounds, school grounds, community halls, or open spaces as temporary parking slots for the demo.
            </p>
          </div>

          <form onSubmit={onboardCommunityParking} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              value={communityParkingForm.name}
              onChange={(e) => setCommunityParkingForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Community space name"
            />
            <Input
              value={communityParkingForm.owner}
              onChange={(e) => setCommunityParkingForm((prev) => ({ ...prev, owner: e.target.value }))}
              placeholder="Owner / coordinator"
            />
            <Input
              value={communityParkingForm.phone}
              onChange={(e) => setCommunityParkingForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Contact number"
            />
            <Input
              value={communityParkingForm.address}
              onChange={(e) => setCommunityParkingForm((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Address"
              className="md:col-span-2"
            />
            <Input
              type="number"
              min="1"
              value={communityParkingForm.totalSpaces}
              onChange={(e) => setCommunityParkingForm((prev) => ({ ...prev, totalSpaces: e.target.value }))}
              placeholder="Number of slots"
            />
            <Input
              value={communityParkingForm.vehicleTypes}
              onChange={(e) => setCommunityParkingForm((prev) => ({ ...prev, vehicleTypes: e.target.value }))}
              placeholder="Allowed vehicles (Car, Bus, Truck)"
              className="md:col-span-2"
            />
            <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
              Add Community Parking
            </Button>
          </form>

          {communityMessage && (
            <p className="mt-4 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {communityMessage}
            </p>
          )}
        </Card>

        {/* Demo parking grid */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-kumbh-text">Parking Demo Grid | स्लॉट डेमो</h2>
              <p className="text-sm text-gray-600">
                Available slots can be booked with vehicle type and passenger count. Reservations are valid for 30 minutes.
              </p>
            </div>
            <Button variant="outline" onClick={resetDemoParking}>
              Reset Demo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-kumbh-text">{demoCounts.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-xl font-bold text-green-700">{demoCounts.available}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
              <p className="text-xs text-gray-500">Reserved</p>
              <p className="text-xl font-bold text-yellow-700">{demoCounts.reserved}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-gray-500">Occupied</p>
              <p className="text-xl font-bold text-red-700">{demoCounts.occupied}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div className="flex items-center gap-1.5"><span>🟩</span><span>Available</span></div>
            <div className="flex items-center gap-1.5"><span>🚫</span><span>Reserved (Booked, not parked)</span></div>
            <div className="flex items-center gap-1.5"><span>🚗</span><span>Occupied (Vehicle parked)</span></div>
          </div>

          <form onSubmit={handleDemoBookSlot} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-5">
            <Input
              value={demoBooking.name}
              onChange={(e) => setDemoBooking((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="User name"
            />
            <Input
              value={demoBooking.vehicleNumber}
              onChange={(e) => setDemoBooking((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
              placeholder="Vehicle number"
            />
            <Select value={demoBooking.vehicleType} onValueChange={(value) => setDemoBooking((prev) => ({ ...prev, vehicleType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {demoVehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={demoBooking.passengers}
              onChange={(e) => setDemoBooking((prev) => ({ ...prev, passengers: e.target.value }))}
              placeholder="Passengers"
            />
            <Select value={selectedDemoSlot} onValueChange={setSelectedDemoSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-assign or pick slot" />
              </SelectTrigger>
              <SelectContent>
                {demoSlots
                  .filter((slot) => slot.status === 'available')
                  .map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-kumbh-orange text-white hover:bg-kumbh-deep">
              Book Slot (Reserve)
            </Button>
          </form>

          <div className="flex justify-end mb-4">
            <Button onClick={handleDemoVehicleParked} className="bg-green-600 text-white hover:bg-green-700">
              Mark Reserved Slot as Parked
            </Button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {demoSlots.map((slot) => {
              const isAvailable = slot.status === 'available';
              const isReserved = slot.status === 'reserved';
              const isOccupied = slot.status === 'occupied';

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => isAvailable && setSelectedDemoSlot(slot.id)}
                  className={`h-16 rounded-lg border text-xs font-semibold px-1 transition-all ${
                    isAvailable
                      ? selectedDemoSlot === slot.id
                        ? 'bg-green-200 border-green-600 text-green-900'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : isReserved
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700 cursor-not-allowed'
                        : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                  title={
                    isAvailable
                      ? `${slot.id} - Available`
                      : isReserved
                        ? `${slot.id} - Reserved for ${slot.reservedFor || 'N/A'} (${slot.vehicleNumber || 'No vehicle'}) - ${slot.vehicleType || 'Vehicle'} - ${slot.passengers || '?'} passengers - ${formatDemoSlotValidity(slot.bookingExpiresAt)}`
                        : `${slot.id} - Occupied by ${slot.vehicleNumber || 'Vehicle'} - ${slot.vehicleType || 'Vehicle'} - ${slot.passengers || '?'} passengers`
                  }
                >
                  <div>{slot.id}</div>
                  <div className="text-base">{isAvailable ? '🟩' : isReserved ? '🚫' : '🚗'}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Location Services */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Find Nearby Parking | पास की पार्किंग खोजें
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Enable location services to find parking near your current location
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
              {nearbyParking.length > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  Found {nearbyParking.length} nearby parking spaces
                </p>
              )}
            </div>
            <Button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
            >
              {locationLoading ? 'Getting Location...' : 'Find Nearby Parking'}
            </Button>
          </div>
        </Card>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Search Parking | पार्किंग खोजें
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  Duration (Hours) | अवधि
                </label>
                <Select value={searchFilters.duration} onValueChange={(value) => setSearchFilters({...searchFilters, duration: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="4">4 Hours</SelectItem>
                    <SelectItem value="8">8 Hours</SelectItem>
                    <SelectItem value="24">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                >
                  Search Parking | खोजें
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Map and Parking List Section */}
        {searchResults.length > 0 && (
          <div className="mb-8" ref={parkingListRef}>
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Available Parking | उपलब्ध पार्किंग
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Section - Left Side */}
              <div className="lg:sticky lg:top-4 h-[600px]">
                <Card className="p-4 h-full">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-kumbh-text">
                      Map View | मानचित्र दृश्य
                    </h3>
                    {selectedParkingForRoute && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearRoute}
                        className="text-xs"
                      >
                        Clear Route
                      </Button>
                    )}
                  </div>
                  <div className="h-[calc(100%-3rem)] rounded-lg overflow-hidden">
                    <MapContainer 
                      center={mapCenter} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapUpdater center={mapCenter} />
                      
                      {/* User Location Marker */}
                      {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                          <Popup>
                            <div className="text-center">
                              <strong>Your Location</strong>
                              <br />
                              <span className="text-sm">आपका स्थान</span>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      
                      {/* Routing Component */}
                      {userLocation && selectedParkingForRoute && selectedParkingForRoute.coordinates && (
                        <RoutingMachine 
                          userLocation={userLocation}
                          destination={selectedParkingForRoute.coordinates}
                        />
                      )}
                      
                      {/* Parking Location Markers */}
                      {searchResults.map((parking) => (
                        parking.coordinates && (
                          <Marker 
                            key={parking.id} 
                            position={[parking.coordinates.lat, parking.coordinates.lng]}
                            icon={parkingIcon}
                          >
                            <Popup>
                              <div className="min-w-[200px]">
                                <h4 className="font-bold text-kumbh-text">{parking.name}</h4>
                                <p className="text-xs text-kumbh-orange">{parking.nameHindi}</p>
                                <p className="text-xs text-gray-600 mt-1">{parking.address}</p>
                                <div className="mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Available:</span>
                                    <span className="font-bold text-green-600">{parking.available_spaces}/{parking.total_spaces}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Price/hr:</span>
                                    <span className="font-bold text-kumbh-orange">₹{parking.price_per_hour}</span>
                                  </div>
                                  {parking.distanceFromUser && (
                                    <div className="flex justify-between">
                                      <span>Distance:</span>
                                      <span className="font-bold">{parking.distanceFromUser.toFixed(1)} km</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => showRouteToParking(parking)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white text-xs"
                                  >
                                    🗺️ Show Route
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleParkingSelect(parking)}
                                    disabled={parking.available_spaces === 0}
                                    className="w-full bg-kumbh-orange hover:bg-kumbh-deep text-white text-xs"
                                  >
                                    Book Now
                                  </Button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  </div>
                </Card>
              </div>

              {/* Parking List - Right Side */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {searchResults.map((parking, index) => (
                  <Card key={parking.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {parking.distanceFromUser && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              #{index + 1}
                            </Badge>
                          )}
                          <h3 className="text-lg font-bold text-kumbh-text">
                            {parking.name}
                          </h3>
                        </div>
                        <p className="font-devanagari text-kumbh-orange font-semibold text-sm">
                          {parking.nameHindi}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          {parking.address}
                        </p>
                      </div>
                      <div className="text-right">
                        {parking.verified && (
                          <Badge variant="secondary" className="text-xs mb-1 bg-green-100 text-green-800">
                            ✓ Verified
                          </Badge>
                        )}
                        {parking.distanceFromUser && (
                          <Badge variant="secondary" className="text-xs block mt-1">
                            📍 {parking.distanceFromUser.toFixed(1)} km
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="font-bold text-kumbh-text">{parking.total_spaces}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">Available</div>
                        <div className={`font-bold ${parking.available_spaces > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parking.available_spaces}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">₹/Hour</div>
                        <div className="font-bold text-kumbh-orange">₹{parking.price_per_hour}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showRouteToParking(parking)}
                        className="flex-1 text-xs border-green-500 text-green-600 hover:bg-green-50"
                        disabled={!userLocation}
                      >
                        🗺️ Show Route
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleParkingSelect(parking)}
                        disabled={parking.available_spaces === 0}
                        className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep disabled:bg-gray-400 text-xs"
                      >
                        {parking.available_spaces > 0 ? 'Book Now' : 'Full'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Parking Booking Modal */}
        {showBooking && selectedParking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kumbh-text">
                    Book Parking | पार्किंग बुक करें
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

                {/* Parking Details */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-xl font-bold text-kumbh-text">{selectedParking.name}</h3>
                    <p className="font-devanagari text-kumbh-orange font-semibold">{selectedParking.nameHindi}</p>
                    <p className="text-gray-600 text-sm">{selectedParking.address}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Available: </span>
                        <span className="font-semibold text-green-600">{selectedParking.available_spaces} spaces</span>
                      </div>
                      <div className="text-lg font-bold text-kumbh-orange">₹{selectedParking.price_per_hour}/hour</div>
                    </div>
                  </div>
                </div>

                {/* Step 1: Booking Details */}
                {bookingStep === 1 && (
                  <form onSubmit={handleBooking}>
                    <h3 className="text-xl font-bold text-kumbh-text mb-4">
                      Booking Details | बुकिंग विवरण
                    </h3>
                    
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
                      <div>
                        <label className="block text-sm font-medium text-kumbh-text mb-2">
                          Vehicle Number | वाहन नंबर
                        </label>
                        <Input
                          type="text"
                          value={bookingDetails.vehicleNumber}
                          onChange={(e) => setBookingDetails({...bookingDetails, vehicleNumber: e.target.value})}
                          placeholder="MH-15-XX-1234"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-kumbh-text mb-2">
                          Vehicle Type | वाहन का प्रकार
                        </label>
                        <Select value={bookingDetails.vehicleType} onValueChange={(value) => setBookingDetails({...bookingDetails, vehicleType: value})} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-kumbh-text mb-2">
                          Duration (Hours) | अवधि (घंटे)
                        </label>
                        <Select value={bookingDetails.duration} onValueChange={(value) => setBookingDetails({...bookingDetails, duration: value})} required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="2">2 Hours</SelectItem>
                            <SelectItem value="3">3 Hours</SelectItem>
                            <SelectItem value="4">4 Hours</SelectItem>
                            <SelectItem value="6">6 Hours</SelectItem>
                            <SelectItem value="8">8 Hours</SelectItem>
                            <SelectItem value="12">12 Hours</SelectItem>
                            <SelectItem value="24">Full Day (24 Hours)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                          id="cash"
                          name="paymentMethod"
                          value="Cash"
                          checked={paymentMethod === 'Cash'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <label htmlFor="cash" className="flex items-center space-x-3 cursor-pointer">
                          <span className="text-2xl">💵</span>
                          <div>
                            <div className="font-semibold">Cash on Arrival</div>
                            <div className="text-sm text-gray-600">Pay when you arrive at parking</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-kumbh-text mb-3">Booking Summary | बुकिंग सारांश</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Parking:</span>
                          <span className="font-semibold">{selectedParking.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{searchFilters.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{bookingDetails.duration} {parseInt(bookingDetails.duration) === 1 ? 'hour' : 'hours'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vehicle:</span>
                          <span>{bookingDetails.vehicleNumber} ({bookingDetails.vehicleType})</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="text-kumbh-orange">₹{calculateTotalPrice(selectedParking)}</span>
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
                        <div><strong>Parking:</strong> {selectedParking.name}</div>
                        <div><strong>Address:</strong> {selectedParking.address}</div>
                        <div><strong>Date:</strong> {searchFilters.date}</div>
                        <div><strong>Duration:</strong> {bookingDetails.duration} {parseInt(bookingDetails.duration) === 1 ? 'hour' : 'hours'}</div>
                        <div><strong>Vehicle:</strong> {bookingDetails.vehicleNumber}</div>
                        <div><strong>Total Amount:</strong> ₹{calculateTotalPrice(selectedParking)}</div>
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
            Parking Tips | पार्किंग सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book parking in advance during Kumbh Mela', icon: '📅' },
              { tip: 'Keep your booking confirmation ready', icon: '📄' },
              { tip: 'Arrive early to find your parking spot easily', icon: '⏰' },
              { tip: 'Note down the parking attendant contact', icon: '📞' },
              { tip: 'Check parking opening hours before booking', icon: '🕐' },
              { tip: 'Verify parking location and accessibility', icon: '📍' }
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
