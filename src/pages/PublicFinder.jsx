import React, { useState, useEffect } from 'react';
import { SearchFilters } from '../components/public/SearchFilters';
import { SearchResults } from '../components/public/SearchResults';
import { useStore } from '../store';

const PublicFinder = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    bodyPart: '',
    modalities: [],
    dateRange: null
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  const { centers, fetchCenters } = useStore();

  useEffect(() => {
    // Fetch centers data when component mounts
    fetchCenters();
  }, [fetchCenters]);

  const handleSearch = async (params) => {
    setLoading(true);
    setSearchParams(params);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter centers based on search parameters
    let filtered = [...centers];
    
    if (params.location) {
      // Simple location filtering (in real app, would use geocoding)
      filtered = filtered.filter(center => 
        center.address.city.toLowerCase().includes(params.location.toLowerCase()) ||
        center.address.zip.includes(params.location)
      );
    }
    
    if (params.bodyPart) {
      filtered = filtered.filter(center => 
        center.bodyParts.includes(params.bodyPart)
      );
    }
    
    if (params.modalities.length > 0) {
      filtered = filtered.filter(center => 
        params.modalities.some(modality => 
          center.modalities.includes(modality)
        )
      );
    }
    
    setSearchResults(filtered);
    setLoading(false);
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Find Imaging Centers</h1>
              <p className="text-muted-foreground mt-2">
                Discover and compare imaging centers near you
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleViewModeToggle}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {viewMode === 'list' ? '🗺️ Map View' : '📋 List View'}
              </button>
              <a 
                href="/dashboard" 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                🏠 Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onSearch={handleSearch} />
          </div>
          
          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults 
              results={searchResults}
              loading={loading}
              viewMode={viewMode}
              searchParams={searchParams}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicFinder;
