import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, MapPin, Clock, Phone, Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { generateReferralURL } from '../../lib/deepLinking';

export function CenterCard({ center, onClick }) {
  const { toggleFavoriteCenter, isFavoriteCenter } = useFavorites();
  
  // Calculate mock distance (in real app, would use geocoding)
  const mockDistance = Math.floor(Math.random() * 20) + 1;
  
  // Format modalities for display
  const formatModalities = (modalities) => {
    if (!modalities || modalities.length === 0) return [];
    return modalities.slice(0, 3); // Show max 3 modalities
  };

  // Format TAT for display
  const formatTAT = (tat) => {
    if (!tat) return 'N/A';
    if (tat <= 1) return 'Same day';
    if (tat <= 2) return '1-2 days';
    if (tat <= 5) return '3-5 days';
    return `${tat}+ days`;
  };

  // Get rating display
  const getRatingDisplay = (rating) => {
    if (!rating) return { stars: 0, text: 'No rating' };
    const stars = Math.round(rating);
    const text = `${rating.toFixed(1)}/5`;
    return { stars, text };
  };

  const { stars, text } = getRatingDisplay(center.rating);
  const displayModalities = formatModalities(center.modalities);

  return (
    <Card 
      className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
              {center.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{center.address.city}, {center.address.state}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <div className="text-sm font-medium text-primary">
              {mockDistance} mi
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteCenter(center);
              }}
              className={`p-1 rounded-full transition-colors hover:bg-muted/50 ${
                isFavoriteCenter(center.id) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              title={isFavoriteCenter(center.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`h-3 w-3 ${
                  isFavoriteCenter(center.id) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Rating and TAT */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array(5).fill(0).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < stars 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-muted-foreground'
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              {text}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTAT(center.avgTat)}</span>
          </div>
        </div>

        {/* Modalities */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Available Modalities</div>
          <div className="flex flex-wrap gap-2">
            {displayModalities.map((modality) => (
              <Badge key={modality} variant="secondary" className="text-xs">
                {modality}
              </Badge>
            ))}
            {center.modalities && center.modalities.length > 3 && (
              <div className="relative group">
                <Badge variant="outline" className="text-xs cursor-help">
                  +{center.modalities.length - 3} more
                </Badge>
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1 max-w-48">
                    {center.modalities.slice(3).map((modality) => (
                      <span key={modality} className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {modality}
                      </span>
                    ))}
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Features */}
        {center.features && center.features.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Features</div>
            <div className="flex flex-wrap gap-2">
              {center.features.slice(0, 3).map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {center.features.length > 3 && (
                <div className="relative group">
                  <Badge variant="outline" className="text-xs cursor-help">
                    +{center.features.length - 3} more
                  </Badge>
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {center.features.slice(3).map((feature) => (
                        <span key={feature} className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
          <Phone className="h-4 w-4" />
          <span>{center.phone || 'Contact for details'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              
              // Generate deep link to Referral Wizard with center preselected
              const referralURL = generateReferralURL(center.id, {});
              console.log('🔗 Navigating to Referral Wizard:', referralURL);
              
              // Show a professional modal instead of alert
              const modal = document.createElement('div');
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
              modal.innerHTML = `
                <div class="bg-background border border-border rounded-lg p-6 max-w-md mx-4">
                  <h3 class="text-lg font-semibold text-foreground mb-4">Appointment Booking</h3>
                  <p class="text-muted-foreground mb-4">
                    You would be redirected to the appointment booking system for <strong>${center.name}</strong>.
                  </p>
                  <div class="flex gap-3">
                    <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onclick="this.closest('.fixed').remove()">
                      Got it
                    </button>
                    <button class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors" onclick="window.open('${referralURL}', '_blank')">
                      Open in New Tab
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(modal);
              
              // Remove modal when clicking outside
              modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
              });
            }}
          >
            📅 Book Appointment
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              
              // Generate Google Maps directions URL
              const address = `${center.address.street}, ${center.address.city}, ${center.address.state} ${center.address.zip}`;
              const mapsURL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
              console.log('🗺️ Opening Google Maps:', mapsURL);
              window.open(mapsURL, '_blank');
            }}
          >
            🗺️ Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
