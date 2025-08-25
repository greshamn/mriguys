import { create } from 'zustand';

export const systemSlice = (set, get) => ({
  // State
  systemInfo: null,
  settings: {},
  logs: [],
  health: {
    status: 'unknown',
    lastCheck: null,
    services: {},
  },
  notifications: [],
  loading: false,
  error: null,

  // Actions
  setSystemInfo: (systemInfo) => set({ systemInfo }),
  
  setSettings: (settings) => set({ settings }),
  
  setLogs: (logs) => set({ logs }),
  
  setHealth: (health) => set({ health }),
  
  setNotifications: (notifications) => set({ notifications }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // API Integration
  fetchSystemInfo: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/system/info');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const systemInfo = await response.json();
      set({ systemInfo, loading: false });
      
      return systemInfo;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/system/settings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const settings = await response.json();
      set({ settings, loading: false });
      
      return settings;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSettings: async (updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedSettings = await response.json();
      
      // Update state
      set((state) => ({
        settings: { ...state.settings, ...updatedSettings },
        loading: false,
      }));
      
      return updatedSettings;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchLogs: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add params
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/system/logs?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const logs = await response.json();
      set({ logs, loading: false });
      
      return logs;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  checkHealth: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/system/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const health = await response.json();
      set({ 
        health: { ...health, lastCheck: new Date().toISOString() },
        loading: false 
      });
      
      return health;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/system/notifications');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const notifications = await response.json();
      set({ notifications, loading: false });
      
      return notifications;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await fetch(`/api/system/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update state
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // System Actions
  restartService: async (serviceName) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/system/services/${serviceName}/restart`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      set({ loading: false });
      
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearLogs: async (logType = 'all') => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/system/logs/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: logType }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Clear logs from state if clearing all
      if (logType === 'all') {
        set({ logs: [] });
      }
      
      set({ loading: false });
      
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Utility Actions
  addNotification: (notification) => {
    const newNotification = {
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
    
    return newNotification;
  },

  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  // Selectors (computed values)
  getSystemStatus: () => {
    const { health } = get();
    return health.status;
  },

  getServiceHealth: (serviceName) => {
    const { health } = get();
    return health.services[serviceName] || { status: 'unknown' };
  },

  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter((notification) => !notification.read);
  },

  getNotificationsByType: (type) => {
    const { notifications } = get();
    return notifications.filter((notification) => notification.type === type);
  },

  getNotificationsByPriority: (priority) => {
    const { notifications } = get();
    return notifications.filter((notification) => notification.priority === priority);
  },

  getSystemStats: () => {
    const { systemInfo, health, notifications } = get();
    
    return {
      uptime: systemInfo?.uptime || 0,
      version: systemInfo?.version || 'unknown',
      healthStatus: health.status,
      lastHealthCheck: health.lastCheck,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
      serviceCount: Object.keys(health.services || {}).length,
    };
  },

  getLogsByLevel: (level) => {
    const { logs } = get();
    return logs.filter((log) => log.level === level);
  },

  getLogsByService: (service) => {
    const { logs } = get();
    return logs.filter((log) => log.service === service);
  },

  getLogsByDateRange: (from, to) => {
    const { logs } = get();
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= from && logDate <= to;
    });
  },

  // Settings helpers
  getSetting: (key, defaultValue = null) => {
    const { settings } = get();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  updateSetting: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },

  // Reset state
  resetSystem: () => set({
    systemInfo: null,
    settings: {},
    logs: [],
    health: {
      status: 'unknown',
      lastCheck: null,
      services: {},
    },
    notifications: [],
    loading: false,
    error: null,
  }),
});

// Export individual hook for this slice
export const useSystemStore = create(systemSlice);
