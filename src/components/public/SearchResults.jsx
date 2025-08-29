import React, { useState, useEffect, useMemo } from 'react';
import { CenterCard } from './CenterCard';
import { CenterProfileModal } from './CenterProfileModal';
import InteractiveMap from './InteractiveMap';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { List, MapPin, Grid3X3 } from 'lucide-react';

export const SearchResults = React.memo(({ results, loading, viewMode, searchParams, onCenterClick, aiInsightsButton }) => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'rating', 'tat'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [localViewMode, setLocalViewMode] = useState(viewMode);
  
  // Persist view mode preference and sync with parent
  useEffect(() => {
    const savedViewMode = localStorage.getItem('publicFinderViewMode');
    if (savedViewMode && ['list', 'map'].includes(savedViewMode)) {
      setLocalViewMode(savedViewMode);
    } else {
      setLocalViewMode(viewMode);
    }
  }, [viewMode]);
  
  const handleViewModeChange = (mode) => {
    setLocalViewMode(mode);
    localStorage.setItem('publicFinderViewMode', mode);
  };

  const handleCenterClick = (center) => {
    // Call the parent's onCenterClick for deep-linking
    if (onCenterClick) {
      onCenterClick(center);
    }
    
    // Open the modal as before
    setSelectedCenter(center);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCenter(null);
  };

  // Reset pagination when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results.length]);

  // Memoize sorted results to prevent unnecessary recalculations
  const sortedResults = useMemo(() => {
    if (!results.length) return [];
    
    const sorted = [...results];
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'tat':
        return sorted.sort((a, b) => (a.avgTat || 999) - (b.avgTat || 999));
      case 'distance':
      default:
        return sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }
  }, [results, sortBy]);
  
  // Pagination logic
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, endIndex);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Don't show "no results" if we're in initial state (no filters applied)
  const isInitialState = !searchParams.location && !searchParams.bodyPart && searchParams.modalities.length === 0;
  
  if (!results.length && !isInitialState) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No centers found</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search filters or location
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          🔄 Reset Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {results.length} Imaging Center{results.length !== 1 ? 's' : ''} Found
          </h2>
          {searchParams.location && (
            <p className="text-muted-foreground">
              Near {searchParams.location}
            </p>
          )}
          {totalPages > 1 && (
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
            </p>
          )}
        </div>
        
        {/* View Toggle and Sort Controls */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                localViewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                localViewMode === 'map'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Map
            </button>
          </div>
          
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="tat">Turnaround Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* AI Insights Button */}
          {aiInsightsButton}
        </div>
      </div>

      {/* Results Content */}
      {localViewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedResults.map((center) => (
            <CenterCard
              key={center.id}
              center={center}
              onClick={() => handleCenterClick(center)}
            />
          ))}
        </div>
      ) : (
        <InteractiveMap
          centers={sortedResults}
          onCenterClick={(centerId) => {
            const center = sortedResults.find(c => c.id === centerId);
            if (center) {
              handleCenterClick(center);
            }
          }}
          selectedCenterId={selectedCenter?.id}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </Button>
          
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-10 h-10 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Center Profile Modal */}
      {showModal && selectedCenter && (
        <CenterProfileModal
          center={selectedCenter}
          onClose={handleCloseModal}
          searchContext={searchParams}
        />
      )}
    </div>
  );
});

SearchResults.displayName = 'SearchResults';
