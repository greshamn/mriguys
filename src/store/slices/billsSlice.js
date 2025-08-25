import { create } from 'zustand';

export const billsSlice = (set, get) => ({
  // State
  bills: [],
  selectedBill: null,
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
  setBills: (bills) => set({ bills }),
  
  setSelectedBill: (bill) => set({ selectedBill: bill }),
  
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
  fetchBills: async (params = {}) => {
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
      const response = await fetch(`/api/bills?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        bills: data.data || data,
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

  fetchBillById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/bills/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const bill = await response.json();
      set({ selectedBill: bill, loading: false });
      
      return bill;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createBill: async (billData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newBill = await response.json();
      
      // Optimistic update
      set((state) => ({
        bills: [newBill, ...state.bills],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newBill;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateBill: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedBill = await response.json();
      
      // Update state
      set((state) => ({
        bills: state.bills.map((bill) =>
          bill.id === id ? updatedBill : bill
        ),
        selectedBill: state.selectedBill?.id === id
          ? updatedBill
          : state.selectedBill,
        loading: false,
      }));
      
      return updatedBill;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addBill: (bill) => {
    const newBill = { ...bill, id: `temp-${Date.now()}` };
    set((state) => ({
      bills: [newBill, ...state.bills],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newBill;
  },

  updateBillStatus: (id, status) => {
    set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === id ? { ...bill, status } : bill
      ),
      selectedBill: state.selectedBill?.id === id
        ? { ...state.selectedBill, status }
        : state.selectedBill,
    }));
  },

  // Selectors (computed values)
  getBillsByStatus: (status) => {
    const { bills } = get();
    return bills.filter((bill) => bill.status === status);
  },

  getBillsByPatient: (patientId) => {
    const { bills } = get();
    return bills.filter((bill) => bill.patientId === patientId);
  },

  getBillsByCenter: (centerId) => {
    const { bills } = get();
    return bills.filter((bill) => bill.centerId === centerId);
  },

  getBillsByDate: (date) => {
    const { bills } = get();
    const targetDate = new Date(date);
    return bills.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      return billDate.toDateString() === targetDate.toDateString();
    });
  },

  getBillsByDateRange: (from, to) => {
    const { bills } = get();
    return bills.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      return billDate >= from && billDate <= to;
    });
  },

  getBillsByAmountRange: (min, max) => {
    const { bills } = get();
    return bills.filter((bill) => {
      const amount = parseFloat(bill.amount);
      return amount >= min && amount <= max;
    });
  },

  getBillStats: () => {
    const { bills } = get();
    const total = bills.length;
    const draft = bills.filter((b) => b.status === 'draft').length;
    const pending = bills.filter((b) => b.status === 'pending').length;
    const sent = bills.filter((b) => b.status === 'sent').length;
    const paid = bills.filter((b) => b.status === 'paid').length;
    const overdue = bills.filter((b) => b.status === 'overdue').length;
    
    // Calculate total amounts
    const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const paidAmount = bills
      .filter((b) => b.status === 'paid')
      .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const pendingAmount = bills
      .filter((b) => b.status === 'pending')
      .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    
    return { 
      total, 
      draft, 
      pending, 
      sent, 
      paid, 
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  },

  // Get bills by appointment
  getBillsByAppointment: (appointmentId) => {
    const { bills } = get();
    return bills.filter((bill) => bill.appointmentId === appointmentId);
  },

  // Get overdue bills
  getOverdueBills: () => {
    const { bills } = get();
    const now = new Date();
    return bills.filter((bill) => {
      if (bill.status !== 'sent') return false;
      if (!bill.dueDate) return false;
      const dueDate = new Date(bill.dueDate);
      return dueDate < now;
    });
  },

  // Get bills by insurance
  getBillsByInsurance: (insuranceId) => {
    const { bills } = get();
    return bills.filter((bill) => bill.insuranceId === insuranceId);
  },

  // Reset state
  resetBills: () => set({
    bills: [],
    selectedBill: null,
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
export const useBillsStore = create(billsSlice);
