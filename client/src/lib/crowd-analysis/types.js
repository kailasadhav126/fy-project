// Crowd Analysis System Types

export const CROWD_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
};

export const HEATMAP_COLORS = {
  [CROWD_LEVELS.LOW]: '#00FF00',      // Green - Low crowd
  [CROWD_LEVELS.MEDIUM]: '#FFFF00',   // Yellow - Medium crowd
  [CROWD_LEVELS.HIGH]: '#FFA500',     // Orange - High crowd
  [CROWD_LEVELS.VERY_HIGH]: '#FF0000' // Red - Very high crowd
};

export const ROUTE_RECOMMENDATIONS = {
  OPTIMAL: 'optimal',
  GOOD: 'good',
  MODERATE: 'moderate',
  AVOID: 'avoid'
};

export const CROWD_THRESHOLDS = {
  LOW: 10,      // 0-10 users per 100m²
  MEDIUM: 25,   // 11-25 users per 100m²
  HIGH: 50,     // 26-50 users per 100m²
  VERY_HIGH: 100 // 50+ users per 100m²
};

// Grid cell size for crowd analysis (in meters)
export const GRID_CELL_SIZE = 100;

// Update interval for crowd data (in milliseconds)
export const CROWD_UPDATE_INTERVAL = 30000; // 30 seconds
