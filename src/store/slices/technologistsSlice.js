import { create } from 'zustand';

export const technologistsSlice = (set, get) => ({
  // State
  technologists: [],
  selectedTechnologist: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    modality: '',
    centerId: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setTechnologists: (technologists) => set({ technologists }),
  
  setSelectedTechnologist: (technologist) => set({ selectedTechnologist: technologist }),
  
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
  fetchTechnologists: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.modality) queryParams.append('modality', filters.modality);
    if (filters.centerId) queryParams.append('centerId', filters.centerId);
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
      const response = await fetch(`/api/technologists?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        technologists: data.data || data,
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

  fetchTechnologistById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/technologists/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const technologist = await response.json();
      set({ selectedTechnologist: technologist, loading: false });
      
      return technologist;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createTechnologist: async (technologistData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/technologists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(technologistData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newTechnologist = await response.json();
      
      // Optimistic update
      set((state) => ({
        technologists: [newTechnologist, ...state.technologists],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newTechnologist;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTechnologist: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/technologists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedTechnologist = await response.json();
      
      // Update state
      set((state) => ({
        technologists: state.technologists.map((technologist) =>
          technologist.id === id ? updatedTechnologist : technologist
        ),
        selectedTechnologist: state.selectedTechnologist?.id === id
          ? updatedTechnologist
          : state.selectedTechnologist,
        loading: false,
      }));
      
      return updatedTechnologist;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addTechnologist: (technologist) => {
    const newTechnologist = { ...technologist, id: `temp-${Date.now()}` };
    set((state) => ({
      technologists: [newTechnologist, ...state.technologists],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newTechnologist;
  },

  updateTechnologistStatus: (id, status) => {
    set((state) => ({
      technologists: state.technologists.map((technologist) =>
        technologist.id === id ? { ...technologist, status } : technologist
      ),
      selectedTechnologist: state.selectedTechnologist?.id === id
        ? { ...state.selectedTechnologist, status }
        : state.selectedTechnologist,
    }));
  },

  // Selectors (computed values)
  getTechnologistsByStatus: (status) => {
    const { technologists } = get();
    return technologists.filter((technologist) => technologist.status === status);
  },

  getTechnologistsByModality: (modality) => {
    const { technologists } = get();
    return technologists.filter((technologist) => technologist.modality === modality);
  },

  getTechnologistsByCenter: (centerId) => {
    const { technologists } = get();
    return technologists.filter((technologist) => technologist.centerId === centerId);
  },

  getTechnologistById: (id) => {
    const { technologists } = get();
    return technologists.find((technologist) => technologist.id === id);
  },

  getTechnologistByName: (name) => {
    const { technologists } = get();
    const searchTerm = name.toLowerCase();
    return technologists.filter((technologist) => {
      const fullName = `${technologist.firstName} ${technologist.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  },

  getTechnologistStats: () => {
    const { technologists } = get();
    const total = technologists.length;
    const active = technologists.filter((t) => t.status === 'active').length;
    const inactive = technologists.filter((t) => t.status === 'inactive').length;
    
    // Count by modality
    const byModality = technologists.reduce((acc, technologist) => {
      const modality = technologist.modality || 'Unknown';
      acc[modality] = (acc[modality] || 0) + 1;
      return acc;
    }, {});
    
    // Count by center
    const byCenter = technologists.reduce((acc, technologist) => {
      const centerId = technologist.centerId || 'Unknown';
      acc[centerId] = (acc[centerId] || 0) + 1;
      return acc;
    }, {});
    
    return { total, active, inactive, byModality, byCenter };
  },

  // Search technologists by multiple criteria
  searchTechnologists: (query) => {
    const { technologists } = get();
    const searchTerm = query.toLowerCase();
    
    return technologists.filter((technologist) => {
      const firstName = technologist.firstName?.toLowerCase() || '';
      const lastName = technologist.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const modality = technologist.modality?.toLowerCase() || '';
      const certification = technologist.certification?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             modality.includes(searchTerm) ||
             certification.includes(searchTerm);
    });
  },

  // Get technologists by appointment count
  getTechnologistsByAppointmentCount: (minCount = 0) => {
    const { technologists } = get();
    return technologists.filter((technologist) => 
      (technologist.appointmentCount || 0) >= minCount
    ).sort((a, b) => (b.appointmentCount || 0) - (a.appointmentCount || 0));
  },

  // Get technologists by availability
  getAvailableTechnologists: (date, modality, centerId) => {
    const { technologists } = get();
    return technologists.filter((technologist) => {
      const statusMatch = technologist.status === 'active';
      const modalityMatch = technologist.modality === modality;
      const centerMatch = technologist.centerId === centerId;
      const availabilityMatch = technologist.availability?.[date] !== false;
      
      return statusMatch && modalityMatch && centerMatch && availabilityMatch;
    });
  },

  // Get technologists by shift
  getTechnologistsByShift: (shift) => {
    const { technologists } = get();
    return technologists.filter((technologist) => 
      technologist.shifts?.includes(shift)
    );
  },

  // Reset state
  resetTechnologists: () => set({
    technologists: [],
    selectedTechnologist: null,
    loading: false,
    error: null,
    filters: {
      name: '',
      modality: '',
      centerId: '',
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
export const useTechnologistsStore = create(technologistsSlice);
