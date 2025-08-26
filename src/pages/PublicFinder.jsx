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
  
  const { centers, fetchCenters, bodyParts, fetchBodyParts, modalityOptions } = useStore();

  useEffect(() => {
    // Fetch centers data when component mounts
    fetchCenters();
    // Fetch body parts data when component mounts
    fetchBodyParts();
  }, [fetchCenters, fetchBodyParts]);



  // Show all centers initially when centers data is loaded
  useEffect(() => {
    if (centers.length > 0 && searchResults.length === 0) {
      setSearchResults(centers);
    }
  }, [centers, searchResults.length]);

  const handleSearch = async (params) => {
    console.log('🔍 Search called with:', params);
    console.log('🔍 bodyParts available:', bodyParts?.length);
    console.log('🔍 centers available:', centers.length);
    
    // Prevent search if no meaningful filters are applied
    const hasMeaningfulFilters = params.location?.trim() || params.bodyPart || params.modalities?.length > 0;
    
    // If no filters, show all centers without loading state
    if (!hasMeaningfulFilters) {
      setSearchResults(centers);
      setSearchParams(params);
      return;
    }
    
    setLoading(true);
    setSearchParams(params);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter centers based on search parameters
    let filtered = [...centers];
    
    if (params.location?.trim()) {
      // Simple location filtering (in real app, would use geocoding)
      filtered = filtered.filter(center => 
        center.address.city.toLowerCase().includes(params.location.trim().toLowerCase()) ||
        center.address.zip.includes(params.location.trim())
      );
      console.log('🔍 After location filter:', filtered.length);
    }
    
    if (params.bodyPart && bodyParts) {
      // Get the body part name from the ID
      const bodyPartName = bodyParts.find(part => part.id === params.bodyPart)?.name;
      console.log('🔍 Body part ID:', params.bodyPart, 'Name found:', bodyPartName);
      if (bodyPartName) {
        filtered = filtered.filter(center => 
          center.bodyParts.includes(bodyPartName)
        );
        console.log('🔍 After body part filter:', filtered.length);
      }
    }
    
    if (params.modalities?.length > 0) {
      console.log('🔍 Filtering by modalities:', params.modalities);
      console.log('🔍 Sample center modalities:', filtered[0]?.modalities);
      
      filtered = filtered.filter(center => 
        params.modalities.some(modality => 
          center.modalities.includes(modality)
        )
      );
      console.log('🔍 After modality filter:', filtered.length);
    }
    
    console.log('🔍 Final filtered results:', filtered.length);
    setSearchResults(filtered);
    setLoading(false);
  };

  const handleClearSearch = () => {
    setSearchResults(centers); // Show all centers when clearing
    setSearchParams({
      location: '',
      bodyPart: '',
      modalities: [],
      dateRange: null
    });
    // Don't call handleSearch again - just update the state directly
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
            <SearchFilters onSearch={handleSearch} bodyParts={bodyParts} modalityOptions={modalityOptions} />
          </div>
          
          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults 
              key={`search-${JSON.stringify(searchParams)}`}
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
