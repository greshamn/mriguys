import { create } from 'zustand';

export const liensSlice = (set, get) => ({
  // State
  liens: [],
  selectedLien: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    caseId: '',
    attorneyId: '',
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
  setLiens: (liens) => set({ liens }),
  
  setSelectedLien: (lien) => set({ selectedLien: lien }),
  
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
  fetchLiens: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.caseId) queryParams.append('caseId', filters.caseId);
    if (filters.attorneyId) queryParams.append('attorneyId', filters.attorneyId);
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
      const response = await fetch(`/api/liens?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        liens: data.data || data,
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

  fetchLienById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/liens/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const lien = await response.json();
      set({ selectedLien: lien, loading: false });
      
      return lien;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createLien: async (lienData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/liens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lienData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newLien = await response.json();
      
      // Optimistic update
      set((state) => ({
        liens: [newLien, ...state.liens],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newLien;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateLien: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/liens/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedLien = await response.json();
      
      // Update state
      set((state) => ({
        liens: state.liens.map((lien) =>
          lien.id === id ? updatedLien : lien
        ),
        selectedLien: state.selectedLien?.id === id
          ? updatedLien
          : state.selectedLien,
        loading: false,
      }));
      
      return updatedLien;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  approveLien: async (id, approvalData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/liens/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const approvedLien = await response.json();
      
      // Update state
      set((state) => ({
        liens: state.liens.map((lien) =>
          lien.id === id ? approvedLien : lien
        ),
        selectedLien: state.selectedLien?.id === id
          ? approvedLien
          : state.selectedLien,
        loading: false,
      }));
      
      return approvedLien;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addLien: (lien) => {
    const newLien = { ...lien, id: `temp-${Date.now()}` };
    set((state) => ({
      liens: [newLien, ...state.liens],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newLien;
  },

  updateLienStatus: (id, status) => {
    set((state) => ({
      liens: state.liens.map((lien) =>
        lien.id === id ? { ...lien, status } : lien
      ),
      selectedLien: state.selectedLien?.id === id
        ? { ...state.selectedLien, status }
        : state.selectedLien,
    }));
  },

  // Selectors (computed values)
  getLiensByStatus: (status) => {
    const { liens } = get();
    return liens.filter((lien) => lien.status === status);
  },

  getLiensByCase: (caseId) => {
    const { liens } = get();
    return liens.filter((lien) => lien.caseId === caseId);
  },

  getLiensByAttorney: (attorneyId) => {
    const { liens } = get();
    return liens.filter((lien) => lien.attorneyId === attorneyId);
  },

  getLiensByDate: (date) => {
    const { liens } = get();
    const targetDate = new Date(date);
    return liens.filter((lien) => {
      const lienDate = new Date(lien.createdAt);
      return lienDate.toDateString() === targetDate.toDateString();
    });
  },

  getLiensByDateRange: (from, to) => {
    const { liens } = get();
    return liens.filter((lien) => {
      const lienDate = new Date(lien.createdAt);
      return lienDate >= from && lienDate <= to;
    });
  },

  getLiensByAmountRange: (min, max) => {
    const { liens } = get();
    return liens.filter((lien) => {
      const amount = parseFloat(lien.amount);
      return amount >= min && amount <= max;
    });
  },

  getLienStats: () => {
    const { liens } = get();
    const total = liens.length;
    const pending = liens.filter((l) => l.status === 'pending').length;
    const approved = liens.filter((l) => l.status === 'approved').length;
    const rejected = liens.filter((l) => l.status === 'rejected').length;
    const settled = liens.filter((l) => l.status === 'settled').length;
    
    // Calculate total amounts
    const totalAmount = liens.reduce((sum, lien) => sum + parseFloat(lien.amount || 0), 0);
    const approvedAmount = liens
      .filter((l) => l.status === 'approved')
      .reduce((sum, lien) => sum + parseFloat(lien.amount || 0), 0);
    const pendingAmount = liens
      .filter((l) => l.status === 'pending')
      .reduce((sum, lien) => sum + parseFloat(lien.amount || 0), 0);
    
    return { 
      total, 
      pending, 
      approved, 
      rejected, 
      settled,
      totalAmount,
      approvedAmount,
      pendingAmount
    };
  },

  // Get liens by priority
  getLiensByPriority: (priority) => {
    const { liens } = get();
    return liens.filter((lien) => lien.priority === priority);
  },

  // Get liens by accident type
  getLiensByAccidentType: (accidentType) => {
    const { liens } = get();
    return liens.filter((lien) => lien.accidentType === accidentType);
  },

  // Get liens by settlement status
  getLiensBySettlementStatus: (settlementStatus) => {
    const { liens } = get();
    return liens.filter((lien) => lien.settlementStatus === settlementStatus);
  },

  // Get liens by exposure area
  getLiensByExposureArea: (exposureArea) => {
    const { liens } = get();
    return liens.filter((lien) => lien.exposureArea === exposureArea);
  },

  // Get liens by defendant
  getLiensByDefendant: (defendantId) => {
    const { liens } = get();
    return liens.filter((lien) => lien.defendantId === defendantId);
  },

  // Reset state
  resetLiens: () => set({
    liens: [],
    selectedLien: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      caseId: '',
      attorneyId: '',
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
export const useLiensStore = create(liensSlice);
