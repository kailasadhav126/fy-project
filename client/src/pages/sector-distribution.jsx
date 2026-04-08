import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SectorDistribution() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-kumbh-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Map (left) + Sector buttons (right) */}
        <div className="flex items-start gap-8">
          {/* Map box — top-left */}
          <div className="w-full max-w-xl flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-orange-100 flex items-center space-x-2">
                <span className="text-lg">🗺️</span>
                <h2 className="font-bold text-kumbh-text text-sm">Nashik — Sector Distribution Map</h2>
              </div>
              <iframe
                title="Nashik Sector Distribution Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=73.7200%2C19.9500%2C73.8200%2C20.0200&layer=mapnik"
                className="w-full"
                style={{ height: '420px', border: 'none' }}
                loading="lazy"
              />
              <div className="px-4 py-2 bg-orange-50 text-xs text-gray-500">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-kumbh-orange">OpenStreetMap</a> contributors
              </div>
            </div>
          </div>

          {/* Sector buttons — right side */}
          <div className="flex flex-col items-end flex-1">
            <div className="w-56">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-right">Sectors</p>
              {[
                { id: '1',   num: '1',   via: 'Dhule' },
                { id: '2',   num: '2',   via: 'Pune' },
                { id: '3',   num: '3',   via: 'Mumbai' },
                { id: '4',   num: '4',   via: 'Shambhaji Nagar' },
                { id: '5',   num: '5',   via: 'Peth' },
                { id: '6',   num: '6',   via: 'Dindori' },
                { id: '7',   num: '7',   via: 'Girnare (Gangapur Road)' },
                { id: '8',   num: '8',   via: 'Trimbak' },
                { id: '9',   num: '9',   via: '' },
                { id: '10a', num: '10A', via: 'Nashik Road' },
                { id: '10b', num: '10B', via: 'Devlali Camp Station' },
              ].map(({ id, num, via }) => (
                <button
                  key={id}
                  onClick={() => setLocation(`/sector/${id}`)}
                  className="w-full mb-1.5 bg-white border border-orange-200 text-kumbh-text font-medium py-1.5 px-3 rounded-lg hover:bg-kumbh-orange hover:text-white hover:border-kumbh-orange hover:shadow-md transition-all duration-200 text-right"
                >
                  <span className="block text-xs font-bold">Sector {num} →</span>
                  {via ? <span className="block text-xs font-normal opacity-70">via {via}</span> : <span className="block text-xs font-normal opacity-50 italic">—</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
