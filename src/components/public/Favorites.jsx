import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Heart, Clock, MapPin, Search, Trash2, RotateCcw } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

export function Favorites({ onRestoreSearch, onCenterClick }) {
  const { 
    favoriteCenters, 
    searchHistory, 
    removeFavoriteCenter, 
    clearSearchHistory,
    isFavoriteCenter 
  } = useFavorites();
  
  const [activeTab, setActiveTab] = useState('favorites');

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatSearchParams = (params) => {
    const parts = [];
    if (params.location) parts.push(params.location);
    if (params.bodyPart) parts.push(params.bodyPart);
    if (params.modalities && params.modalities.length > 0) {
      parts.push(params.modalities.join(', '));
    }
    return parts.length > 0 ? parts.join(' • ') : 'General search';
  };

  if (favoriteCenters.length === 0 && searchHistory.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4" />
        <span>No favorites yet</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Compact Dropdown Trigger */}
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
        <Heart className="h-4 w-4 text-red-500" />
        <span className="hidden sm:inline">Favorites</span>
        <Badge variant="secondary" className="text-xs">
          {favoriteCenters.length + searchHistory.length}
        </Badge>
      </button>

      {/* Dropdown Content */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Quick Access</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-2 py-1 text-xs rounded ${
                  activeTab === 'favorites' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Favorites ({favoriteCenters.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2 py-1 text-xs rounded ${
                  activeTab === 'history' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                History ({searchHistory.length})
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {activeTab === 'favorites' && (
            <div className="space-y-1 p-2">
              {favoriteCenters.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No favorites yet
                </div>
              ) : (
                favoriteCenters.slice(0, 3).map((center) => (
                  <div key={center.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                    <Heart className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{center.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {center.address.city}, {center.address.state}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onCenterClick && onCenterClick(center)}
                        className="text-xs text-primary hover:text-primary/80 underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => removeFavoriteCenter(center.id)}
                        className="text-xs text-destructive hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
              {favoriteCenters.length > 3 && (
                <div className="text-center py-2 text-xs text-muted-foreground border-t">
                  +{favoriteCenters.length - 3} more favorites
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-1 p-2">
              {searchHistory.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No search history
                </div>
              ) : (
                searchHistory.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                    <Search className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {formatSearchParams(entry.params)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={() => onRestoreSearch && onRestoreSearch(entry.params)}
                      className="text-xs text-primary hover:text-primary/80 underline"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
              {searchHistory.length > 3 && (
                <div className="text-center py-2 text-xs text-muted-foreground border-t">
                  +{searchHistory.length - 3} more searches
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('favorites')}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              View all favorites
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              View all history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
