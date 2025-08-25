import { create } from 'zustand';

export const patientsSlice = (set, get) => ({
  // State
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    dateOfBirth: null,
    phone: '',
    email: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setPatients: (patients) => set({ patients }),
  
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  
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
  fetchPatients: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.dateOfBirth) queryParams.append('dateOfBirth', filters.dateOfBirth.toISOString());
    if (filters.phone) queryParams.append('phone', filters.phone);
    if (filters.email) queryParams.append('email', filters.email);
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
      const response = await fetch(`/api/patients?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        patients: data.data || data,
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

  fetchPatientById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const patient = await response.json();
      set({ selectedPatient: patient, loading: false });
      
      return patient;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createPatient: async (patientData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newPatient = await response.json();
      
      // Optimistic update
      set((state) => ({
        patients: [newPatient, ...state.patients],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newPatient;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePatient: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPatient = await response.json();
      
      // Update state
      set((state) => ({
        patients: state.patients.map((patient) =>
          patient.id === id ? updatedPatient : patient
        ),
        selectedPatient: state.selectedPatient?.id === id
          ? updatedPatient
          : state.selectedPatient,
        loading: false,
      }));
      
      return updatedPatient;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addPatient: (patient) => {
    const newPatient = { ...patient, id: `temp-${Date.now()}` };
    set((state) => ({
      patients: [newPatient, ...state.patients],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newPatient;
  },

  updatePatientStatus: (id, status) => {
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === id ? { ...patient, status } : patient
      ),
      selectedPatient: state.selectedPatient?.id === id
        ? { ...state.selectedPatient, status }
        : state.selectedPatient,
    }));
  },

  // Selectors (computed values)
  getPatientsByStatus: (status) => {
    const { patients } = get();
    return patients.filter((patient) => patient.status === status);
  },

  getPatientById: (id) => {
    const { patients } = get();
    return patients.find((patient) => patient.id === id);
  },

  getPatientByName: (name) => {
    const { patients } = get();
    const searchTerm = name.toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  },

  getPatientByPhone: (phone) => {
    const { patients } = get();
    return patients.find((patient) => patient.phone === phone);
  },

  getPatientByEmail: (email) => {
    const { patients } = get();
    return patients.find((patient) => patient.email === email);
  },

  getPatientStats: () => {
    const { patients } = get();
    const total = patients.length;
    const active = patients.filter((p) => p.status === 'active').length;
    const inactive = patients.filter((p) => p.status === 'inactive').length;
    
    // Calculate age distribution
    const now = new Date();
    const ageGroups = {
      '0-17': 0,
      '18-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0,
    };
    
    patients.forEach((patient) => {
      if (patient.dateOfBirth) {
        const birthDate = new Date(patient.dateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();
        
        if (age <= 17) ageGroups['0-17']++;
        else if (age <= 30) ageGroups['18-30']++;
        else if (age <= 50) ageGroups['31-50']++;
        else if (age <= 70) ageGroups['51-70']++;
        else ageGroups['70+']++;
      }
    });
    
    return { total, active, inactive, ageGroups };
  },

  // Search patients by multiple criteria
  searchPatients: (query) => {
    const { patients } = get();
    const searchTerm = query.toLowerCase();
    
    return patients.filter((patient) => {
      const firstName = patient.firstName?.toLowerCase() || '';
      const lastName = patient.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const phone = patient.phone?.toLowerCase() || '';
      const email = patient.email?.toLowerCase() || '';
      const mrn = patient.mrn?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             phone.includes(searchTerm) ||
             email.includes(searchTerm) ||
             mrn.includes(searchTerm);
    });
  },

  // Get patients with recent activity
  getRecentPatients: (days = 30) => {
    const { patients } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return patients.filter((patient) => {
      if (!patient.lastActivity) return false;
      const lastActivity = new Date(patient.lastActivity);
      return lastActivity >= cutoffDate;
    }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  },

  // Reset state
  resetPatients: () => set({
    patients: [],
    selectedPatient: null,
    loading: false,
    error: null,
    filters: {
      name: '',
      dateOfBirth: null,
      phone: '',
      email: '',
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
export const usePatientsStore = create(patientsSlice);
