import { create } from 'zustand';

export const appointmentsSlice = (set, get) => ({
  // State
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    patientName: '',
    centerId: '',
    dateFrom: null,
    dateTo: null,
    modality: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setAppointments: (appointments) => set({ appointments }),
  
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
  
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
  fetchAppointments: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.patientName) queryParams.append('patientName', filters.patientName);
    if (filters.centerId) queryParams.append('centerId', filters.centerId);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
    if (filters.modality) queryParams.append('modality', filters.modality);
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/appointments?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        appointments: data.data || data,
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

  fetchAppointmentById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const appointment = await response.json();
      set({ selectedAppointment: appointment, loading: false });
      
      return appointment;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createAppointment: async (appointmentData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newAppointment = await response.json();
      
      // Optimistic update
      set((state) => ({
        appointments: [newAppointment, ...state.appointments],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newAppointment;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateAppointment: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedAppointment = await response.json();
      
      // Update state
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment
        ),
        selectedAppointment: state.selectedAppointment?.id === id
          ? updatedAppointment
          : state.selectedAppointment,
        loading: false,
      }));
      
      return updatedAppointment;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cancelAppointment: async (id, reason) => {
    return get().updateAppointment(id, { 
      status: 'cancelled', 
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    });
  },

  // Optimistic Updates
  addAppointment: (appointment) => {
    const newAppointment = { ...appointment, id: `temp-${Date.now()}` };
    set((state) => ({
      appointments: [newAppointment, ...state.appointments],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newAppointment;
  },

  updateAppointmentStatus: (id, status) => {
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment
      ),
      selectedAppointment: state.selectedAppointment?.id === id
        ? { ...state.selectedAppointment, status }
        : state.selectedAppointment,
    }));
  },

  // Selectors (computed values)
  getAppointmentsByStatus: (status) => {
    const { appointments } = get();
    return appointments.filter((appointment) => appointment.status === status);
  },

  getAppointmentsByPatient: (patientId) => {
    const { appointments } = get();
    return appointments.filter((appointment) => appointment.patientId === patientId);
  },

  getAppointmentsByCenter: (centerId) => {
    const { appointments } = get();
    return appointments.filter((appointment) => appointment.centerId === centerId);
  },

  getAppointmentsByDate: (date) => {
    const { appointments } = get();
    const targetDate = new Date(date);
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.scheduledAt);
      return appointmentDate.toDateString() === targetDate.toDateString();
    });
  },

  getUpcomingAppointments: () => {
    const { appointments } = get();
    const now = new Date();
    return appointments
      .filter((appointment) => 
        appointment.status === 'confirmed' && 
        new Date(appointment.scheduledAt) > now
      )
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  },

  getAppointmentStats: () => {
    const { appointments } = get();
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const noShow = appointments.filter((a) => a.status === 'no-show').length;
    
    return { total, confirmed, completed, cancelled, noShow };
  },

  getAppointmentsByDateRange: (from, to) => {
    const { appointments } = get();
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.scheduledAt);
      return appointmentDate >= from && appointmentDate <= to;
    });
  },

  // Reset state
  resetAppointments: () => set({
    appointments: [],
    selectedAppointment: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      patientName: '',
      centerId: '',
      dateFrom: null,
      dateTo: null,
      modality: '',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useAppointmentsStore = create(appointmentsSlice);
