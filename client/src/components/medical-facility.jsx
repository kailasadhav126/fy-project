import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function MedicalFacilityCard({ facility, onGetDirections }) {
  const [, setLocation] = useLocation();
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow" data-testid={`card-medical-${facility.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`${facility.emergency24x7 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} p-2 rounded-full`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6h5v2h2V6h1V4h-1V1H9v3H4v2zm0 4h5v2H4v-2zm0 4h5v2H4v-2z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900" data-testid={`text-medical-name-${facility.id}`}>
                {facility.name}
              </h4>
              <p className="text-sm text-gray-600" data-testid={`text-medical-type-${facility.id}`}>
                {facility.type}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            </svg>
            <span data-testid={`text-medical-distance-${facility.id}`}>
              {facility.distance} km away
            </span>
            <span className="ml-4" data-testid={`text-medical-address-${facility.id}`}>
              {facility.address}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className={`${facility.emergency24x7 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-full text-xs mr-2`} data-testid={`badge-medical-service-${facility.id}`}>
              {facility.emergency24x7 ? '24/7 Emergency' : 'Free Treatment'}
            </span>
            <span className="text-gray-600" data-testid={`text-medical-phone-${facility.id}`}>
              📞 {facility.phone}
            </span>
          </div>
        </div>
        <Button 
          onClick={() => {
            // Store facility data for navigation
            const facilityData = {
              name: facility.name,
              address: facility.address,
              coordinates: facility.coordinates || { lat: 19.9975, lng: 73.7898 },
              type: facility.type,
              timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('navigationDestination', JSON.stringify(facilityData));
            setLocation('/navigation');
          }}
          className="bg-kumbh-orange text-white hover:bg-kumbh-deep ml-4"
          data-testid={`button-directions-medical-${facility.id}`}
        >
          Get Directions
        </Button>
      </div>
    </div>
  );
}
