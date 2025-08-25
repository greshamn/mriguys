import { create } from 'zustand';

export const claimsSlice = (set, get) => ({
  // State
  claims: [],
  selectedClaim: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    patientName: '',
    centerId: '',
    dateFrom: null,
    dateTo: null,
    amountMin: null,
    amountMax: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setClaims: (claims) => set({ claims }),
  
  setSelectedClaim: (claim) => set({ selectedClaim: claim }),
  
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
  fetchClaims: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.patientName) queryParams.append('patientName', filters.patientName);
    if (filters.centerId) queryParams.append('centerId', filters.centerId);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
    if (filters.amountMin) queryParams.append('amountMin', filters.amountMin);
    if (filters.amountMax) queryParams.append('amountMax', filters.amountMax);
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/claims?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        claims: data.data || data,
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

  fetchClaimById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/claims/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const claim = await response.json();
      set({ selectedClaim: claim, loading: false });
      
      return claim;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createClaim: async (claimData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newClaim = await response.json();
      
      // Optimistic update
      set((state) => ({
        claims: [newClaim, ...state.claims],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newClaim;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateClaim: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/claims/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedClaim = await response.json();
      
      // Update state
      set((state) => ({
        claims: state.claims.map((claim) =>
          claim.id === id ? updatedClaim : claim
        ),
        selectedClaim: state.selectedClaim?.id === id
          ? updatedClaim
          : state.selectedClaim,
        loading: false,
      }));
      
      return updatedClaim;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addClaim: (claim) => {
    const newClaim = { ...claim, id: `temp-${Date.now()}` };
    set((state) => ({
      claims: [newClaim, ...state.claims],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newClaim;
  },

  updateClaimStatus: (id, status) => {
    set((state) => ({
      claims: state.claims.map((claim) =>
        claim.id === id ? { ...claim, status } : claim
      ),
      selectedClaim: state.selectedClaim?.id === id
        ? { ...state.selectedClaim, status }
        : state.selectedClaim,
    }));
  },

  // Selectors (computed values)
  getClaimsByStatus: (status) => {
    const { claims } = get();
    return claims.filter((claim) => claim.status === status);
  },

  getClaimsByPatient: (patientId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.patientId === patientId);
  },

  getClaimsByCenter: (centerId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.centerId === centerId);
  },

  getClaimsByDate: (date) => {
    const { claims } = get();
    const targetDate = new Date(date);
    return claims.filter((claim) => {
      const claimDate = new Date(claim.createdAt);
      return claimDate.toDateString() === targetDate.toDateString();
    });
  },

  getClaimsByDateRange: (from, to) => {
    const { claims } = get();
    return claims.filter((claim) => {
      const claimDate = new Date(claim.createdAt);
      return claimDate >= from && claimDate <= to;
    });
  },

  getClaimsByAmountRange: (min, max) => {
    const { claims } = get();
    return claims.filter((claim) => {
      const amount = parseFloat(claim.amount);
      return amount >= min && amount <= max;
    });
  },

  getClaimStats: () => {
    const { claims } = get();
    const total = claims.length;
    const draft = claims.filter((c) => c.status === 'draft').length;
    const pending = claims.filter((c) => c.status === 'pending').length;
    const submitted = claims.filter((c) => c.status === 'submitted').length;
    const approved = claims.filter((c) => c.status === 'approved').length;
    const denied = claims.filter((c) => c.status === 'denied').length;
    const paid = claims.filter((c) => c.status === 'paid').length;
    
    // Calculate total amounts
    const totalAmount = claims.reduce((sum, claim) => sum + parseFloat(claim.amount || 0), 0);
    const paidAmount = claims
      .filter((c) => c.status === 'paid')
      .reduce((sum, claim) => sum + parseFloat(claim.amount || 0), 0);
    const pendingAmount = claims
      .filter((c) => c.status === 'pending')
      .reduce((sum, claim) => sum + parseFloat(claim.amount || 0), 0);
    
    return { 
      total, 
      draft, 
      pending, 
      submitted, 
      approved, 
      denied, 
      paid,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  },

  // Get claims by insurance
  getClaimsByInsurance: (insuranceId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.insuranceId === insuranceId);
  },

  // Get claims by appointment
  getClaimsByAppointment: (appointmentId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.appointmentId === appointmentId);
  },

  // Get claims by referral
  getClaimsByReferral: (referralId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.referralId === referralId);
  },

  // Get claims by body part
  getClaimsByBodyPart: (bodyPart) => {
    const { claims } = get();
    return claims.filter((claim) => claim.bodyPart === bodyPart);
  },

  // Get claims by modality
  getClaimsByModality: (modality) => {
    const { claims } = get();
    return claims.filter((claim) => claim.modality === modality);
  },

  // Get claims by provider
  getClaimsByProvider: (providerId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.providerId === providerId);
  },

  // Get claims by technologist
  getClaimsByTechnologist: (technologistId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.technologistId === technologistId);
  },

  // Get claims by radiologist
  getClaimsByRadiologist: (radiologistId) => {
    const { claims } = get();
    return claims.filter((claim) => claim.radiologistId === radiologistId);
  },

  // Reset state
  resetClaims: () => set({
    claims: [],
    selectedClaim: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      patientName: '',
      centerId: '',
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useClaimsStore = create(claimsSlice);
