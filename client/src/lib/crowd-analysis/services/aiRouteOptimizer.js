// AI-Powered Route Optimization Service

import { CROWD_LEVELS, ROUTE_RECOMMENDATIONS } from '../types';
import crowdDataService from './crowdDataService';

class AIRouteOptimizer {
  constructor() {
    this.weights = {
      crowdDensity: 0.4,      // 40% weight for crowd density
      distance: 0.3,          // 30% weight for distance
      time: 0.2,              // 20% weight for estimated time
      roadQuality: 0.1        // 10% weight for road quality
    };
  }

  // Analyze multiple routes and recommend the best one
  analyzeRoutes(routes, userLocation) {
    if (!routes || routes.length === 0) {
      return null;
    }

    const analyzedRoutes = routes.map(route => this.analyzeRoute(route, userLocation));
    
    // Sort routes by score (higher is better)
    analyzedRoutes.sort((a, b) => b.score - a.score);

    return {
      recommended: analyzedRoutes[0],
      alternatives: analyzedRoutes.slice(1),
      analysis: this.generateAnalysis(analyzedRoutes)
    };
  }

  // Analyze a single route
  analyzeRoute(route, userLocation) {
    const crowdAnalysis = this.analyzeCrowdDensity(route);
    const routeMetrics = this.calculateRouteMetrics(route);
    
    const score = this.calculateRouteScore(crowdAnalysis, routeMetrics);
    const recommendation = this.getRouteRecommendation(score, crowdAnalysis);

    return {
      ...route,
      crowdAnalysis,
      routeMetrics,
      score,
      recommendation,
      reasons: this.generateRecommendationReasons(crowdAnalysis, routeMetrics, score)
    };
  }

  // Analyze crowd density along the route
  analyzeCrowdDensity(route) {
    if (!route || !route.coordinates || route.coordinates.length === 0) {
      return {
        averageDensity: 0,
        maxDensity: 0,
        crowdedSegments: [],
        crowdLevel: CROWD_LEVELS.LOW,
        riskScore: 0,
        segmentData: []
      };
    }

    const segments = this.divideRouteIntoSegments(route.coordinates);
    const crowdData = [];

    segments.forEach((segment, index) => {
      const centerLat = (segment.start.lat + segment.end.lat) / 2;
      const centerLng = (segment.start.lng + segment.end.lng) / 2;
      
      const crowdLevel = crowdDataService.getCrowdLevelAtLocation(centerLat, centerLng);
      
      crowdData.push({
        segmentIndex: index,
        center: { lat: centerLat, lng: centerLng },
        crowdLevel: crowdLevel.level,
        density: crowdLevel.density,
        userCount: crowdLevel.userCount,
        risk: this.calculateSegmentRisk(crowdLevel.level, crowdLevel.density)
      });
    });

    const averageDensity = crowdData.length > 0 ? crowdData.reduce((sum, seg) => sum + seg.density, 0) / crowdData.length : 0;
    const maxDensity = crowdData.length > 0 ? Math.max(...crowdData.map(seg => seg.density)) : 0;
    const crowdedSegments = crowdData.filter(seg => seg.crowdLevel === CROWD_LEVELS.HIGH || seg.crowdLevel === CROWD_LEVELS.VERY_HIGH);
    
    const crowdLevel = this.determineOverallCrowdLevel(averageDensity, maxDensity, crowdedSegments.length);
    const riskScore = this.calculateOverallRiskScore(crowdData);

    return {
      averageDensity,
      maxDensity,
      crowdedSegments,
      crowdLevel,
      riskScore,
      segmentData: crowdData
    };
  }

  // Divide route into segments for analysis
  divideRouteIntoSegments(coordinates) {
    const segments = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      segments.push({
        start: { lat: coordinates[i][0], lng: coordinates[i][1] },
        end: { lat: coordinates[i + 1][0], lng: coordinates[i + 1][1] }
      });
    }
    
    return segments;
  }

  // Calculate segment risk based on crowd level
  calculateSegmentRisk(crowdLevel, density) {
    const riskMap = {
      [CROWD_LEVELS.LOW]: 0.1,
      [CROWD_LEVELS.MEDIUM]: 0.3,
      [CROWD_LEVELS.HIGH]: 0.6,
      [CROWD_LEVELS.VERY_HIGH]: 1.0
    };

    return riskMap[crowdLevel] || 0.1;
  }

  // Determine overall crowd level for the route
  determineOverallCrowdLevel(averageDensity, maxDensity, crowdedSegmentsCount) {
    if (maxDensity >= 50 || crowdedSegmentsCount >= 3) {
      return CROWD_LEVELS.VERY_HIGH;
    } else if (maxDensity >= 25 || crowdedSegmentsCount >= 2) {
      return CROWD_LEVELS.HIGH;
    } else if (averageDensity >= 15 || crowdedSegmentsCount >= 1) {
      return CROWD_LEVELS.MEDIUM;
    } else {
      return CROWD_LEVELS.LOW;
    }
  }

  // Calculate overall risk score for the route
  calculateOverallRiskScore(segmentData) {
    if (!segmentData || segmentData.length === 0) return 0;
    const totalRisk = segmentData.reduce((sum, seg) => sum + seg.risk, 0);
    return totalRisk / segmentData.length;
  }

  // Calculate route metrics (distance, time, etc.)
  calculateRouteMetrics(route) {
    if (!route || !route.coordinates) {
      return {
        distance: 0,
        estimatedTime: 0,
        roadQuality: 0,
        complexity: 0
      };
    }
    
    const distance = this.calculateRouteDistance(route.coordinates);
    const estimatedTime = this.calculateEstimatedTime(distance, route.crowdAnalysis?.crowdLevel || CROWD_LEVELS.LOW);
    const roadQuality = this.estimateRoadQuality(route);

    return {
      distance,
      estimatedTime,
      roadQuality,
      complexity: this.calculateRouteComplexity(route.coordinates)
    };
  }

  // Calculate total route distance
  calculateRouteDistance(coordinates) {
    if (!coordinates || coordinates.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += this.haversineDistance(
        coordinates[i][0], coordinates[i][1],
        coordinates[i + 1][0], coordinates[i + 1][1]
      );
    }
    
    return totalDistance;
  }

  // Haversine distance calculation
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Calculate estimated time based on distance and crowd level
  calculateEstimatedTime(distance, crowdLevel) {
    const baseSpeed = 5; // km/h base walking speed
    const speedReduction = {
      [CROWD_LEVELS.LOW]: 0,
      [CROWD_LEVELS.MEDIUM]: 0.2,
      [CROWD_LEVELS.HIGH]: 0.4,
      [CROWD_LEVELS.VERY_HIGH]: 0.6
    };

    const effectiveSpeed = baseSpeed * (1 - speedReduction[crowdLevel]);
    return (distance / effectiveSpeed) * 60; // Convert to minutes
  }

  // Estimate road quality (simplified)
  estimateRoadQuality(route) {
    // This would ideally use real road data
    // For now, we'll use a simple heuristic
    const distance = this.calculateRouteDistance(route.coordinates);
    const complexity = this.calculateRouteComplexity(route.coordinates);
    
    if (distance < 2 && complexity < 0.3) return 0.9;
    if (distance < 5 && complexity < 0.5) return 0.7;
    if (distance < 10 && complexity < 0.7) return 0.5;
    return 0.3;
  }

  // Calculate route complexity
  calculateRouteComplexity(coordinates) {
    if (!coordinates || coordinates.length < 3) return 0;

    let totalAngleChange = 0;
    for (let i = 1; i < coordinates.length - 1; i++) {
      const angle1 = Math.atan2(
        coordinates[i][1] - coordinates[i-1][1],
        coordinates[i][0] - coordinates[i-1][0]
      );
      const angle2 = Math.atan2(
        coordinates[i+1][1] - coordinates[i][1],
        coordinates[i+1][0] - coordinates[i][0]
      );
      
      let angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      totalAngleChange += angleDiff;
    }

    return Math.min(totalAngleChange / (coordinates.length - 2), 1);
  }

  // Calculate overall route score
  calculateRouteScore(crowdAnalysis, routeMetrics) {
    const crowdScore = 1 - crowdAnalysis.riskScore; // Lower risk = higher score
    const distanceScore = 1 - Math.min(routeMetrics.distance / 20, 1); // Normalize distance
    const timeScore = 1 - Math.min(routeMetrics.estimatedTime / 120, 1); // Normalize time
    const qualityScore = routeMetrics.roadQuality;

    return (
      crowdScore * this.weights.crowdDensity +
      distanceScore * this.weights.distance +
      timeScore * this.weights.time +
      qualityScore * this.weights.roadQuality
    );
  }

  // Get route recommendation based on score and analysis
  getRouteRecommendation(score, crowdAnalysis) {
    if (score >= 0.8 && crowdAnalysis.crowdLevel === CROWD_LEVELS.LOW) {
      return ROUTE_RECOMMENDATIONS.OPTIMAL;
    } else if (score >= 0.6 && crowdAnalysis.crowdLevel !== CROWD_LEVELS.VERY_HIGH) {
      return ROUTE_RECOMMENDATIONS.GOOD;
    } else if (score >= 0.4) {
      return ROUTE_RECOMMENDATIONS.MODERATE;
    } else {
      return ROUTE_RECOMMENDATIONS.AVOID;
    }
  }

  // Generate recommendation reasons
  generateRecommendationReasons(crowdAnalysis, routeMetrics, score) {
    const reasons = [];

    if (crowdAnalysis.crowdLevel === CROWD_LEVELS.LOW) {
      reasons.push('✅ Low crowd density - smooth navigation');
    } else if (crowdAnalysis.crowdLevel === CROWD_LEVELS.VERY_HIGH) {
      reasons.push('⚠️ High crowd density - expect delays');
    }

    if (routeMetrics.distance < 3) {
      reasons.push('✅ Short distance route');
    } else if (routeMetrics.distance > 10) {
      reasons.push('⚠️ Long distance - consider alternatives');
    }

    if (routeMetrics.estimatedTime < 30) {
      reasons.push('✅ Quick estimated time');
    } else if (routeMetrics.estimatedTime > 90) {
      reasons.push('⚠️ Long estimated time');
    }

    if (crowdAnalysis.crowdedSegments.length === 0) {
      reasons.push('✅ No crowded segments detected');
    } else {
      reasons.push(`⚠️ ${crowdAnalysis.crowdedSegments.length} crowded segment(s) along route`);
    }

    return reasons;
  }

  // Generate analysis summary
  generateAnalysis(analyzedRoutes) {
    if (!analyzedRoutes || analyzedRoutes.length === 0) {
      return {
        totalRoutes: 0,
        averageScore: 0,
        crowdLevelDistribution: {
          [CROWD_LEVELS.LOW]: 0,
          [CROWD_LEVELS.MEDIUM]: 0,
          [CROWD_LEVELS.HIGH]: 0,
          [CROWD_LEVELS.VERY_HIGH]: 0
        },
        bestRouteScore: 0,
        worstRouteScore: 0
      };
    }
    
    const crowdLevels = analyzedRoutes.map(route => route.crowdAnalysis?.crowdLevel || CROWD_LEVELS.LOW);
    const avgScore = analyzedRoutes.reduce((sum, route) => sum + (route.score || 0), 0) / analyzedRoutes.length;
    
    return {
      totalRoutes: analyzedRoutes.length,
      averageScore: avgScore,
      crowdLevelDistribution: this.getCrowdLevelDistribution(crowdLevels),
      bestRouteScore: analyzedRoutes[0]?.score || 0,
      worstRouteScore: analyzedRoutes[analyzedRoutes.length - 1]?.score || 0
    };
  }

  // Get crowd level distribution
  getCrowdLevelDistribution(crowdLevels) {
    const distribution = {
      [CROWD_LEVELS.LOW]: 0,
      [CROWD_LEVELS.MEDIUM]: 0,
      [CROWD_LEVELS.HIGH]: 0,
      [CROWD_LEVELS.VERY_HIGH]: 0
    };

    if (crowdLevels && crowdLevels.length > 0) {
      crowdLevels.forEach(level => {
        if (level && distribution.hasOwnProperty(level)) {
          distribution[level]++;
        }
      });
    }

    return distribution;
  }
}

// Create singleton instance
const aiRouteOptimizer = new AIRouteOptimizer();

export default aiRouteOptimizer;
