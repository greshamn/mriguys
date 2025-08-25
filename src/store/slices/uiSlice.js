import { create } from 'zustand';

export const uiSlice = (set, get) => ({
  // State
  theme: 'light', // 'light' | 'dark' | 'mri-neon'
  sidebarCollapsed: false,
  aiDrawerOpen: false,
  commandModalOpen: false,
  notifications: [],
  loadingStates: {},
  modals: {},
  toasts: [],

  // Actions
  setTheme: (theme) => {
    set({ theme });
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mriguys-theme', theme);
  },

  toggleTheme: () => {
    const { theme } = get();
    const themes = ['light', 'dark', 'mri-neon'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    get().setTheme(nextTheme);
  },

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setAIDrawerOpen: (open) => set({ aiDrawerOpen: open }),

  toggleAIDrawer: () => set((state) => ({ aiDrawerOpen: !state.aiDrawerOpen })),

  setCommandModalOpen: (open) => set({ commandModalOpen: open }),

  toggleCommandModal: () => set((state) => ({ commandModalOpen: !state.commandModalOpen })),

  // Loading States
  setLoading: (key, loading) => set((state) => ({
    loadingStates: { ...state.loadingStates, [key]: loading },
  })),

  getLoading: (key) => {
    const { loadingStates } = get();
    return loadingStates[key] || false;
  },

  // Notifications
  addNotification: (notification) => {
    const id = `notification-${Date.now()}`;
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
    }));
    
    // Auto-remove after duration (default: 5000ms)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
    
    return id;
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),

  clearNotifications: () => set({ notifications: [] }),

  // Modals
  openModal: (key, data = {}) => set((state) => ({
    modals: { ...state.modals, [key]: { open: true, data } },
  })),

  closeModal: (key) => set((state) => ({
    modals: { ...state.modals, [key]: { open: false, data: {} } },
  })),

  getModal: (key) => {
    const { modals } = get();
    return modals[key] || { open: false, data: {} };
  },

  // Toasts
  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    const newToast = {
      id,
      timestamp: new Date().toISOString(),
      type: 'info', // 'info' | 'success' | 'warning' | 'error'
      duration: 5000,
      ...toast,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast].slice(-5), // Keep last 5
    }));
    
    // Auto-remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
    
    return id;
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearToasts: () => set({ toasts: [] }),

  // Utility functions
  showSuccess: (message, title = 'Success') => {
    get().addToast({ type: 'success', message, title });
  },

  showError: (message, title = 'Error') => {
    get().addToast({ type: 'error', message, title });
  },

  showWarning: (message, title = 'Warning') => {
    get().addToast({ type: 'warning', message, title });
  },

  showInfo: (message, title = 'Info') => {
    get().addToast({ type: 'info', message, title });
  },

  // Reset state
  resetUI: () => set({
    theme: 'light',
    sidebarCollapsed: false,
    aiDrawerOpen: false,
    commandModalOpen: false,
    notifications: [],
    loadingStates: {},
    modals: {},
    toasts: [],
  }),

  // Initialize theme from localStorage
  initializeTheme: () => {
    const savedTheme = localStorage.getItem('mriguys-theme');
    if (savedTheme && ['light', 'dark', 'mri-neon'].includes(savedTheme)) {
      get().setTheme(savedTheme);
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      get().setTheme(prefersDark ? 'dark' : 'light');
    }
  },
});

// Export individual hook for this slice
export const useUIStore = create(uiSlice);
