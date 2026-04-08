export default function TransportOption({ route }) {
  const getTransportIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'bus':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
          </svg>
        );
      case 'walking':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15.5 20.5L18 18l-2.5-2.5L14 17l1.5 3.5zM9.5 20.5L8 17l-1.5-1.5L4 18l2.5 2.5z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
          </svg>
        );
    }
  };

  const getIconBg = (type) => {
    switch (type.toLowerCase()) {
      case 'bus':
        return 'bg-blue-100 text-blue-600';
      case 'walking':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4" data-testid={`card-transport-${route.id}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`${getIconBg(route.type)} p-2 rounded-full`}>
            {getTransportIcon(route.type)}
          </div>
          <div>
            <h4 className="font-semibold" data-testid={`text-transport-name-${route.id}`}>
              {route.name}
            </h4>
            <p className="text-sm text-gray-600" data-testid={`text-transport-description-${route.id}`}>
              {route.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-kumbh-orange" data-testid={`text-transport-duration-${route.id}`}>
            {route.duration} mins
          </p>
          <p className="text-sm text-gray-600" data-testid={`text-transport-cost-${route.id}`}>
            {route.cost === '0' ? 'Free' : `₹${route.cost}`}
          </p>
        </div>
      </div>
      <div className="text-sm text-gray-600" data-testid={`text-transport-details-${route.id}`}>
        {route.type === 'Bus' ? 'Walk 5 min → Bus 8 min → Walk 2 min' : 
         route.type === 'Walking' ? '1.8 km walk with shaded paths' : 
         route.description}
      </div>
    </div>
  );
}
