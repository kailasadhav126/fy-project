import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CrowdHeatmap from '@/components/crowd-analysis/CrowdHeatmap';
import AIRouteRecommendation from '@/components/crowd-analysis/AIRouteRecommendation';
import { useCrowdAnalysis, useUserLocation } from '@/hooks/useCrowdAnalysis';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Navigation() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocationState, setUserLocationState] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [route, setRoute] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationMode, setNavigationMode] = useState('walking'); // walking, driving, cycling
  const [showCrowdAnalysis, setShowCrowdAnalysis] = useState(true);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  const [selectedZone, setSelectedZone] = useState('all');

  const kumbhCenter = [20.008197, 73.792326];

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

  // Crowd analysis hooks
  const { 
    crowdData, 
    statistics, 
    isActive, 
    registerUser, 
    removeUser, 
    getCrowdLevelAtLocation,
    simulateCrowdData 
  } = useCrowdAnalysis();
  
  const { 
    location: currentUserLocation, 
    error: locationError, 
    isLoading: isLocationLoading, 
    getCurrentLocation 
  } = useUserLocation();

  // Kumbh Mela routes and destinations with exact coordinates
  const kumbhDestinations = [
    {
      id: 'ramkund-ghat',
      name: 'Ramkund Ghat',
      nameHindi: 'रामकुंड घाट',
      category: 'ghat',
      coordinates: [20.008197, 73.792326],
      description: 'Main bathing ghat for Kumbh Mela',
      sector: 'Main',
      routes: [
        {
          from: 'Nashik Road Station',
          distance: '3.2 km',
          duration: '15 min',
          waypoints: ['Bitko Chowk', 'Jail Road', 'Notepress', 'Dasak', 'Panchak']
        },
        {
          from: 'Deolali Camp Station',
          distance: '9.54 km',
          duration: '45 min',
          waypoints: ['Krishi Utpanna Bazar Samiti', 'Bitco Signal', 'Jail Road', 'Notepress']
        }
      ]
    },
    {
      id: 'dasak-ghat',
      name: 'Dasak Ghat',
      nameHindi: 'दसक घाट',
      category: 'ghat',
      coordinates: [19.98767, 73.85796],
      description: 'Sector 10 bathing ghat',
      sector: 'Sector 10',
      routes: [
        {
          from: 'Nashik Road Station',
          distance: '7.4 km',
          duration: '1h 45m',
          waypoints: ['Bitko Chowk', 'Jail Road', 'Notepress', 'Dasak', 'Panchak']
        }
      ]
    },
    {
      id: 'takali-sangam-ghat',
      name: 'Takali Sangam Ghat',
      nameHindi: 'टाकळी संगम घाट',
      category: 'ghat',
      coordinates: [19.98936, 73.82216],
      description: 'Sector 1 bathing ghat',
      sector: 'Sector 1',
      routes: [
        {
          from: 'Ozar Airport',
          distance: '12.19 km',
          duration: '1h 15m',
          waypoints: ['Rasbihari High School Chowk', 'Chhatrapati Sambhaji Nagar Road', 'Pawar Mala', 'Sanap Dairy']
        }
      ]
    },
    {
      id: 'talkuteshwar-ghat',
      name: 'Talkuteshwar Ghat',
      nameHindi: 'टाळकुटेश्वर घाट',
      category: 'ghat',
      coordinates: [20.001333, 73.798034],
      description: 'Sector 6 bathing ghat',
      sector: 'Sector 6',
      routes: [
        {
          from: 'Health Science University',
          distance: '13.5 km',
          duration: '1h 30m',
          waypoints: ['Mhanigaen', 'Jain Temple', 'RTO Corner', 'Rajmata Hall', 'KKW College']
        }
      ]
    },
    {
      id: 'laxminarayan-ghat',
      name: 'Laxminarayan Ghat',
      nameHindi: 'लक्ष्मीनारायण घाट',
      category: 'ghat',
      coordinates: [20.001502, 73.804025],
      description: 'Sector 3 bathing ghat',
      sector: 'Sector 3',
      routes: [
        {
          from: 'Rajur Bahula',
          distance: '14.05 km',
          duration: '1h 45m',
          waypoints: ['Pandava Caves', 'Gawand 7 Point', 'Indira Nagar', 'Lalita Nagar', 'Rane Nagar']
        }
      ]
    },
    {
      id: 'gandhi-talav-ghat',
      name: 'Gandhi Talav Ghat',
      nameHindi: 'गांधी तलाव घाट',
      category: 'ghat',
      coordinates: [20.007767, 73.790707],
      description: 'Sector 5 & 7 bathing ghat',
      sector: 'Sector 5 & 7',
      routes: [
        {
          from: 'Peth Road',
          distance: '10.57 km',
          duration: '1h 20m',
          waypoints: ['Thakkar Maidan', 'RTO Signal', 'Dream Castle', 'Chopda Lawns', 'Ravivar Karanja']
        },
        {
          from: 'Gangapur Road',
          distance: '15.5 km',
          duration: '2h 0m',
          waypoints: ['Dugav Outer Parking', 'Gangapur', 'Someshwar Water Fall', 'Canada Corner']
        }
      ]
    },
    {
      id: 'rokdoba-maidan-ghat',
      name: 'Rokdoba Maidan Ghat',
      nameHindi: 'रोकडोबा मैदान घाट',
      category: 'ghat',
      coordinates: [20.004226, 73.793697],
      description: 'Sector 8 bathing ghat',
      sector: 'Sector 8',
      routes: [
        {
          from: 'Trimbakeshwar',
          distance: '13.5 km',
          duration: '1h 30m',
          waypoints: ['Khambale Outer Parking', 'Nehru Garden', 'Old CBS', 'Thakkar Bazar', 'Golf Club']
        }
      ]
    },
    {
      id: 'nandur-manur-ghat',
      name: 'Nandur Manur Ghat',
      nameHindi: 'नांदुर मानुर घाट',
      category: 'ghat',
      coordinates: [19.99000, 73.84675],
      description: 'Sector 4 bathing ghat',
      sector: 'Sector 4',
      routes: [
        {
          from: 'Chh. Sambhaji Nagar',
          distance: '4.0 km',
          duration: '30 min',
          waypoints: ['Nadur Naka', 'Mayuresh Lawns', 'Vasant Dada Patil School', 'Vaishnavi Garden']
        }
      ]
    },
    {
      id: 'odha-ghat',
      name: 'Odha Ghat',
      nameHindi: 'ओढा घाट',
      category: 'ghat',
      coordinates: [19.988441, 73.867699],
      description: 'Proposed bathing ghat',
      sector: 'Proposed',
      routes: [
        {
          from: 'Odha Railway Station',
          distance: '3.0 km',
          duration: '20 min',
          waypoints: ['Male Road', 'Hrishikesh Farm House', 'Sambhaji Nagar Road']
        }
      ]
    },
    {
      id: 'eklahare-ghat',
      name: 'Eklahare Ghat',
      nameHindi: 'एकलहरे घाट',
      category: 'ghat',
      coordinates: [19.986382, 73.874729],
      description: 'Traditional ghat with cultural significance',
      sector: 'Outer',
      routes: [
        {
          from: 'Nashik Road Station',
          distance: '7.2 km',
          duration: '32 min',
          waypoints: ['Bitko Chowk', 'Jail Road', 'Notepress', 'Dasak', 'Panchak', 'Eklahare Road']
        }
      ]
    }
  ];

  const parkingAreas = [
    {
      id: 'nilgiri-bagh-parking',
      name: 'Nilgiri Bagh Parking',
      nameHindi: 'निलगिरी बाग पार्किंग',
      coordinates: [19.997404508609478, 73.82731456846231],
      type: 'inner',
      capacity: '500 vehicles'
    },
    {
      id: 'thakkar-ground-parking',
      name: 'Thakkar Ground Parking',
      nameHindi: 'ठक्कर मैदान पार्किंग',
      coordinates: [20.006042, 73.772655],
      type: 'outer',
      capacity: '1000 vehicles'
    },
    {
      id: 'krishi-utpanna-parking',
      name: 'Krishi Utpanna Bazar Samiti',
      nameHindi: 'कृषि उत्पन्न बाजार समिति',
      coordinates: [20.017729, 73.800076],
      type: 'inner',
      capacity: '300 vehicles'
    },
    {
      id: 'bkc-parking-adgaon',
      name: 'BKC Parking, Adgaon',
      nameHindi: 'बीकेसी पार्किंग, अडगांव',
      coordinates: [20.064771, 73.844124],
      type: 'outer',
      capacity: '800 vehicles'
    },
    {
      id: 'muhs-parking',
      name: 'MUHS Parking',
      nameHindi: 'एमयूएचएस पार्किंग',
      coordinates: [20.07713049778618, 73.81471593326823],
      type: 'outer',
      capacity: '600 vehicles'
    },
    {
      id: 'wasali-parking',
      name: 'Wasali Parking',
      nameHindi: 'वसाली पार्किंग',
      coordinates: [20.000381, 73.674190],
      type: 'outer',
      capacity: '400 vehicles'
    },
    {
      id: 'eklahare-parking',
      name: 'Eklahare Parking',
      nameHindi: 'एकलहरे पार्किंग',
      coordinates: [19.967357, 73.864398],
      type: 'outer',
      capacity: '350 vehicles'
    },
    {
      id: 'ambad-parking',
      name: 'Ambad Parking',
      nameHindi: 'अंबाड पार्किंग',
      coordinates: [19.934047, 73.705139],
      type: 'outer',
      capacity: '450 vehicles'
    }
  ];

  // Hotels near Kumbh Mela
  const hotels = [
    {
      id: 'hotel-triton',
      name: 'Hotel Triton',
      nameHindi: 'होटल ट्राइटन',
      coordinates: [20.005372957177702, 73.80290875003763],
      category: 'hotel',
      rating: 4.2,
      price: '₹2,500/night'
    },
    {
      id: 'ira-orchid-hotel',
      name: 'IRA By Orchid Hotel',
      nameHindi: 'आईआरए बाय ऑर्किड होटल',
      coordinates: [19.985720772091813, 73.8019572759453],
      category: 'hotel',
      rating: 4.5,
      price: '₹3,200/night'
    },
    {
      id: 'courtyard-marriott',
      name: 'Courtyard by Marriott',
      nameHindi: 'कॉर्टयार्ड बाय मैरियट',
      coordinates: [19.99114058634587, 73.788743342578],
      category: 'hotel',
      rating: 4.7,
      price: '₹4,500/night'
    },
    {
      id: '7-apple-hotel',
      name: '7 Apple Hotel',
      nameHindi: '7 एप्पल होटल',
      coordinates: [19.969394158526708, 73.76784298174198],
      category: 'hotel',
      rating: 3.8,
      price: '₹1,800/night'
    },
    {
      id: 'west-india-resort',
      name: 'The West India Resort',
      nameHindi: 'द वेस्ट इंडिया रिसॉर्ट',
      coordinates: [19.984168025096164, 73.71927143495672],
      category: 'hotel',
      rating: 4.3,
      price: '₹3,800/night'
    },
    {
      id: 'hotel-prestige-point',
      name: 'Hotel Prestige Point',
      nameHindi: 'होटल प्रेस्टीज पॉइंट',
      coordinates: [19.999140303595127, 73.83951591611591],
      category: 'hotel',
      rating: 4.0,
      price: '₹2,200/night'
    }
  ];

  // Hospitals near Kumbh Mela
  const hospitals = [
    {
      id: 'apollo-hospital',
      name: 'Apollo Hospital',
      nameHindi: 'अपोलो अस्पताल',
      coordinates: [20.012831979030558, 73.81595458606283],
      category: 'hospital',
      type: 'Private',
      emergency: '24/7'
    },
    {
      id: 'samruddhi-hospital',
      name: 'Samruddhi Hospital & Critical Care Center',
      nameHindi: 'समृद्धि अस्पताल और क्रिटिकल केयर सेंटर',
      coordinates: [20.000371387133725, 73.83771266561284],
      category: 'hospital',
      type: 'Private',
      emergency: '24/7'
    },
    {
      id: 'suvichar-hospital',
      name: 'Suvichar Hospital',
      nameHindi: 'सुविचार अस्पताल',
      coordinates: [19.98513756370441, 73.80237632421043],
      category: 'hospital',
      type: 'Private',
      emergency: '24/7'
    },
    {
      id: 'shree-siddhivinayak',
      name: 'Shree Siddhivinayak',
      nameHindi: 'श्री सिद्धिविनायक',
      coordinates: [20.007255994208226, 73.77989351670311],
      category: 'hospital',
      type: 'Private',
      emergency: '24/7'
    },
    {
      id: 'nmc-hospital',
      name: 'NMC Hospital (Jijamata Hospital)',
      nameHindi: 'एनएमसी अस्पताल (जिजामाता अस्पताल)',
      coordinates: [20.004534007974446, 73.79123538060004],
      category: 'hospital',
      type: 'Private',
      emergency: '24/7'
    },
    {
      id: 'civil-hospital',
      name: 'Civil Hospital',
      nameHindi: 'सिविल अस्पताल',
      coordinates: [19.997995097521596, 73.7774369313904],
      category: 'hospital',
      type: 'Government',
      emergency: '24/7'
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Register user location when it changes
  useEffect(() => {
    if (currentUserLocation && registerUser && typeof registerUser === 'function') {
      try {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        registerUser(userId, currentUserLocation, {
          deviceType: 'mobile',
          appVersion: '1.0.0',
          sessionId: userId
        });

        // Clean up user registration on unmount
        return () => {
          if (removeUser && typeof removeUser === 'function') {
            removeUser(userId);
          }
        };
      } catch (error) {
        console.error('Error registering user location:', error);
      }
    }
  }, [currentUserLocation, registerUser, removeUser]);

  // Simulate crowd data on component mount
  useEffect(() => {
    // Simulate crowd data for demonstration
    const timer = setTimeout(() => {
      try {
        if (simulateCrowdData && typeof simulateCrowdData === 'function') {
          simulateCrowdData();
        }
      } catch (error) {
        console.error('Error simulating crowd data:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [simulateCrowdData]);

  // Initialize OpenStreetMap
  useEffect(() => {
    if (mapRef.current && !map) {
      // Load Leaflet CSS and JS dynamically
      const loadLeaflet = async () => {
        try {
          // Check if Leaflet is already loaded
          if (window.L) {
            initializeMap();
            return;
          }

          // Load CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          // Load JS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            try {
              initializeMap();
            } catch (error) {
              console.error('Error initializing map:', error);
            }
          };
          script.onerror = () => {
            console.error('Failed to load Leaflet library');
          };
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error loading Leaflet:', error);
        }
      };

      const initializeMap = () => {
        try {
          const L = window.L;
          if (!L || !mapRef.current) return;

          const mapInstance = L.map(mapRef.current).setView([19.9975, 73.7898], 13);
          
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

  // Add markers, zones and routes to map
  useEffect(() => {
    if (map && window.L) {
      try {
        // Clear existing layers
        map.eachLayer((layer) => {
          if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline || layer instanceof window.L.Polygon) {
            map.removeLayer(layer);
          }
        });
      } catch (error) {
        console.error('Error clearing map layers:', error);
      }

      // Draw zone circles
      try {
        window.L.circle(kumbhCenter, {
          color: zones.zone1.color,
          fillColor: zones.zone1.color,
          fillOpacity: 0.02,
          weight: 3,
          radius: zones.zone1.radius
        }).addTo(map);

        window.L.circle(kumbhCenter, {
          color: zones.zone2.color,
          fillColor: zones.zone2.color,
          fillOpacity: 0.04,
          weight: 3,
          radius: zones.zone2.radius
        }).addTo(map);

        window.L.circle(kumbhCenter, {
          color: zones.zone3.color,
          fillColor: zones.zone3.color,
          fillOpacity: 0.06,
          weight: 4,
          radius: zones.zone3.radius,
          dashArray: '5, 5'
        }).addTo(map);
      } catch (error) {
        console.error('Error drawing zones:', error);
      }

      // Add ghat markers
      kumbhDestinations.forEach((ghat) => {
        const marker = window.L.marker(ghat.coordinates)
          .addTo(map)
          .bindPopup(`
            <div>
              <h3>${ghat.name}</h3>
              <p class="font-devanagari">${ghat.nameHindi}</p>
              <p><strong>Sector:</strong> ${ghat.sector}</p>
              <p>${ghat.description}</p>
            </div>
          `);
        
        marker.setIcon(
          window.L.divIcon({
            className: 'custom-ghat-marker',
            html: `<div style="background: #ff6b35; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">G</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        );
      });

      // Add parking markers
      parkingAreas.forEach((parking) => {
        const marker = window.L.marker(parking.coordinates)
          .addTo(map)
          .bindPopup(`
            <div>
              <h3>${parking.name}</h3>
              <p class="font-devanagari">${parking.nameHindi}</p>
              <p><strong>Type:</strong> ${parking.type} parking</p>
              <p><strong>Capacity:</strong> ${parking.capacity}</p>
            </div>
          `);
        
        marker.setIcon(
          window.L.divIcon({
            className: 'custom-parking-marker',
            html: `<div style="background: #4CAF50; color: white; border-radius: 4px; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">P</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          })
        );
      });

      // Add hotel markers
      hotels.forEach((hotel) => {
        const marker = window.L.marker(hotel.coordinates)
          .addTo(map)
          .bindPopup(`
            <div>
              <h3>${hotel.name}</h3>
              <p class="font-devanagari">${hotel.nameHindi}</p>
              <p><strong>Rating:</strong> ${hotel.rating}⭐</p>
              <p><strong>Price:</strong> ${hotel.price}</p>
            </div>
          `);
        
        marker.setIcon(
          window.L.divIcon({
            className: 'custom-hotel-marker',
            html: `<div style="background: #2196F3; color: white; border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 12px;">🏨</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        );
      });

      // Add hospital markers
      hospitals.forEach((hospital) => {
        const marker = window.L.marker(hospital.coordinates)
          .addTo(map)
          .bindPopup(`
            <div>
              <h3>${hospital.name}</h3>
              <p class="font-devanagari">${hospital.nameHindi}</p>
              <p><strong>Type:</strong> ${hospital.type}</p>
              <p><strong>Emergency:</strong> ${hospital.emergency}</p>
            </div>
          `);
        
        marker.setIcon(
          window.L.divIcon({
            className: 'custom-hospital-marker',
            html: `<div style="background: #f44336; color: white; border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 12px;">🏥</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        );
      });

      // Add user location marker
      if (currentUserLocation) {
        const userMarker = window.L.marker([currentUserLocation.lat, currentUserLocation.lng])
          .addTo(map)
          .bindPopup('Your Location');
        
        userMarker.setIcon(
          window.L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="background: #2196F3; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">U</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          })
        );
      }

      // Add route if available
      if (route && route.coordinates && route.coordinates.length > 0) {
        const routePolyline = window.L.polyline(route.coordinates, {
          color: '#ff6b35',
          weight: 6,
          opacity: 0.9,
          dashArray: '10, 10'
        }).addTo(map);

        // Add route markers for start and end points
        const startMarker = window.L.marker(route.coordinates[0])
          .addTo(map)
          .bindPopup('Start Point');

        const endMarker = window.L.marker(route.coordinates[route.coordinates.length - 1])
          .addTo(map)
          .bindPopup('Destination');
        
        // Style the route markers
        startMarker.setIcon(
          window.L.divIcon({
            className: 'custom-route-marker',
            html: `<div style="background: #4CAF50; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 12px;">S</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        );
        
        endMarker.setIcon(
          window.L.divIcon({
            className: 'custom-route-marker',
            html: `<div style="background: #f44336; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 12px;">E</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        );
        
        // Add waypoint markers
        if (route.coordinates.length > 2) {
          route.coordinates.slice(1, -1).forEach((waypoint, index) => {
          const waypointMarker = window.L.marker(waypoint)
            .addTo(map)
            .bindPopup(`Waypoint ${index + 1}`);
          
          waypointMarker.setIcon(
            window.L.divIcon({
              className: 'custom-waypoint-marker',
              html: `<div style="background: #2196F3; color: white; border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; font-size: 10px;">${index + 1}</div>`,
              iconSize: [15, 15],
              iconAnchor: [7, 7]
            })
          );
          });
        }
        
        // Fit map to show the entire route
        map.fitBounds(routePolyline.getBounds(), { padding: [20, 20] });
      }
    }
  }, [map, currentUserLocation, route]);

  const handleGetUserLocation = () => {
    getCurrentLocation();
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate realistic route with waypoints
  const generateRoute = (start, end, destination, routeType = 'direct') => {
    const distance = calculateDistance(start.lat, start.lng, end[0], end[1]);
    const duration = Math.round(distance * 2); // Rough estimate: 2 minutes per km for walking
    
    // Generate intermediate waypoints for more realistic routing
    const waypoints = [];
    let numWaypoints, variation, routeModifier;
    
    // Adjust route characteristics based on type
    switch (routeType) {
      case 'scenic':
        numWaypoints = Math.min(8, Math.max(4, Math.floor(distance * 3)));
        variation = 0.002; // More curves for scenic route
        routeModifier = 1.3; // 30% longer
        break;
      case 'alternative':
        numWaypoints = Math.min(6, Math.max(3, Math.floor(distance * 2.5)));
        variation = 0.0015; // Moderate curves
        routeModifier = 1.1; // 10% longer
        break;
      default: // direct
        numWaypoints = Math.min(5, Math.max(2, Math.floor(distance * 2)));
        variation = 0.001; // Minimal curves
        routeModifier = 1.0; // Direct distance
    }
    
    for (let i = 1; i < numWaypoints; i++) {
      const ratio = i / numWaypoints;
      const lat = start.lat + (end[0] - start.lat) * ratio;
      const lng = start.lng + (end[1] - start.lng) * ratio;
      
      // Add variation to simulate road routing
      waypoints.push([
        lat + (Math.random() - 0.5) * variation,
        lng + (Math.random() - 0.5) * variation
      ]);
    }

    const routeCoordinates = [
      [start.lat, start.lng],
      ...waypoints,
      [end[0], end[1]]
    ];

    // Generate realistic turn-by-turn directions
    const steps = [
      { 
        instruction: `Start from your current location`, 
        distance: '0 m',
        type: 'start'
      }
    ];

    // Add intermediate steps
    waypoints.forEach((waypoint, index) => {
      const stepDistance = calculateDistance(
        index === 0 ? start.lat : waypoints[index - 1][0],
        index === 0 ? start.lng : waypoints[index - 1][1],
        waypoint[0],
        waypoint[1]
      );
      
      const directions = [
        'Continue straight on main road',
        'Turn left at the intersection',
        'Turn right at the junction',
        'Continue on the highway',
        'Follow the road ahead',
        'Take the next turn',
        'Stay on the main route'
      ];
      
      steps.push({
        instruction: directions[index % directions.length],
        distance: `${Math.round(stepDistance * 1000)} m`,
        type: 'turn'
      });
    });

      // Final step
      const finalDistance = waypoints.length > 0 ? calculateDistance(
        waypoints[waypoints.length - 1][0],
        waypoints[waypoints.length - 1][1],
        end[0],
        end[1]
      ) : calculateDistance(start.lat, start.lng, end[0], end[1]);

    steps.push({
      instruction: `Arrive at ${destination.name}`,
      distance: `${Math.round(finalDistance * 1000)} m`,
      type: 'arrival'
    });

    return {
      coordinates: routeCoordinates,
      distance: `${(distance * routeModifier).toFixed(1)} km`,
      duration: `${Math.floor((duration * routeModifier) / 60)}h ${Math.floor((duration * routeModifier) % 60)}m`,
      steps: steps,
      type: routeType,
      originalDistance: distance
    };
  };

  const handleStartNavigation = () => {
    if (!currentUserLocation) {
      alert('Please get your location first.');
      return;
    }

    if (!selectedDestination) {
      alert('Please select a destination.');
      return;
    }

    const destination = kumbhDestinations.find(dest => dest.id === selectedDestination) ||
                       parkingAreas.find(p => p.id === selectedDestination) ||
                       hotels.find(h => h.id === selectedDestination) ||
                       hospitals.find(h => h.id === selectedDestination);
    
    if (!destination) {
      alert('Destination not found.');
      return;
    }

    // Generate multiple route options
    const routes = generateMultipleRoutes(currentUserLocation, destination.coordinates, destination);

    // Set the first route as default
    if (routes && routes.length > 0) {
      setRoute(routes[0]);
      setAlternativeRoutes(routes.slice(1));
      setIsNavigating(true);
      setCurrentStep(0);
    }
  };

  const generateMultipleRoutes = (start, end, destination) => {
    const routes = [];
    
    // Route 1: Direct route
    const directRoute = generateRoute(start, end, destination, 'direct');
    routes.push(directRoute);
    
    // Route 2: Scenic route (longer but potentially less crowded)
    const scenicRoute = generateRoute(start, end, destination, 'scenic');
    routes.push(scenicRoute);
    
    // Route 3: Alternative route
    const alternativeRoute = generateRoute(start, end, destination, 'alternative');
    routes.push(alternativeRoute);
    
    return routes;
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setRoute(null);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (route && route.steps && currentStep < route.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
            Kumbh Mela Navigation
          </h1>
          <p className="font-devanagari text-xl text-kumbh-orange font-semibold mb-4">
            कुंभ मेला नेविगेशन
          </p>
        </div>

        {/* 1. Plan Your Route */}
        <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-kumbh-text mb-6">
              Plan Your Route | अपना मार्ग योजना बनाएं
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-kumbh-text">Location Services | स्थान सेवाएं</h3>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Get your current location for navigation</p>
                  {currentUserLocation ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">✅ Location enabled</p>
                      <p className="text-xs text-gray-500">{currentUserLocation.lat.toFixed(4)}, {currentUserLocation.lng.toFixed(4)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">📍 Location not enabled</p>
                  )}
                </div>
                <Button onClick={handleGetUserLocation} className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep">
                  {currentUserLocation ? 'Update Location' : 'Get My Location'}
                </Button>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-kumbh-text">Select Destination | गंतव्य चुनें</h3>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a ghat or destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <h4 className="px-2 py-1 text-sm font-semibold text-gray-500">Ghats</h4>
                    {kumbhDestinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>
                        <div>
                          <div className="font-semibold">{dest.name}</div>
                          <div className="font-devanagari text-sm text-kumbh-orange">
                            {dest.nameHindi}
                          </div>
                          <div className="text-xs text-gray-500">{dest.sector}</div>
                        </div>
                      </SelectItem>
                    ))}
                    <h4 className="px-2 py-1 text-sm font-semibold text-gray-500 mt-2">Parking Areas</h4>
                    {parkingAreas.map((parking) => (
                      <SelectItem key={parking.id} value={parking.id}>
                        <div>
                          <div className="font-semibold">{parking.name}</div>
                          <div className="font-devanagari text-sm text-kumbh-orange">
                            {parking.nameHindi}
                          </div>
                          <div className="text-xs text-gray-500">{parking.type} parking</div>
                        </div>
                      </SelectItem>
                    ))}
                    <h4 className="px-2 py-1 text-sm font-semibold text-gray-500 mt-2">Hotels</h4>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        <div>
                          <div className="font-semibold">{hotel.name}</div>
                          <div className="font-devanagari text-sm text-kumbh-orange">
                            {hotel.nameHindi}
                          </div>
                          <div className="text-xs text-gray-500">{hotel.rating}⭐ - {hotel.price}</div>
                        </div>
                      </SelectItem>
                    ))}
                    <h4 className="px-2 py-1 text-sm font-semibold text-gray-500 mt-2">Hospitals</h4>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <div>
                          <div className="font-semibold">{hospital.name}</div>
                          <div className="font-devanagari text-sm text-kumbh-orange">
                            {hospital.nameHindi}
                          </div>
                          <div className="text-xs text-gray-500">{hospital.type} - {hospital.emergency}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDestination && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const dest = kumbhDestinations.find(d => d.id === selectedDestination);
                      const parking = parkingAreas.find(p => p.id === selectedDestination);
                      const hotel = hotels.find(h => h.id === selectedDestination);
                      const hospital = hospitals.find(h => h.id === selectedDestination);
                      if (dest) {
                        return (
                          <div>
                            <h4 className="font-semibold text-kumbh-text">{dest.name}</h4>
                            <p className="font-devanagari text-kumbh-orange text-sm">{dest.nameHindi}</p>
                            <p className="text-sm text-gray-600">{dest.description}</p>
                            <Badge variant="outline" className="mt-2">{dest.sector}</Badge>
                          </div>
                        );
                      } else if (parking) {
                        return (
                          <div>
                            <h4 className="font-semibold text-kumbh-text">{parking.name}</h4>
                            <p className="font-devanagari text-kumbh-orange text-sm">{parking.nameHindi}</p>
                            <p className="text-sm text-gray-600">Capacity: {parking.capacity}</p>
                            <Badge variant="outline" className="mt-2">{parking.type} Parking</Badge>
                          </div>
                        );
                      } else if (hotel) {
                        return (
                          <div>
                            <h4 className="font-semibold text-kumbh-text">{hotel.name}</h4>
                            <p className="font-devanagari text-kumbh-orange text-sm">{hotel.nameHindi}</p>
                            <p className="text-sm text-gray-600">Rating: {hotel.rating}⭐ | Price: {hotel.price}</p>
                            <Badge variant="outline" className="mt-2">Hotel</Badge>
                          </div>
                        );
                      } else if (hospital) {
                        return (
                          <div>
                            <h4 className="font-semibold text-kumbh-text">{hospital.name}</h4>
                            <p className="font-devanagari text-kumbh-orange text-sm">{hospital.nameHindi}</p>
                            <p className="text-sm text-gray-600">Type: {hospital.type} | Emergency: {hospital.emergency}</p>
                            <Badge variant="outline" className="mt-2">Hospital</Badge>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex space-x-2">
                    <Button onClick={handleStartNavigation} disabled={!currentUserLocation || !selectedDestination} className="flex-1 bg-kumbh-orange text-white hover:bg-kumbh-deep">Start Navigation</Button>
                    <Button onClick={handleStopNavigation} disabled={!isNavigating} variant="outline" className="flex-1">Stop</Button>
                  </div>
                  {route && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Distance: {route.distance}</span>
                        <span>Duration: {route.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Interactive Zone Map */}
          <Card className="p-4 mb-8">
            <h2 className="text-2xl font-bold text-kumbh-text mb-4 text-center">Interactive Zone Map</h2>
            <div className="h-96 w-full rounded-lg relative" ref={mapRef}>
              {!map && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kumbh-orange mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
              {/* Crowd Heatmap Overlay */}
              {showCrowdAnalysis && (
                <CrowdHeatmap 
                  map={map} 
                  bounds={map ? map.getBounds() : null} 
                  visible={showCrowdAnalysis} 
                />
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-600">
                    Interactive map with crowd analysis and AI route optimization
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Ghats</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Parking</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Hotels</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Hospitals</span>
                  </div>
                  {route && (
                    <>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Start</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>End</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Waypoints</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Turn-by-Turn Directions */}
          {isNavigating && route && route.steps && route.steps.length > 0 && (
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-kumbh-text mb-4">Turn-by-Turn Directions | दिशा-निर्देश</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {route.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-kumbh-orange text-white shadow-lg'
                        : index < currentStep
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === currentStep
                            ? 'bg-white text-kumbh-orange'
                            : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span className="text-sm font-medium">
                          {step.instruction}
                        </span>
                      </div>
                      <span className={`text-xs ${
                        index === currentStep ? 'text-white opacity-90' : 'text-gray-500'
                      }`}>
                        {step.distance}
                      </span>
                    </div>
                    {step.type === 'turn' && index === currentStep && (
                      <div className="mt-2 text-xs opacity-90">
                        🧭 Navigation instruction
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  size="sm"
                >
                  ← Previous
                </Button>
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Step {currentStep + 1} of {route.steps ? route.steps.length : 0}
                  </span>
                </div>
                <Button
                  onClick={handleNextStep}
                  disabled={currentStep === (route.steps ? route.steps.length - 1 : 0)}
                  variant="outline"
                  size="sm"
                >
                  Next →
                </Button>
              </div>
            </Card>
          )}

          {/* 4. All Zones quick list */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
              <Button variant={selectedZone === 'all' ? 'default' : 'ghost'} onClick={() => setSelectedZone('all')} className={selectedZone === 'all' ? 'bg-kumbh-orange text-white' : ''}>All Zones</Button>
              <Button variant={selectedZone === 'zone3' ? 'default' : 'ghost'} onClick={() => setSelectedZone('zone3')} className={selectedZone === 'zone3' ? 'text-white' : ''} style={{ backgroundColor: selectedZone === 'zone3' ? zones.zone3.color : 'transparent' }}>🚶 Zone 3</Button>
              <Button variant={selectedZone === 'zone2' ? 'default' : 'ghost'} onClick={() => setSelectedZone('zone2')} className={selectedZone === 'zone2' ? 'text-white' : ''} style={{ backgroundColor: selectedZone === 'zone2' ? zones.zone2.color : 'transparent' }}>🚌 Zone 2</Button>
              <Button variant={selectedZone === 'zone1' ? 'default' : 'ghost'} onClick={() => setSelectedZone('zone1')} className={selectedZone === 'zone1' ? 'text-white' : ''} style={{ backgroundColor: selectedZone === 'zone1' ? zones.zone1.color : 'transparent' }}>🚗 Zone 1</Button>
            </div>
          </div>

          {/* 5. Zone cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[zones.zone1, zones.zone2, zones.zone3].map((zone) => (
              <Card key={zone.id} className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3 p-4 rounded-full inline-block" style={{ backgroundColor: `${zone.color}20` }}>{zone.icon}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: zone.color }}>{zone.name}</h3>
                  <p className="font-devanagari text-sm text-gray-600 mb-3">{zone.nameHindi}</p>
                  <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                  <Badge className="text-white" style={{ backgroundColor: zone.color }}>{zone.type === 'walking' ? 'Walking Only' : 'Vehicle Allowed'}</Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* 6. Zone Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-kumbh-text text-center">Zone Information | ज़ोन जानकारी</h2>

            <Card className="p-6">
              <div className="text-2xl">🚶</div>
              <h3 className="text-xl font-bold">Zone 3: Ghat Zone (Core)</h3>
              <p className="font-devanagari text-kumbh-orange">ज़ोन 3: घाट क्षेत्र (केंद्र)</p>
              <p className="text-sm text-gray-600">Walking-only area around Ramkund & ghats (1-3 km)</p>
              <div className="mt-4">
                <h4 className="font-semibold">Key Features:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>No vehicles allowed</li>
                  <li>Walking only zone</li>
                  <li>Direct access to ghats</li>
                  <li>Crowd management in place</li>
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Important Notes:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Wear comfortable shoes</li>
                  <li>Carry water bottle</li>
                  <li>Follow crowd instructions</li>
                  <li>Stay with your group</li>
                </ul>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-2xl">🚌</div>
              <h3 className="text-xl font-bold">Zone 2: Inner City Zone</h3>
              <p className="font-devanagari text-kumbh-orange">ज़ोन 2: आंतरिक शहर क्षेत्र</p>
              <p className="text-sm text-gray-600">Inside Nashik city, closer parking & limited access (5-10 km)</p>
              <div className="mt-4">
                <h4 className="font-semibold">Key Features:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Limited parking spaces</li>
                  <li>Closer to ghats</li>
                  <li>Vehicle restrictions apply</li>
                  <li>Walking distance to Zone 3</li>
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Important Notes:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Limited availability</li>
                  <li>Higher parking fees</li>
                  <li>Prepare for walking</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-2xl">🚗</div>
              <h3 className="text-xl font-bold">Zone 1: Outer Zone (Outskirts)</h3>
              <p className="font-devanagari text-kumbh-orange">ज़ोन 1: बाहरी क्षेत्र (बाहरी इलाका)</p>
              <p className="text-sm text-gray-600">Entry to Nashik city, large outer parking, shuttle booking (15-20 km)</p>
              <div className="mt-4">
                <h4 className="font-semibold">Key Features:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Large parking capacity</li>
                  <li>Vehicle access allowed</li>
                  <li>Shuttle services available</li>
                  <li>Security checkpoints</li>
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Important Notes:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Book parking in advance</li>
                  <li>Follow traffic rules</li>
                  <li>Keep vehicle documents ready</li>
                </ul>
              </div>
            </Card>
          </div>

        {/* AI Route Recommendation (kept after map and directions) */}
        {isNavigating && alternativeRoutes && alternativeRoutes.length > 0 && (
          <div className="mt-8">
            <ErrorBoundary>
              <AIRouteRecommendation
                routes={[route, ...alternativeRoutes]}
                userLocation={currentUserLocation}
                destination={kumbhDestinations.find(dest => dest.id === selectedDestination)}
                onRouteSelect={(selectedRoute) => {
                  setRoute(selectedRoute);
                  setAlternativeRoutes([route, ...alternativeRoutes.filter(r => r !== selectedRoute)]);
                }}
                visible={true}
              />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
