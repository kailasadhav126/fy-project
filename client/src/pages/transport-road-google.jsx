import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function TransportRoadGoogle() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeDirections, setRouteDirections] = useState([]);
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [destSearchQuery, setDestSearchQuery] = useState('Kumbh Mela Venue (Ramkund Ghat)');
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [destSearchResults, setDestSearchResults] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapSectionRef = useRef(null);

  // Destination options
  const destinations = [
    { 
      id: 'ramkund', 
      name: 'Kumbh Mela Venue (Ramkund Ghat)', 
      nameHindi: 'कुंभ मेला स्थल (रामकुंड घाट)',
      lat: 19.9975, 
      lng: 73.7898,
      isMain: true
    },
    { 
      id: 'panchavati', 
      name: 'Panchavati Area', 
      nameHindi: 'पंचवटी क्षेत्र',
      lat: 20.0104, 
      lng: 73.7877,
      isMain: false
    },
    { 
      id: 'trimbakeshwar', 
      name: 'Trimbakeshwar Temple', 
      nameHindi: 'त्र्यंबकेश्वर मंदिर',
      lat: 19.9333, 
      lng: 73.5333,
      isMain: false
    },
    { 
      id: 'nashik-station', 
      name: 'Nashik Road Railway Station', 
      nameHindi: 'नासिक रोड रेलवे स्टेशन',
      lat: 19.9615, 
      lng: 73.7906,
      isMain: false
    }
  ];

  // Default destination is Ramkund Ghat
  const currentDestination = selectedDestination || destinations[0];



  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-dropdown-container')) {
        setShowStartDropdown(false);
        setShowDestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize and update map when location or destination changes
  useEffect(() => {
    const dest = currentDestination;
    
    // Load Leaflet CSS if not already loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS if not already loaded
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapContainerRef.current) return;

      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const L = window.L;
      
      // Determine map center and zoom
      let center, zoom;
      if (userLocation || selectedCity) {
        const location = userLocation || selectedCity;
        // Center between start and destination
        center = [(location.lat + dest.lat) / 2, (location.lng + dest.lng) / 2];
        zoom = 8;
      } else {
        // Center on destination
        center = [dest.lat, dest.lng];
        zoom = 12;
      }

      // Create map
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add markers and route if start location exists
      if (userLocation || selectedCity) {
        const location = userLocation || selectedCity;

        // Start marker (green location pin)
        const startIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="position: relative; width: 40px; height: 50px;">
            <div style="background-color: #22c55e; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">
              <span style="transform: rotate(45deg); font-size: 24px;">📍</span>
            </div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        });

        L.marker([location.lat, location.lng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<b>🚗 Starting Point</b><br>${userLocation ? 'Your Current Location' : majorCities.find(c => c.lat === location.lat)?.name || 'Selected City'}`);

        // Destination marker (orange temple/destination)
        const destIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="position: relative; width: 40px; height: 50px;">
            <div style="background-color: #f97316; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">
              <span style="transform: rotate(45deg); font-size: 24px;">🛕</span>
            </div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        });

        L.marker([dest.lat, dest.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>🎯 Destination</b><br>${dest.name}`);

        // Fetch and draw actual road route using OSRM
        fetchAndDrawRoute(map, location, dest);
      } else {
        // Only destination marker (orange temple/destination)
        const destIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="position: relative; width: 40px; height: 50px;">
            <div style="background-color: #f97316; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">
              <span style="transform: rotate(45deg); font-size: 24px;">🛕</span>
            </div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        });

        L.marker([dest.lat, dest.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>🎯 Destination</b><br>${dest.name}`);

        setRouteDirections([]);
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, selectedCity, selectedDestination]);

  // Fetch actual road route from OSRM and draw on map
  const fetchAndDrawRoute = async (map, start, end) => {
    const L = window.L;
    
    try {
      // OSRM API endpoint for routing
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        
        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
        
        // Draw the route on the map
        const routeLine = L.polyline(latLngs, {
          color: '#FF6B35',
          weight: 5,
          opacity: 0.8
        }).addTo(map);
        
        // Fit map to show the entire route
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        
        // Generate turn-by-turn directions from OSRM steps
        generateDirectionsFromOSRM(route, start, end);
      } else {
        // Fallback to straight line if routing fails
        console.warn('OSRM routing failed, using straight line');
        drawStraightLine(map, start, end);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to straight line
      drawStraightLine(map, start, end);
    }
  };

  // Draw straight line as fallback
  const drawStraightLine = (map, start, end) => {
    const L = window.L;
    const routeLine = L.polyline(
      [[start.lat, start.lng], [end.lat, end.lng]],
      {
        color: '#FF6B35',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }
    ).addTo(map);
    
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    generateBasicDirections(start, end);
  };

  // Generate turn-by-turn directions from OSRM response
  const generateDirectionsFromOSRM = (route, start, end) => {
    const steps = route.legs[0].steps;
    const totalDistance = (route.distance / 1000).toFixed(1); // Convert to km
    const totalDuration = Math.round(route.duration / 60); // Convert to minutes
    
    const directions = steps.map((step, index) => {
      const distance = (step.distance / 1000).toFixed(1); // Convert to km
      const duration = Math.round(step.duration / 60); // Convert to minutes
      
      // Get instruction type and icon
      let icon = '➡️';
      let instruction = step.maneuver.type;
      
      if (step.maneuver.type === 'depart') {
        icon = '🚗';
        instruction = 'Start your journey';
      } else if (step.maneuver.type === 'arrive') {
        icon = '📍';
        instruction = 'Arrive at destination';
      } else if (step.maneuver.type.includes('turn')) {
        icon = step.maneuver.modifier?.includes('left') ? '↰' : '↱';
        instruction = `Turn ${step.maneuver.modifier || ''}`;
      } else if (step.maneuver.type === 'roundabout') {
        icon = '🔄';
        instruction = 'Take roundabout';
      } else if (step.maneuver.type.includes('merge')) {
        icon = '🛣️';
        instruction = 'Merge onto highway';
      }
      
      return {
        step: index + 1,
        icon: icon,
        instruction: instruction.charAt(0).toUpperCase() + instruction.slice(1),
        detail: step.name || 'Continue on this road',
        distance: `${distance} km`,
        duration: `${duration} min`
      };
    });
    
    setRouteDirections(directions);
  };

  // Generate basic turn-by-turn directions (fallback)
  const generateBasicDirections = (start, end) => {
    const distance = calculateDistance(start, end);
    const duration = calculateDurationFromDistance(distance);
    
    const directions = [
      {
        step: 1,
        icon: '🚗',
        instruction: `Start from your location`,
        detail: `Head towards ${end.name}`,
        distance: '0 km',
        duration: '0 min'
      },
      {
        step: 2,
        icon: '🛣️',
        instruction: 'Take the main highway',
        detail: 'Follow NH160 or Mumbai-Nashik Highway',
        distance: `${(parseFloat(distance) * 0.2).toFixed(1)} km`,
        duration: `${Math.round(parseFloat(duration.replace('h', '')) * 60 * 0.2)} min`
      },
      {
        step: 3,
        icon: '➡️',
        instruction: 'Continue on highway',
        detail: 'Follow signs towards Nashik city',
        distance: `${(parseFloat(distance) * 0.5).toFixed(1)} km`,
        duration: `${Math.round(parseFloat(duration.replace('h', '')) * 60 * 0.5)} min`
      },
      {
        step: 4,
        icon: '🔄',
        instruction: 'Take exit towards city center',
        detail: 'Follow signs for Nashik city center',
        distance: `${(parseFloat(distance) * 0.2).toFixed(1)} km`,
        duration: `${Math.round(parseFloat(duration.replace('h', '')) * 60 * 0.2)} min`
      },
      {
        step: 5,
        icon: '📍',
        instruction: `Arrive at ${end.name}`,
        detail: 'You have reached your destination',
        distance: '0 km',
        duration: '0 min'
      }
    ];
    
    setRouteDirections(directions);
  };



  // Get user's current location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser. Please select a city from the dropdown.');
      setIsLoadingLocation(false);
      return;
    }

    console.log('Requesting user location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setStartSearchQuery('Current Location');
        setIsLoadingLocation(false);
        console.log('User location obtained:', location);
        scrollToMap();
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access or select a city from the dropdown.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please select a city from the dropdown.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or select a city.';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
        console.log('Location error:', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // Search for starting location
  const searchStartLocation = async (query) => {
    if (query.length < 3) {
      setStartSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setStartSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Search for destination
  const searchDestination = async (query) => {
    if (query.length < 3) {
      setDestSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setDestSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Handle start location search input
  const handleStartSearchChange = (e) => {
    const query = e.target.value;
    setStartSearchQuery(query);
    setShowStartDropdown(true);
    if (query.length >= 3) {
      searchStartLocation(query);
    } else {
      setStartSearchResults([]);
    }
  };

  // Handle destination search input
  const handleDestSearchChange = (e) => {
    const query = e.target.value;
    setDestSearchQuery(query);
    setShowDestDropdown(true);
    if (query.length >= 3) {
      searchDestination(query);
    } else {
      setDestSearchResults([]);
    }
  };

  // Select start location from search results
  const selectStartLocation = (result) => {
    setUserLocation({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setSelectedCity(null);
    setStartSearchQuery(result.display_name);
    setShowStartDropdown(false);
    setStartSearchResults([]);
    scrollToMap();
  };

  // Select destination from search results
  const selectDestinationLocation = (result) => {
    const dest = {
      id: 'custom',
      name: result.display_name.split(',')[0],
      nameHindi: result.display_name.split(',')[0],
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      isMain: false
    };
    setSelectedDestination(dest);
    setDestSearchQuery(result.display_name);
    setShowDestDropdown(false);
    setDestSearchResults([]);
    scrollToMap();
  };

  // Set Kumbh Mela venue as destination
  const setKumbhMelaVenue = () => {
    const kumbhVenue = destinations[0]; // First destination is Kumbh Mela
    setSelectedDestination(kumbhVenue);
    setDestSearchQuery(kumbhVenue.name);
    setShowDestDropdown(false);
    scrollToMap();
  };

  // Auto-scroll to map when both locations are selected
  const scrollToMap = () => {
    if (mapSectionRef.current) {
      setTimeout(() => {
        mapSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  };



  // Calculate distance between two points using Haversine formula
  const calculateDistance = (start, end) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return `${Math.round(distance)} km`;
  };

  // Calculate duration from distance
  const calculateDurationFromDistance = (distanceStr) => {
    const distance = parseFloat(distanceStr.replace(' km', ''));
    const avgSpeed = 50; // km/h average speed
    const hours = Math.round(distance / avgSpeed * 10) / 10;
    return `${hours}h`;
  };

  const majorCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, distance: '180 km' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, distance: '220 km' },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, distance: '1,400 km' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, distance: '850 km' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, distance: '650 km' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, distance: '450 km' }
  ];

  const handleCitySelect = (cityName) => {
    const city = majorCities.find(c => c.name === cityName);
    if (city) {
      const location = { lat: city.lat, lng: city.lng };
      setSelectedCity(location);
      setUserLocation(null);
      scrollToMap();
    }
  };

  const roadTransportOptions = [
    {
      id: 'bus',
      name: 'State Transport Bus',
      nameHindi: 'राज्य परिवहन बस',
      icon: '🚌',
      description: 'Government operated buses',
      features: ['Affordable', 'Regular service', 'Multiple stops'],
      price: '₹200-500'
    },
    {
      id: 'private-bus',
      name: 'Private Bus',
      nameHindi: 'निजी बस',
      icon: '🚍',
      description: 'Private operators with AC/Non-AC',
      features: ['Comfortable', 'AC available', 'Direct routes'],
      price: '₹400-800'
    },
    {
      id: 'car',
      name: 'Car Rental',
      nameHindi: 'कार किराया',
      icon: '🚗',
      description: 'Self-drive or chauffeur driven',
      features: ['Flexible timing', 'Door-to-door', 'Privacy'],
      price: '₹2000-4000'
    },
    {
      id: 'taxi',
      name: 'Taxi/Cab',
      nameHindi: 'टैक्सी/कैब',
      icon: '🚕',
      description: 'Ola, Uber, local taxis',
      features: ['Convenient', 'Real-time booking', 'Multiple options'],
      price: '₹3000-6000'
    }
  ];

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
            Road Transport to Nashik
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            नासिक तक सड़क परिवहन
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the best road routes to Nashik with real-time navigation using Waze
          </p>
        </div>

        {/* Route Planning - Starting Point and Destination */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-6 text-center">
            Plan Your Route | अपना मार्ग योजना बनाएं
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starting Point - Left Side */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold text-kumbh-text">Starting Point</h3>
                  <p className="text-sm text-gray-600 font-devanagari">प्रारंभिक स्थान</p>
                </div>
              </div>

              {/* Search Box for Starting Point */}
              <div className="relative search-dropdown-container">
                <div className="relative">
                  <Input
                    type="text"
                    value={startSearchQuery}
                    onChange={handleStartSearchChange}
                    onFocus={() => setShowStartDropdown(true)}
                    placeholder="🔍 Search or type starting location..."
                    className="w-full h-12 text-base pr-10"
                  />
                  <Button
                    onClick={getUserLocation}
                    className="absolute right-1 top-1 h-10 px-3 bg-green-500 hover:bg-green-600 text-white"
                    title="Use Current Location"
                  >
                    📍
                  </Button>
                </div>

                {/* Search Results Dropdown */}
                {showStartDropdown && (startSearchResults.length > 0 || startSearchQuery.length === 0) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {startSearchQuery.length === 0 && (
                      <>
                        <div 
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => {
                            getUserLocation();
                            setShowStartDropdown(false);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">📍</span>
                            <span className="font-semibold">Use Current Location</span>
                          </div>
                        </div>
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold bg-gray-50">Quick Select:</div>
                        {majorCities.map((city) => (
                          <div
                            key={city.name}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              handleCitySelect(city.name);
                              setStartSearchQuery(city.name);
                              setShowStartDropdown(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🏙️</span>
                              <span>{city.name}</span>
                              <span className="text-gray-500 text-sm">({city.distance})</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {startSearchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectStartLocation(result)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📍</span>
                          <span className="text-sm">{result.display_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isLoadingLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-blue-800 text-sm">Getting your location...</p>
                  </div>
                </div>
              )}

              {userLocation && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Current Location:</p>
                      <p className="text-base font-bold text-gray-800">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedCity && !userLocation && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏙️</span>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Selected City:</p>
                      <p className="text-base font-bold text-gray-800">
                        {majorCities.find(c => c.lat === selectedCity.lat)?.name || 'City'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{locationError}</p>
                </div>
              )}
            </div>

            {/* Destination - Right Side */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  B
                </div>
                <div>
                  <h3 className="text-lg font-bold text-kumbh-text">Destination</h3>
                  <p className="text-sm text-gray-600 font-devanagari">गंतव्य</p>
                </div>
              </div>

              {/* Search Box for Destination */}
              <div className="relative search-dropdown-container">
                <div className="relative">
                  <Input
                    type="text"
                    value={destSearchQuery}
                    onChange={handleDestSearchChange}
                    onFocus={() => setShowDestDropdown(true)}
                    placeholder="🔍 Search or type destination..."
                    className="w-full h-12 text-base pr-10"
                  />
                  <Button
                    onClick={setKumbhMelaVenue}
                    className="absolute right-1 top-1 h-10 px-3 bg-orange-500 hover:bg-orange-600 text-white"
                    title="Kumbh Mela Venue"
                  >
                    🛕
                  </Button>
                </div>

                {/* Search Results Dropdown */}
                {showDestDropdown && (destSearchResults.length > 0 || destSearchQuery.length === 0) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {destSearchQuery.length === 0 && (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold bg-gray-50">Popular Destinations:</div>
                        {destinations.map((dest) => (
                          <div
                            key={dest.id}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setSelectedDestination(dest);
                              setDestSearchQuery(dest.name);
                              setShowDestDropdown(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              {dest.isMain && <span className="text-orange-500 text-lg">⭐</span>}
                              <div>
                                <p className={`text-sm ${dest.isMain ? 'font-bold' : ''}`}>{dest.name}</p>
                                <p className="text-xs text-gray-500 font-devanagari">{dest.nameHindi}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {destSearchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectDestinationLocation(result)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🛕</span>
                          <span className="text-sm">{result.display_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Selected Destination:</p>
                    <p className="text-base font-bold text-gray-800">{currentDestination.name}</p>
                    <p className="text-sm text-orange-600 font-devanagari">{currentDestination.nameHindi}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Summary */}
          {(userLocation || selectedCity) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 via-blue-50 to-orange-50 rounded-lg border-2 border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    A
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {userLocation 
                      ? `Your Location`
                      : selectedCity 
                      ? `${majorCities.find(c => c.lat === selectedCity.lat)?.name}`
                      : 'Start'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-2xl text-kumbh-orange">→</div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Distance</p>
                    <p className="text-sm font-bold text-kumbh-orange">
                      {calculateDistance(userLocation || selectedCity, currentDestination)}
                    </p>
                  </div>
                  <div className="text-2xl text-kumbh-orange">→</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {currentDestination.name.split('(')[0].trim()}
                  </span>
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    B
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Interactive Route Map */}
        <div ref={mapSectionRef} className="mb-8">
          <Card className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-kumbh-text">
                Interactive Route Map | इंटरैक्टिव मार्ग मानचित्र
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                View your route from starting point to destination
              </p>
            </div>

            {/* Map Container */}
            <div 
              ref={mapContainerRef}
              className="w-full rounded-lg overflow-hidden border-2 border-gray-300" 
              style={{ height: '500px', position: 'relative', zIndex: 1 }}
            />

            {/* Map Legend */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 via-gray-50 to-orange-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-around">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">📍</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Starting Point</p>
                    <p className="text-xs text-gray-500">Your Location</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="h-1 w-16 bg-orange-500 rounded"></div>
                  <span className="text-sm font-semibold text-gray-700">Road Route</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">🛕</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Destination</p>
                    <p className="text-xs text-gray-500">Kumbh Mela Venue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Instructions */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">How to use the map:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>📍 Green pin</strong> shows your starting point (your location)</li>
                    <li>• <strong>🛕 Orange temple</strong> shows your destination (Kumbh Mela venue)</li>
                    <li>• <strong>Orange line</strong> shows the actual road route following highways and streets</li>
                    <li>• Click on markers to see location details</li>
                    <li>• Zoom in/out using the + and - buttons on the map</li>
                    <li>• Drag the map to explore the route area</li>
                    <li>• The route is calculated using real road networks for accurate navigation</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Route Information Card */}
        {(userLocation || selectedCity) && (
          <Card className="p-6 mb-8">
            <h3 className="text-2xl font-bold text-kumbh-text mb-4">
              Route Information | मार्ग जानकारी
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-kumbh-light rounded-lg">
                <div className="text-3xl mb-2">🛣️</div>
                <h4 className="font-semibold text-kumbh-text mb-1">Estimated Distance</h4>
                <p className="text-2xl font-bold text-kumbh-orange">
                  {calculateDistance(userLocation || selectedCity, currentDestination)}
                </p>
              </div>
              <div className="text-center p-4 bg-kumbh-light rounded-lg">
                <div className="text-3xl mb-2">⏱️</div>
                <h4 className="font-semibold text-kumbh-text mb-1">Estimated Duration</h4>
                <p className="text-2xl font-bold text-kumbh-orange">
                  {calculateDurationFromDistance(calculateDistance(userLocation || selectedCity, currentDestination))}
                </p>
              </div>
              <div className="text-center p-4 bg-kumbh-light rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-kumbh-text mb-1">Destination</h4>
                <p className="text-lg font-bold text-kumbh-orange">{currentDestination.name}</p>
              </div>
            </div>

            {/* Turn-by-Turn Directions */}
            {routeDirections.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xl font-bold text-kumbh-text mb-4">
                  Turn-by-Turn Directions | चरणबद्ध दिशा-निर्देश
                </h4>
                <div className="space-y-3">
                  {routeDirections.map((direction, index) => (
                    <div 
                      key={index}
                      className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${
                        index === 0 ? 'bg-green-50 border-green-500' :
                        index === routeDirections.length - 1 ? 'bg-orange-50 border-orange-500' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className={`rounded-full w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0 ${
                        index === 0 ? 'bg-green-500 text-white' :
                        index === routeDirections.length - 1 ? 'bg-orange-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {direction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-800 text-lg">
                            Step {direction.step}: {direction.instruction}
                          </h5>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>🛣️ {direction.distance}</span>
                            <span>⏱️ {direction.duration}</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{direction.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> These are estimated directions. For real-time, accurate turn-by-turn navigation with live traffic updates, click the "Open in Waze App" button above. Waze will provide the most optimal route based on current traffic conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}



        {/* Transport Options */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-6">
            Road Transport Options | सड़क परिवहन विकल्प
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadTransportOptions.map((option) => (
              <Card key={option.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className="text-lg font-bold text-kumbh-text mb-2">
                    {option.name}
                  </h3>
                  <p className="font-devanagari text-kumbh-orange font-semibold mb-2 text-sm">
                    {option.nameHindi}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    {option.description}
                  </p>
                  <div className="mb-3">
                    <span className="text-lg font-bold text-kumbh-orange">
                      {option.price}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-kumbh-orange rounded-full"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                    size="sm"
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Travel Tips | यात्रा सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tip: 'Book tickets in advance during peak season', icon: '🎫' },
              { tip: 'Check road conditions before departure', icon: '🛣️' },
              { tip: 'Carry water and snacks for long journeys', icon: '🥤' },
              { tip: 'Keep emergency contact numbers handy', icon: '📞' },
              { tip: 'Check weather forecast for your route', icon: '🌤️' },
              { tip: 'Plan rest stops for long drives', icon: '⏸️' }
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
