import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import aiRouteOptimizer from '../../lib/crowd-analysis/services/aiRouteOptimizer';
import { ROUTE_RECOMMENDATIONS, CROWD_LEVELS } from '../../lib/crowd-analysis/types';

const AIRouteRecommendation = ({ 
  routes = [], 
  userLocation, 
  destination, 
  onRouteSelect,
  visible = true 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (routes && routes.length > 0 && userLocation && destination) {
      analyzeRoutes();
    }
  }, [routes, userLocation, destination]);

  const analyzeRoutes = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = aiRouteOptimizer.analyzeRoutes(routes, userLocation);
      setAnalysis(result);
      
      if (result?.recommended) {
        setSelectedRoute(result.recommended);
      }
    } catch (error) {
      console.error('Route analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case ROUTE_RECOMMENDATIONS.OPTIMAL:
        return 'bg-green-100 text-green-800 border-green-300';
      case ROUTE_RECOMMENDATIONS.GOOD:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case ROUTE_RECOMMENDATIONS.MODERATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case ROUTE_RECOMMENDATIONS.AVOID:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case ROUTE_RECOMMENDATIONS.OPTIMAL:
        return '⭐';
      case ROUTE_RECOMMENDATIONS.GOOD:
        return '✅';
      case ROUTE_RECOMMENDATIONS.MODERATE:
        return '⚠️';
      case ROUTE_RECOMMENDATIONS.AVOID:
        return '🚫';
      default:
        return '❓';
    }
  };

  const getCrowdLevelIcon = (level) => {
    switch (level) {
      case CROWD_LEVELS.LOW:
        return '🟢';
      case CROWD_LEVELS.MEDIUM:
        return '🟡';
      case CROWD_LEVELS.HIGH:
        return '🟠';
      case CROWD_LEVELS.VERY_HIGH:
        return '🔴';
      default:
        return '⚪';
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    if (onRouteSelect) {
      onRouteSelect(route);
    }
  };

  if (!visible || !analysis) return null;

  return (
    <div className="ai-route-recommendation">
      {/* Analysis Summary */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-kumbh-text">
            🤖 AI Route Analysis
          </h3>
          {isAnalyzing && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-kumbh-orange"></div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-kumbh-orange">{analysis.analysis.totalRoutes}</div>
            <div className="text-sm text-gray-600">Routes Analyzed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {(analysis.analysis.averageScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {analysis.analysis.crowdLevelDistribution[CROWD_LEVELS.LOW]}
            </div>
            <div className="text-sm text-gray-600">Low Crowd</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {analysis.analysis.crowdLevelDistribution[CROWD_LEVELS.VERY_HIGH]}
            </div>
            <div className="text-sm text-gray-600">High Crowd</div>
          </div>
        </div>
      </Card>

      {/* Recommended Route */}
      {analysis.recommended && (
        <Card className="p-4 mb-4 border-2 border-green-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold text-kumbh-text">Recommended Route</h3>
            </div>
            <Badge className={getRecommendationColor(analysis.recommended.recommendation)}>
              {getRecommendationIcon(analysis.recommended.recommendation)} {analysis.recommended.recommendation.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-kumbh-orange">
                {analysis.recommended.routeMetrics.distance.toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(analysis.recommended.routeMetrics.estimatedTime)} min
              </div>
              <div className="text-sm text-gray-600">Est. Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <span>{getCrowdLevelIcon(analysis.recommended.crowdAnalysis.crowdLevel)}</span>
                <span className="text-lg font-bold">
                  {(analysis.recommended.crowdAnalysis.averageDensity).toFixed(1)}
                </span>
              </div>
              <div className="text-sm text-gray-600">Crowd Density</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Why this route?</h4>
            <div className="space-y-1">
              {analysis.recommended.reasons.map((reason, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => handleRouteSelect(analysis.recommended)}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              🚀 Use Recommended Route
            </Button>
          </div>
        </Card>
      )}

      {/* Alternative Routes */}
      {analysis.alternatives && analysis.alternatives.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-kumbh-text mb-4">
            Alternative Routes
          </h3>
          
          <div className="space-y-3">
            {analysis.alternatives.map((route, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRoute === route
                    ? 'border-kumbh-orange bg-kumbh-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleRouteSelect(route)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Route {index + 2}</span>
                    <Badge className={getRecommendationColor(route.recommendation)}>
                      {getRecommendationIcon(route.recommendation)} {route.recommendation.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Score: {(route.score * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{route.routeMetrics.distance.toFixed(1)} km</span>
                    <div className="text-gray-500">Distance</div>
                  </div>
                  <div>
                    <span className="font-medium">{Math.round(route.routeMetrics.estimatedTime)} min</span>
                    <div className="text-gray-500">Est. Time</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{getCrowdLevelIcon(route.crowdAnalysis.crowdLevel)}</span>
                    <span className="font-medium">
                      {route.crowdAnalysis.averageDensity.toFixed(1)}
                    </span>
                    <div className="text-gray-500">Crowd</div>
                  </div>
                </div>

                {route.crowdedSegments && route.crowdedSegments.length > 0 && (
                  <div className="mt-2 text-xs text-orange-600">
                    ⚠️ {route.crowdedSegments.length} crowded segment(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIRouteRecommendation;
