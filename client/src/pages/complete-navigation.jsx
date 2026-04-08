import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { createParkingDetailPath } from '@/lib/parking-detail-data';
import 'leaflet/dist/leaflet.css';

const NASHIK_CENTER = [19.9975, 73.7898];
const NASHIK_APPROACH_RADIUS_KM = 35;

const demoLocations = [
  { name: 'Kokan (Ratnagiri)', coords: [16.9944, 73.3005] },
  { name: 'Nagpur', coords: [21.1458, 79.0882] },
  { name: 'Mumbai', coords: [19.0760, 72.8777] },
  { name: 'Pune', coords: [18.5204, 73.8567] },
  { name: 'Dhule', coords: [20.9042, 74.7749] },
  { name: 'Nashik Road', coords: [19.9484, 73.8408] },
  { name: 'Devlali Camp', coords: [19.89768, 73.83587] },
];

const sectorRoutes = [
  {
    id: '1',
    label: 'Sector 1',
    via: 'Dhule',
    entry: [20.06929, 73.89962],
    routeWaypoints: [
      [20.06929, 73.89962],
      [20.04705, 73.87765],
      [19.98944, 73.82217],
    ],
    routeSegments: [
      [
        [20.06929, 73.89962],
        [20.04705, 73.87765],
        [19.98944, 73.82217],
      ],
    ],
    outerParkings: [{ name: 'Adgaon Truck Terminal', coords: [20.04705, 73.87765] }],
    innerParkings: [{ name: 'Niligiri Bagh Parking', coords: [20.00773, 73.82727] }],
    destinations: [{ name: 'Takli Sangam Ghat', coords: [19.98944, 73.82217] }],
  },
  {
    id: '2',
    label: 'Sector 2',
    via: 'Pune',
    entry: [19.88746, 73.93818],
    routeWaypoints: [
      [19.88746, 73.93818],
      [19.94814, 73.84632],
      [19.98980, 73.84636],
    ],
    routeSegments: [
      [
        [19.88746, 73.93818],
        [19.94814, 73.84632],
      ],
      [
        [19.94814, 73.84632],
        [19.96500, 73.87500],
        [19.99319, 73.90326],
      ],
      [
        [19.94814, 73.84632],
        [19.98980, 73.84636],
      ],
    ],
    outerParkings: [
      { name: 'Chincholi Shivar Outer Parking', coords: [19.88497, 73.92065] },
      { name: 'Mohagaon Outer Parking', coords: [19.93452, 73.92065] },
    ],
    innerParkings: [{ name: 'Sinnar Phata Market Inner Parking', coords: [19.95113, 73.84918] }],
    destinations: [
      { name: 'Dasak Ghat', coords: [19.98980, 73.84636] },
      { name: 'Eklahare Ghat', coords: [19.99319, 73.90326] },
    ],
  },
  {
    id: '3',
    label: 'Sector 3',
    via: 'Mumbai',
    entry: [19.89475, 73.69645],
    routeWaypoints: [
      [19.89475, 73.69645],
      [19.91463, 73.70736],
      [19.98710, 73.78271],
      [20.00158, 73.80432],
    ],
    routeSegments: [
      [
        [19.89475, 73.69645],
        [19.91463, 73.70736],
        [19.98710, 73.78271],
        [20.00158, 73.80432],
      ],
    ],
    outerParkings: [{ name: 'Rajur Bahula Outer Parking', coords: [19.91463, 73.70736] }],
    innerParkings: [{ name: 'Mahamarg Bus Stand Inner Parking', coords: [19.98710, 73.78271] }],
    destinations: [{ name: 'Laxmi Narayan Ghat', coords: [20.00158, 73.80432] }],
  },
  {
    id: '4',
    label: 'Sector 4',
    via: 'Shambhaji Nagar',
    entry: [20.00176, 73.87900],
    routeWaypoints: [
      [20.00176, 73.87900],
      [19.98993, 73.84640],
    ],
    routeSegments: [
      [
        [20.00176, 73.87900],
        [19.98993, 73.84640],
      ],
    ],
    outerParkings: [{ name: 'Mhadsangvi Outer Parking', coords: [20.00324, 73.86598] }],
    innerParkings: [],
    destinations: [{ name: 'Nandur Manur Ghat', coords: [19.98993, 73.84640] }],
  },
  {
    id: '5',
    label: 'Sector 5',
    via: 'Peth',
    entry: [20.06808, 73.78006],
    routeWaypoints: [
      [20.06808, 73.78006],
      [20.02520, 73.78469],
      [20.01817, 73.78718],
      [20.00859, 73.77210],
      [20.00691, 73.78483],
      [20.00751, 73.79085],
    ],
    routeSegments: [
      [
        [20.06808, 73.78006],
        [20.02520, 73.78469],
        [20.01817, 73.78718],
        [20.00859, 73.77210],
        [20.00691, 73.78483],
        [20.00751, 73.79085],
      ],
    ],
    outerParkings: [{ name: 'Thakkar Maidan Peth Road Outer Parking', coords: [20.05087, 73.79240] }],
    innerParkings: [{ name: 'Sharad Chandra Pawar Market Yard Inner Parking', coords: [20.03007, 73.79363] }],
    destinations: [{ name: 'Gandhi Talav Ghat', coords: [20.00751, 73.79085] }],
  },
  {
    id: '6',
    label: 'Sector 6',
    via: 'Dindori',
    entry: [20.09317, 73.80597],
    routeWaypoints: [
      [20.09317, 73.80597],
      [20.03287, 73.80307],
      [20.03100, 73.81500],
      [20.01944, 73.83162],
      [20.00921, 73.80625],
      [20.00149, 73.79903],
    ],
    routeSegments: [
      [
        [20.09317, 73.80597],
        [20.03287, 73.80307],
        [20.03100, 73.81500],
        [20.01944, 73.83162],
        [20.00921, 73.80625],
        [20.00149, 73.79903],
      ],
    ],
    outerParkings: [{ name: 'Health Science University Outer Parking', coords: [20.08079, 73.80601] }],
    innerParkings: [{ name: 'Ratan Luth Estate Inner Parking', coords: [20.01597, 73.81955] }],
    destinations: [{ name: 'Talkuteshwar Ghat', coords: [20.00149, 73.79903] }],
  },
  {
    id: '7',
    label: 'Sector 7',
    via: 'Girnare (Gangapur Road)',
    entry: [20.06847, 73.65259],
    routeWaypoints: [
      [20.06847, 73.65259],
      [20.05812, 73.68332],
      [20.04547, 73.68660],
      [20.01221, 73.74900],
      [20.00678, 73.77290],
      [20.00751, 73.79085],
    ],
    routeSegments: [
      [
        [20.06847, 73.65259],
        [20.05812, 73.68332],
        [20.04547, 73.68660],
        [20.01221, 73.74900],
        [20.00678, 73.77290],
        [20.00751, 73.79085],
      ],
    ],
    outerParkings: [{ name: 'Dugaon Outer Parking', coords: [20.07251, 73.68371] }],
    innerParkings: [{ name: 'Dongre Vasti Gruh', coords: [20.00678, 73.77290] }],
    destinations: [{ name: 'Gandhi Talav Ghat', coords: [20.00751, 73.79085] }],
  },
  {
    id: '8',
    label: 'Sector 8',
    via: 'Trimbak',
    entry: [19.95743, 73.60587],
    routeWaypoints: [
      [19.95743, 73.60587],
      [19.96375, 73.64265],
      [19.99146, 73.73142],
      [20.00468, 73.79305],
    ],
    routeSegments: [
      [
        [19.95743, 73.60587],
        [19.96375, 73.64265],
        [19.99146, 73.73142],
        [20.00468, 73.79305],
      ],
    ],
    outerParkings: [{ name: 'Khambale Outer Parking', coords: [19.96375, 73.64265] }],
    innerParkings: [{ name: 'Satpur Bus Stand Inner Parking', coords: [19.99146, 73.73142] }],
    destinations: [{ name: 'Rokdoba Maidan Ghat', coords: [20.00468, 73.79305] }],
  },
  {
    id: '9',
    label: 'Sector 9',
    via: 'Nashik City Access',
    entry: [19.9975, 73.7898],
    isPlaceholder: true,
    routeWaypoints: [
      [19.9975, 73.7898],
      [19.98980, 73.84636],
    ],
    outerParkings: [],
    innerParkings: [],
    destinations: [{ name: 'Dasak Ghat', coords: [19.98980, 73.84636] }],
  },
  {
    id: '10a',
    label: 'Sector 10A',
    via: 'Nashik Road',
    entry: [19.94840, 73.84078],
    routeWaypoints: [
      [19.94840, 73.84078],
      [19.98980, 73.84636],
    ],
    routeSegments: [
      [
        [19.94840, 73.84078],
        [19.98980, 73.84636],
      ],
    ],
    outerParkings: [],
    innerParkings: [],
    destinations: [{ name: 'Dasak Ghat', coords: [19.98980, 73.84636] }],
  },
  {
    id: '10b',
    label: 'Sector 10B',
    via: 'Devlali Camp Station',
    entry: [19.89768, 73.83587],
    routeWaypoints: [
      [19.89768, 73.83587],
      [19.98980, 73.84636],
    ],
    routeSegments: [
      [
        [19.89768, 73.83587],
        [19.98980, 73.84636],
      ],
    ],
    outerParkings: [],
    innerParkings: [],
    destinations: [{ name: 'Dasak Ghat', coords: [19.98980, 73.84636] }],
  },
];

function toRad(value) {
  return (value * Math.PI) / 180;
}

function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDuration(seconds) {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

async function fetchRoadRoute(points) {
  const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Route API failed');
  const data = await res.json();
  if (!data.routes?.[0]) throw new Error('No route found');
  const route = data.routes[0];
  return {
    coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: route.distance / 1000,
    durationSec: route.duration,
  };
}

function detectSectorFromRoute(routeCoords) {
  const approachPoint =
    routeCoords.find((point) => haversineKm(point, NASHIK_CENTER) <= NASHIK_APPROACH_RADIUS_KM) ||
    routeCoords[routeCoords.length - 1];
  const detectableSectors = sectorRoutes.filter((sector) => !sector.isPlaceholder);

  let best = null;
  for (const sector of detectableSectors) {
    const dist = haversineKm(approachPoint, sector.entry);
    if (!best || dist < best.dist) best = { sector, dist };
  }

  return best?.sector || detectableSectors[0];
}

async function fetchSectorRouteSegments(sector) {
  const segmentWaypoints = sector.routeSegments || [sector.routeWaypoints];
  const routes = await Promise.all(segmentWaypoints.map((segment) => fetchRoadRoute(segment)));
  return {
    coords: routes.map((route) => route.coords),
    distanceKm: routes.reduce((total, route) => total + route.distanceKm, 0),
    durationSec: routes.reduce((total, route) => total + route.durationSec, 0),
  };
}

function pointTooltipHtml(label, sublabel) {
  return `<div style="font-family:sans-serif;min-width:120px">
    <strong style="font-size:13px">${label}</strong>
    ${sublabel ? `<br/><span style="font-size:11px;color:#666">${sublabel}</span>` : ''}
  </div>`;
}

export default function CompleteNavigation() {
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [navigationState, setNavigationState] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    import('leaflet').then((L) => {
      if (!mounted || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, {
        center: NASHIK_CENTER,
        zoom: 11,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    });

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!navigationState || !mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];

      const { sourceCoords, sourceName, toEntryCoords, sectorRouteSegments, sector } = navigationState;
      const toEntryLine = L.polyline(toEntryCoords, {
        color: '#ea580c',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      const sectorLines = sectorRouteSegments.map((segmentCoords, index) =>
        L.polyline(segmentCoords, {
          color: index === 0 ? '#2563eb' : index === 1 ? '#7c3aed' : '#0e7490',
          weight: 5,
          opacity: 0.85,
        }).addTo(map)
      );

      const sourceMarker = L.marker(sourceCoords)
        .addTo(map)
        .bindTooltip(pointTooltipHtml(sourceName, 'Source'), { direction: 'top', sticky: true });
      const entryMarker = L.circleMarker(sector.entry, {
        radius: 7,
        color: '#16a34a',
        fillColor: '#16a34a',
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindTooltip(pointTooltipHtml(`${sector.label} Entry Marker`, `via ${sector.via}`), { direction: 'top', sticky: true });
      const parkingMarkers = [
        ...sector.outerParkings.map((parking) => {
          const marker = L.circleMarker(parking.coords, {
            radius: 6,
            color: '#1d4ed8',
            fillColor: '#1d4ed8',
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindTooltip(pointTooltipHtml(parking.name, 'Outer Parking'), { direction: 'top', sticky: true });

          marker.on('click', () => setLocation(createParkingDetailPath(parking.name)));
          return marker;
        }),
        ...sector.innerParkings.map((parking) => {
          const marker = L.circleMarker(parking.coords, {
            radius: 6,
            color: '#b91c1c',
            fillColor: '#b91c1c',
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindTooltip(pointTooltipHtml(parking.name, 'Inner Parking'), { direction: 'top', sticky: true });

          marker.on('click', () => setLocation(createParkingDetailPath(parking.name)));
          return marker;
        }),
      ];

      const destinationMarkers = sector.destinations.map((dest) =>
        L.circleMarker(dest.coords, {
          radius: 6,
          color: '#7c3aed',
          fillColor: '#7c3aed',
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindTooltip(pointTooltipHtml(dest.name, 'Destination Ghat'), { direction: 'top', sticky: true })
      );

      layersRef.current = [toEntryLine, ...sectorLines, sourceMarker, entryMarker, ...parkingMarkers, ...destinationMarkers];
      map.fitBounds(L.featureGroup(layersRef.current).getBounds(), { padding: [30, 30] });
    });
  }, [navigationState, setLocation]);

  async function runFlow(sourceCoords, sourceName) {
    try {
      setIsLoading(true);
      setError('');
      const routeToNashik = await fetchRoadRoute([sourceCoords, NASHIK_CENTER]);
      const sector = detectSectorFromRoute(routeToNashik.coords);
      const routeToEntry = await fetchRoadRoute([sourceCoords, sector.entry]);
      const routeInsideSector = await fetchSectorRouteSegments(sector);
      setNavigationState({
        sourceCoords,
        sourceName,
        toEntryCoords: routeToEntry.coords,
        sectorRouteSegments: routeInsideSector.coords,
        sector,
        distanceToNashikKm: routeToNashik.distanceKm,
        etaToNashikText: formatDuration(routeToNashik.durationSec),
        distanceToEntryKm: routeToEntry.distanceKm,
        etaToEntryText: formatDuration(routeToEntry.durationSec),
        sectorLegKm: routeInsideSector.distanceKm,
        sectorLegEtaText: formatDuration(routeInsideSector.durationSec),
      });
    } catch (e) {
      setError('Unable to fetch route right now. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const source = [position.coords.latitude, position.coords.longitude];
        runFlow(source, 'Your Live Location');
      },
      () => setError('Location permission denied or unavailable. Use demo random location.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function runRandomDemo() {
    const random = demoLocations[Math.floor(Math.random() * demoLocations.length)];
    runFlow(random.coords, random.name);
  }

  const activeSector = navigationState?.sector;

  return (
    <div className="min-h-screen bg-kumbh-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-6">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-orange-100 flex items-center space-x-2">
                <span className="text-lg">🗺️</span>
                <h2 className="font-bold text-kumbh-text text-sm">Complete Navigation — Source to Nashik Sector</h2>
              </div>
              <div ref={mapRef} style={{ height: '460px', width: '100%' }} />
              <div className="px-4 py-2 bg-orange-50 text-xs text-gray-500">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-kumbh-orange">OpenStreetMap</a> contributors
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={useMyLocation}
              disabled={isLoading}
              className="w-full bg-kumbh-orange text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:bg-kumbh-deep transition-colors text-sm disabled:opacity-60"
            >
              📍 Use My Live Location
            </button>
            <button
              onClick={runRandomDemo}
              disabled={isLoading}
              className="w-full bg-white border-2 border-orange-200 text-kumbh-text px-5 py-3 rounded-xl font-semibold shadow-sm hover:bg-orange-50 transition-colors text-sm disabled:opacity-60"
            >
              🎲 Demo: Generate Random Location
            </button>
            <button
              onClick={() => setLocation('/sector-distribution')}
              className="w-full bg-white border border-gray-200 text-kumbh-text px-5 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors text-sm"
            >
              📊 Sector Wise Distribution
            </button>
            {activeSector && (
              <button
                onClick={() => setLocation(`/sector/${activeSector.id}`)}
                className="w-full bg-kumbh-orange text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:bg-kumbh-deep transition-colors text-sm"
              >
                ➡ Open {activeSector.label} Guidance
              </button>
            )}
            <span className="text-xs text-gray-400 italic">Demo mode: random location simulates full flow</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-orange-100 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Status</p>
            <p className="text-sm font-semibold text-kumbh-text">
              {isLoading ? 'Analyzing route...' : navigationState ? 'Route analyzed' : 'Waiting for location'}
            </p>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>

          <div className="bg-white rounded-xl border border-orange-100 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Detected Sector</p>
            <p className="text-sm font-semibold text-kumbh-text">
              {activeSector ? `${activeSector.label} — via ${activeSector.via}` : 'Not detected yet'}
            </p>
            {navigationState && (
              <p className="text-xs text-gray-500 mt-2">
                To entry: {navigationState.distanceToEntryKm.toFixed(1)} km • {navigationState.etaToEntryText}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-orange-100 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Source</p>
            <p className="text-sm font-semibold text-kumbh-text">{navigationState?.sourceName || '—'}</p>
            {navigationState && (
              <p className="text-xs text-gray-500 mt-2">
                {navigationState.sourceCoords[0].toFixed(4)}, {navigationState.sourceCoords[1].toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {navigationState && (
          <div className="mt-4 bg-white rounded-xl border border-orange-100 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Route Stages</p>
            <p className="text-sm text-kumbh-text">
              Stage 1: Your location to {activeSector?.label} entry ({navigationState.distanceToEntryKm.toFixed(1)} km, {navigationState.etaToEntryText})
            </p>
            <p className="text-sm text-kumbh-text mt-1">
              Stage 2: {activeSector?.label} entry to sector route and parking to destination ghat ({navigationState.sectorLegKm.toFixed(1)} km, {navigationState.sectorLegEtaText})
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Overall to Nashik: {navigationState.distanceToNashikKm.toFixed(1)} km • {navigationState.etaToNashikText}
            </p>
          </div>
        )}

        {activeSector && (
          <div className="mt-4 bg-white rounded-2xl border-2 border-orange-200 p-5">
            <h3 className="text-base font-bold text-kumbh-text mb-3">Sector Guidance Flow</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Entry Sector</p>
                <p className="font-semibold text-kumbh-text">{activeSector.label}</p>
                <p className="text-xs text-gray-500">via {activeSector.via}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Outer Parking</p>
                <p className="font-semibold text-kumbh-text">
                  {activeSector.outerParkings.length > 0 ? activeSector.outerParkings.map((p) => p.name).join(', ') : 'Not required'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-gray-500 mb-1">Inner Parking</p>
                <p className="font-semibold text-kumbh-text">
                  {activeSector.innerParkings.length > 0 ? activeSector.innerParkings.map((p) => p.name).join(', ') : 'Not required'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs text-gray-500 mb-1">Destination Ghat</p>
                <p className="font-semibold text-kumbh-text">{activeSector.destinations.map((d) => d.name).join(', ')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
