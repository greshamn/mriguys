import { create } from 'zustand';

export const centersSlice = (set, get) => ({
  // State
  centers: [],
  selectedCenter: null,
  loading: false,
  error: null,
  filters: {
    location: '',
    modality: '',
    bodyPart: '',
    date: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setCenters: (centers) => set({ centers }),
  
  setSelectedCenter: (center) => set({ selectedCenter: center }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, page: 1 }, // Reset to first page
  })),
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination },
  })),

  // API Integration
  fetchCenters: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.modality) queryParams.append('modality', filters.modality);
    if (filters.bodyPart) queryParams.append('bodyPart', filters.bodyPart);
    if (filters.date) queryParams.append('date', filters.date.toISOString());
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/centers?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        centers: data.data || data,
        pagination: {
          ...pagination,
          total: data.total || data.length,
        },
        loading: false,
      });
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCenterById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/centers/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const center = await response.json();
      set({ selectedCenter: center, loading: false });
      
      return center;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCenterAvailability: async (centerId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.date) queryParams.append('date', params.date.toISOString());
    if (params.modality) queryParams.append('modality', params.modality);
    if (params.bodyPart) queryParams.append('bodyPart', params.bodyPart);
    
    try {
      const response = await fetch(`/api/centers/${centerId}/availability?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const availability = await response.json();
      return availability;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Optimistic Updates
  addCenter: (center) => {
    const newCenter = { ...center, id: `temp-${Date.now()}` };
    set((state) => ({
      centers: [newCenter, ...state.centers],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    // In a real app, you'd sync this with the backend
    return newCenter;
  },

  updateCenter: (id, updates) => {
    set((state) => ({
      centers: state.centers.map((center) =>
        center.id === id ? { ...center, ...updates } : center
      ),
      selectedCenter: state.selectedCenter?.id === id
        ? { ...state.selectedCenter, ...updates }
        : state.selectedCenter,
    }));
  },

  // Selectors (computed values)
  getCentersByModality: (modality) => {
    const { centers } = get();
    return centers.filter((center) => 
      center.modalities?.includes(modality)
    );
  },

  getCentersByLocation: (location) => {
    const { centers } = get();
    return centers.filter((center) => 
      center.location?.toLowerCase().includes(location.toLowerCase())
    );
  },

  getAvailableCenters: () => {
    const { centers } = get();
    return centers.filter((center) => center.status === 'active');
  },

  getCenterStats: () => {
    const { centers } = get();
    const total = centers.length;
    const active = centers.filter((c) => c.status === 'active').length;
    const inactive = centers.filter((c) => c.status === 'inactive').length;
    
    return { total, active, inactive };
  },

  // Reset state
  resetCenters: () => set({
    centers: [],
    selectedCenter: null,
    loading: false,
    error: null,
    filters: {
      location: '',
      modality: '',
      bodyPart: '',
      date: null,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useCentersStore = create(centersSlice);
