import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { attachPointInteractions } from '@/lib/map-point-utils';
import 'leaflet/dist/leaflet.css';

const routeWaypoints = [
  [20.06929, 73.89962],
  [20.04705, 73.87765],
  [19.98944, 73.82217],
];

const markers = [
  { pos: [20.06929, 73.89962], label: 'Entry — Dhule Road', sublabel: 'Starting Point', color: '#16a34a' },
  { pos: [20.04705, 73.87765], label: 'Adgaon Truck Terminal Parking', sublabel: 'Outer Parking', color: '#1d4ed8' },
  { pos: [20.00773, 73.82727], label: 'Niligiri Bagh Parking', sublabel: 'Inner Parking', color: '#b91c1c' },
  { pos: [19.98944, 73.82217], label: 'Takli Sangam Ghat', sublabel: 'Destination', color: '#7c3aed' },
];

const legendItems = [
  { color: '#16a34a', label: 'Entry — Dhule Road' },
  { color: '#1d4ed8', label: 'Outer Parking — Adgaon Truck Terminal' },
  { color: '#b91c1c', label: 'Inner Parking — Niligiri Bagh' },
  { color: '#7c3aed', label: 'Ghat — Takli Sangam' },
  { color: '#ea580c', label: 'Route', isLine: true },
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

export default function Sector1Map() {
  const [, setLocation] = useLocation();
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current) return;

    import('leaflet').then(async (L) => {
      const map = L.map(mapRef.current, {
        center: [20.03, 73.86],
        zoom: 13,
        scrollWheelZoom: true,
      });
      instanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const roadCoords = await fetchRoadRoute(routeWaypoints);
      L.polyline(roadCoords, { color: '#ea580c', weight: 5, opacity: 0.85 }).addTo(map);

      markers.forEach(({ pos, label, sublabel, color }) => {
        const icon = L.divIcon({
          html: `<div style="background:${color};border-radius:50%;width:14px;height:14px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        attachPointInteractions(L.marker(pos, { icon }).addTo(map), { label, sublabel, setLocation });
      });

      // Legend control — bottom left
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
            max-width:175px;
            margin-left:6px;
          `;
          div.innerHTML = `<strong style="font-size:12px;display:block;margin-bottom:4px;border-bottom:1px solid #eee;padding-bottom:3px">INDEX</strong>` +
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
