import { create } from 'zustand';

export const radiologistsSlice = (set, get) => ({
  // State
  radiologists: [],
  selectedRadiologist: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    specialty: '',
    centerId: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setRadiologists: (radiologists) => set({ radiologists }),
  
  setSelectedRadiologist: (radiologist) => set({ selectedRadiologist: radiologist }),
  
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
  fetchRadiologists: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.specialty) queryParams.append('specialty', filters.specialty);
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
      const response = await fetch(`/api/radiologists?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        radiologists: data.data || data,
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

  fetchRadiologistById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/radiologists/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const radiologist = await response.json();
      set({ selectedRadiologist: radiologist, loading: false });
      
      return radiologist;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createRadiologist: async (radiologistData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/radiologists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(radiologistData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRadiologist = await response.json();
      
      // Optimistic update
      set((state) => ({
        radiologists: [newRadiologist, ...state.radiologists],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newRadiologist;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRadiologist: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/radiologists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedRadiologist = await response.json();
      
      // Update state
      set((state) => ({
        radiologists: state.radiologists.map((radiologist) =>
          radiologist.id === id ? updatedRadiologist : radiologist
        ),
        selectedRadiologist: state.selectedRadiologist?.id === id
          ? updatedRadiologist
          : state.selectedRadiologist,
        loading: false,
      }));
      
      return updatedRadiologist;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addRadiologist: (radiologist) => {
    const newRadiologist = { ...radiologist, id: `temp-${Date.now()}` };
    set((state) => ({
      radiologists: [newRadiologist, ...state.radiologists],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newRadiologist;
  },

  updateRadiologistStatus: (id, status) => {
    set((state) => ({
      radiologists: state.radiologists.map((radiologist) =>
        radiologist.id === id ? { ...radiologist, status } : radiologist
      ),
      selectedRadiologist: state.selectedRadiologist?.id === id
        ? { ...state.selectedRadiologist, status }
        : state.selectedRadiologist,
    }));
  },

  // Selectors (computed values)
  getRadiologistsByStatus: (status) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => radiologist.status === status);
  },

  getRadiologistsBySpecialty: (specialty) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => radiologist.specialty === specialty);
  },

  getRadiologistsByCenter: (centerId) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => radiologist.centerId === centerId);
  },

  getRadiologistById: (id) => {
    const { radiologists } = get();
    return radiologists.find((radiologist) => radiologist.id === id);
  },

  getRadiologistByName: (name) => {
    const { radiologists } = get();
    const searchTerm = name.toLowerCase();
    return radiologists.filter((radiologist) => {
      const fullName = `${radiologist.firstName} ${radiologist.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  },

  getRadiologistStats: () => {
    const { radiologists } = get();
    const total = radiologists.length;
    const active = radiologists.filter((r) => r.status === 'active').length;
    const inactive = radiologists.filter((r) => r.status === 'inactive').length;
    
    // Count by specialty
    const bySpecialty = radiologists.reduce((acc, radiologist) => {
      const specialty = radiologist.specialty || 'Unknown';
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {});
    
    // Count by center
    const byCenter = radiologists.reduce((acc, radiologist) => {
      const centerId = radiologist.centerId || 'Unknown';
      acc[centerId] = (acc[centerId] || 0) + 1;
      return acc;
    }, {});
    
    return { total, active, inactive, bySpecialty, byCenter };
  },

  // Search radiologists by multiple criteria
  searchRadiologists: (query) => {
    const { radiologists } = get();
    const searchTerm = query.toLowerCase();
    
    return radiologists.filter((radiologist) => {
      const firstName = radiologist.firstName?.toLowerCase() || '';
      const lastName = radiologist.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const specialty = radiologist.specialty?.toLowerCase() || '';
      const boardCertification = radiologist.boardCertification?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             specialty.includes(searchTerm) ||
             boardCertification.includes(searchTerm);
    });
  },

  // Get radiologists by report count
  getRadiologistsByReportCount: (minCount = 0) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => 
      (radiologist.reportCount || 0) >= minCount
    ).sort((a, b) => (b.reportCount || 0) - (a.reportCount || 0));
  },

  // Get radiologists by availability
  getAvailableRadiologists: (date, specialty, centerId) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => {
      const statusMatch = radiologist.status === 'active';
      const specialtyMatch = !specialty || radiologist.specialty === specialty;
      const centerMatch = !centerId || radiologist.centerId === centerId;
      const availabilityMatch = radiologist.availability?.[date] !== false;
      
      return statusMatch && specialtyMatch && centerMatch && availabilityMatch;
    });
  },

  // Get radiologists by shift
  getRadiologistsByShift: (shift) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => 
      radiologist.shifts?.includes(shift)
    );
  },

  // Get radiologists by modality expertise
  getRadiologistsByModality: (modality) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => 
      radiologist.modalities?.includes(modality)
    );
  },

  // Get radiologists by body part expertise
  getRadiologistsByBodyPart: (bodyPart) => {
    const { radiologists } = get();
    return radiologists.filter((radiologist) => 
      radiologist.bodyPartExpertise?.includes(bodyPart)
    );
  },

  // Reset state
  resetRadiologists: () => set({
    radiologists: [],
    selectedRadiologist: null,
    loading: false,
    error: null,
    filters: {
      name: '',
      specialty: '',
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
export const useRadiologistsStore = create(radiologistsSlice);
