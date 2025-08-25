import { create } from 'zustand';

export const providersSlice = (set, get) => ({
  // State
  providers: [],
  selectedProvider: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    specialty: '',
    npi: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setProviders: (providers) => set({ providers }),
  
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  
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
  fetchProviders: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.specialty) queryParams.append('specialty', filters.specialty);
    if (filters.npi) queryParams.append('npi', filters.npi);
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
      const response = await fetch(`/api/providers?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        providers: data.data || data,
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

  fetchProviderById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/providers/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const provider = await response.json();
      set({ selectedProvider: provider, loading: false });
      
      return provider;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createProvider: async (providerData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newProvider = await response.json();
      
      // Optimistic update
      set((state) => ({
        providers: [newProvider, ...state.providers],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newProvider;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProvider: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedProvider = await response.json();
      
      // Update state
      set((state) => ({
        providers: state.providers.map((provider) =>
          provider.id === id ? updatedProvider : provider
        ),
        selectedProvider: state.selectedProvider?.id === id
          ? updatedProvider
          : state.selectedProvider,
        loading: false,
      }));
      
      return updatedProvider;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addProvider: (provider) => {
    const newProvider = { ...provider, id: `temp-${Date.now()}` };
    set((state) => ({
      providers: [newProvider, ...state.providers],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newProvider;
  },

  updateProviderStatus: (id, status) => {
    set((state) => ({
      providers: state.providers.map((provider) =>
        provider.id === id ? { ...provider, status } : provider
      ),
      selectedProvider: state.selectedProvider?.id === id
        ? { ...state.selectedProvider, status }
        : state.selectedProvider,
    }));
  },

  // Selectors (computed values)
  getProvidersByStatus: (status) => {
    const { providers } = get();
    return providers.filter((provider) => provider.status === status);
  },

  getProvidersBySpecialty: (specialty) => {
    const { providers } = get();
    return providers.filter((provider) => provider.specialty === specialty);
  },

  getProviderById: (id) => {
    const { providers } = get();
    return providers.find((provider) => provider.id === id);
  },

  getProviderByNPI: (npi) => {
    const { providers } = get();
    return providers.find((provider) => provider.npi === npi);
  },

  getProviderByName: (name) => {
    const { providers } = get();
    const searchTerm = name.toLowerCase();
    return providers.filter((provider) => {
      const fullName = `${provider.firstName} ${provider.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  },

  getProviderStats: () => {
    const { providers } = get();
    const total = providers.length;
    const active = providers.filter((p) => p.status === 'active').length;
    const inactive = providers.filter((p) => p.status === 'inactive').length;
    
    // Count by specialty
    const bySpecialty = providers.reduce((acc, provider) => {
      const specialty = provider.specialty || 'Unknown';
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {});
    
    return { total, active, inactive, bySpecialty };
  },

  // Search providers by multiple criteria
  searchProviders: (query) => {
    const { providers } = get();
    const searchTerm = query.toLowerCase();
    
    return providers.filter((provider) => {
      const firstName = provider.firstName?.toLowerCase() || '';
      const lastName = provider.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const specialty = provider.specialty?.toLowerCase() || '';
      const npi = provider.npi?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             specialty.includes(searchTerm) ||
             npi.includes(searchTerm);
    });
  },

  // Get providers by referral count
  getProvidersByReferralCount: (minCount = 0) => {
    const { providers } = get();
    return providers.filter((provider) => 
      (provider.referralCount || 0) >= minCount
    ).sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0));
  },

  // Reset state
  resetProviders: () => set({
    providers: [],
    selectedProvider: null,
    loading: false,
    error: null,
    filters: {
      name: '',
      specialty: '',
      npi: '',
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
export const useProvidersStore = create(providersSlice);
