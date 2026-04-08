import { useEffect, Suspense, lazy } from 'react';
import { useParams, useLocation } from 'wouter';

const Sector1Map = lazy(() => import('@/components/sector1-map'));
const Sector2Map = lazy(() => import('@/components/sector2-map'));
const Sector3Map = lazy(() => import('@/components/sector3-map'));
const Sector4Map = lazy(() => import('@/components/sector4-map'));
const Sector5Map = lazy(() => import('@/components/sector5-map'));
const Sector6Map = lazy(() => import('@/components/sector6-map'));
const Sector7Map = lazy(() => import('@/components/sector7-map'));
const Sector8Map = lazy(() => import('@/components/sector8-map'));
const Sector10Map = lazy(() => import('@/components/sector10-map'));
const Sector10AMap = Sector10Map; // 10A reuses the same map
const Sector10BMap = lazy(() => import('@/components/sector10b-map'));

const sectorInfo = {
  1: { via: 'Dhule' },
  2: { via: 'Pune' },
  3: { via: 'Mumbai' },
  4: { via: 'Shambhaji Nagar' },
  5: { via: 'Peth' },
  6: { via: 'Dindori' },
  7: { via: 'Girnare (Gangapur Road)' },
  8: { via: 'Trimbak' },
  9: { via: '' },
  10: { via: 'Nashik Road' },
  '10a': { via: 'Nashik Road' },
  '10b': { via: 'Devlali Camp Station' },
};

const sectorMapComponents = {
  '1': Sector1Map,
  '2': Sector2Map,
  '3': Sector3Map,
  '4': Sector4Map,
  '5': Sector5Map,
  '6': Sector6Map,
  '7': Sector7Map,
  '8': Sector8Map,
  '10': Sector10Map,
  '10a': Sector10AMap,
  '10b': Sector10BMap,
};

function ShuttleButton() {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => setLocation('/shuttleservices')}
      className="w-full bg-kumbh-orange text-white font-semibold py-2 px-4 rounded-lg hover:bg-kumbh-deep transition-colors text-sm"
    >
      🚌 Book Shuttle Service
    </button>
  );
}

const sectorInfoPanels = {
  '1': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 1 — via Dhule</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Dhule side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Adgaon Truck Terminal</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Niligiri Bagh Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Takli Sangam Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '2': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 2 — via Pune</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Pune side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking 1</p>
            <p className="text-sm font-semibold text-kumbh-text">Chincholi Shivar Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking 2</p>
            <p className="text-sm font-semibold text-kumbh-text">Mohagaon Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Sinnar Phata Market Inner Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat 1 — Route A</p>
            <p className="text-sm font-semibold text-kumbh-text">Dasak Ghat</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-cyan-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat 2 — Route B</p>
            <p className="text-sm font-semibold text-kumbh-text">Eklahare Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '3': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 3 — via Mumbai</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Mumbai side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Rajur Bahula Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Mahamarg Bus Stand Inner Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Laxmi Narayan Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '4': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 4 — via Shambhaji Nagar</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Shambhaji Nagar side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Mhadsangvi Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Nandur Manur Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '5': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 5 — via Peth</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Peth side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Thakkar Maidan Peth Road Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Sharad Chandra Pawar Market Yard Inner Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Gandhi Talav Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '6': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 6 — via Dindori</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Dindori side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Health Science University Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Ratan Luth Estate Inner Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Talkuteshwar Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '7': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 7 — via Girnare (Gangapur Road)</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Girnare / Gangapur Road side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Dugaon Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Dongre Vasti Gruh</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Gandhi Talav Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '8': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 8 — via Trimbak</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims coming from Trimbakeshwar side</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-blue-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Outer Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Khambale Outer Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inner Parking</p>
            <p className="text-sm font-semibold text-kumbh-text">Satpur Bus Stand Inner Parking</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Rokdoba Maidan Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  '10': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 10 — via Nashik Road</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims arriving at Nashik Road Railway Station</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-green-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Starting Point</p>
            <p className="text-sm font-semibold text-kumbh-text">Nashik Road Railway Station</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Dasak Ghat</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Shuttle Service</p>
          <p className="text-xs text-gray-500 mb-3">Shuttle buses available from Nashik Road Railway Station to Dasak Ghat via Jail Road</p>
          <ShuttleButton />
        </div>
      </div>
    </div>
  ),
  '10a': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 10A — via Nashik Road</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims arriving at Nashik Road Railway Station</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-green-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Starting Point</p>
            <p className="text-sm font-semibold text-kumbh-text">Nashik Road Railway Station</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Dasak Ghat</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Shuttle Service</p>
          <p className="text-xs text-gray-500 mb-3">Shuttle buses available from Nashik Road Railway Station to Dasak Ghat via Jail Road</p>
          <ShuttleButton />
        </div>
      </div>
    </div>
  ),
  '10b': (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
      <h2 className="text-xl font-bold text-kumbh-text mb-1">Sector 10B — via Devlali Camp Station</h2>
      <p className="text-gray-500 text-sm mb-6">Pilgrims arriving at Devlali Camp Station</p>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-green-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Starting Point</p>
            <p className="text-sm font-semibold text-kumbh-text">Devlali Camp Station</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <span className="mt-1 w-3 h-3 rounded-full bg-purple-700 flex-shrink-0"></span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ghat</p>
            <p className="text-sm font-semibold text-kumbh-text">Dasak Ghat</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export default function SectorDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const sector = sectorInfo[id];
  const MapComponent = sectorMapComponents[id];
  const infoPanel = sectorInfoPanels[id];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!sector) {
    return (
      <div className="min-h-screen bg-kumbh-bg flex items-center justify-center">
        <p className="text-gray-500">Sector not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kumbh-bg p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setLocation('/sector-distribution')}
          className="mb-6 text-sm text-kumbh-orange hover:underline flex items-center gap-1"
        >
          ← Back to Sector Distribution
        </button>

        <div className={`flex items-start gap-8 ${infoPanel ? '' : 'justify-start'}`}>
          {/* Map box */}
          <div className="w-full max-w-xl flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-orange-100 flex items-center space-x-2">
                <span className="text-lg">🗺️</span>
                <h2 className="font-bold text-kumbh-text text-sm">
                  Sector {id} Map{sector.via ? ` — via ${sector.via}` : ''}
                </h2>
              </div>

              {MapComponent ? (
                <Suspense fallback={<div style={{ height: '420px' }} className="flex items-center justify-center text-gray-400 text-sm">Loading map…</div>}>
                  <MapComponent />
                </Suspense>
              ) : (
                <iframe
                  title={`Sector ${id} Map`}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=73.7200%2C19.9500%2C73.8200%2C20.0200&layer=mapnik"
                  className="w-full"
                  style={{ height: '420px', border: 'none' }}
                  loading="lazy"
                />
              )}

              <div className="px-4 py-2 bg-orange-50 text-xs text-gray-500">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-kumbh-orange">OpenStreetMap</a> contributors
              </div>
            </div>
          </div>

          {/* Info panel */}
          {infoPanel && (
            <div className="flex-1 min-w-0">
              {infoPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
