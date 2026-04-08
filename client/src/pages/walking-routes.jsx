import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WalkingRoutes() {
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isInWalkingZone, setIsInWalkingZone] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Kumbh Mela center (Ramkund Ghat)
  const kumbhCenter = [20.008197, 73.792326];
  
  // Jatra Hotel location (for development/testing)
  const jatraHotelLocation = { lat: 19.9975, lng: 73.7898, name: 'Jatra Hotel, Nashik' };

  // Zone definitions (Zone 2 and Zone 3 are walking zones)
  const zones = {
    zone3: {
      id: 'zone3',
      name: 'Zone 3: Ghat Zone (Core)',
      nameHindi: 'ज़ोन 3: घाट क्षेत्र (केंद्र)',
      radius: 2000, // 2 km
      center: kumbhCenter,
      color: '#EF4444'
    },
    zone2: {
      id: 'zone2',
      name: 'Zone 2: Inner City Zone',
      nameHindi: 'ज़ोन 2: आंतरिक शहर क्षेत्र',
      radius: 7500, // 7.5 km
      center: kumbhCenter,
      color: '#F97316'
    }
  };

  const [selectedDestination, setSelectedDestination] = useState('');
  const [routeDirections, setRouteDirections] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Destinations: Ghats, Temples, and Areas of Interest
  const destinations = [
    // Ghats
    { id: 'ramkund-ghat', name: 'Ramkund Ghat', nameHindi: 'रामकुंड घाट', type: 'ghat', coordinates: [20.008197, 73.792326], description: 'Main bathing ghat' },
    { id: 'dasak-ghat', name: 'Dasak Ghat', nameHindi: 'दसक घाट', type: 'ghat', coordinates: [19.98767, 73.85796], description: 'Sector 10 ghat' },
    { id: 'takali-ghat', name: 'Takali Sangam Ghat', nameHindi: 'टाकळी संगम घाट', type: 'ghat', coordinates: [19.98936, 73.82216], description: 'Sector 1 ghat' },
    { id: 'gandhi-talav-ghat', name: 'Gandhi Talav Ghat', nameHindi: 'गांधी तलाव घाट', type: 'ghat', coordinates: [20.007767, 73.790707], description: 'Sector 5 & 7 ghat' },
    { id: 'godavari-ghat', name: 'Godavari Ghat', nameHindi: 'गोदावरी घाट', type: 'ghat', coordinates: [20.007, 73.793], description: 'Sacred river ghat' },
    
    // Temples
    { id: 'kala-ram-temple', name: 'Kala Ram Temple', nameHindi: 'काला राम मंदिर', type: 'temple', coordinates: [19.9975, 73.7898], description: 'Ancient Ram temple' },
    { id: 'sita-gufa', name: 'Sita Gufa', nameHindi: 'सीता गुफा', type: 'temple', coordinates: [20.006, 73.791], description: 'Cave where Sita lived' },
    { id: 'kapaleshwar-temple', name: 'Kapaleshwar Temple', nameHindi: 'कपालेश्वर मंदिर', type: 'temple', coordinates: [19.9995, 73.7918], description: 'Ancient Shiva temple' },
    { id: 'sundarnarayan-temple', name: 'Sundarnarayan Temple', nameHindi: 'सुंदरनारायण मंदिर', type: 'temple', coordinates: [19.9985, 73.7908], description: 'Vishnu temple' },
    { id: 'trimbakeshwar', name: 'Trimbakeshwar Temple', nameHindi: 'त्रिम्बकेश्वर मंदिर', type: 'temple', coordinates: [19.9333, 73.5333], description: 'One of 12 Jyotirlingas' },
    
    // Areas of Interest
    { id: 'panchavati', name: 'Panchavati', nameHindi: 'पंचवटी', type: 'area', coordinates: [20.005, 73.790], description: 'Historic religious area' },
    { id: 'saraf-bazaar', name: 'Saraf Bazaar', nameHindi: 'सराफ बाजार', type: 'area', coordinates: [20.000, 73.785], description: 'Traditional market' },
    { id: 'nashik-road-station', name: 'Nashik Road Railway Station', nameHindi: 'नासिक रोड रेलवे स्टेशन', type: 'area', coordinates: [19.9975, 73.7898], description: 'Main railway station' },
  ];

  // Popular routes
  const popularRoutes = [
    { id: 'to-ramkund', name: 'To Ramkund Ghat', nameHindi: 'रामकुंड घाट तक', destination: 'ramkund-ghat', icon: '🛕', distance: '~2 km' },
    { id: 'to-sita-gufa', name: 'To Sita Gufa', nameHindi: 'सीता गुफा तक', destination: 'sita-gufa', icon: '🏔️', distance: '~3 km' },
    { id: 'to-kala-ram', name: 'To Kala Ram Temple', nameHindi: 'काला राम मंदिर तक', destination: 'kala-ram-temple', icon: '🛕', distance: '~1.5 km' },
    { id: 'to-panchavati', name: 'To Panchavati', nameHindi: 'पंचवटी तक', destination: 'panchavati', icon: '🌳', distance: '~2.5 km' },
    { id: 'to-gandhi-talav', name: 'To Gandhi Talav Ghat', nameHindi: 'गांधी तलाव घाट तक', destination: 'gandhi-talav-ghat', icon: '🛕', distance: '~1.8 km' },
  ];

  // Walking routes within Zone 2 and Zone 3
  const walkingRoutes = [
    {
      id: 'temple-tour',
      name: 'Temple Circuit',
      nameHindi: 'मंदिर सर्किट',
      zone: 'zone3',
      distance: '4.2 km',
      duration: '1h 30m',
      difficulty: 'Easy',
      description: 'Visit major temples in the Ghat zone',
      descriptionHindi: 'घाट क्षेत्र के प्रमुख मंदिरों का दौरा',
      landmarks: [
        { name: 'Kala Ram Temple', nameHindi: 'काला राम मंदिर', coordinates: [19.9975, 73.7898] },
        { name: 'Sundarnarayan Temple', nameHindi: 'सुंदरनारायण मंदिर', coordinates: [19.9985, 73.7908] },
        { name: 'Kapaleshwar Temple', nameHindi: 'कपालेश्वर मंदिर', coordinates: [19.9995, 73.7918] }
      ],
      startPoint: { lat: 19.9975, lng: 73.7898 },
      endPoint: { lat: 19.9995, lng: 73.7918 }
    },
    {
      id: 'ghat-walk',
      name: 'Ghat Walking Tour',
      nameHindi: 'घाट वॉकिंग टूर',
      zone: 'zone3',
      distance: '3.8 km',
      duration: '1h 15m',
      difficulty: 'Easy',
      description: 'Explore the sacred ghats along Godavari river',
      descriptionHindi: 'गोदावरी नदी के किनारे पवित्र घाटों का अन्वेषण',
      landmarks: [
        { name: 'Ramkund Ghat', nameHindi: 'रामकुंड घाट', coordinates: [20.008197, 73.792326] },
        { name: 'Godavari Ghat', nameHindi: 'गोदावरी घाट', coordinates: [20.007, 73.793] },
        { name: 'Ahilyabai Holkar Ghat', nameHindi: 'अहिल्याबाई होलकर घाट', coordinates: [20.006, 73.794] }
      ],
      startPoint: { lat: 20.008197, lng: 73.792326 },
      endPoint: { lat: 20.006, lng: 73.794 }
    },
    {
      id: 'market-tour',
      name: 'Market & Shopping Walk',
      nameHindi: 'बाजार और खरीदारी वॉक',
      zone: 'zone2',
      distance: '2.5 km',
      duration: '2h 0m',
      difficulty: 'Easy',
      description: 'Explore local markets in inner city zone',
      descriptionHindi: 'आंतरिक शहर क्षेत्र में स्थानीय बाजारों का अन्वेषण',
      landmarks: [
        { name: 'Saraf Bazaar', nameHindi: 'सराफ बाजार', coordinates: [20.000, 73.785] },
        { name: 'Jewelry Market', nameHindi: 'ज्वैलरी मार्केट', coordinates: [20.001, 73.786] },
        { name: 'Spice Market', nameHindi: 'मसाला बाजार', coordinates: [20.002, 73.787] }
      ],
      startPoint: { lat: 20.000, lng: 73.785 },
      endPoint: { lat: 20.002, lng: 73.787 }
    },
    {
      id: 'heritage-walk',
      name: 'Heritage & History Walk',
      nameHindi: 'विरासत और इतिहास वॉक',
      zone: 'zone2',
      distance: '5.1 km',
      duration: '2h 30m',
      difficulty: 'Moderate',
      description: 'Discover Nashik\'s rich historical heritage',
      descriptionHindi: 'नासिक की समृद्ध ऐतिहासिक विरासत की खोज',
      landmarks: [
        { name: 'Panchavati', nameHindi: 'पंचवटी', coordinates: [20.005, 73.790] },
        { name: 'Sita Gufa', nameHindi: 'सीता गुफा', coordinates: [20.006, 73.791] },
        { name: 'Ancient Temples', nameHindi: 'प्राचीन मंदिर', coordinates: [20.007, 73.792] }
      ],
      startPoint: { lat: 20.005, lng: 73.790 },
      endPoint: { lat: 20.007, lng: 73.792 }
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Check user location on mount
  useEffect(() => {
    checkUserLocation();
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Check if user is in Zone 2 or Zone 3
  const isUserInWalkingZone = (lat, lng) => {
    const distanceFromCenter = calculateDistance(lat, lng, kumbhCenter[0], kumbhCenter[1]);
    // User is in walking zone if within 7.5 km (Zone 2 radius)
    return distanceFromCenter <= 7.5;
  };

  // Get user's current location
  const checkUserLocation = () => {
    setIsCheckingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          
          const inZone = isUserInWalkingZone(lat, lng);
          setIsInWalkingZone(inZone);
          setShowAccessDenied(!inZone);
          setIsCheckingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsCheckingLocation(false);
          setShowAccessDenied(true);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsCheckingLocation(false);
      setShowAccessDenied(true);
    }
  };

  // Proceed with fixed location (for development)
  const proceedWithFixedLocation = () => {
    setUserLocation(jatraHotelLocation);
    setIsInWalkingZone(true);
    setShowAccessDenied(false);
  };

  // Fetch route from OSRM API
  const fetchRoute = async (start, end) => {
    try {
      setIsLoadingRoute(true);
      const url = `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        const steps = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach((step) => {
            if (step.maneuver) {
              const maneuverType = step.maneuver.type;
              const modifier = step.maneuver.modifier || '';
              const roadName = step.name || 'the road';
              
              let instruction = '';
              if (maneuverType === 'depart') {
                instruction = `Head ${modifier} on ${roadName}`;
              } else if (maneuverType === 'arrive') {
                instruction = `Arrive at your destination`;
              } else if (maneuverType === 'turn') {
                instruction = `Turn ${modifier} onto ${roadName}`;
              } else if (maneuverType === 'continue') {
                instruction = `Continue on ${roadName}`;
              } else {
                instruction = `${maneuverType} ${modifier} onto ${roadName}`.trim();
              }
              
              steps.push({
                instruction,
                distance: `${(step.distance / 1000).toFixed(2)} km`,
                duration: `${Math.floor(step.duration / 60)} min`,
                type: step.maneuver.type
              });
            }
          });
        }
        
        setRouteDirections({
          coordinates,
          distance: (route.distance / 1000).toFixed(2),
          duration: Math.floor(route.duration / 60),
          steps
        });
        setIsLoadingRoute(false);
        return true;
      }
      
      setIsLoadingRoute(false);
      return false;
    } catch (error) {
      console.error('Error fetching route:', error);
      setIsLoadingRoute(false);
      return false;
    }
  };

  // Handle destination selection
  const handleDestinationSelect = async (destinationId) => {
    if (!userLocation) {
      alert('Unable to get your location. Please enable location services.');
      return;
    }

    setSelectedDestination(destinationId);
    const destination = destinations.find(d => d.id === destinationId);
    
    if (destination) {
      await fetchRoute(userLocation, destination.coordinates);
    }
  };

  // Handle popular route selection
  const handlePopularRouteSelect = async (routeId) => {
    const route = popularRoutes.find(r => r.id === routeId);
    if (route) {
      await handleDestinationSelect(route.destination);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map && isInWalkingZone) {
      const loadLeaflet = async () => {
        try {
          if (window.L) {
            initializeMap();
            return;
          }

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => initializeMap();
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error loading Leaflet:', error);
        }
      };

      const initializeMap = () => {
        try {
          const L = window.L;
          if (!L || !mapRef.current) return;

          // Center map on Kumbh center to show whole Zone 2
          const mapInstance = L.map(mapRef.current).setView(kumbhCenter, 12);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance);

          setMap(mapInstance);
        } catch (error) {
          console.error('Error creating map instance:', error);
        }
      };

      loadLeaflet();
    }
  }, [map, isInWalkingZone, userLocation]);

  // Add zones and markers to map
  useEffect(() => {
    if (map && window.L && isInWalkingZone) {
      try {
        // Clear existing layers
        map.eachLayer((layer) => {
          if (layer instanceof window.L.Marker || layer instanceof window.L.Circle || layer instanceof window.L.Polyline) {
            map.removeLayer(layer);
          }
        });

        // Draw Zone 2 circle (outer boundary)
        window.L.circle(kumbhCenter, {
          color: zones.zone2.color,
          fillColor: zones.zone2.color,
          fillOpacity: 0.05,
          weight: 3,
          radius: zones.zone2.radius
        }).addTo(map).bindPopup(`
          <div>
            <h3 class="font-bold" style="color: ${zones.zone2.color}">${zones.zone2.name}</h3>
            <p class="font-devanagari text-sm">${zones.zone2.nameHindi}</p>
          </div>
        `);

        // Draw Zone 3 circle (inner core)
        window.L.circle(kumbhCenter, {
          color: zones.zone3.color,
          fillColor: zones.zone3.color,
          fillOpacity: 0.08,
          weight: 4,
          radius: zones.zone3.radius,
          dashArray: '5, 5'
        }).addTo(map).bindPopup(`
          <div>
            <h3 class="font-bold" style="color: ${zones.zone3.color}">${zones.zone3.name}</h3>
            <p class="font-devanagari text-sm">${zones.zone3.nameHindi}</p>
          </div>
        `);

        // Add user location marker
        if (userLocation) {
          const userMarker = window.L.marker([userLocation.lat, userLocation.lng]).addTo(map);
          userMarker.bindPopup('Your Location');
          userMarker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #E91E63; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">📍</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          }));
        }

        // Removed: route markers with numbers (1-2-3) are no longer displayed

        // Add destination markers
        if (selectedDestination) {
          const destination = destinations.find(d => d.id === selectedDestination);
          if (destination) {
            const destMarker = window.L.marker(destination.coordinates).addTo(map);
            destMarker.bindPopup(`
              <div>
                <h3 class="font-bold">${destination.name}</h3>
                <p class="font-devanagari text-sm">${destination.nameHindi}</p>
                <p class="text-xs text-gray-600">${destination.description}</p>
              </div>
            `);
            destMarker.setIcon(window.L.divIcon({
              className: 'custom-marker',
              html: `<div style="background: #4CAF50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 16px;">🎯</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            }));
          }
        }

        // Draw route if available
        if (routeDirections && routeDirections.coordinates && routeDirections.coordinates.length > 0) {
          // Helper function to check if a point is in Zone 3
          const isInZone3 = (lat, lng) => {
            const distance = calculateDistance(lat, lng, kumbhCenter[0], kumbhCenter[1]);
            return distance <= 2; // Zone 3 radius is 2 km
          };

          // Split route into segments based on zones
          const segments = [];
          let currentSegment = {
            coords: [routeDirections.coordinates[0]],
            inZone3: isInZone3(routeDirections.coordinates[0][0], routeDirections.coordinates[0][1])
          };

          for (let i = 1; i < routeDirections.coordinates.length; i++) {
            const coord = routeDirections.coordinates[i];
            const inZone3 = isInZone3(coord[0], coord[1]);
            
            if (inZone3 === currentSegment.inZone3) {
              currentSegment.coords.push(coord);
            } else {
              // Zone changed, save current segment and start new one
              segments.push(currentSegment);
              currentSegment = {
                coords: [routeDirections.coordinates[i - 1], coord], // Include last point of previous segment
                inZone3: inZone3
              };
            }
          }
          segments.push(currentSegment);

          // Draw each segment with appropriate style
          const allPolylines = [];
          segments.forEach(segment => {
            const polyline = window.L.polyline(segment.coords, {
              color: '#2196F3',
              weight: 6,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: segment.inZone3 ? '10, 10' : '0' // Dotted in Zone 3, solid outside
            }).addTo(map);
            allPolylines.push(polyline);
          });

          // Add start and end markers
          const startMarker = window.L.marker(routeDirections.coordinates[0]).addTo(map);
          startMarker.bindPopup('Start Point');
          startMarker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #4CAF50; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 12px;">S</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          }));

          const endMarker = window.L.marker(routeDirections.coordinates[routeDirections.coordinates.length - 1]).addTo(map);
          endMarker.bindPopup('Destination');
          endMarker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #f44336; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 12px;">E</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          }));

          // Fit map to show entire route using the first polyline's bounds
          if (allPolylines.length > 0) {
            const bounds = window.L.latLngBounds(routeDirections.coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    }
  }, [map, isInWalkingZone, userLocation, selectedDestination, routeDirections]);



  // Access denied modal
  if (showAccessDenied && !isInWalkingZone) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-6">🚫</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Access Restricted
            </h1>
            <p className="font-devanagari text-2xl text-red-500 mb-6">
              प्रवेश प्रतिबंधित
            </p>
            <p className="text-lg text-gray-700 mb-6">
              You are not in the walking zone of Kumbh Mela.
            </p>
            <p className="text-md text-gray-600 mb-8">
              Walking routes are only available in Zone 2 (Inner City) and Zone 3 (Ghat Core).
              Please navigate to these zones first.
            </p>
            
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-3">Walking Zones:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: zones.zone3.color }}></div>
                  <span><strong>Zone 3:</strong> Within 2 km of Ramkund Ghat</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: zones.zone2.color }}></div>
                  <span><strong>Zone 2:</strong> Within 7.5 km of Ramkund Ghat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setLocation('/navigation')}
                  className="bg-kumbh-orange hover:bg-kumbh-orange/90 text-white px-8 py-3 text-lg"
                >
                  Go to Navigation
                </Button>
                <Button
                  onClick={checkUserLocation}
                  variant="outline"
                  className="px-8 py-3 text-lg"
                >
                  Check Location Again
                </Button>
              </div>
              
              {/* Development/Testing Button */}
              <div className="border-t-2 border-gray-300 pt-4 mt-2">
                <p className="text-sm text-gray-500 mb-3 text-center">
                  For Development/Testing Only
                </p>
                <Button
                  onClick={proceedWithFixedLocation}
                  variant="outline"
                  className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-3"
                >
                  🧪 Proceed Anyway (Use Fixed Location: {jatraHotelLocation.name})
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  This will use Jatra Hotel location for testing purposes
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isCheckingLocation) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="text-2xl font-bold mb-2">Checking Your Location...</h2>
          <p className="text-gray-600">Please wait while we verify your zone access.</p>
        </Card>
      </div>
    );
  }

  // Main content (only shown if user is in walking zone)
  return (
    <div className="min-h-screen bg-kumbh-bg">
      {/* Header */}
      <div className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setLocation('/transport/in-city')}
                variant="outline"
                size="sm"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-kumbh-text">
                  Walking Routes | <span className="font-devanagari text-kumbh-orange">पैदल मार्ग</span>
                </h1>
              </div>
            </div>
            <Badge className="bg-green-500 text-white px-3 py-1">
              ✓ In Walking Zone
            </Badge>
          </div>
        </div>
      </div>

      {/* Split Layout: Map (Left) and Controls (Right) */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Map */}
        <div className="w-1/2 relative z-0">
          <div 
            ref={mapRef} 
            className="w-full h-full"
          />
          {isLoadingRoute && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kumbh-orange"></div>
                <span className="text-sm font-semibold">Loading route...</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Navigation Controls */}
        <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
          {/* Destination Search */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Select Destination | गंतव्य चुनें
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search for Ghats, Temples & Areas
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => handleDestinationSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-kumbh-orange focus:outline-none text-base"
              >
                <option value="">-- Select a destination --</option>
                <optgroup label="🛕 Ghats">
                  {destinations.filter(d => d.type === 'ghat').map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name} | {dest.nameHindi}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏛️ Temples">
                  {destinations.filter(d => d.type === 'temple').map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name} | {dest.nameHindi}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📍 Areas of Interest">
                  {destinations.filter(d => d.type === 'area').map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name} | {dest.nameHindi}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {selectedDestination && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-kumbh-text">
                      {destinations.find(d => d.id === selectedDestination)?.name}
                    </h3>
                    <p className="font-devanagari text-sm text-kumbh-orange">
                      {destinations.find(d => d.id === selectedDestination)?.nameHindi}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {destinations.find(d => d.id === selectedDestination)?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Popular Routes */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-kumbh-text mb-4">
              Popular Routes | लोकप्रिय मार्ग
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {popularRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handlePopularRouteSelect(route.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    selectedDestination === route.destination
                      ? 'border-kumbh-orange bg-orange-50'
                      : 'border-gray-200 hover:border-kumbh-orange'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{route.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-kumbh-text">{route.name}</h3>
                      <p className="font-devanagari text-sm text-gray-600">{route.nameHindi}</p>
                    </div>
                    <div className="text-sm text-gray-500">{route.distance}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Route Directions */}
          {routeDirections && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-kumbh-text mb-4">
                Turn-by-Turn Directions | मार्ग निर्देश
              </h2>
              
              {/* Route Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl mb-1">📏</div>
                  <div className="text-sm text-gray-600">Distance</div>
                  <div className="text-lg font-bold text-kumbh-orange">{routeDirections.distance} km</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="text-lg font-bold text-kumbh-orange">{routeDirections.duration} min</div>
                </div>
              </div>

              {/* Step-by-Step Directions */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {routeDirections.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-kumbh-orange text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{step.instruction}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>📏 {step.distance}</span>
                        <span>⏱️ {step.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Navigation Button */}
              <Button
                onClick={() => setIsNavigating(true)}
                className="w-full mt-6 bg-kumbh-orange hover:bg-kumbh-orange/90 text-white py-6 text-lg font-semibold"
              >
                🚶 Start Walking Navigation
              </Button>
            </Card>
          )}

          {/* No Route Selected */}
          {!selectedDestination && !routeDirections && (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Select a Destination
              </h3>
              <p className="text-gray-600">
                Choose a ghat, temple, or area from the dropdown above or select a popular route to get started.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
