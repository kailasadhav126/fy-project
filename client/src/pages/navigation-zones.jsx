import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NavigationZones() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [fromLocation, setFromLocation] = useState('current');
  const [toLocation, setToLocation] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [route, setRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  // Kumbh Mela center (Ramkund Ghat)
  const kumbhCenter = [20.008197, 73.792326];

  // Define three concentric zones from Kumbh Mela center (Ramkund)
  const zones = {
    zone3: {
      id: 'zone3',
      name: 'Zone 3: Ghat Zone (Core)',
      nameHindi: 'ज़ोन 3: घाट क्षेत्र (केंद्र)',
      description: 'Walking-only area around Ramkund & ghats (1-3 km)',
      color: '#EF4444',
      type: 'walking',
      icon: '🚶',
      radius: 2000,
      center: kumbhCenter
    },
    zone2: {
      id: 'zone2',
      name: 'Zone 2: Inner City Zone',
      nameHindi: 'ज़ोन 2: आंतरिक शहर क्षेत्र',
      description: 'Inside Nashik city, closer parking & limited access (5-10 km)',
      color: '#F97316',
      type: 'vehicle',
      icon: '🚌',
      radius: 7500,
      center: kumbhCenter
    },
    zone1: {
      id: 'zone1',
      name: 'Zone 1: Outer Zone (Outskirts)',
      nameHindi: 'ज़ोन 1: बाहरी क्षेत्र (बाहरी इलाका)',
      description: 'Entry to Nashik city, large outer parking, shuttle booking (15-20 km)',
      color: '#84CC16',
      type: 'vehicle',
      icon: '🚗',
      radius: 17500,
      center: kumbhCenter
    }
  };

  // Outer parking locations
  const outerParking = [
    { id: 'bkc-adgaon', name: 'BKC Parking, Adgaon', nameHindi: 'बीकेसी पार्किंग, अडगांव', coordinates: [20.064771, 73.844124], capacity: '800 vehicles' },
    { id: 'muhs', name: 'MUHS Parking', nameHindi: 'एमयूएचएस पार्किंग', coordinates: [20.077130, 73.814715], capacity: '600 vehicles' },
    { id: 'thakkar', name: 'Thakkar Ground Parking', nameHindi: 'ठक्कर मैदान पार्किंग', coordinates: [20.006042, 73.772655], capacity: '1000 vehicles' },
    { id: 'wasali', name: 'Wasali Parking', nameHindi: 'वसाली पार्किंग', coordinates: [20.000381, 73.674190], capacity: '400 vehicles' },
    { id: 'eklahare', name: 'Eklahare Parking', nameHindi: 'एकलहरे पार्किंग', coordinates: [19.967357, 73.864398], capacity: '350 vehicles' },
    { id: 'ambad', name: 'Ambad Parking', nameHindi: 'अंबाड पार्किंग', coordinates: [19.934047, 73.705139], capacity: '450 vehicles' }
  ];

  // Inner parking locations
  const innerParking = [
    { id: 'nilgiri', name: 'Nilgiri Bagh Parking', nameHindi: 'निलगिरी बाग पार्किंग', coordinates: [19.997404, 73.827314], capacity: '500 vehicles' },
    { id: 'krishi', name: 'Krishi Utpanna Bazar', nameHindi: 'कृषि उत्पन्न बाजार', coordinates: [20.017729, 73.800076], capacity: '300 vehicles' }
  ];

  // Ghat locations (walking destinations)
  const ghats = [
    { id: 'ramkund', name: 'Ramkund Ghat', nameHindi: 'रामकुंड घाट', coordinates: [20.008197, 73.792326], sector: 'Main' },
    { id: 'dasak', name: 'Dasak Ghat', nameHindi: 'दसक घाट', coordinates: [19.98767, 73.85796], sector: 'Sector 10' },
    { id: 'takali', name: 'Takali Sangam Ghat', nameHindi: 'टाकळी संगम घाट', coordinates: [19.98936, 73.82216], sector: 'Sector 1' },
    { id: 'talkuteshwar', name: 'Talkuteshwar Ghat', nameHindi: 'टाळकुटेश्वर घाट', coordinates: [20.001333, 73.798034], sector: 'Sector 6' },
    { id: 'laxminarayan', name: 'Laxminarayan Ghat', nameHindi: 'लक्ष्मीनारायण घाट', coordinates: [20.001502, 73.804025], sector: 'Sector 3' },
    { id: 'gandhi-talav', name: 'Gandhi Talav Ghat', nameHindi: 'गांधी तलाव घाट', coordinates: [20.007767, 73.790707], sector: 'Sector 5 & 7' }
  ];

  // Major Indian cities (for users coming from different locations)
  const majorCities = [
    { id: 'mumbai', name: 'Mumbai', nameHindi: 'मुंबई', coordinates: [19.0760, 72.8777], distance: '~170 km' },
    { id: 'pune', name: 'Pune', nameHindi: 'पुणे', coordinates: [18.5204, 73.8567], distance: '~210 km' },
    { id: 'delhi', name: 'Delhi', nameHindi: 'दिल्ली', coordinates: [28.7041, 77.1025], distance: '~1,200 km' },
    { id: 'ahmedabad', name: 'Ahmedabad', nameHindi: 'अहमदाबाद', coordinates: [23.0225, 72.5714], distance: '~450 km' },
    { id: 'surat', name: 'Surat', nameHindi: 'सूरत', coordinates: [21.1702, 72.8311], distance: '~280 km' },
    { id: 'indore', name: 'Indore', nameHindi: 'इंदौर', coordinates: [22.7196, 75.8577], distance: '~380 km' },
    { id: 'nagpur', name: 'Nagpur', nameHindi: 'नागपुर', coordinates: [21.1458, 79.0882], distance: '~450 km' },
    { id: 'aurangabad', name: 'Aurangabad', nameHindi: 'औरंगाबाद', coordinates: [19.8762, 75.3433], distance: '~220 km' },
    { id: 'thane', name: 'Thane', nameHindi: 'ठाणे', coordinates: [19.2183, 72.9781], distance: '~150 km' },
    { id: 'kolkata', name: 'Kolkata', nameHindi: 'कोलकाता', coordinates: [22.5726, 88.3639], distance: '~1,900 km' },
    { id: 'hyderabad', name: 'Hyderabad', nameHindi: 'हैदराबाद', coordinates: [17.3850, 78.4867], distance: '~650 km' },
    { id: 'bangalore', name: 'Bangalore', nameHindi: 'बेंगलुरु', coordinates: [12.9716, 77.5946], distance: '~850 km' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Initialize OpenStreetMap
  useEffect(() => {
    if (mapRef.current && !map) {
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
  }, [map]);

  // Add zone overlays and markers to map
  useEffect(() => {
    if (map && window.L) {
      try {
        map.eachLayer((layer) => {
          if (layer instanceof window.L.Marker || layer instanceof window.L.Polygon || layer instanceof window.L.Polyline) {
            map.removeLayer(layer);
          }
        });

        // Draw three concentric zone circles
        // Zone 1: Outer Zone (Light Green) - 17.5km
        window.L.circle(kumbhCenter, {
          color: zones.zone1.color,
          fillColor: zones.zone1.color,
          fillOpacity: 0.02,
          weight: 3,
          radius: zones.zone1.radius
        }).addTo(map).bindPopup(`
          <div>
            <h3 class="font-bold" style="color: ${zones.zone1.color}">${zones.zone1.name}</h3>
            <p class="font-devanagari text-sm">${zones.zone1.nameHindi}</p>
            <p class="text-sm mt-2">${zones.zone1.icon} ${zones.zone1.description}</p>
          </div>
        `);

        // Zone 2: Inner City Zone (Orange) - 7.5km
        window.L.circle(kumbhCenter, {
          color: zones.zone2.color,
          fillColor: zones.zone2.color,
          fillOpacity: 0.04,
          weight: 3,
          radius: zones.zone2.radius
        }).addTo(map).bindPopup(`
          <div>
            <h3 class="font-bold" style="color: ${zones.zone2.color}">${zones.zone2.name}</h3>
            <p class="font-devanagari text-sm">${zones.zone2.nameHindi}</p>
            <p class="text-sm mt-2">${zones.zone2.icon} ${zones.zone2.description}</p>
          </div>
        `);

        // Zone 3: Ghat Zone (Red) - 2km
        window.L.circle(kumbhCenter, {
          color: zones.zone3.color,
          fillColor: zones.zone3.color,
          fillOpacity: 0.06,
          weight: 4,
          radius: zones.zone3.radius,
          dashArray: '5, 5'
        }).addTo(map).bindPopup(`
          <div>
            <h3 class="font-bold" style="color: ${zones.zone3.color}">${zones.zone3.name}</h3>
            <p class="font-devanagari text-sm">${zones.zone3.nameHindi}</p>
            <p class="text-sm mt-2">${zones.zone3.icon} <strong>Walking Only - No Vehicles</strong></p>
            <p class="text-sm">${zones.zone3.description}</p>
          </div>
        `);

        // Add outer parking markers
        outerParking.forEach((parking) => {
          const marker = window.L.marker(parking.coordinates).addTo(map);
          marker.bindPopup(`
            <div>
              <h3 class="font-bold">${parking.name}</h3>
              <p class="font-devanagari text-sm">${parking.nameHindi}</p>
              <p class="text-sm"><strong>Capacity:</strong> ${parking.capacity}</p>
              <p class="text-xs text-green-600 mt-1">Outer Parking</p>
            </div>
          `);
          marker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #4CAF50; color: white; border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">P</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          }));
        });

        // Add inner parking markers
        innerParking.forEach((parking) => {
          const marker = window.L.marker(parking.coordinates).addTo(map);
          marker.bindPopup(`
            <div>
              <h3 class="font-bold">${parking.name}</h3>
              <p class="font-devanagari text-sm">${parking.nameHindi}</p>
              <p class="text-sm"><strong>Capacity:</strong> ${parking.capacity}</p>
              <p class="text-xs text-orange-600 mt-1">Inner Parking</p>
            </div>
          `);
          marker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #FF9800; color: white; border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">P</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          }));
        });

        // Add ghat markers
        ghats.forEach((ghat) => {
          const marker = window.L.marker(ghat.coordinates).addTo(map);
          marker.bindPopup(`
            <div>
              <h3 class="font-bold">${ghat.name}</h3>
              <p class="font-devanagari text-sm">${ghat.nameHindi}</p>
              <p class="text-sm"><strong>Sector:</strong> ${ghat.sector}</p>
              <p class="text-xs text-blue-600 mt-1">Ghat (Walking Zone)</p>
            </div>
          `);
          marker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #2196F3; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">G</div>`,
            iconSize: [35, 35],
            iconAnchor: [17, 17]
          }));
        });

        // Add user location marker
        if (userLocation) {
          const userMarker = window.L.marker([userLocation.lat, userLocation.lng]).addTo(map);
          userMarker.bindPopup('Your Location');
          userMarker.setIcon(window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #E91E63; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; animation: pulse 2s infinite;">📍</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          }));
        }

        // Draw route if available - split by zones
        if (route && route.coordinates && route.coordinates.length > 0 && !route.loading) {
          // Split route into segments based on zones
          const segments = [];
          let currentSegment = {
            coords: [route.coordinates[0]],
            zone: getZoneForCoordinate(route.coordinates[0][0], route.coordinates[0][1])
          };

          for (let i = 1; i < route.coordinates.length; i++) {
            const coord = route.coordinates[i];
            const zone = getZoneForCoordinate(coord[0], coord[1]);
            
            if (zone === currentSegment.zone) {
              currentSegment.coords.push(coord);
            } else {
              // Zone changed, save current segment and start new one
              segments.push(currentSegment);
              currentSegment = {
                coords: [route.coordinates[i - 1], coord], // Include last point of previous segment
                zone: zone
              };
            }
          }
          segments.push(currentSegment);

          // Draw each segment with appropriate style
          segments.forEach(segment => {
            const zoneColors = {
              'zone1': '#84CC16',  // Light Green
              'zone2': '#F97316',  // Orange
              'zone3': '#EF4444'   // Red
            };

            const polyline = window.L.polyline(segment.coords, {
              color: zoneColors[segment.zone] || '#4CAF50',
              weight: 6,
              opacity: 0.9,
              dashArray: segment.zone === 'zone3' ? '10, 10' : '0', // Dotted only for Zone 3
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);

            // Add popup to show zone info
            polyline.bindPopup(`
              <div>
                <strong>${zones[segment.zone].name}</strong><br/>
                <span class="text-sm">${segment.zone === 'zone3' ? '🚶 Walking Only' : '🚗 Vehicle Allowed'}</span>
              </div>
            `);
          });

          // Fit map to show entire route
          const allCoords = route.coordinates;
          const bounds = window.L.latLngBounds(allCoords);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    }
  }, [map, selectedZone, userLocation, route]);

  // Auto-trigger navigation when city or custom location is selected
  useEffect(() => {
    const autoNavigate = async () => {
      // Only auto-navigate if both from and to locations are selected
      // and we're not already navigating
      if (!fromLocation || !toLocation || isNavigating) {
        return;
      }

      // Check if fromLocation is a city (not 'current')
      const isFromCity = majorCities.some(city => city.id === fromLocation);
      
      // Auto-navigate if user selected a city or has a valid location
      if (isFromCity || (fromLocation === 'current' && userLocation)) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          handleStartNavigation();
        }, 500);
      }
    };

    autoNavigate();
  }, [fromLocation, toLocation]);

  // Get user location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setFromLocation('current');
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Determine which zone a coordinate is in based on distance from Kumbh center
  const getZoneForCoordinate = (lat, lng) => {
    const distanceFromCenter = calculateDistance(lat, lng, kumbhCenter[0], kumbhCenter[1]);
    
    // Zone 3: Within 2km of Ramkund (Ghat Zone - walking only)
    if (distanceFromCenter <= 2) {
      return 'zone3';
    }
    
    // Zone 2: Between 2km and 7.5km from Ramkund (Inner City Zone)
    if (distanceFromCenter <= 7.5) {
      return 'zone2';
    }
    
    // Zone 1: Beyond 7.5km up to 17.5km (Outer Zone)
    return 'zone1';
  };

  // Fetch real road route from OSRM
  const fetchRoadRoute = async (start, end, profile = 'driving') => {
    try {
      // OSRM API endpoint (free public server)
      const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Extract turn-by-turn instructions
        const instructions = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach((step, index) => {
            if (step.maneuver) {
              // Generate instruction from maneuver type and modifier
              let instruction = '';
              const maneuverType = step.maneuver.type;
              const modifier = step.maneuver.modifier || '';
              const roadName = step.name || 'the road';
              
              // Create human-readable instructions
              if (maneuverType === 'depart') {
                instruction = `Head ${modifier} on ${roadName}`;
              } else if (maneuverType === 'arrive') {
                instruction = `Arrive at your destination`;
              } else if (maneuverType === 'turn') {
                instruction = `Turn ${modifier} onto ${roadName}`;
              } else if (maneuverType === 'merge') {
                instruction = `Merge ${modifier} onto ${roadName}`;
              } else if (maneuverType === 'roundabout') {
                instruction = `Take the roundabout and exit onto ${roadName}`;
              } else if (maneuverType === 'continue') {
                instruction = `Continue on ${roadName}`;
              } else if (maneuverType === 'fork') {
                instruction = `At the fork, keep ${modifier} onto ${roadName}`;
              } else if (maneuverType === 'ramp') {
                instruction = `Take the ramp ${modifier} onto ${roadName}`;
              } else {
                instruction = `${maneuverType} ${modifier} onto ${roadName}`.trim();
              }
              
              instructions.push({
                instruction: instruction,
                distance: `${(step.distance / 1000).toFixed(2)} km`,
                duration: `${Math.floor(step.duration / 60)} min`,
                type: step.maneuver.type
              });
            }
          });
        }
        
        return {
          coordinates: coordinates,
          distance: (route.distance / 1000).toFixed(1), // Convert to km
          duration: Math.floor(route.duration / 60), // Convert to minutes
          instructions: instructions
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching route from OSRM:', error);
      return null;
    }
  };

  // Generate route with zone transitions and real road routing
  const generateZonedRoute = async (start, end) => {
    const startZone = getZoneForCoordinate(start.lat, start.lng);
    const endZone = getZoneForCoordinate(end[0], end[1]);

    // Determine routing profile based on zones
    let profile = 'driving';
    if (startZone === 'zone3' || endZone === 'zone3') {
      profile = 'foot'; // Walking profile for zone 3
    }

    // Fetch real road route
    const roadRoute = await fetchRoadRoute(start, end, profile);
    
    let routeCoordinates, distance, duration, roadInstructions;
    
    if (roadRoute) {
      // Use real road route
      routeCoordinates = roadRoute.coordinates;
      distance = roadRoute.distance;
      duration = roadRoute.duration;
      roadInstructions = roadRoute.instructions;
    } else {
      // Fallback to straight line if API fails
      const straightDistance = calculateDistance(start.lat, start.lng, end[0], end[1]);
      routeCoordinates = [[start.lat, start.lng], [end[0], end[1]]];
      distance = straightDistance.toFixed(1);
      duration = Math.floor(straightDistance * 3);
      roadInstructions = [];
    }

    // Generate zone-specific instructions
    const steps = [];
    let currentZone = startZone;

    steps.push({
      instruction: `Start from your location in ${zones[startZone].name}`,
      zone: startZone,
      type: zones[startZone].type,
      distance: '0 m'
    });

    // Add road instructions if available
    if (roadInstructions && roadInstructions.length > 0) {
      roadInstructions.forEach((instr, index) => {
        // Determine zone based on progress through route
        const progress = index / roadInstructions.length;
        let stepZone = startZone;
        
        if (startZone !== endZone) {
          if (progress > 0.7 && endZone === 'zone3') {
            stepZone = 'zone3';
          } else if (progress > 0.4 && (startZone === 'zone1' && endZone !== 'zone1')) {
            stepZone = 'zone2';
          }
        }
        
        steps.push({
          instruction: instr.instruction,
          zone: stepZone,
          type: stepZone === 'zone3' ? 'walking' : 'vehicle',
          distance: instr.distance
        });
      });
    }

    // Add zone transition warnings
    if (startZone !== endZone) {
      if ((startZone === 'zone1' || startZone === 'zone2') && endZone === 'zone3') {
        steps.push({
          instruction: '🚶 Park your vehicle and continue on foot (Zone 3 - Walking Only)',
          zone: 'zone3',
          type: 'walking',
          distance: `${(parseFloat(distance) * 0.2).toFixed(1)} km`,
          warning: 'No vehicles allowed beyond this point'
        });
      }
    }

    steps.push({
      instruction: `Arrive at destination`,
      zone: endZone,
      type: zones[endZone].type,
      distance: '0 m'
    });

    return {
      coordinates: routeCoordinates,
      distance: `${distance} km`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      steps: steps,
      zones: [startZone, endZone],
      zone: endZone
    };
  };

  // Handle navigation start
  const handleStartNavigation = async () => {
    let startCoords;

    if (fromLocation === 'current') {
      if (!userLocation) {
        alert('Please get your location first.');
        return;
      }
      startCoords = userLocation;
    } else {
      const fromPlace = [...majorCities, ...outerParking, ...innerParking, ...ghats].find(p => p.id === fromLocation);
      if (!fromPlace) {
        alert('Please select a starting location.');
        return;
      }
      startCoords = { lat: fromPlace.coordinates[0], lng: fromPlace.coordinates[1] };
    }

    if (!toLocation) {
      alert('Please select a destination.');
      return;
    }

    const destination = [...outerParking, ...innerParking, ...ghats].find(p => p.id === toLocation);
    if (!destination) {
      alert('Destination not found.');
      return;
    }

    // Show loading state
    setIsNavigating(true);
    setRoute({ loading: true });

    // Scroll to map section
    setTimeout(() => {
      if (mapSectionRef.current) {
        mapSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);

    try {
      const generatedRoute = await generateZonedRoute(startCoords, destination.coordinates);
      setRoute(generatedRoute);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error generating route:', error);
      alert('Failed to generate route. Please try again.');
      setIsNavigating(false);
      setRoute(null);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setRoute(null);
    setCurrentStep(0);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-kumbh-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Navigation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setLocation('/')}>Go to Home</Button>
          </Card>
        </div>
      </div>
    );
  }

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
            Kumbh Mela Zone Navigation
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            कुंभ मेला ज़ोन नेविगेशन
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Navigate through three zones: Outer Zone → Inner City → Ghat Core (Walking Only)
          </p>
        </div>

        {/* Navigation Controls */}
        <Card className="p-6 mb-8 relative z-20">
          <h2 className="text-2xl font-bold text-kumbh-text mb-6">
            Plan Your Route | अपना मार्ग योजना बनाएं
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* From Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From | से
              </label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select starting point" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">📍 Current Location | वर्तमान स्थान</SelectItem>
                  <SelectItem value="separator-0" disabled className="text-xs font-bold text-purple-600 bg-purple-50">
                    🏙️ Major Cities
                  </SelectItem>
                  {majorCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      ���️ {city.name} ({city.distance})
                    </SelectItem>
                  ))}
                  <SelectItem value="separator-1" disabled className="text-xs font-bold text-green-600 bg-green-50">
                    � Outer Parrking (Zone 1)
                  </SelectItem>
                  {outerParking.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      🅿️ {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="separator-2" disabled className="text-xs font-bold text-orange-600 bg-orange-50">
                    �  Inner Parking (Zone 2)
                  </SelectItem>
                  {innerParking.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      🅿️ {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="separator-3" disabled className="text-xs font-bold text-blue-600 bg-blue-50">
                    🚶 Ghats (Zone 3)
                  </SelectItem>
                  {ghats.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      🛕 {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To | तक
              </label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="separator-1" disabled className="text-xs font-bold text-green-600 bg-green-50">
                    🚗 Outer Parking (Zone 1)
                  </SelectItem>
                  {outerParking.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      🅿️ {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="separator-2" disabled className="text-xs font-bold text-orange-600 bg-orange-50">
                    🚌 Inner Parking (Zone 2)
                  </SelectItem>
                  {innerParking.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      🅿️ {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="separator-3" disabled className="text-xs font-bold text-blue-600 bg-blue-50">
                    🚶 Ghats (Zone 3)
                  </SelectItem>
                  {ghats.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      🛕 {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-2">
              <Button
                onClick={handleGetUserLocation}
                variant="outline"
                className="flex-1 border-kumbh-orange text-kumbh-orange hover:bg-kumbh-orange hover:text-white"
              >
                📍 Get Location
              </Button>
              <Button
                onClick={handleStartNavigation}
                className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep"
              >
                🗺️ Navigate
              </Button>
            </div>
          </div>

          {/* User Location Status */}
          {userLocation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Location enabled: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
        </Card>

        {/* Map Container */}
        <Card ref={mapSectionRef} className="p-6 mb-8 relative z-10">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-kumbh-text">
              Interactive Zone Map | इंटरैक्टिव ज़ोन मैप
            </h2>
            {isNavigating && (
              <Button
                onClick={handleStopNavigation}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Stop Navigation
              </Button>
            )}
          </div>

          <div 
            ref={mapRef} 
            className="w-full h-[600px] rounded-lg border-2 border-gray-300"
            style={{ minHeight: '600px' }}
          />

          {/* Map Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm">Zone 1 (Outer)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span className="text-sm">Zone 2 (Inner)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <span className="text-sm">Zone 3 (Walking)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
              <span className="text-sm">Your Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Ghats</span>
            </div>
          </div>
        </Card>

        {/* Route Instructions */}
        {isNavigating && route && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Turn-by-Turn Directions | मार्गदर्शन
            </h2>

            {route.loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-kumbh-orange mb-4"></div>
                <p className="text-gray-600">Calculating best route along roads...</p>
                <p className="text-sm text-gray-500 mt-2">Fetching real-time directions</p>
              </div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Distance</div>
                    <div className="text-2xl font-bold text-blue-600">{route.distance}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
                    <div className="text-2xl font-bold text-green-600">{route.duration}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Current Step</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {currentStep + 1} / {route.steps.length}
                    </div>
              </div>
            </div>

            {/* Current Step */}
            <div className="mb-6 p-6 bg-gradient-to-r from-kumbh-orange to-kumbh-deep text-white rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-90 mb-1">Step {currentStep + 1}</div>
                  <div className="text-2xl font-bold">{route.steps[currentStep].instruction}</div>
                </div>
                <div className="text-4xl">
                  {route.steps[currentStep].type === 'walking' ? '🚶' : '🚗'}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white text-kumbh-orange">
                  {route.steps[currentStep].distance}
                </Badge>
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: zones[route.steps[currentStep].zone].color }}
                >
                  {zones[route.steps[currentStep].zone].name.split(':')[0]}
                </Badge>
              </div>
              {route.steps[currentStep].warning && (
                <div className="mt-4 p-3 bg-yellow-500 text-white rounded">
                  ⚠️ {route.steps[currentStep].warning}
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                variant="outline"
                className="flex-1"
              >
                ← Previous Step
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(route.steps.length - 1, currentStep + 1))}
                disabled={currentStep === route.steps.length - 1}
                className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep"
              >
                Next Step →
              </Button>
            </div>

            {/* All Steps */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-kumbh-text mb-3">All Steps</h3>
              {route.steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    index === currentStep
                      ? 'border-kumbh-orange bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: zones[step.zone].color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{step.instruction}</div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{step.distance}</Badge>
                          <Badge 
                            className="text-white"
                            style={{ backgroundColor: zones[step.zone].color }}
                          >
                            {zones[step.zone].name.split(':')[0]}
                          </Badge>
                          <Badge variant="outline">
                            {step.type === 'walking' ? '🚶 Walking' : '🚗 Vehicle'}
                          </Badge>
                        </div>
                        {step.warning && (
                          <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                            ⚠️ {step.warning}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </Card>
        )}

        {/* Zone Filter */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
            <Button
              variant={selectedZone === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedZone('all')}
              className={selectedZone === 'all' ? 'bg-kumbh-orange text-white' : ''}
            >
              All Zones
            </Button>
            {Object.values(zones).map((zone) => (
              <Button
                key={zone.id}
                variant={selectedZone === zone.id ? 'default' : 'ghost'}
                onClick={() => setSelectedZone(zone.id)}
                className={selectedZone === zone.id ? 'text-white' : ''}
                style={{ 
                  backgroundColor: selectedZone === zone.id ? zone.color : 'transparent',
                  color: selectedZone === zone.id ? 'white' : 'inherit'
                }}
              >
                {zone.icon} Zone {zone.id.slice(-1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Zone Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.values(zones).map((zone) => (
            <Card 
              key={zone.id}
              className={`p-6 cursor-pointer transition-all ${
                selectedZone === zone.id ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{ 
                borderColor: zone.color,
                borderWidth: '2px',
                ringColor: selectedZone === zone.id ? zone.color : 'transparent'
              }}
              onClick={() => setSelectedZone(zone.id)}
            >
              <div className="text-center">
                <div 
                  className="text-4xl mb-3 p-4 rounded-full inline-block"
                  style={{ backgroundColor: `${zone.color}20` }}
                >
                  {zone.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: zone.color }}>
                  {zone.name}
                </h3>
                <p className="font-devanagari text-sm text-gray-600 mb-3">
                  {zone.nameHindi}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {zone.description}
                </p>
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.type === 'walking' ? 'Walking Only' : 'Vehicle Allowed'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Zone Information */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-kumbh-text mb-6">
            Zone Information | ज़ोन जानकारी
          </h2>

          <div className="space-y-6">
            {Object.values(zones).map((zone) => (
              <div key={zone.id} className="border-l-4 pl-4" style={{ borderColor: zone.color }}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-3xl">{zone.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: zone.color }}>
                      {zone.name}
                    </h3>
                    <p className="font-devanagari text-sm text-gray-600">{zone.nameHindi}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{zone.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Key Features:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {zone.id === 'zone1' && (
                        <>
                          <li>• Large parking capacity</li>
                          <li>• Vehicle access allowed</li>
                          <li>• Shuttle services available</li>
                          <li>• Security checkpoints</li>
                        </>
                      )}
                      {zone.id === 'zone2' && (
                        <>
                          <li>• Limited parking spaces</li>
                          <li>• Closer to ghats</li>
                          <li>• Vehicle restrictions apply</li>
                          <li>• Walking distance to Zone 3</li>
                        </>
                      )}
                      {zone.id === 'zone3' && (
                        <>
                          <li>• No vehicles allowed</li>
                          <li>• Walking only zone</li>
                          <li>• Direct access to ghats</li>
                          <li>• Crowd management in place</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Important Notes:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {zone.id === 'zone1' && (
                        <>
                          <li>• Book parking in advance</li>
                          <li>• Follow traffic rules</li>
                          <li>• Keep vehicle documents ready</li>
                        </>
                      )}
                      {zone.id === 'zone2' && (
                        <>
                          <li>• Limited availability</li>
                          <li>• Higher parking fees</li>
                          <li>• Prepare for walking</li>
                        </>
                      )}
                      {zone.id === 'zone3' && (
                        <>
                          <li>• Wear comfortable shoes</li>
                          <li>• Carry water bottle</li>
                          <li>• Follow crowd instructions</li>
                          <li>• Stay with your group</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
