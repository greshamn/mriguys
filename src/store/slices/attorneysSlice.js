import { create } from 'zustand';

export const attorneysSlice = (set, get) => ({
  // State
  attorneys: [],
  selectedAttorney: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    specialty: '',
    status: '',
    location: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setAttorneys: (attorneys) => set({ attorneys }),
  
  setSelectedAttorney: (attorney) => set({ selectedAttorney: attorney }),
  
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
  fetchAttorneys: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.specialty) queryParams.append('specialty', filters.specialty);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.location) queryParams.append('location', filters.location);
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/attorneys?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        attorneys: data.data || data,
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

  fetchAttorneyById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/attorneys/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const attorney = await response.json();
      set({ selectedAttorney: attorney, loading: false });
      
      return attorney;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createAttorney: async (attorneyData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/attorneys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attorneyData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newAttorney = await response.json();
      
      // Optimistic update
      set((state) => ({
        attorneys: [newAttorney, ...state.attorneys],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newAttorney;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateAttorney: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/attorneys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedAttorney = await response.json();
      
      // Update state
      set((state) => ({
        attorneys: state.attorneys.map((attorney) =>
          attorney.id === id ? updatedAttorney : attorney
        ),
        selectedAttorney: state.selectedAttorney?.id === id
          ? updatedAttorney
          : state.selectedAttorney,
        loading: false,
      }));
      
      return updatedAttorney;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addAttorney: (attorney) => {
    const newAttorney = { ...attorney, id: `temp-${Date.now()}` };
    set((state) => ({
      attorneys: [newAttorney, ...state.attorneys],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newAttorney;
  },

  updateAttorneyStatus: (id, status) => {
    set((state) => ({
      attorneys: state.attorneys.map((attorney) =>
        attorney.id === id ? { ...attorney, status } : attorney
      ),
      selectedAttorney: state.selectedAttorney?.id === id
        ? { ...state.selectedAttorney, status }
        : state.selectedAttorney,
    }));
  },

  // Selectors (computed values)
  getAttorneysByStatus: (status) => {
    const { attorneys } = get();
    return attorneys.filter((attorney) => attorney.status === status);
  },

  getAttorneysBySpecialty: (specialty) => {
    const { attorneys } = get();
    return attorneys.filter((attorney) => attorney.specialty === specialty);
  },

  getAttorneyById: (id) => {
    const { attorneys } = get();
    return attorneys.find((attorney) => attorney.id === id);
  },

  getAttorneyByName: (name) => {
    const { attorneys } = get();
    const searchTerm = name.toLowerCase();
    return attorneys.filter((attorney) => {
      const fullName = `${attorney.firstName} ${attorney.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  },

  getAttorneysByLocation: (location) => {
    const { attorneys } = get();
    const searchTerm = location.toLowerCase();
    return attorneys.filter((attorney) => 
      attorney.location?.toLowerCase().includes(searchTerm)
    );
  },

  getAttorneyStats: () => {
    const { attorneys } = get();
    const total = attorneys.length;
    const active = attorneys.filter((a) => a.status === 'active').length;
    const inactive = attorneys.filter((a) => a.status === 'inactive').length;
    
    // Count by specialty
    const bySpecialty = attorneys.reduce((acc, attorney) => {
      const specialty = attorney.specialty || 'Unknown';
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {});
    
    // Count by location
    const byLocation = attorneys.reduce((acc, attorney) => {
      const location = attorney.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    
    return { total, active, inactive, bySpecialty, byLocation };
  },

  // Search attorneys by multiple criteria
  searchAttorneys: (query) => {
    const { attorneys } = get();
    const searchTerm = query.toLowerCase();
    
    return attorneys.filter((attorney) => {
      const firstName = attorney.firstName?.toLowerCase() || '';
      const lastName = attorney.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const specialty = attorney.specialty?.toLowerCase() || '';
      const location = attorney.location?.toLowerCase() || '';
      const firm = attorney.firm?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             specialty.includes(searchTerm) ||
             location.includes(searchTerm) ||
             firm.includes(searchTerm);
    });
  },

  // Get attorneys by case count
  getAttorneysByCaseCount: (minCount = 0) => {
    const { attorneys } = get();
    return attorneys.filter((attorney) => 
      (attorney.caseCount || 0) >= minCount
    ).sort((a, b) => (b.caseCount || 0) - (a.caseCount || 0));
  },

  // Get attorneys by lien count
  getAttorneysByLienCount: (minCount = 0) => {
    const { attorneys } = get();
    return attorneys.filter((attorney) => 
      (attorney.lienCount || 0) >= minCount
    ).sort((a, b) => (b.lienCount || 0) - (a.lienCount || 0));
  },

  // Get attorneys by settlement count
  getAttorneysBySettlementCount: (minCount = 0) => {
    const { attorneys } = get();
    return attorneys.filter((attorney) => 
      (attorney.settlementCount || 0) >= minCount
    ).sort((a, b) => (b.settlementCount || 0) - (a.settlementCount || 0));
  },

  // Get attorneys by success rate
  getAttorneysBySuccessRate: (minRate = 0) => {
    const { attorneys } = get();
    return attorneys.filter((attorney) => 
      (attorney.successRate || 0) >= minRate
    ).sort((a, b) => (b.successRate || 0) - (a.successRate || 0));
  },

  // Reset state
  resetAttorneys: () => set({
    attorneys: [],
    selectedAttorney: null,
    loading: false,
    error: null,
    filters: {
      name: '',
      specialty: '',
      status: '',
      location: '',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useAttorneysStore = create(attorneysSlice);
