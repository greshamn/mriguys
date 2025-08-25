import { create } from 'zustand';

export const reportsSlice = (set, get) => ({
  // State
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    patientName: '',
    centerId: '',
    dateFrom: null,
    dateTo: null,
    modality: '',
    bodyPart: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Actions
  setReports: (reports) => set({ reports }),
  
  setSelectedReport: (report) => set({ selectedReport: report }),
  
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
  fetchReports: async (params = {}) => {
    const { filters, pagination } = get();
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.patientName) queryParams.append('patientName', filters.patientName);
    if (filters.centerId) queryParams.append('centerId', filters.centerId);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
    if (filters.modality) queryParams.append('modality', filters.modality);
    if (filters.bodyPart) queryParams.append('bodyPart', filters.bodyPart);
    if (filters.search) queryParams.append('search', filters.search);
    
    // Add pagination
    queryParams.append('page', pagination.page);
    queryParams.append('limit', pagination.limit);
    
    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/reports?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({
        reports: data.data || data,
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

  fetchReportById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const report = await response.json();
      set({ selectedReport: report, loading: false });
      
      return report;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createReport: async (reportData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newReport = await response.json();
      
      // Optimistic update
      set((state) => ({
        reports: [newReport, ...state.reports],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        loading: false,
      }));
      
      return newReport;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReport: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedReport = await response.json();
      
      // Update state
      set((state) => ({
        reports: state.reports.map((report) =>
          report.id === id ? updatedReport : report
        ),
        selectedReport: state.selectedReport?.id === id
          ? updatedReport
          : state.selectedReport,
        loading: false,
      }));
      
      return updatedReport;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optimistic Updates
  addReport: (report) => {
    const newReport = { ...report, id: `temp-${Date.now()}` };
    set((state) => ({
      reports: [newReport, ...state.reports],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }));
    
    return newReport;
  },

  updateReportStatus: (id, status) => {
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === id ? { ...report, status } : report
      ),
      selectedReport: state.selectedReport?.id === id
        ? { ...state.selectedReport, status }
        : state.selectedReport,
    }));
  },

  // Selectors (computed values)
  getReportsByStatus: (status) => {
    const { reports } = get();
    return reports.filter((report) => report.status === status);
  },

  getReportsByPatient: (patientId) => {
    const { reports } = get();
    return reports.filter((report) => report.patientId === patientId);
  },

  getReportsByCenter: (centerId) => {
    const { reports } = get();
    return reports.filter((report) => report.centerId === centerId);
  },

  getReportsByModality: (modality) => {
    const { reports } = get();
    return reports.filter((report) => report.modality === modality);
  },

  getReportsByBodyPart: (bodyPart) => {
    const { reports } = get();
    return reports.filter((report) => report.bodyPart === bodyPart);
  },

  getReportsByDate: (date) => {
    const { reports } = get();
    const targetDate = new Date(date);
    return reports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      return reportDate.toDateString() === targetDate.toDateString();
    });
  },

  getReportsByDateRange: (from, to) => {
    const { reports } = get();
    return reports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= from && reportDate <= to;
    });
  },

  getReportStats: () => {
    const { reports } = get();
    const total = reports.length;
    const draft = reports.filter((r) => r.status === 'draft').length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const completed = reports.filter((r) => r.status === 'completed').length;
    const reviewed = reports.filter((r) => r.status === 'reviewed').length;
    const signed = reports.filter((r) => r.status === 'signed').length;
    
    return { total, draft, pending, completed, reviewed, signed };
  },

  // Search reports by text
  searchReports: (query) => {
    const { reports } = get();
    const searchTerm = query.toLowerCase();
    
    return reports.filter((report) => {
      const patientName = report.patientName?.toLowerCase() || '';
      const findings = report.findings?.toLowerCase() || '';
      const impression = report.impression?.toLowerCase() || '';
      const modality = report.modality?.toLowerCase() || '';
      const bodyPart = report.bodyPart?.toLowerCase() || '';
      
      return patientName.includes(searchTerm) ||
             findings.includes(searchTerm) ||
             impression.includes(searchTerm) ||
             modality.includes(searchTerm) ||
             bodyPart.includes(searchTerm);
    });
  },

  // Get reports for a specific appointment
  getReportsByAppointment: (appointmentId) => {
    const { reports } = get();
    return reports.filter((report) => report.appointmentId === appointmentId);
  },

  // Reset state
  resetReports: () => set({
    reports: [],
    selectedReport: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      patientName: '',
      centerId: '',
      dateFrom: null,
      dateTo: null,
      modality: '',
      bodyPart: '',
      search: '',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),
});

// Export individual hook for this slice
export const useReportsStore = create(reportsSlice);
