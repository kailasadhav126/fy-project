// Note: This is ONLY for demonstration purposes as the design reference contains mock data
// In production, this would be replaced with actual API calls

export const mockHotels = [
  {
    id: '1',
    name: 'Bon Vivant',
    location: 'Near Ramkund',
    address: '123 Ramkund Road, Nashik',
    price: '3500',
    rating: '4.5',
    reviews: 156,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Spa', 'Pool'],
    distance: '0.5'
  },
  {
    id: '2',
    name: 'Courtyard By Marriott',
    location: 'Near Panchavati',
    address: '456 Panchavati Street, Nashik',
    price: '8500',
    rating: '4.8',
    reviews: 234,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Parking', 'Restaurant', 'Gym', 'Pool', 'Spa'],
    distance: '1.2'
  },
  {
    id: '3',
    name: 'Express Inn',
    location: 'Near Tapovan',
    address: '789 Tapovan Road, Nashik',
    price: '1800',
    rating: '4.1',
    reviews: 89,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Parking'],
    distance: '0.8'
  },
  {
    id: '4',
    name: 'Ibis',
    location: 'Near Nashik Road Station',
    address: '321 Station Road, Nashik',
    price: '4200',
    rating: '4.3',
    reviews: 178,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Gym', 'Business Center'],
    distance: '2.1'
  },
  {
    id: '5',
    name: 'IRA by Orchid Hotels',
    location: 'Near Dwarka',
    address: '654 Dwarka Circle, Nashik',
    price: '2800',
    rating: '4.4',
    reviews: 142,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Spa', 'Pool'],
    distance: '1.5'
  },
  {
    id: '6',
    name: 'Hotel Grand Rio',
    location: 'Near Civil Hospital',
    address: '987 Civil Lines, Nashik',
    price: '2200',
    rating: '4.0',
    reviews: 98,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Parking'],
    distance: '1.8'
  },
  {
    id: '7',
    name: '7 Apple Hotel',
    location: 'Near C.B.S',
    address: '147 C.B.S Road, Nashik',
    price: '1600',
    rating: '3.9',
    reviews: 67,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant'],
    distance: '0.9'
  },
  {
    id: '8',
    name: 'Hotel Triton',
    location: 'Near Shalimar',
    address: '258 Shalimar Road, Nashik',
    price: '1900',
    rating: '4.2',
    reviews: 112,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Parking', 'Gym'],
    distance: '1.3'
  }
];

export const mockMedicalFacilities = [
  {
    id: '1',
    name: 'Nashik District Hospital',
    type: 'Multi-specialty Hospital',
    address: 'College Road, Nashik',
    phone: '+91-253-2571234',
    emergency24x7: true,
    distance: '2.5',
    services: ['Emergency', 'Surgery', 'Medicine', 'Orthopedics']
  },
  {
    id: '2',
    name: 'Kumbh Medical Camp - Ramkund',
    type: 'Primary Healthcare Camp',
    address: 'Near Ramkund Ghat',
    phone: '+91-253-2345890',
    emergency24x7: false,
    distance: '0.3',
    services: ['Basic Treatment', 'First Aid', 'Consultation']
  }
];

export const mockTransportRoutes = [
  {
    id: '1',
    name: 'Bus Route #12',
    type: 'Bus',
    fromLocation: 'Current Location',
    toLocation: 'Ramkund',
    duration: 15,
    cost: '20',
    description: 'Via College Road',
    active: true
  },
  {
    id: '2',
    name: 'Walking Route',
    type: 'Walking',
    fromLocation: 'Current Location',
    toLocation: 'Ramkund',
    duration: 25,
    cost: '0',
    description: '1.8 km walk with shaded paths',
    active: true
  }
];

export const mockEmergencyContacts = [
  {
    id: '1',
    name: 'Police Control Room',
    phone: '100',
    type: 'Police',
    available24x7: true
  },
  {
    id: '2',
    name: 'Emergency Ambulance',
    phone: '108',
    type: 'Medical',
    available24x7: true
  },
  {
    id: '3',
    name: 'Fire & Rescue',
    phone: '101',
    type: 'Fire',
    available24x7: true
  },
  {
    id: '4',
    name: 'Kumbh Helpdesk',
    phone: '1800-123-4567',
    type: 'General',
    available24x7: true
  }
];
