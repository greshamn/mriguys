/**
 * Deep-linking utilities for Public Finder
 * Handles URL generation, parameter parsing, and state management
 */

/**
 * Generate a deep link URL for the Public Finder with search parameters
 * @param {Object} params - Search parameters
 * @param {string} params.location - Location (city/ZIP)
 * @param {string} params.bodyPart - Selected body part ID
 * @param {Array} params.modalities - Selected modalities
 * @param {Object} params.dateRange - Date range object
 * @param {string} params.sortBy - Sort criteria
 * @param {string} params.centerId - Specific center ID for direct access
 * @returns {string} Generated URL
 */
export const generatePublicFinderURL = (params = {}) => {
  const url = new URL(window.location.origin + '/centers');
  const searchParams = new URLSearchParams();

  // Add search parameters if they exist
  if (params.location?.trim()) {
    searchParams.set('location', params.location.trim());
  }
  
  if (params.bodyPart) {
    searchParams.set('bodyPart', params.bodyPart);
  }
  
  if (params.modalities?.length > 0) {
    searchParams.set('modalities', params.modalities.join(','));
  }
  
  if (params.dateRange?.from) {
    searchParams.set('dateFrom', params.dateRange.from.toISOString().split('T')[0]);
  }
  
  if (params.dateRange?.to) {
    searchParams.set('dateTo', params.dateRange.to.toISOString().split('T')[0]);
  }
  
  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }
  
  if (params.centerId) {
    searchParams.set('centerId', params.centerId);
  }

  // Add search params to URL if any exist
  if (searchParams.toString()) {
    url.search = searchParams.toString();
  }

  return url.toString();
};

/**
 * Parse URL parameters and return search state
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} Parsed search parameters
 */
export const parseURLParams = (searchParams) => {
  const params = {
    location: '',
    bodyPart: '',
    modalities: [],
    dateRange: null,
    sortBy: '',
    centerId: ''
  };

  // Parse location
  const location = searchParams.get('location');
  if (location) {
    params.location = location;
  }

  // Parse body part
  const bodyPart = searchParams.get('bodyPart');
  if (bodyPart) {
    params.bodyPart = bodyPart;
  }

  // Parse modalities (comma-separated)
  const modalities = searchParams.get('modalities');
  if (modalities) {
    params.modalities = modalities.split(',').filter(Boolean);
  }

  // Parse date range
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    params.dateRange = {
      from: dateFrom ? new Date(dateFrom) : null,
      to: dateTo ? new Date(dateTo) : null
    };
  }

  // Parse sort criteria
  const sortBy = searchParams.get('sortBy');
  if (sortBy) {
    params.sortBy = sortBy;
  }

  // Parse center ID for direct access
  const centerId = searchParams.get('centerId');
  if (centerId) {
    params.centerId = centerId;
  }

  return params;
};

/**
 * Generate a deep link for a specific center
 * @param {string} centerId - Center ID
 * @param {Object} searchContext - Optional search context to preserve
 * @returns {string} Generated center URL
 */
export const generateCenterURL = (centerId, searchContext = {}) => {
  return generatePublicFinderURL({
    ...searchContext,
    centerId
  });
};

/**
 * Generate a deep link for the Referral Wizard with center preselected
 * @param {string} centerId - Center ID
 * @param {Object} searchContext - Search context to preserve
 * @returns {string} Generated referral URL
 */
export const generateReferralURL = (centerId, searchContext = {}) => {
  const url = new URL(window.location.origin + '/referral');
  const searchParams = new URLSearchParams();

  // Add center ID
  searchParams.set('centerId', centerId);

  // Add search context for pre-filling
  if (searchContext.bodyPart) {
    searchParams.set('bodyPart', searchContext.bodyPart);
  }
  
  if (searchContext.modalities?.length > 0) {
    searchParams.set('modalities', searchContext.modalities.join(','));
  }

  if (searchContext.dateRange?.from) {
    searchParams.set('dateFrom', searchContext.dateRange.from.toISOString().split('T')[0]);
  }

  url.search = searchParams.toString();
  return url.toString();
};

/**
 * Generate a deep link for the Slot Picker with center preselected
 * @param {string} centerId - Center ID
 * @param {Object} searchContext - Search context to preserve
 * @returns {string} Generated slot picker URL
 */
export const generateSlotPickerURL = (centerId, searchContext = {}) => {
  const url = new URL(window.location.origin + '/slots');
  const searchParams = new URLSearchParams();

  // Add center ID
  searchParams.set('centerId', centerId);

  // Add search context for pre-filling
  if (searchContext.bodyPart) {
    searchParams.set('bodyPart', searchContext.bodyPart);
  }
  
  if (searchContext.modalities?.length > 0) {
    searchParams.set('modalities', searchContext.modalities.join(','));
  }

  if (searchContext.dateRange?.from) {
    searchParams.set('dateFrom', searchContext.dateRange.from.toISOString().split('T')[0]);
  }

  url.search = searchParams.toString();
  return url.toString();
};

/**
 * Update browser URL without triggering navigation
 * @param {Object} params - Search parameters to update URL with
 * @param {boolean} replace - Whether to replace current history entry
 */
export const updateBrowserURL = (params, replace = false) => {
  const url = generatePublicFinderURL(params);
  
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
};

/**
 * Share current search results via Web Share API or fallback
 * @param {Object} params - Current search parameters
 * @param {Array} results - Search results
 */
export const shareSearchResults = async (params, results) => {
  const url = generatePublicFinderURL(params);
  const title = 'Imaging Centers Search Results';
  
  let description = 'Found imaging centers';
  if (params.location) {
    description += ` in ${params.location}`;
  }
  if (params.bodyPart) {
    description += ` for ${params.bodyPart}`;
  }
  description += ` (${results.length} results)`;

  // Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: description,
        url
      });
      return;
    } catch (error) {
      console.log('Web Share API failed:', error);
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    // You could show a toast notification here
    console.log('URL copied to clipboard:', url);
  } catch (error) {
    console.error('Failed to copy URL:', error);
  }
};
