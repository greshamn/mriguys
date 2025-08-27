import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchFilters } from '../components/public/SearchFilters';
import { SearchResults } from '../components/public/SearchResults';
import { ShareDropdown } from '../components/public/ShareDropdown';
import { Bookmarks } from '../components/public/Bookmarks';
import { useStore } from '../store';
import { 
  parseURLParams, 
  updateBrowserURL, 
  shareSearchResults,
  generateCenterURL 
} from '../lib/deepLinking';

const PublicFinder = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    bodyPart: '',
    modalities: [],
    dateRange: null,
    sortBy: '',
    centerId: ''
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  const { centers, fetchCenters, bodyParts, fetchBodyParts, modalityOptions } = useStore();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Add debugging to see store values
  console.log('PublicFinder - bodyParts from store:', bodyParts);
  console.log('PublicFinder - modalityOptions from store:', modalityOptions);

  // Initialize search state from URL parameters on component mount
  useEffect(() => {
    const urlParams = parseURLParams(urlSearchParams);
    console.log('🔄 PublicFinder: Initializing from URL params:', urlParams);
    
    // Update local state with URL parameters
    setSearchParams(prevParams => ({
      ...prevParams,
      ...urlParams
    }));

    // If we have meaningful URL parameters, execute the search automatically
    const hasMeaningfulParams = urlParams.location?.trim() || urlParams.bodyPart || urlParams.modalities?.length > 0;
    if (hasMeaningfulParams) {
      console.log('🔍 PublicFinder: Auto-executing search from URL params');
      // Execute search with URL parameters after a short delay to ensure data is loaded
      setTimeout(() => {
        handleSearch(urlParams);
      }, 100);
    }
  }, []); // Only run once on mount

  useEffect(() => {
    // Add a small delay to ensure MSW is fully initialized
    const initializeData = async () => {
      try {
        // Wait a bit for MSW to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🔄 PublicFinder: Starting data initialization...');
        
        // Fetch centers data when component mounts
        await fetchCenters();
        console.log('✅ PublicFinder: Centers fetched successfully');
        
        // Fetch body parts data when component mounts
        await fetchBodyParts();
        console.log('✅ PublicFinder: Body parts fetched successfully');
        
      } catch (error) {
        console.error('❌ PublicFinder: Failed to initialize data:', error);
      }
    };
    
    initializeData();
  }, [fetchCenters, fetchBodyParts]);

  // Show all centers initially when centers data is loaded
  useEffect(() => {
    if (centers.length > 0 && searchResults.length === 0) {
      setSearchResults(centers);
    }
  }, [centers, searchResults.length]);

  // Handle direct center access from URL
  useEffect(() => {
    if (searchParams.centerId && centers.length > 0) {
      const center = centers.find(c => c.id === searchParams.centerId);
      if (center) {
        console.log('🎯 PublicFinder: Direct center access for:', center.name);
        // Filter results to show only this center
        setSearchResults([center]);
        // Update URL to remove centerId after processing
        const { centerId, ...otherParams } = searchParams;
        updateBrowserURL(otherParams, true);
        setSearchParams(otherParams);
      }
    }
  }, [searchParams.centerId, centers]);

  const handleSearch = async (params) => {
    console.log('🔍 PublicFinder: Handling search with params:', params);
    
    // Prevent search if no meaningful filters are applied
    const hasMeaningfulFilters = params.location?.trim() || params.bodyPart || params.modalities?.length > 0;
    
    // If no filters, show all centers without loading state
    if (!hasMeaningfulFilters) {
      setSearchResults(centers);
      setSearchParams(params);
      // Update URL to reflect cleared search
      updateBrowserURL(params);
      return;
    }
    
    setLoading(true);
    setSearchParams(params);
    
    // Update browser URL with search parameters
    updateBrowserURL(params);
    
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
    }
    
    if (params.bodyPart && bodyParts) {
      // Get the body part name from the ID
      const bodyPartName = bodyParts.find(part => part.id === params.bodyPart)?.name;
      if (bodyPartName) {
        filtered = filtered.filter(center => 
          center.bodyParts.includes(bodyPartName)
        );
      }
    }
    
    if (params.modalities?.length > 0) {
      filtered = filtered.filter(center => 
        params.modalities.some(modality => 
          center.modalities.includes(modality)
        )
      );
    }
    
    setSearchResults(filtered);
    setLoading(false);
  };

  const handleClearSearch = () => {
    console.log('🧹 PublicFinder: Clearing search');
    const clearedParams = {
      location: '',
      bodyPart: '',
      modalities: [],
      dateRange: null,
      sortBy: '',
      centerId: ''
    };
    
    setSearchResults(centers); // Show all centers when clearing
    setSearchParams(clearedParams);
    
    // Update URL to reflect cleared search
    updateBrowserURL(clearedParams);
  };

  const handleBookmark = (bookmarkData, isAdded) => {
    console.log(`🔖 Bookmark ${isAdded ? 'added' : 'removed'}:`, bookmarkData);
    // You could show a toast notification here
  };

  const handleRestoreSearch = (bookmarkParams) => {
    console.log('🔄 Restoring search from bookmark:', bookmarkParams);
    handleSearch(bookmarkParams);
  };



  const handleCenterClick = (center) => {
    console.log('🎯 PublicFinder: Center clicked:', center.name);
    // Generate deep link for this center with current search context
    const centerURL = generateCenterURL(center.id, searchParams);
    console.log('🔗 Generated center URL:', centerURL);
    
    // Update URL to include center context
    updateBrowserURL({
      ...searchParams,
      centerId: center.id
    });
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
              {/* Bookmarks */}
              <Bookmarks onRestoreSearch={handleRestoreSearch} />
              
              {/* Share Dropdown */}
              <ShareDropdown 
                searchParams={searchParams}
                searchResults={searchResults}
                onBookmark={handleBookmark}
              />
              
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
            <SearchFilters 
              onSearch={handleSearch} 
              bodyParts={bodyParts} 
              modalityOptions={modalityOptions}
              initialValues={searchParams}
            />
          </div>
          
          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults 
              key={`search-${JSON.stringify(searchParams)}`}
              results={searchResults}
              loading={loading}
              viewMode={viewMode}
              searchParams={searchParams}
              onCenterClick={handleCenterClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicFinder;
