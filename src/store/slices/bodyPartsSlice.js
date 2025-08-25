import { create } from 'zustand';

export const bodyPartsSlice = (set, get) => ({
  // State
  bodyParts: [],
  loading: false,
  error: null,

  // Actions
  setBodyParts: (bodyParts) => set({ bodyParts }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // API Integration
  fetchBodyParts: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/body-parts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        bodyParts: data.data || data,
        loading: false,
      });
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Selectors (computed values)
  getBodyPartsByModality: (modality) => {
    const { bodyParts } = get();
    return bodyParts.filter((bodyPart) => 
      bodyPart.modalities?.includes(modality)
    );
  },

  getBodyPartById: (id) => {
    const { bodyParts } = get();
    return bodyParts.find((bodyPart) => bodyPart.id === id);
  },

  getBodyPartByName: (name) => {
    const { bodyParts } = get();
    return bodyParts.find((bodyPart) => 
      bodyPart.name.toLowerCase() === name.toLowerCase()
    );
  },

  getBodyPartsByCategory: (category) => {
    const { bodyParts } = get();
    return bodyParts.filter((bodyPart) => bodyPart.category === category);
  },

  getBodyPartStats: () => {
    const { bodyParts } = get();
    const total = bodyParts.length;
    const byCategory = bodyParts.reduce((acc, bodyPart) => {
      const category = bodyPart.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return { total, byCategory };
  },

  // Reset state
  resetBodyParts: () => set({
    bodyParts: [],
    loading: false,
    error: null,
  }),
});

// Export individual hook for this slice
export const useBodyPartsStore = create(bodyPartsSlice);
