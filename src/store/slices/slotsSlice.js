import { create } from 'zustand';

export const slotsSlice = (set, get) => ({
  // State
  slots: [],
  selectedSlot: null,
  loading: false,
  error: null,
  filters: {
    centerId: '',
    date: null,
    modality: '',
    bodyPart: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setSlots: (slots) => set({ slots }),
  
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  
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
  fetchSlots: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.centerId) queryParams.append('centerId', filters.centerId);
    if (filters.date) queryParams.append('date', filters.date.toISOString());
    if (filters.modality) queryParams.append('modality', filters.modality);
    if (filters.bodyPart) queryParams.append('bodyPart', filters.bodyPart);
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
      const response = await fetch(`/api/slots?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        slots: data.data || data,
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

  fetchSlotsByCenter: async (centerId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.date) queryParams.append('date', params.date.toISOString());
    if (params.modality) queryParams.append('modality', params.modality);
    if (params.bodyPart) queryParams.append('bodyPart', params.bodyPart);
    if (params.status) queryParams.append('status', params.status);
    
    try {
      const response = await fetch(`/api/centers/${centerId}/availability?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const slots = await response.json();
      return slots;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  holdSlot: async (slotId, referralId, duration = 15) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/slots/hold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId,
          referralId,
          duration, // minutes
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const holdData = await response.json();
      
      // Update slot status to held
      set((state) => ({
        slots: state.slots.map((slot) =>
          slot.id === slotId 
            ? { ...slot, status: 'held', holdData }
            : slot
        ),
        loading: false,
      }));
      
      return holdData;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  releaseSlot: async (slotId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/slots/${slotId}/release`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update slot status to available
      set((state) => ({
        slots: state.slots.map((slot) =>
          slot.id === slotId 
            ? { ...slot, status: 'available', holdData: null }
            : slot
        ),
        loading: false,
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Selectors (computed values)
  getSlotsByStatus: (status) => {
    const { slots } = get();
    return slots.filter((slot) => slot.status === status);
  },

  getSlotsByCenter: (centerId) => {
    const { slots } = get();
    return slots.filter((slot) => slot.centerId === centerId);
  },

  getSlotsByDate: (date) => {
    const { slots } = get();
    const targetDate = new Date(date);
    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return slotDate.toDateString() === targetDate.toDateString();
    });
  },

  getSlotsByModality: (modality) => {
    const { slots } = get();
    return slots.filter((slot) => slot.modality === modality);
  },

  getAvailableSlots: () => {
    const { slots } = get();
    return slots.filter((slot) => slot.status === 'available');
  },

  getHeldSlots: () => {
    const { slots } = get();
    return slots.filter((slot) => slot.status === 'held');
  },

  getBookedSlots: () => {
    const { slots } = get();
    return slots.filter((slot) => slot.status === 'booked');
  },

  getSlotStats: () => {
    const { slots } = get();
    const total = slots.length;
    const available = slots.filter((s) => s.status === 'available').length;
    const held = slots.filter((s) => s.status === 'held').length;
    const booked = slots.filter((s) => s.status === 'booked').length;
    const cancelled = slots.filter((s) => s.status === 'cancelled').length;
    
    return { total, available, held, booked, cancelled };
  },

  getSlotsByDateRange: (from, to) => {
    const { slots } = get();
    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return slotDate >= from && slotDate <= to;
    });
  },

  // Get next available slot for a specific center/modality/body part
  getNextAvailableSlot: (centerId, modality, bodyPart, date) => {
    const { slots } = get();
    const targetDate = new Date(date);
    
    return slots
      .filter((slot) => {
        const slotDate = new Date(slot.startTime);
        const dateMatch = slotDate.toDateString() === targetDate.toDateString();
        const centerMatch = slot.centerId === centerId;
        const modalityMatch = slot.modality === modality;
        const bodyPartMatch = slot.bodyPart === bodyPart;
        const statusMatch = slot.status === 'available';
        
        return dateMatch && centerMatch && modalityMatch && bodyPartMatch && statusMatch;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
  },

  // Reset state
  resetSlots: () => set({
    slots: [],
    selectedSlot: null,
    loading: false,
    error: null,
    filters: {
      centerId: '',
      date: null,
      modality: '',
      bodyPart: '',
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
export const useSlotsStore = create(slotsSlice);
