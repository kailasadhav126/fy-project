import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function TransportRoad() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Auto-get user location when component mounts
  useEffect(() => {
    if (mapLoaded) {
      console.log('Google Maps loaded, attempting to get user location...');
      getUserLocation();
    }
  }, [mapLoaded]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded');
        setMapLoaded(true);
        return;
      }

      // Use the API key directly for now
      const apiKey = 'AIzaSyDabQINVTQFBFRg9UMs2YZIvqXhZXntUAo';
      console.log('Loading Google Maps with API key:', apiKey);
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        setMapLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        setLocationError('Failed to load Google Maps. Please check your internet connection.');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

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
        setIsLoadingLocation(false);
        console.log('User location obtained:', location);
        
        // Automatically calculate route when location is obtained
        if (mapLoaded) {
          console.log('Calculating route from user location to Nashik...');
          calculateRoute(location);
        }
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

  // Initialize map
  const initializeMap = (center = { lat: 19.9975, lng: 73.7898 }) => {
    if (!mapLoaded || !window.google || !mapRef.current) {
      console.log('Map not ready:', { mapLoaded, google: !!window.google, mapRef: !!mapRef.current });
      return;
    }

    console.log('Initializing map with center:', center);
    
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: center,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Add a marker for Nashik with custom icon
    const nashikMarker = new window.google.maps.Marker({
      position: { lat: 19.9975, lng: 73.7898 },
      map: map,
      title: 'Nashik - Maha Kumbh 2026',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="#fff" stroke-width="2"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="bold">K</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Add info window for Nashik
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #FF6B35;">Nashik - Maha Kumbh 2026</h3>
          <p style="margin: 0; font-size: 14px;">Destination for your pilgrimage journey</p>
        </div>
      `
    });

    nashikMarker.addListener('click', () => {
      infoWindow.open(map, nashikMarker);
    });

    return map;
  };

  // Draw custom route on map
  const drawCustomRoute = (startLocation, endLocation = { lat: 19.9975, lng: 73.7898 }) => {
    if (!mapLoaded || !window.google) return;

    console.log('Drawing custom route from:', startLocation, 'to:', endLocation);

    // Initialize map
    const map = initializeMap(startLocation);
    if (!map) return;

    // Add start location marker
    const startMarker = new window.google.maps.Marker({
      position: startLocation,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#4CAF50" stroke="#fff" stroke-width="2"/>
            <text x="15" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">📍</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(30, 30)
      }
    });

    // Add end location marker (Nashik)
    const endMarker = new window.google.maps.Marker({
      position: endLocation,
      map: map,
      title: 'Nashik - Maha Kumbh 2026',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="#fff" stroke-width="2"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="bold">K</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Calculate intermediate waypoints for a more realistic route
    const waypoints = calculateWaypoints(startLocation, endLocation);
    
    // Create route path
    const routePath = new window.google.maps.Polyline({
      path: [startLocation, ...waypoints, endLocation],
      geodesic: true,
      strokeColor: '#FF6B35',
      strokeOpacity: 0.8,
      strokeWeight: 4
    });

    routePath.setMap(map);

    // Add info windows for markers
    const startInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #4CAF50;">Your Location</h3>
          <p style="margin: 0; font-size: 14px;">Starting point of your journey</p>
        </div>
      `
    });

    const endInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #FF6B35;">Nashik - Maha Kumbh 2026</h3>
          <p style="margin: 0; font-size: 14px;">Destination for your pilgrimage journey</p>
        </div>
      `
    });

    startMarker.addListener('click', () => {
      startInfoWindow.open(map, startMarker);
    });

    endMarker.addListener('click', () => {
      endInfoWindow.open(map, endMarker);
    });

    // Fit map to show both markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(startLocation);
    bounds.extend(endLocation);
    map.fitBounds(bounds);

    return map;
  };

  // Calculate waypoints for a more realistic route
  const calculateWaypoints = (start, end) => {
    const waypoints = [];
    const steps = 5; // Number of intermediate points
    
    for (let i = 1; i < steps; i++) {
      const lat = start.lat + (end.lat - start.lat) * (i / steps);
      const lng = start.lng + (end.lng - start.lng) * (i / steps);
      
      // Add some variation to make the route more realistic
      const variation = 0.01;
      const latVariation = (Math.random() - 0.5) * variation;
      const lngVariation = (Math.random() - 0.5) * variation;
      
      waypoints.push({
        lat: lat + latVariation,
        lng: lng + lngVariation
      });
    }
    
    return waypoints;
  };

  // Calculate route to Nashik
  const calculateRoute = (startLocation, endLocation = { lat: 19.9975, lng: 73.7898 }) => {
    if (!mapLoaded || !window.google) {
      console.log('Google Maps not loaded yet');
      return;
    }

    console.log('Calculating route from:', startLocation, 'to:', endLocation);

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#FF6B35',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    // Initialize map first
    const map = initializeMap(startLocation);
    if (!map) return;

    directionsRenderer.setMap(map);

    const request = {
      origin: startLocation,
      destination: endLocation,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidHighways: false,
      avoidTolls: false,
      unitSystem: window.google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        console.log('Route calculated successfully');
        directionsRenderer.setDirections(result);
        
        // Store detailed route information
        const routes = result.routes.map((route, index) => {
          const leg = route.legs[0];
          return {
            id: index,
            summary: route.summary || `Route ${index + 1}`,
            distance: leg.distance.text,
            duration: leg.duration.text,
            distanceValue: leg.distance.value,
            durationValue: leg.duration.value,
            steps: leg.steps,
            warnings: route.warnings || [],
            waypoint_order: route.waypoint_order || []
          };
        });
        
        setRouteInfo(routes);
        setSelectedRoute(routes[0]);
        
        // Log route details
        console.log('Available routes:', routes.length);
        routes.forEach((route, index) => {
          console.log(`Route ${index + 1}: ${route.distance} - ${route.duration}`);
        });
      } else {
        console.error('Directions request failed:', status);
        
        // Handle specific error cases
        let errorMessage = 'Route calculation failed. ';
        switch (status) {
          case 'REQUEST_DENIED':
            errorMessage += 'API key issue. Please check the Google Maps API configuration.';
            break;
          case 'ZERO_RESULTS':
            errorMessage += 'No routes found. Please try a different location.';
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage += 'API quota exceeded. Please try again later.';
            break;
          case 'INVALID_REQUEST':
            errorMessage += 'Invalid request. Please check the locations.';
            break;
          case 'UNKNOWN_ERROR':
            errorMessage += 'Unknown error occurred. Please try again.';
            break;
          default:
            errorMessage += `Error: ${status}. Please try selecting a different location.`;
        }
        
        setLocationError(errorMessage);
        
        // Draw custom route on map even when API fails
        console.log('Drawing custom route due to API failure');
        drawCustomRoute(startLocation, endLocation);
        
        // Show a fallback message with manual route info
        const fallbackRoutes = [
          {
            id: 0,
            summary: 'Via NH160 (Recommended)',
            distance: calculateDistance(startLocation, endLocation),
            duration: calculateDurationFromDistance(calculateDistance(startLocation, endLocation)),
            distanceValue: calculateDistanceValue(startLocation, endLocation),
            durationValue: calculateDurationValue(calculateDistance(startLocation, endLocation)),
            steps: [
              { instructions: `Start from your current location (${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)})` },
              { instructions: 'Head towards NH160 highway' },
              { instructions: 'Follow NH160 towards Nashik' },
              { instructions: 'Take exit towards Nashik city center' },
              { instructions: 'Arrive at Nashik - Maha Kumbh 2026 venue' }
            ],
            warnings: ['Route calculated offline - use GPS for real-time navigation']
          }
        ];
        setRouteInfo(fallbackRoutes);
        setSelectedRoute(fallbackRoutes[0]);
      }
    });
  };

  // Handle route calculation when user location is available
  useEffect(() => {
    if (userLocation && mapLoaded) {
      calculateRoute(userLocation);
    }
  }, [userLocation, mapLoaded]);

  // Initialize default map when Google Maps loads
  useEffect(() => {
    if (mapLoaded && !userLocation) {
      console.log('Initializing default map');
      initializeMap();
    }
  }, [mapLoaded]);

  const majorCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, distance: '180 km' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, distance: '220 km' },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, distance: '1,400 km' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, distance: '850 km' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, distance: '650 km' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, distance: '450 km' }
  ];

  const handleCitySelect = (city) => {
    const location = { lat: city.lat, lng: city.lng };
    setUserLocation(location);
    if (mapLoaded) {
      calculateRoute(location);
    } else {
      // Fallback route calculation without Google Maps API
      calculateFallbackRoute(city);
    }
  };

  // Fallback route calculation for when Google Maps API fails
  const calculateFallbackRoute = (city) => {
    console.log('Using fallback route calculation for:', city.name);
    
    const cityLocation = { lat: city.lat, lng: city.lng };
    const nashikLocation = { lat: 19.9975, lng: 73.7898 };
    
    // Draw custom route on map
    if (mapLoaded) {
      drawCustomRoute(cityLocation, nashikLocation);
    }
    
    const fallbackRoutes = [
      {
        id: 0,
        summary: `Via NH160 from ${city.name}`,
        distance: city.distance,
        duration: calculateDuration(city.distance),
        distanceValue: parseDistance(city.distance),
        durationValue: parseDuration(calculateDuration(city.distance)),
        steps: [
          { instructions: `Start from ${city.name}` },
          { instructions: 'Take NH160 towards Nashik' },
          { instructions: 'Follow signs to Nashik city center' },
          { instructions: 'Arrive at Nashik - Maha Kumbh 2026 venue' }
        ],
        warnings: ['Route calculated offline - use GPS for real-time navigation']
      }
    ];
    
    setRouteInfo(fallbackRoutes);
    setSelectedRoute(fallbackRoutes[0]);
  };

  // Helper function to calculate duration based on distance
  const calculateDuration = (distanceStr) => {
    const distance = parseDistance(distanceStr);
    const avgSpeed = 50; // km/h average speed
    const hours = Math.round(distance / avgSpeed * 10) / 10;
    return `${hours}h`;
  };

  // Helper function to parse distance string
  const parseDistance = (distanceStr) => {
    const match = distanceStr.match(/(\d+(?:,\d+)?)/);
    return match ? parseInt(match[1].replace(',', '')) * 1000 : 0;
  };

  // Helper function to parse duration string
  const parseDuration = (durationStr) => {
    const match = durationStr.match(/(\d+(?:\.\d+)?)h/);
    return match ? parseFloat(match[1]) * 3600 : 0;
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

  // Calculate distance value in meters
  const calculateDistanceValue = (start, end) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 1000); // Convert to meters
  };

  // Calculate duration from distance
  const calculateDurationFromDistance = (distanceStr) => {
    const distance = parseFloat(distanceStr.replace(' km', ''));
    const avgSpeed = 50; // km/h average speed
    const hours = Math.round(distance / avgSpeed * 10) / 10;
    return `${hours}h`;
  };

  // Calculate duration value in seconds
  const calculateDurationValue = (distanceStr) => {
    const distance = parseFloat(distanceStr.replace(' km', ''));
    const avgSpeed = 50; // km/h average speed
    const hours = distance / avgSpeed;
    return Math.round(hours * 3600); // Convert to seconds
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
            Find the best road routes to Nashik with real-time navigation
          </p>
        </div>

        {/* Location Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-kumbh-text mb-4">
            Your Location | आपका स्थान
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GPS Location */}
            <div>
              <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                Use Current Location | वर्तमान स्थान
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={getUserLocation}
                  disabled={isLoadingLocation}
                  className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                >
                  {isLoadingLocation ? 'Getting Location...' : '📍 Get My Location'}
                </Button>
                {locationError && (
                  <Button
                    onClick={getUserLocation}
                    variant="outline"
                    className="w-full text-kumbh-orange border-kumbh-orange hover:bg-kumbh-orange hover:text-white"
                  >
                    🔄 Try Again
                  </Button>
                )}
              </div>
              
              {userLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    ✅ Location found: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
              
              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-red-600 text-xl">❌</div>
                    <div className="flex-1">
                      <p className="text-red-800 text-sm mb-2">{locationError}</p>
                      <div className="space-y-2">
                        <p className="text-red-700 text-xs">
                          <strong>Solutions:</strong>
                        </p>
                        <ul className="text-red-700 text-xs space-y-1 ml-4">
                          <li>• Try selecting a city from the dropdown below</li>
                          <li>• Check your internet connection</li>
                          <li>• Refresh the page and try again</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Select from Major Cities */}
            <div>
              <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                Or Select from Major Cities | प्रमुख शहरों से चुनें
              </h3>
              <Select onValueChange={(value) => {
                const city = majorCities.find(c => c.name === value);
                if (city) handleCitySelect(city);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {majorCities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.distance})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Map and Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                Route Map | मार्ग मानचित्र
              </h3>
              {!mapLoaded ? (
                <div className="w-full h-96 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kumbh-orange mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading Google Maps...</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border"
                  style={{ minHeight: '400px' }}
                />
              )}
            </Card>
          </div>

          {/* Route Information */}
          <div>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                Route Options | मार्ग विकल्प
              </h3>
              {!userLocation ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-gray-600 text-sm">
                    Select a location above to see route options
                  </p>
                </div>
              ) : routeInfo && routeInfo.length > 0 ? (
                routeInfo.map((route) => (
                  <div 
                    key={route.id}
                    className={`p-4 rounded-lg mb-3 cursor-pointer transition-all duration-200 ${
                      selectedRoute?.id === route.id 
                        ? 'bg-kumbh-orange text-white shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">{route.summary}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedRoute?.id === route.id 
                          ? 'bg-white text-kumbh-orange' 
                          : 'bg-kumbh-orange text-white'
                      }`}>
                        Route {route.id + 1}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">🛣️</span>
                        <span className="opacity-90">{route.distance}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">⏱️</span>
                        <span className="opacity-90">{route.duration}</span>
                      </div>
                    </div>
                    {route.warnings && route.warnings.length > 0 && (
                      <div className="mt-2 text-xs opacity-75">
                        ⚠️ {route.warnings[0]}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">
                    Calculating routes...
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Selected Route Details */}
        {selectedRoute && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-kumbh-text mb-4">
              Selected Route Details | चयनित मार्ग विवरण
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-kumbh-light rounded-lg">
                <div className="text-3xl mb-2">🛣️</div>
                <h3 className="font-semibold text-kumbh-text mb-1">Distance</h3>
                <p className="text-2xl font-bold text-kumbh-orange">{selectedRoute.distance}</p>
              </div>
              <div className="text-center p-4 bg-kumbh-light rounded-lg">
                <div className="text-3xl mb-2">⏱️</div>
                <h3 className="font-semibold text-kumbh-text mb-1">Duration</h3>
                <p className="text-2xl font-bold text-kumbh-orange">{selectedRoute.duration}</p>
              </div>
              <div className="text-center p-4 bg-kumbh-light rounded-lg">
                <div className="text-3xl mb-2">🚗</div>
                <h3 className="font-semibold text-kumbh-text mb-1">Route Type</h3>
                <p className="text-lg font-bold text-kumbh-orange">Road Trip</p>
              </div>
            </div>
            
            {selectedRoute.steps && selectedRoute.steps.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-kumbh-text mb-3">
                  Turn-by-Turn Directions | चरणबद्ध दिशा-निर्देश
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedRoute.steps.slice(0, 10).map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                      <div className="bg-kumbh-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                    </div>
                  ))}
                  {selectedRoute.steps.length > 10 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      ... and {selectedRoute.steps.length - 10} more steps
                    </p>
                  )}
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
