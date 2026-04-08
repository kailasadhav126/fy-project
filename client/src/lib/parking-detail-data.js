const SECTOR_PARKING_DISTRIBUTION = [
  { id: '1', label: 'Sector 1', via: 'Dhule', parkings: ['Adgaon Truck Terminal', 'Niligiri Bagh Parking'] },
  { id: '2', label: 'Sector 2', via: 'Pune', parkings: ['Chincholi Shivar Outer Parking', 'Mohagaon Outer Parking', 'Sinnar Phata Market Inner Parking'] },
  { id: '3', label: 'Sector 3', via: 'Mumbai', parkings: ['Rajur Bahula Outer Parking', 'Mahamarg Bus Stand Inner Parking'] },
  { id: '4', label: 'Sector 4', via: 'Shambhaji Nagar', parkings: ['Mhadsangvi Outer Parking'] },
  { id: '5', label: 'Sector 5', via: 'Peth', parkings: ['Thakkar Maidan Peth Road Outer Parking', 'Sharad Chandra Pawar Market Yard Inner Parking'] },
  { id: '6', label: 'Sector 6', via: 'Dindori', parkings: ['Health Science University Outer Parking', 'Ratan Luth Estate Inner Parking'] },
  { id: '7', label: 'Sector 7', via: 'Girnare (Gangapur Road)', parkings: ['Dugaon Outer Parking', 'Dongre Vasti Gruh'] },
  { id: '8', label: 'Sector 8', via: 'Trimbak', parkings: ['Khambale Outer Parking', 'Satpur Bus Stand Inner Parking'] },
  { id: '9', label: 'Sector 9', via: 'Nashik City Access', parkings: [] },
  { id: '10a', label: 'Sector 10A', via: 'Nashik Road', parkings: [] },
  { id: '10b', label: 'Sector 10B', via: 'Devlali Camp Station', parkings: [] },
];

function createSeededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createTemplateSlots(rows, cols, seed) {
  const random = createSeededRandom(seed);
  const slots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const chance = random();
      let status = 'available';
      if (chance < 0.11) status = 'occupied';
      else if (chance < 0.20) status = 'reserved';
      else if (chance < 0.27) status = 'blocked';

      const vehicleNumber = `MH15${Math.floor(1000 + random() * 8999)}`;
      slots.push({
        id: `${String.fromCharCode(65 + row)}-${String(col + 1).padStart(2, '0')}`,
        status,
        reservedFor: status === 'reserved' ? `Pilgrim ${Math.floor(10 + random() * 89)}` : '',
        vehicleNumber: status === 'occupied' || status === 'reserved' ? vehicleNumber : '',
      });
    }
  }
  return slots;
}

const PARKING_GRID_TEMPLATES = {
  'grid-a': { key: 'grid-a', label: 'Riverfront Grid A', rows: 4, cols: 8, slots: createTemplateSlots(4, 8, 101) },
  'grid-b': { key: 'grid-b', label: 'Ghatside Grid B', rows: 5, cols: 7, slots: createTemplateSlots(5, 7, 202) },
  'grid-c': { key: 'grid-c', label: 'Ringroad Grid C', rows: 6, cols: 6, slots: createTemplateSlots(6, 6, 303) },
  'grid-d': { key: 'grid-d', label: 'Transit Grid D', rows: 5, cols: 8, slots: createTemplateSlots(5, 8, 404) },
  'grid-e': { key: 'grid-e', label: 'Mela Grid E', rows: 4, cols: 10, slots: createTemplateSlots(4, 10, 505) },
};

const PARKING_TEMPLATE_BY_NAME = {
  'adgaon truck terminal': 'grid-a',
  'adgaon truck terminal parking': 'grid-a',
  'niligiri bagh parking': 'grid-b',
  'chincholi shivar outer parking': 'grid-c',
  'mohagaon outer parking': 'grid-d',
  'sinnar phata market inner parking': 'grid-e',
  'rajur bahula outer parking': 'grid-a',
  'mahamarg bus stand inner parking': 'grid-b',
  'mhadsangvi outer parking': 'grid-c',
  'thakkar maidan peth road outer parking': 'grid-d',
  'sharad chandra pawar market yard inner parking': 'grid-e',
  'health science university outer parking': 'grid-a',
  'ratan luth estate inner parking': 'grid-b',
  'dugaon outer parking': 'grid-c',
  'dongre vasti gruh': 'grid-d',
  'khambale outer parking': 'grid-e',
  'satpur bus stand inner parking': 'grid-a',
};

function normalizeParkingName(name) {
  return String(name || '').trim().toLowerCase();
}

function getFallbackTemplateKey(parkingName) {
  const keys = Object.keys(PARKING_GRID_TEMPLATES);
  if (!parkingName) return keys[0];
  const hash = parkingName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return keys[hash % keys.length];
}

export function createParkingDetailPath(parkingName) {
  const safeName = String(parkingName || '').trim() || 'Selected Parking';
  return `/parking-detail/${encodeURIComponent(safeName)}`;
}

export function decodeParkingNameSlug(parkingNameSlug) {
  if (!parkingNameSlug) return 'Selected Parking';
  try {
    return decodeURIComponent(parkingNameSlug);
  } catch (error) {
    console.error('Failed to decode parking name from URL slug', error);
    return String(parkingNameSlug);
  }
}

export function getParkingGridData(parkingName) {
  const safeParkingName = String(parkingName || '').trim() || 'Selected Parking';
  const normalizedName = normalizeParkingName(safeParkingName);
  const templateKey = PARKING_TEMPLATE_BY_NAME[normalizedName] || getFallbackTemplateKey(normalizedName);
  const template = PARKING_GRID_TEMPLATES[templateKey];

  return {
    parkingName: safeParkingName,
    templateKey: template.key,
    templateLabel: template.label,
    rows: template.rows,
    cols: template.cols,
    slots: template.slots.map((slot) => ({ ...slot })),
  };
}

export { SECTOR_PARKING_DISTRIBUTION };
