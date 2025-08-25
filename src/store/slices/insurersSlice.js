import { create } from 'zustand';

export const insurersSlice = (set, get) => ({
  // State
  insurers: [],
  selectedInsurer: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    type: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setInsurers: (insurers) => set({ insurers }),
  
  setSelectedInsurer: (insurer) => set({ selectedInsurer: insurer }),
  
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
  fetchInsurers: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/insurers?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        insurers: data.data || data,
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

  fetchInsurerById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/insurers/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const insurer = await response.json();
      set({ selectedInsurer: insurer, loading: false });
      
      return insurer;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createInsurer: async (insurerData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/insurers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insurerData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newInsurer = await response.json();
      
      // Optimistic update
      set((state) => ({
        insurers: [newInsurer, ...state.insurers],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newInsurer;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateInsurer: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/insurers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedInsurer = await response.json();
      
      // Update state
      set((state) => ({
        insurers: state.insurers.map((insurer) =>
          insurer.id === id ? updatedInsurer : insurer
        ),
        selectedInsurer: state.selectedInsurer?.id === id
          ? updatedInsurer
          : state.selectedInsurer,
        loading: false,
      }));
      
      return updatedInsurer;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addInsurer: (insurer) => {
    const newInsurer = { ...insurer, id: `temp-${Date.now()}` };
    set((state) => ({
      insurers: [newInsurer, ...state.insurers],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newInsurer;
  },

  updateInsurerStatus: (id, status) => {
    set((state) => ({
      insurers: state.insurers.map((insurer) =>
        insurer.id === id ? { ...insurer, status } : insurer
      ),
      selectedInsurer: state.selectedInsurer?.id === id
        ? { ...state.selectedInsurer, status }
        : state.selectedInsurer,
    }));
  },

  // Selectors (computed values)
  getInsurersByStatus: (status) => {
    const { insurers } = get();
    return insurers.filter((insurer) => insurer.status === status);
  },

  getInsurersByType: (type) => {
    const { insurers } = get();
    return insurers.filter((insurer) => insurer.type === type);
  },

  getInsurerById: (id) => {
    const { insurers } = get();
    return insurers.find((insurer) => insurer.id === id);
  },

  getInsurerByName: (name) => {
    const { insurers } = get();
    const searchTerm = name.toLowerCase();
    return insurers.filter((insurer) => 
      insurer.name.toLowerCase().includes(searchTerm)
    );
  },

  getInsurerStats: () => {
    const { insurers } = get();
    const total = insurers.length;
    const active = insurers.filter((i) => i.status === 'active').length;
    const inactive = insurers.filter((i) => i.status === 'inactive').length;
    
    // Count by type
    const byType = insurers.reduce((acc, insurer) => {
      const type = insurer.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return { total, active, inactive, byType };
  },

  // Search insurers by multiple criteria
  searchInsurers: (query) => {
    const { insurers } = get();
    const searchTerm = query.toLowerCase();
    
    return insurers.filter((insurer) => {
      const name = insurer.name?.toLowerCase() || '';
      const type = insurer.type?.toLowerCase() || '';
      const groupNumber = insurer.groupNumber?.toLowerCase() || '';
      
      return name.includes(searchTerm) ||
             type.includes(searchTerm) ||
             groupNumber.includes(searchTerm);
    });
  },

  // Get insurers by claim count
  getInsurersByClaimCount: (minCount = 0) => {
    const { insurers } = get();
    return insurers.filter((insurer) => 
      (insurer.claimCount || 0) >= minCount
    ).sort((a, b) => (b.claimCount || 0) - (a.claimCount || 0));
  },

  // Reset state
  resetInsurers: () => set({
    insurers: [],
    selectedInsurer: null,
    loading: false,
    error: null,
    filters: {
      name: '',
      type: '',
      status: '',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useInsurersStore = create(insurersSlice);
