import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import TransportOption from '@/components/transport-option';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTransportRoutes } from '@/lib/mock-data';

export default function Transport() {
  const { t } = useLanguage();
  const [routeFilters, setRouteFilters] = useState({
    from: '',
    to: ''
  });

  const handlePlanRoute = (e) => {
    e.preventDefault();
    console.log('Planning route:', routeFilters);
  };

  return (
    <div className="min-h-screen bg-kumbh-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kumbh-text mb-2" data-testid="text-page-title">
            {t('transport.title')} | <span className="font-devanagari">{t('transport.title.hindi')}</span>
          </h1>
          <p className="text-gray-700">Real-time transport information and navigation support</p>
        </div>

        {/* Transport Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { name: 'Shuttle Buses', hindi: 'शटल बसें', desc: 'Free shuttles between major ghats', status: '🟢 Active', color: 'bg-yellow-100 text-yellow-600' },
            { name: 'Local Trains', hindi: 'स्थानीय ट्रेनें', desc: 'Connect to Mumbai & Pune', status: '🟢 Running', color: 'bg-blue-100 text-blue-600' },
            { name: 'Auto Rickshaw', hindi: 'ऑटो रिक्शा', desc: 'Short distance travel', status: '🟢 Available', color: 'bg-green-100 text-green-600' },
            { name: 'Walking Routes', hindi: 'पैदल मार्ग', desc: 'Guided walking paths', status: '📍 Live GPS', color: 'bg-purple-100 text-purple-600' }
          ].map((option, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg text-center" data-testid={`card-transport-option-${index}`}>
              <div className={`${option.color} p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="font-bold mb-2" data-testid={`text-option-name-${index}`}>
                {option.name}
              </h3>
              <p className="font-devanagari text-sm text-kumbh-orange mb-2">
                {option.hindi}
              </p>
              <p className="text-gray-600 text-sm">{option.desc}</p>
              <div className="mt-3">
                <span className="text-green-600 text-sm font-semibold">{option.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Route Planner */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-kumbh-text mb-6">
            Plan Your Route | अपना मार्ग योजना बनाएं
          </h2>
          
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" onSubmit={handlePlanRoute}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From | से</label>
              <Select value={routeFilters.from} onValueChange={(value) => setRouteFilters({...routeFilters, from: value})}>
                <SelectTrigger data-testid="select-route-from">
                  <SelectValue placeholder="Select starting point" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Location</SelectItem>
                  <SelectItem value="ramkund">Ramkund Ghat</SelectItem>
                  <SelectItem value="panchavati">Panchavati</SelectItem>
                  <SelectItem value="railway">Railway Station</SelectItem>
                  <SelectItem value="bus">Bus Stand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To | तक</label>
              <Select value={routeFilters.to} onValueChange={(value) => setRouteFilters({...routeFilters, to: value})}>
                <SelectTrigger data-testid="select-route-to">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ramkund">Ramkund Ghat</SelectItem>
                  <SelectItem value="panchavati">Panchavati</SelectItem>
                  <SelectItem value="tapovan">Tapovan</SelectItem>
                  <SelectItem value="nashik-road">Nashik Road Station</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                data-testid="button-plan-route"
              >
                Get Directions
              </Button>
            </div>
          </form>

          {/* Route Results */}
          <div className="space-y-4">
            {mockTransportRoutes.map((route) => (
              <TransportOption key={route.id} route={route} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

