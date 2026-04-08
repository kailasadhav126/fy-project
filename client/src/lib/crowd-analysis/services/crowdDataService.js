// Crowd Data Collection and Management Service

import { CROWD_LEVELS, CROWD_THRESHOLDS, GRID_CELL_SIZE, CROWD_UPDATE_INTERVAL } from '../types';

class CrowdDataService {
  constructor() {
    this.activeUsers = new Map(); // user_id -> location_data
    this.crowdGrid = new Map(); // grid_key -> crowd_data
    this.listeners = new Set();
    this.updateInterval = null;
    this.isRunning = false;
  }

  // Start the crowd data collection service
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.updateCrowdData();
    }, CROWD_UPDATE_INTERVAL);

    console.log('Crowd analysis service started');
  }

  // Stop the crowd data collection service
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log('Crowd analysis service stopped');
  }

  // Register a user's location
  registerUserLocation(userId, location, metadata = {}) {
    const userData = {
      id: userId,
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || 10,
        timestamp: Date.now()
      },
      metadata: {
        deviceType: metadata.deviceType || 'mobile',
        appVersion: metadata.appVersion || '1.0.0',
        ...metadata
      }
    };

    this.activeUsers.set(userId, userData);
    this.updateCrowdGrid();
    this.notifyListeners();
  }

  // Remove user from tracking
  removeUser(userId) {
    this.activeUsers.delete(userId);
    this.updateCrowdGrid();
    this.notifyListeners();
  }

  // Generate grid key from coordinates
  generateGridKey(lat, lng) {
    const gridLat = Math.floor(lat * 10000 / GRID_CELL_SIZE) * GRID_CELL_SIZE / 10000;
    const gridLng = Math.floor(lng * 10000 / GRID_CELL_SIZE) * GRID_CELL_SIZE / 10000;
    return `${gridLat.toFixed(6)},${gridLng.toFixed(6)}`;
  }

  // Update crowd density grid
  updateCrowdGrid() {
    this.crowdGrid.clear();

    // Group users by grid cells
    this.activeUsers.forEach((userData) => {
      const { lat, lng } = userData.location;
      const gridKey = this.generateGridKey(lat, lng);
      
      if (!this.crowdGrid.has(gridKey)) {
        this.crowdGrid.set(gridKey, {
          key: gridKey,
          center: {
            lat: Math.floor(lat * 10000 / GRID_CELL_SIZE) * GRID_CELL_SIZE / 10000 + GRID_CELL_SIZE / 20000,
            lng: Math.floor(lng * 10000 / GRID_CELL_SIZE) * GRID_CELL_SIZE / 10000 + GRID_CELL_SIZE / 20000
          },
          users: [],
          density: 0,
          level: CROWD_LEVELS.LOW,
          lastUpdated: Date.now()
        });
      }

      const gridCell = this.crowdGrid.get(gridKey);
      gridCell.users.push(userData);
    });

    // Calculate density and crowd level for each grid cell
    this.crowdGrid.forEach((gridCell) => {
      const userCount = gridCell.users ? gridCell.users.length : 0;
      const cellArea = (GRID_CELL_SIZE * GRID_CELL_SIZE) / 10000; // Convert to hectares
      gridCell.density = userCount / cellArea;
      
      // Determine crowd level
      if (gridCell.density <= CROWD_THRESHOLDS.LOW) {
        gridCell.level = CROWD_LEVELS.LOW;
      } else if (gridCell.density <= CROWD_THRESHOLDS.MEDIUM) {
        gridCell.level = CROWD_LEVELS.MEDIUM;
      } else if (gridCell.density <= CROWD_THRESHOLDS.HIGH) {
        gridCell.level = CROWD_LEVELS.HIGH;
      } else {
        gridCell.level = CROWD_LEVELS.VERY_HIGH;
      }
    });
  }

  // Get crowd data for a specific area
  getCrowdData(bounds) {
    const { north, south, east, west } = bounds;
    const relevantCells = [];

    this.crowdGrid.forEach((gridCell) => {
      const { lat, lng } = gridCell.center;
      if (lat >= south && lat <= north && lng >= west && lng <= east) {
        relevantCells.push(gridCell);
      }
    });

    return relevantCells;
  }

  // Get crowd level for specific coordinates
  getCrowdLevelAtLocation(lat, lng) {
    const gridKey = this.generateGridKey(lat, lng);
    const gridCell = this.crowdGrid.get(gridKey);
    
    if (!gridCell) {
      return {
        level: CROWD_LEVELS.LOW,
        density: 0,
        userCount: 0
      };
    }

    return {
      level: gridCell.level,
      density: gridCell.density,
      userCount: gridCell.users ? gridCell.users.length : 0
    };
  }

  // Get all active users
  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  // Get crowd statistics
  getCrowdStatistics() {
    const totalUsers = this.activeUsers ? this.activeUsers.size : 0;
    const gridCells = this.crowdGrid ? Array.from(this.crowdGrid.values()) : [];
    
    const levelCounts = {
      [CROWD_LEVELS.LOW]: 0,
      [CROWD_LEVELS.MEDIUM]: 0,
      [CROWD_LEVELS.HIGH]: 0,
      [CROWD_LEVELS.VERY_HIGH]: 0
    };

    if (gridCells && gridCells.length > 0) {
      gridCells.forEach(cell => {
        if (cell && cell.level && levelCounts.hasOwnProperty(cell.level)) {
          levelCounts[cell.level]++;
        }
      });
    }

    return {
      totalUsers,
      totalCells: gridCells.length,
      levelCounts,
      averageDensity: gridCells.length > 0 ? 
        gridCells.reduce((sum, cell) => sum + (cell.density || 0), 0) / gridCells.length : 0
    };
  }

  // Add listener for crowd data updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of data updates
  notifyListeners() {
    const crowdData = {
      grid: Array.from(this.crowdGrid.values()),
      statistics: this.getCrowdStatistics(),
      timestamp: Date.now()
    };

    this.listeners.forEach(callback => {
      try {
        callback(crowdData);
      } catch (error) {
        console.error('Error in crowd data listener:', error);
      }
    });
  }

  // Simulate crowd data for testing
  simulateCrowdData() {
    const nashikBounds = {
      north: 20.1,
      south: 19.8,
      east: 73.9,
      west: 73.7
    };

    // Simulate random user locations
    for (let i = 0; i < 150; i++) {
      const lat = nashikBounds.south + Math.random() * (nashikBounds.north - nashikBounds.south);
      const lng = nashikBounds.west + Math.random() * (nashikBounds.east - nashikBounds.west);
      
      this.registerUserLocation(`user_${i}`, { lat, lng }, {
        deviceType: 'mobile',
        simulated: true
      });
    }
  }
}

// Create singleton instance
const crowdDataService = new CrowdDataService();

export default crowdDataService;
