import { create } from 'zustand';

export const referralsSlice = (set, get) => ({
  // State
  referrals: [],
  selectedReferral: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    patientName: '',
    referrerName: '',
    dateFrom: null,
    dateTo: null,
    centerId: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setReferrals: (referrals) => set({ referrals }),
  
  setSelectedReferral: (referral) => set({ selectedReferral: referral }),
  
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
  fetchReferrals: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.patientName) queryParams.append('patientName', filters.patientName);
    if (filters.referrerName) queryParams.append('referrerName', filters.referrerName);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
    if (filters.centerId) queryParams.append('centerId', filters.centerId);
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/referrals?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        referrals: data.data || data,
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

  fetchReferralById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/referrals/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const referral = await response.json();
      set({ selectedReferral: referral, loading: false });
      
      return referral;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createReferral: async (referralData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newReferral = await response.json();
      
      // Optimistic update
      set((state) => ({
        referrals: [newReferral, ...state.referrals],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newReferral;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReferral: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/referrals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedReferral = await response.json();
      
      // Update state
      set((state) => ({
        referrals: state.referrals.map((referral) =>
          referral.id === id ? updatedReferral : referral
        ),
        selectedReferral: state.selectedReferral?.id === id
          ? updatedReferral
          : state.selectedReferral,
        loading: false,
      }));
      
      return updatedReferral;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addReferral: (referral) => {
    const newReferral = { ...referral, id: `temp-${Date.now()}` };
    set((state) => ({
      referrals: [newReferral, ...state.referrals],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newReferral;
  },

  updateReferralStatus: (id, status) => {
    set((state) => ({
      referrals: state.referrals.map((referral) =>
        referral.id === id ? { ...referral, status } : referral
      ),
      selectedReferral: state.selectedReferral?.id === id
        ? { ...state.selectedReferral, status }
        : state.selectedReferral,
    }));
  },

  // Selectors (computed values)
  getReferralsByStatus: (status) => {
    const { referrals } = get();
    return referrals.filter((referral) => referral.status === status);
  },

  getReferralsByPatient: (patientId) => {
    const { referrals } = get();
    return referrals.filter((referral) => referral.patientId === patientId);
  },

  getReferralsByCenter: (centerId) => {
    const { referrals } = get();
    return referrals.filter((referral) => referral.centerId === centerId);
  },

  getReferralsByReferrer: (referrerId) => {
    const { referrals } = get();
    return referrals.filter((referral) => referral.referrerId === referrerId);
  },

  getReferralStats: () => {
    const { referrals } = get();
    const total = referrals.length;
    const draft = referrals.filter((r) => r.status === 'draft').length;
    const pending = referrals.filter((r) => r.status === 'pending').length;
    const confirmed = referrals.filter((r) => r.status === 'confirmed').length;
    const completed = referrals.filter((r) => r.status === 'completed').length;
    const cancelled = referrals.filter((r) => r.status === 'cancelled').length;
    
    return { total, draft, pending, confirmed, completed, cancelled };
  },

  getReferralsByDateRange: (from, to) => {
    const { referrals } = get();
    return referrals.filter((referral) => {
      const referralDate = new Date(referral.createdAt);
      return referralDate >= from && referralDate <= to;
    });
  },

  // Reset state
  resetReferrals: () => set({
    referrals: [],
    selectedReferral: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      patientName: '',
      referrerName: '',
      dateFrom: null,
      dateTo: null,
      centerId: '',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useReferralsStore = create(referralsSlice);
