import { create } from 'zustand';

export const settlementsSlice = (set, get) => ({
  // State
  settlements: [],
  selectedSettlement: null,
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
  setSettlements: (settlements) => set({ settlements }),
  
  setSelectedSettlement: (settlement) => set({ selectedSettlement: settlement }),
  
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
  fetchSettlements: async (params = {}) => {
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
      const response = await fetch(`/api/settlements?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        settlements: data.data || data,
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

  fetchSettlementById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/settlements/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const settlement = await response.json();
      set({ selectedSettlement: settlement, loading: false });
      
      return settlement;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createSettlement: async (settlementData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settlementData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newSettlement = await response.json();
      
      // Optimistic update
      set((state) => ({
        settlements: [newSettlement, ...state.settlements],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newSettlement;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSettlement: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/settlements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedSettlement = await response.json();
      
      // Update state
      set((state) => ({
        settlements: state.settlements.map((settlement) =>
          settlement.id === id ? updatedSettlement : settlement
        ),
        selectedSettlement: state.selectedSettlement?.id === id
          ? updatedSettlement
          : state.selectedSettlement,
        loading: false,
      }));
      
      return updatedSettlement;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addSettlement: (settlement) => {
    const newSettlement = { ...settlement, id: `temp-${Date.now()}` };
    set((state) => ({
      settlements: [newSettlement, ...state.settlements],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newSettlement;
  },

  updateSettlementStatus: (id, status) => {
    set((state) => ({
      settlements: state.settlements.map((settlement) =>
        settlement.id === id ? { ...settlement, status } : settlement
      ),
      selectedSettlement: state.selectedSettlement?.id === id
        ? { ...state.selectedSettlement, status }
        : state.selectedSettlement,
    }));
  },

  // Selectors (computed values)
  getSettlementsByStatus: (status) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.status === status);
  },

  getSettlementsByCase: (caseId) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.caseId === caseId);
  },

  getSettlementsByAttorney: (attorneyId) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.attorneyId === attorneyId);
  },

  getSettlementsByDate: (date) => {
    const { settlements } = get();
    const targetDate = new Date(date);
    return settlements.filter((settlement) => {
      const settlementDate = new Date(settlement.createdAt);
      return settlementDate.toDateString() === targetDate.toDateString();
    });
  },

  getSettlementsByDateRange: (from, to) => {
    const { settlements } = get();
    return settlements.filter((settlement) => {
      const settlementDate = new Date(settlement.createdAt);
      return settlementDate >= from && settlementDate <= to;
    });
  },

  getSettlementsByAmountRange: (min, max) => {
    const { settlements } = get();
    return settlements.filter((settlement) => {
      const amount = parseFloat(settlement.amount);
      return amount >= min && amount <= max;
    });
  },

  getSettlementStats: () => {
    const { settlements } = get();
    const total = settlements.length;
    const pending = settlements.filter((s) => s.status === 'pending').length;
    const approved = settlements.filter((s) => s.status === 'approved').length;
    const completed = settlements.filter((s) => s.status === 'completed').length;
    const cancelled = settlements.filter((s) => s.status === 'cancelled').length;
    
    // Calculate total amounts
    const totalAmount = settlements.reduce((sum, settlement) => sum + parseFloat(settlement.amount || 0), 0);
    const completedAmount = settlements
      .filter((s) => s.status === 'completed')
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount || 0), 0);
    const pendingAmount = settlements
      .filter((s) => s.status === 'pending')
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount || 0), 0);
    
    return { 
      total, 
      pending, 
      approved, 
      completed, 
      cancelled,
      totalAmount,
      completedAmount,
      pendingAmount
    };
  },

  // Get settlements by type
  getSettlementsByType: (type) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.type === type);
  },

  // Get settlements by funder
  getSettlementsByFunder: (funderId) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.funderId === funderId);
  },

  // Get settlements by lien
  getSettlementsByLien: (lienId) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.lienId === lienId);
  },

  // Get settlements by patient
  getSettlementsByPatient: (patientId) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.patientId === patientId);
  },

  // Get settlements by center
  getSettlementsByCenter: (centerId) => {
    const { settlements } = get();
    return settlements.filter((settlement) => settlement.centerId === centerId);
  },

  // Reset state
  resetSettlements: () => set({
    settlements: [],
    selectedSettlement: null,
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
export const useSettlementsStore = create(settlementsSlice);
