import { create } from 'zustand';

export const adminSlice = (set, get) => ({
  // State
  users: [],
  roles: [],
  permissions: [],
  auditLogs: [],
  systemMetrics: {},
  selectedUser: null,
  loading: false,
  error: null,
  filters: {
    userRole: '',
    userStatus: '',
    dateFrom: null,
    dateTo: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setUsers: (users) => set({ users }),
  
  setRoles: (roles) => set({ roles }),
  
  setPermissions: (permissions) => set({ permissions }),
  
  setAuditLogs: (auditLogs) => set({ auditLogs }),
  
  setSystemMetrics: (systemMetrics) => set({ systemMetrics }),
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  
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
  fetchUsers: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.userRole) queryParams.append('role', filters.userRole);
    if (filters.userStatus) queryParams.append('status', filters.userStatus);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        users: data.data || data,
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

  fetchRoles: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const roles = await response.json();
      set({ roles, loading: false });
      
      return roles;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchPermissions: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/permissions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const permissions = await response.json();
      set({ permissions, loading: false });
      
      return permissions;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchAuditLogs: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add params
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/admin/audit-logs?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const auditLogs = await response.json();
      set({ auditLogs, loading: false });
      
      return auditLogs;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSystemMetrics: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const systemMetrics = await response.json();
      set({ systemMetrics, loading: false });
      
      return systemMetrics;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // User Management
  createUser: async (userData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newUser = await response.json();
      
      // Optimistic update
      set((state) => ({
        users: [newUser, ...state.users],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newUser;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      
      // Update state
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
        selectedUser: state.selectedUser?.id === id
          ? updatedUser
          : state.selectedUser,
        loading: false,
      }));
      
      return updatedUser;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Remove from state
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        loading: false,
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Role Management
  createRole: async (roleData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRole = await response.json();
      
      // Optimistic update
      set((state) => ({
        roles: [newRole, ...state.roles],
        loading: false,
      }));
      
      return newRole;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRole: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedRole = await response.json();
      
      // Update state
      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === id ? updatedRole : role
        ),
        loading: false,
      }));
      
      return updatedRole;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // System Actions
  backupDatabase: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/backup', {
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

  clearCache: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/cache/clear', {
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

  // Optimistic Updates
  addUser: (user) => {
    const newUser = { ...user, id: `temp-${Date.now()}` };
    set((state) => ({
      users: [newUser, ...state.users],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newUser;
  },

  updateUserStatus: (id, status) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, status } : user
      ),
      selectedUser: state.selectedUser?.id === id
        ? { ...state.selectedUser, status }
        : state.selectedUser,
    }));
  },

  // Selectors (computed values)
  getUsersByRole: (role) => {
    const { users } = get();
    return users.filter((user) => user.role === role);
  },

  getUsersByStatus: (status) => {
    const { users } = get();
    return users.filter((user) => user.status === status);
  },

  getUserById: (id) => {
    const { users } = get();
    return users.find((user) => user.id === id);
  },

  getUserByEmail: (email) => {
    const { users } = get();
    return users.find((user) => user.email === email);
  },

  getUserStats: () => {
    const { users } = get();
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status === 'inactive').length;
    const suspended = users.filter((u) => u.status === 'suspended').length;
    
    // Count by role
    const byRole = users.reduce((acc, user) => {
      const role = user.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    return { total, active, inactive, suspended, byRole };
  },

  getRoleById: (id) => {
    const { roles } = get();
    return roles.find((role) => role.id === id);
  },

  getRoleByName: (name) => {
    const { roles } = get();
    return roles.find((role) => role.name === name);
  },

  getPermissionById: (id) => {
    const { permissions } = get();
    return permissions.find((permission) => permission.id === id);
  },

  getAuditLogsByUser: (userId) => {
    const { auditLogs } = get();
    return auditLogs.filter((log) => log.userId === userId);
  },

  getAuditLogsByAction: (action) => {
    const { auditLogs } = get();
    return auditLogs.filter((log) => log.action === action);
  },

  getAuditLogsByDateRange: (from, to) => {
    const { auditLogs } = get();
    return auditLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= from && logDate <= to;
    });
  },

  // Search users by multiple criteria
  searchUsers: (query) => {
    const { users } = get();
    const searchTerm = query.toLowerCase();
    
    return users.filter((user) => {
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const email = user.email?.toLowerCase() || '';
      const role = user.role?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             email.includes(searchTerm) ||
             role.includes(searchTerm);
    });
  },

  // Get system health summary
  getSystemHealthSummary: () => {
    const { systemMetrics } = get();
    
    return {
      database: systemMetrics.database?.status || 'unknown',
      api: systemMetrics.api?.status || 'unknown',
      storage: systemMetrics.storage?.status || 'unknown',
      memory: systemMetrics.memory?.usage || 0,
      cpu: systemMetrics.cpu?.usage || 0,
      uptime: systemMetrics.uptime || 0,
    };
  },

  // Reset state
  resetAdmin: () => set({
    users: [],
    roles: [],
    permissions: [],
    auditLogs: [],
    systemMetrics: {},
    selectedUser: null,
    loading: false,
    error: null,
    filters: {
      userRole: '',
      userStatus: '',
      dateFrom: null,
      dateTo: null,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useAdminStore = create(adminSlice);
