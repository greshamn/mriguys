import { create } from 'zustand';

export const bodyPartsSlice = (set, get) => {
  return {
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
      console.log('🔄 fetchBodyParts: Starting API call...');
      set({ loading: true, error: null });

      const attemptFetch = async (attempt = 1) => {
        console.log(`🔄 fetchBodyParts: Attempt ${attempt}`);
        const response = await fetch('/api/body-parts', {
          headers: { Accept: 'application/json' },
        });
        const contentType = response.headers.get('content-type') || '';
        console.log('🔄 fetchBodyParts: Response status:', response.status, 'ct:', contentType);

        if (!response.ok || contentType.includes('text/html')) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 300 * attempt));
            return attemptFetch(attempt + 1);
          }
          throw new Error(`Unexpected response for /api/body-parts (status: ${response.status}, ct: ${contentType})`);
        }

        try {
          return await response.json();
        } catch (e) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 300 * attempt));
            return attemptFetch(attempt + 1);
          }
          throw e;
        }
      };

      try {
        const data = await attemptFetch(1);
        console.log('🔄 fetchBodyParts: Response data:', data);
        const bodyPartsData = data.data || data;
        set({ bodyParts: bodyPartsData, loading: false });
        console.log('🔄 fetchBodyParts: State updated successfully');
        return data;
      } catch (error) {
        console.warn('⚠️ fetchBodyParts: Falling back to static fixtures due to:', error?.message || error);
        try {
          const module = await import('@/mocks/fixtures/bodyParts.json');
          const fallback = module?.default || module;
          set({ bodyParts: fallback, loading: false });
          return { data: fallback };
        } catch (fallbackErr) {
          set({ error: error.message, loading: false });
          throw fallbackErr;
        }
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
  };
};

// Export individual hook for this slice
export const useBodyPartsStore = create(bodyPartsSlice);
