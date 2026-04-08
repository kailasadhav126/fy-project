import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { attachPointInteractions } from '@/lib/map-point-utils';
import 'leaflet/dist/leaflet.css';

// Common segment: Entry → split point
const commonRoute = [
  [19.88746, 73.93818], // Entry from Pune road
  [19.94814, 73.84632], // Split point
];

// Route A: split → Eklahare Ghat (via Eklahare road, going east)
const routeA = [
  [19.94814, 73.84632], // Split point
  [19.96500, 73.87500], // Intermediate via Eklahare road
  [19.99319, 73.90326], // Eklahare Ghat
];

// Route B: split → Dasak Ghat
const routeB = [
  [19.94814, 73.84632],
  [19.98980, 73.84636], // Dasak Ghat
];

const markers = [
  { pos: [19.88746, 73.93818],  label: 'Entry — Pune Road',               sublabel: 'Starting Point',    color: '#16a34a' },
  { pos: [19.88497, 73.92065],  label: 'Chincholi Shivar Outer Parking',   sublabel: 'Outer Parking 1',   color: '#1d4ed8' },
  { pos: [19.93452, 73.92065],  label: 'Mohagaon Outer Parking',           sublabel: 'Outer Parking 2',   color: '#1d4ed8' },
  { pos: [19.95113, 73.84918],  label: 'Sinnar Phata Market Inner Parking',sublabel: 'Inner Parking',     color: '#b91c1c' },
  { pos: [19.98980, 73.84636],  label: 'Dasak Ghat',                       sublabel: 'Ghat 1',            color: '#7c3aed' },
  { pos: [19.99319, 73.90326],  label: 'Eklahare Ghat',                    sublabel: 'Ghat 2',            color: '#0e7490' },
];

const legendItems = [
  { color: '#16a34a', label: 'Entry — Pune Road' },
  { color: '#1d4ed8', label: 'Outer Parking (Chincholi / Mohagaon)' },
  { color: '#b91c1c', label: 'Inner Parking — Sinnar Phata' },
  { color: '#7c3aed', label: 'Ghat 1 — Dasak Ghat' },
  { color: '#0e7490', label: 'Ghat 2 — Eklahare Ghat' },
  { color: '#ea580c', label: 'Common Route', isLine: true },
  { color: '#7c3aed', label: 'Route A → Eklahare Ghat (east)', isLine: true },
  { color: '#0e7490', label: 'Route B → Dasak Ghat', isLine: true },
];

async function fetchRoadRoute(points) {
  try {
    const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch (e) {
    console.warn('OSRM fetch failed, falling back to straight line', e);
  }
  return points;
}

export default function Sector2Map() {
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current) return;

    import('leaflet').then(async (L) => {
      const map = L.map(mapRef.current, {
        center: [19.94, 73.88],
        zoom: 12,
        scrollWheelZoom: true,
      });
      instanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Fetch all 3 route segments in parallel
      const [commonCoords, routeACoords, routeBCoords] = await Promise.all([
        fetchRoadRoute(commonRoute),
        fetchRoadRoute(routeA),
        fetchRoadRoute(routeB),
      ]);

      // Common segment — orange
      L.polyline(commonCoords, { color: '#ea580c', weight: 5, opacity: 0.85 }).addTo(map);
      // Route A (→ Eklahare) — purple
      L.polyline(routeACoords, { color: '#7c3aed', weight: 5, opacity: 0.85 }).addTo(map);
      // Route B (→ Dasak) — teal
      L.polyline(routeBCoords, { color: '#0e7490', weight: 5, opacity: 0.85 }).addTo(map);

      // Markers
      markers.forEach(({ pos, label, sublabel, color }) => {
        const icon = L.divIcon({
          html: `<div style="background:${color};border-radius:50%;width:14px;height:14px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        attachPointInteractions(L.marker(pos, { icon }).addTo(map), { label, sublabel, setLocation });
      });

      // Legend — bottom right
      const Legend = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd() {
          const div = L.DomUtil.create('div');
          div.style.cssText = `
            background:rgba(255,255,255,0.95);
            padding:6px 8px;
            border-radius:8px;
            box-shadow:0 1px 6px rgba(0,0,0,0.25);
            font-family:sans-serif;
            font-size:10px;
            line-height:1.7;
            min-width:160px;
            max-width:200px;
            margin-right:6px;
          `;
          div.innerHTML =
            `<strong style="font-size:12px;display:block;margin-bottom:4px;border-bottom:1px solid #eee;padding-bottom:3px">INDEX</strong>` +
            legendItems.map(({ color, label, isLine }) => {
              const symbol = isLine
                ? `<span style="display:inline-block;width:22px;height:3px;background:${color};border-radius:2px;vertical-align:middle;margin-right:6px;"></span>`
                : `<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${color};border:1.5px solid #fff;box-shadow:0 0 2px rgba(0,0,0,0.3);vertical-align:middle;margin-right:6px;"></span>`;
              return `<div style="display:flex;align-items:center;">${symbol}<span>${label}</span></div>`;
            }).join('');
          return div;
        },
      });
      new Legend().addTo(map);
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [setLocation]);

  return <div ref={mapRef} style={{ height: '420px', width: '100%' }} />;
}
