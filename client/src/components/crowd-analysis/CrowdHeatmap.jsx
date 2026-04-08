import React, { useEffect, useState } from 'react';
import { CROWD_LEVELS, HEATMAP_COLORS } from '../../lib/crowd-analysis/types';
import crowdDataService from '../../lib/crowd-analysis/services/crowdDataService';

const CrowdHeatmap = ({ map, bounds, visible = true }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!map || !visible) return;

    const updateHeatmap = (crowdData) => {
      try {
        const relevantData = bounds ? 
          crowdData.grid.filter(cell => 
            cell.center.lat >= bounds.south && 
            cell.center.lat <= bounds.north &&
            cell.center.lng >= bounds.west && 
            cell.center.lng <= bounds.east
          ) : crowdData.grid;

        setHeatmapData(relevantData);
        renderHeatmap(map, relevantData);
      } catch (error) {
        console.error('Error updating heatmap:', error);
      }
    };

    let unsubscribe;
    try {
      unsubscribe = crowdDataService.addListener(updateHeatmap);
      
      // Initial data load
      setIsLoading(true);
      const initialData = {
        grid: Array.from(crowdDataService.crowdGrid.values()),
        statistics: crowdDataService.getCrowdStatistics(),
        timestamp: Date.now()
      };
      updateHeatmap(initialData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting up crowd heatmap:', error);
      setIsLoading(false);
    }

    return unsubscribe;
  }, [map, bounds, visible]);

  const renderHeatmap = (mapInstance, data) => {
    // Check if Leaflet is available
    if (!window.L) {
      console.warn('Leaflet not available for heatmap rendering');
      return;
    }

    // Clear existing heatmap layers
    if (window.heatmapLayer) {
      mapInstance.removeLayer(window.heatmapLayer);
    }

    // Create new heatmap layer
    const heatmapLayer = window.L.layerGroup();
    
    data.forEach(cell => {
      const color = HEATMAP_COLORS[cell.level];
      const opacity = Math.min(0.7, cell.density / 100);
      
      // Create circle marker for each grid cell
      const circle = window.L.circle([cell.center.lat, cell.center.lng], {
        radius: 50, // 50 meter radius
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        weight: 1
      });

      // Add popup with crowd information
      circle.bindPopup(`
        <div class="crowd-popup">
          <h4>Crowd Analysis</h4>
          <p><strong>Level:</strong> ${cell.level.toUpperCase()}</p>
          <p><strong>Density:</strong> ${cell.density.toFixed(1)} users/100m²</p>
          <p><strong>Users:</strong> ${cell.users.length}</p>
          <p><strong>Last Updated:</strong> ${new Date(cell.lastUpdated).toLocaleTimeString()}</p>
        </div>
      `);

      heatmapLayer.addLayer(circle);
    });

    // Add heatmap layer to map
    heatmapLayer.addTo(mapInstance);
    window.heatmapLayer = heatmapLayer;
  };

  if (!visible) return null;

  return (
    <div className="crowd-heatmap-container">
      {isLoading && (
        <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Updating heatmap...</span>
          </div>
        </div>
      )}
      
      {/* Heatmap Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-2">Crowd Density</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Low (0-10 users)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Medium (11-25 users)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm">High (26-50 users)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm">Very High (50+ users)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdHeatmap;
