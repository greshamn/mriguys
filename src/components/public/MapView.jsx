import React from 'react';
import { Card, CardContent } from '../ui/card';
import { MapPin, ZoomIn, ZoomOut, Navigation, Layers } from 'lucide-react';

export function MapView({ centers, onCenterClick }) {
  // This is a placeholder for the actual map implementation
  // In production, this would integrate with Leaflet, Google Maps, or similar
  
  return (
    <Card className="h-96">
      <CardContent className="p-0 h-full relative">
        {/* Map Placeholder */}
        <div className="w-full h-full bg-muted flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Map View
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive map coming soon
            </p>
            <p className="text-xs text-muted-foreground">
              {centers.length} centers found in this area
            </p>
          </div>
          
          {/* Mock Center Markers */}
          {centers.slice(0, 8).map((center, index) => {
            // Create a more realistic distribution of markers
            const angle = (index / centers.length) * 2 * Math.PI;
            const radius = 30 + (index % 3) * 10;
            const left = 50 + Math.cos(angle) * radius;
            const top = 50 + Math.sin(angle) * radius;
            
            return (
              <div
                key={center.id}
                className="absolute cursor-pointer hover:scale-110 transition-transform group"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
                onClick={() => onCenterClick(center)}
              >
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-background group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <div className="bg-background/95 backdrop-blur-sm text-foreground text-xs px-3 py-2 rounded-lg mt-2 whitespace-nowrap shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="font-medium">{center.name}</div>
                  <div className="text-muted-foreground">{center.address.city}, {center.address.state}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
            <button className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs hover:bg-muted/80 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
            <button className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs hover:bg-muted/80 transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
            <button className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs hover:bg-muted/80 transition-colors">
              <Navigation className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
            <button className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs hover:bg-muted/80 transition-colors">
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
          <div className="text-xs font-medium text-foreground mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Imaging Center</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-muted rounded-full border border-border"></div>
              <span>Map Controls</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
