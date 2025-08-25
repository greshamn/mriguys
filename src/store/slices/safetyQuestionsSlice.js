import { create } from 'zustand';

export const safetyQuestionsSlice = (set, get) => ({
  // State
  safetyQuestions: [],
  loading: false,
  error: null,
  filters: {
    modality: '',
    bodyPart: '',
    category: '',
  },

  // Actions
  setSafetyQuestions: (safetyQuestions) => set({ safetyQuestions }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  // API Integration
  fetchSafetyQuestions: async (params = {}) => {
    const { filters } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.modality) queryParams.append('modality', filters.modality);
    if (filters.bodyPart) queryParams.append('bodyPart', filters.bodyPart);
    if (filters.category) queryParams.append('category', filters.category);
    
    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/safety-questions?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        safetyQuestions: data.data || data,
        loading: false,
      });
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Selectors (computed values)
  getSafetyQuestionsByModality: (modality) => {
    const { safetyQuestions } = get();
    return safetyQuestions.filter((question) => 
      !question.modality || question.modality === modality
    );
  },

  getSafetyQuestionsByBodyPart: (bodyPart) => {
    const { safetyQuestions } = get();
    return safetyQuestions.filter((question) => 
      !question.bodyPart || question.bodyPart === bodyPart
    );
  },

  getSafetyQuestionsByCategory: (category) => {
    const { safetyQuestions } = get();
    return safetyQuestions.filter((question) => question.category === category);
  },

  getSafetyQuestionsByModalityAndBodyPart: (modality, bodyPart) => {
    const { safetyQuestions } = get();
    return safetyQuestions.filter((question) => {
      const modalityMatch = !question.modality || question.modality === modality;
      const bodyPartMatch = !question.bodyPart || question.bodyPart === bodyPart;
      return modalityMatch && bodyPartMatch;
    });
  },

  getSafetyQuestionById: (id) => {
    const { safetyQuestions } = get();
    return safetyQuestions.find((question) => question.id === id);
  },

  getSafetyQuestionStats: () => {
    const { safetyQuestions } = get();
    const total = safetyQuestions.length;
    const byCategory = safetyQuestions.reduce((acc, question) => {
      const category = question.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    const byModality = safetyQuestions.reduce((acc, question) => {
      const modality = question.modality || 'General';
      acc[modality] = (acc[modality] || 0) + 1;
      return acc;
    }, {});
    
    return { total, byCategory, byModality };
  },

  // Get questions for a specific exam type
  getQuestionsForExam: (modality, bodyPart) => {
    const { safetyQuestions } = get();
    return safetyQuestions.filter((question) => {
      // Questions that apply to this specific exam
      const modalityMatch = !question.modality || question.modality === modality;
      const bodyPartMatch = !question.bodyPart || question.bodyPart === bodyPart;
      
      // Questions that are always asked
      const isGeneral = !question.modality && !question.bodyPart;
      
      return isGeneral || (modalityMatch && bodyPartMatch);
    });
  },

  // Reset state
  resetSafetyQuestions: () => set({
    safetyQuestions: [],
    loading: false,
    error: null,
    filters: {
      modality: '',
      bodyPart: '',
      category: '',
    },
  }),
});

// Export individual hook for this slice
export const useSafetyQuestionsStore = create(safetyQuestionsSlice);
