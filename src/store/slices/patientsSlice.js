export const patientsSlice = (set, get) => ({
  // State
  patients: [],
  selectedPatientId: localStorage.getItem('selectedPatientId') || 'patient-001',
  patientsLoading: false,
  patientsError: null,

  // Actions
  setSelectedPatient: (patientId) => {
    set({ selectedPatientId: patientId });
    localStorage.setItem('selectedPatientId', patientId);
  },

  fetchPatients: async () => {
    set({ patientsLoading: true, patientsError: null });
    
    try {
      // Simulate API call with MSW or direct import
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const payload = await response.json();
      // Accept both array and paginated object shapes
      const normalizedPatients = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.data) ? payload.data : []);

      set({ 
        patients: normalizedPatients,
        patientsLoading: false,
        patientsError: null
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      
      // Fallback: Import mock data directly
      try {
        const { default: mockPatients } = await import('../../mocks/fixtures/patients.json');
        set({ 
          patients: mockPatients,
          patientsLoading: false,
          patientsError: null
        });
      } catch (fallbackError) {
        console.error('Error loading mock patients:', fallbackError);
        set({ 
          patients: [],
          patientsLoading: false,
          patientsError: 'Failed to load patients'
        });
      }
    }
  },

  // Computed getters
  getSelectedPatient: () => {
    const { patients, selectedPatientId } = get();
    return patients.find(p => p.id === selectedPatientId) || patients[0] || null;
  },

  // Clear patients (for cleanup)
  clearPatients: () => {
    set({ 
      patients: [],
      selectedPatientId: 'patient-001',
      patientsLoading: false,
      patientsError: null
    });
    localStorage.removeItem('selectedPatientId');
  }
});

// Export individual store hook for direct access
export const usePatientsStore = () => {
  // This would be used if we had individual slice stores
  // For now, it's just a placeholder to match the import pattern
  return null;
};