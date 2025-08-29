import React, { useEffect, useRef, useCallback } from 'react';

// Add custom CSS for tooltips
const tooltipStyles = `
  .custom-tooltip {
    background: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    z-index: 1000 !important;
  }
  
  .custom-tooltip::before {
    border-top-color: white !important;
  }
  
  .leaflet-tooltip-top:before {
    border-top-color: white !important;
  }
  
  .leaflet-tooltip-bottom:before {
    border-bottom-color: white !important;
  }
  
  .leaflet-tooltip-left:before {
    border-left-color: white !important;
  }
  
  .leaflet-tooltip-right:before {
    border-right-color: white !important;
  }
`;

const InteractiveMap = ({ centers, onCenterClick, selectedCenterId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Memoize the center click handler to prevent unnecessary re-renders
  const handleCenterClick = useCallback((centerId) => {
    onCenterClick(centerId);
  }, [onCenterClick]);

  useEffect(() => {
    // Inject custom CSS for tooltips
    if (!document.getElementById('leaflet-custom-tooltip-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'leaflet-custom-tooltip-styles';
      styleElement.textContent = tooltipStyles;
      document.head.appendChild(styleElement);
    }

    // Simple approach: use global Leaflet from CDN
    if (!window.L || !mapRef.current) {
      console.warn('🗺️ Leaflet not available or map ref not ready');
      return;
    }

    const L = window.L;
    console.log('🗺️ Initializing map with', centers?.length, 'centers');

    // If map already exists, don't recreate it
    if (mapInstanceRef.current) {
      console.log('🗺️ Map already exists, skipping initialization');
      return;
    }

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [25.7617, -80.1918], // Miami
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true
    });

    // Store map instance reference
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add markers for centers
    const markers = [];
    if (centers && centers.length > 0) {
      centers.forEach((center) => {
        // Use actual geo coordinates from mock data, fallback to Miami area if not available
        const lat = center.geo?.lat || (25.7617 + (Math.random() - 0.5) * 0.2);
        const lng = center.geo?.lng || (-80.1918 + (Math.random() - 0.5) * 0.2);

        const marker = L.marker([lat, lng]).addTo(map);
        markers.push(marker);
        
        // Add hover tooltip
        marker.bindTooltip(`
          <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1f2937;">
              ${center.name}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
              📍 ${center.address.city}, ${center.address.state}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
              ⭐ ${center.rating || 'N/A'} (${center.reviewCount || 0} reviews)
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
              🏥 ${center.modalities?.slice(0, 3).join(', ')}${center.modalities?.length > 3 ? '...' : ''}
            </div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 4px; font-style: italic;">
              Click for full details
            </div>
          </div>
        `, {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          opacity: 0.95,
          className: 'custom-tooltip'
        });

        // Add popup for click (more detailed)
        marker.bindPopup(`
          <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${center.name}</h3>
            <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">
              📍 ${center.address.street}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;${center.address.city}, ${center.address.state} ${center.address.zip}
            </p>
            <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">
              ⭐ ${center.rating || 'N/A'} (${center.reviewCount || 0} reviews) • 📞 ${center.phone}
            </p>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
              🏥 ${center.modalities?.join(', ')}
            </p>
            <button onclick="window.dispatchEvent(new CustomEvent('centerClick', {detail: '${center.id}'}))" 
                    style="background: #0ea5e9; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
              View Full Details
            </button>
          </div>
        `);

        // Add click event
        marker.on('click', () => {
          handleCenterClick(center.id);
        });
      });

      // Fit map to show all markers using the markers array
      if (markers.length > 0) {
        try {
          const group = L.featureGroup(markers);
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.1));
          } else {
            console.warn('🗺️ Invalid bounds, using default view');
          }
        } catch (error) {
          console.error('🗺️ Error fitting bounds:', error);
          // Keep the default center and zoom
        }
      }
    }

    // Add event listener for popup button clicks
    const handlePopupCenterClick = (event) => {
      handleCenterClick(event.detail);
    };
    window.addEventListener('centerClick', handlePopupCenterClick);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      window.removeEventListener('centerClick', handlePopupCenterClick);
    };
  }, [centers]); // Removed onCenterClick from dependencies

  return (
    <div className="relative w-full h-full min-h-[500px] z-0">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg border border-border z-0"
        style={{ 
          minHeight: '500px', 
          zIndex: 0,
          position: 'relative'
        }}
      />
      
      {/* Simple Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-border p-3 shadow-lg z-10">
        <div className="text-sm font-medium mb-2">Map Legend</div>
        <div className="text-xs text-gray-600 mb-1">• Hover markers for quick info</div>
        <div className="text-xs text-gray-600">• Click markers for full details</div>
      </div>
    </div>
  );
};

export default InteractiveMap;
