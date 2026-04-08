import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 };
const WALKING_RADIUS_KM = 12;

const journeySteps = [
  {
    id: 'plan',
    title: 'Plan Your Journey',
    subtitle: 'I am travelling to Nashik',
    description: 'Choose train, bus, cab, or road guidance before you enter the city.',
    cta: 'Open travel options',
    path: '/transport/to-city',
    tone: 'bg-blue-50 border-blue-200 text-blue-700',
    actions: [
      { label: 'Train booking', path: '/transport/train' },
      { label: 'Bus booking', path: '/transport/bus' },
      { label: 'Cab booking', path: '/transport/cab' },
      { label: 'Road navigation', path: '/transport/road' },
    ],
  },
  {
    id: 'move',
    title: 'Move Around Nashik',
    subtitle: 'I am already in Nashik',
    description: 'Find parking, city buses, shuttle services, and walking routes from one place.',
    cta: 'Open city transport',
    path: '/transport/in-city',
    tone: 'bg-green-50 border-green-200 text-green-700',
    actions: [
      { label: 'Parking', path: '/parking' },
      { label: 'City bus', path: '/citybus' },
      { label: 'Shuttle services', path: '/shuttleservices' },
      { label: 'Walking routes', path: '/walking-routes' },
    ],
  },
  {
    id: 'ghat',
    title: 'Smart Route to Ghat',
    subtitle: 'Find my ghat and route',
    description: 'Detect sector, parking, allocated ghat, and route guidance using the government route flow.',
    cta: 'Take me to my ghat',
    path: '/complete-navigation',
    tone: 'bg-orange-50 border-orange-200 text-kumbh-orange',
    featured: true,
    actions: [
      { label: 'Use live location', path: '/complete-navigation' },
      { label: 'Sector distribution', path: '/sector-distribution' },
      { label: 'Route map', path: '/navigation' },
    ],
  },
];

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceFromNashikKm(location) {
  if (!location) return null;
  const R = 6371;
  const dLat = toRad(NASHIK_CENTER.lat - location.lat);
  const dLng = toRad(NASHIK_CENTER.lng - location.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(location.lat)) *
      Math.cos(toRad(NASHIK_CENTER.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function TransportTesting() {
  const [, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState('ghat');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const distanceKm = useMemo(() => distanceFromNashikKm(userLocation), [userLocation]);
  const isNearNashik = typeof distanceKm === 'number' && distanceKm <= WALKING_RADIUS_KM;
  const activeJourney = journeySteps.find((step) => step.id === activeStep) || journeySteps[2];

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(nextLocation);
        setLocationStatus('ready');

        const nextDistance = distanceFromNashikKm(nextLocation);
        setActiveStep(nextDistance !== null && nextDistance <= WALKING_RADIUS_KM ? 'move' : 'plan');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => setLocation('/')}>
            Back to Home
          </Button>
          <Button
            onClick={() => setLocation('/complete-navigation')}
            className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
          >
            Take me to my ghat
          </Button>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg border border-orange-100">
          <Badge className="mb-3 bg-kumbh-orange text-white">Testing Module</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text mb-3">
            Smooth Transport Flow
          </h1>
          <p className="max-w-3xl text-gray-700">
            Start with what you need right now: reach Nashik, move inside Nashik, or go directly to your assigned ghat.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={detectLocation}
              disabled={locationStatus === 'loading'}
              className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
            >
              {locationStatus === 'loading' ? 'Checking location...' : 'Use my location'}
            </Button>
            <Button variant="outline" onClick={() => setActiveStep('ghat')}>
              Open smart route
            </Button>
          </div>

          {locationStatus === 'ready' && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {isNearNashik
                ? `You are about ${distanceKm.toFixed(1)} km from Nashik center. City transport and walking routes are useful now.`
                : `You are about ${distanceKm.toFixed(1)} km from Nashik center. Plan your journey to Nashik first.`}
            </div>
          )}
          {locationStatus === 'denied' && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Location permission is unavailable. You can still choose any journey option manually.
            </div>
          )}
          {locationStatus === 'unsupported' && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              This browser does not support live location. You can still choose any journey option manually.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {journeySteps.map((step, index) => (
            <Card
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`cursor-pointer rounded-lg border-2 p-5 transition-all hover:shadow-lg ${
                activeStep === step.id ? step.tone : 'border-gray-200 bg-white'
              } ${step.featured ? 'ring-2 ring-orange-100' : ''}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-kumbh-orange text-sm font-bold text-white">
                  {index + 1}
                </span>
                {step.featured && <Badge className="bg-kumbh-orange text-white">Main</Badge>}
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{step.subtitle}</p>
              <h2 className="mt-1 text-2xl font-bold text-kumbh-text">{step.title}</h2>
              <p className="mt-3 text-sm text-gray-700">{step.description}</p>
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  setLocation(step.path);
                }}
                className="mt-5 w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
              >
                {step.cta}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-lg border border-orange-100 bg-white p-6 shadow-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-kumbh-orange">Selected path</p>
            <h2 className="mt-2 text-2xl font-bold text-kumbh-text">{activeJourney.title}</h2>
            <p className="mt-2 text-gray-700">{activeJourney.description}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeJourney.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setLocation(action.path)}
                  className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-left font-semibold text-kumbh-text transition-colors hover:bg-orange-100"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="rounded-lg border-2 border-orange-200 bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-kumbh-text">Recommended final flow</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="font-semibold text-blue-700">Outside Nashik</p>
                <p className="text-sm text-gray-700">Plan Your Journey, then switch to Smart Route to Ghat near the city.</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="font-semibold text-green-700">Inside Nashik</p>
                <p className="text-sm text-gray-700">Use parking, buses, shuttles, or walking routes based on distance.</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="font-semibold text-kumbh-orange">Near the ghat</p>
                <p className="text-sm text-gray-700">Smart Route to Ghat detects sector, assigned parking, and allocated ghat.</p>
              </div>
            </div>
          </Card>
        </div>

        <Button
          onClick={() => setLocation('/complete-navigation')}
          className="fixed bottom-5 right-5 z-40 rounded-lg bg-kumbh-orange px-5 py-3 text-white shadow-lg hover:bg-kumbh-deep"
        >
          Take me to my ghat
        </Button>
      </div>
    </div>
  );
}
