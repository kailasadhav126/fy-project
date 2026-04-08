// Utility to load and parse CSV files
export const loadCSVData = async (csvPath) => {
  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error loading CSV from ${csvPath}:`, error);
    return [];
  }
};

// Parse CSV text into array of objects
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Get headers
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = parseValue(values[index]);
      });
      data.push(obj);
    }
  }
  
  return data;
};

// Parse a CSV line handling quoted fields
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

// Parse value - convert to number if applicable
const parseValue = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '') return null;
  
  // Try to parse as number
  const num = parseFloat(value);
  if (!isNaN(num) && value.trim() !== '') {
    return num;
  }
  
  return value;
};

// Load hotels data
export const loadHotelsData = async () => {
  return await loadCSVData('/data/hotels_nashik.csv');
};

// Load medical services data
export const loadMedicalServicesData = async () => {
  return await loadCSVData('/data/medical_services_nashik.csv');
};

// Load parking data
export const loadParkingData = async () => {
  return await loadCSVData('/data/parking_nashik.csv');
};

