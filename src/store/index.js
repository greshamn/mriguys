import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { centersSlice } from './slices/centersSlice';
import { slotsSlice } from './slices/slotsSlice';
import { referralsSlice } from './slices/referralsSlice';
import { appointmentsSlice } from './slices/appointmentsSlice';
import { reportsSlice } from './slices/reportsSlice';
import { patientsSlice } from './slices/patientsSlice';
import { providersSlice } from './slices/providersSlice';
import { insurersSlice } from './slices/insurersSlice';
import { billsSlice } from './slices/billsSlice';
import { liensSlice } from './slices/liensSlice';
import { settlementsSlice } from './slices/settlementsSlice';
import { claimsSlice } from './slices/claimsSlice';
import { bodyPartsSlice } from './slices/bodyPartsSlice';
import { safetyQuestionsSlice } from './slices/safetyQuestionsSlice';
import { technologistsSlice } from './slices/technologistsSlice';
import { radiologistsSlice } from './slices/radiologistsSlice';
import { attorneysSlice } from './slices/attorneysSlice';
import { uiSlice } from './slices/uiSlice';
import { systemSlice } from './slices/systemSlice';
import { adminSlice } from './slices/adminSlice';

// Create the main store by combining all slices
export const useStore = create(
  devtools(
    persist(
      (...a) => {
        const combinedStore = {
          // Entity slices
          ...centersSlice(...a),
          ...slotsSlice(...a),
          ...referralsSlice(...a),
          ...appointmentsSlice(...a),
          ...reportsSlice(...a),
          ...patientsSlice(...a),
          ...providersSlice(...a),
          ...insurersSlice(...a),
          ...billsSlice(...a),
          ...liensSlice(...a),
          ...settlementsSlice(...a),
          ...claimsSlice(...a),
          ...bodyPartsSlice(...a),
          ...safetyQuestionsSlice(...a),
          ...technologistsSlice(...a),
          ...radiologistsSlice(...a),
          ...attorneysSlice(...a),
          
          // System slices
          ...(() => {
            const system = systemSlice(...a);
            const admin = adminSlice(...a);
            return {
              // System slice properties
              systemInfo: system.systemInfo,
              systemSettings: system.settings,
              systemLogs: system.logs,
              systemHealth: system.health,
              systemNotifications: system.notifications,
              systemLoading: system.loading,
              systemError: system.error,
              // System actions
              setSystemInfo: system.setSystemInfo,
              setSystemSettings: system.setSettings,
              setSystemLogs: system.setLogs,
              setSystemHealth: system.setHealth,
              setSystemNotifications: system.setNotifications,
              setSystemLoading: system.setLoading,
              setSystemError: system.setError,
              fetchSystemInfo: system.fetchSystemInfo,
              fetchSystemSettings: system.fetchSettings,
              updateSystemSettings: system.updateSettings,
              fetchSystemLogs: system.fetchLogs,
              checkSystemHealth: system.checkHealth,
              fetchSystemNotifications: system.fetchNotifications,
              markSystemNotificationRead: system.markNotificationRead,
              restartSystemService: system.restartService,
              clearSystemLogs: system.clearLogs,
              addSystemNotification: system.addNotification,
              removeSystemNotification: system.removeNotification,
              clearSystemNotifications: system.clearNotifications,
              getSystemStatus: system.getSystemStatus,
              getServiceHealth: system.getServiceHealth,
              getUnreadSystemNotifications: system.getUnreadNotifications,
              getSystemNotificationsByType: system.getNotificationsByType,
              getSystemNotificationsByPriority: system.getNotificationsByPriority,
              getSystemStats: system.getSystemStats,
              getSystemLogsByLevel: system.getLogsByLevel,
              getSystemLogsByService: system.getLogsByService,
              getSystemLogsByDateRange: system.getLogsByDateRange,
              getSystemSetting: system.getSetting,
              updateSystemSetting: system.updateSetting,
              resetSystem: system.resetSystem,
              
              // Admin slice properties
              adminUsers: admin.users,
              adminRoles: admin.roles,
              adminPermissions: admin.permissions,
              adminAuditLogs: admin.auditLogs,
              adminSystemMetrics: admin.systemMetrics,
              adminSelectedUser: admin.selectedUser,
              adminLoading: admin.loading,
              adminError: admin.error,
              adminFilters: admin.filters,
              adminPagination: admin.pagination,
              // Admin actions
              setAdminUsers: admin.setUsers,
              setAdminRoles: admin.setRoles,
              setAdminPermissions: admin.setPermissions,
              setAdminAuditLogs: admin.setAuditLogs,
              setAdminSystemMetrics: admin.setSystemMetrics,
              setAdminSelectedUser: admin.setSelectedUser,
              setAdminLoading: admin.setLoading,
              setAdminError: admin.setError,
              setAdminFilters: admin.setFilters,
              setAdminPagination: admin.setPagination,
              fetchAdminUsers: admin.fetchUsers,
              fetchAdminRoles: admin.fetchRoles,
              fetchAdminPermissions: admin.fetchPermissions,
              fetchAdminAuditLogs: admin.fetchAuditLogs,
              fetchAdminSystemMetrics: admin.fetchSystemMetrics,
              createAdminUser: admin.createUser,
              updateAdminUser: admin.updateUser,
              deleteAdminUser: admin.deleteUser,
              createAdminRole: admin.createRole,
              updateAdminRole: admin.updateRole,
              backupAdminDatabase: admin.backupDatabase,
              clearAdminCache: admin.clearCache,
              addAdminUser: admin.addUser,
              updateAdminUserStatus: admin.updateUserStatus,
              getAdminUsersByRole: admin.getUsersByRole,
              getAdminUsersByStatus: admin.getUsersByStatus,
              getAdminUserById: admin.getUserById,
              getAdminUserByEmail: admin.getUserByEmail,
              getAdminUserStats: admin.getUserStats,
              getAdminRoleById: admin.getRoleById,
              getAdminRoleByName: admin.getRoleByName,
              getAdminPermissionById: admin.getPermissionById,
              getAdminAuditLogsByUser: admin.getAuditLogsByUser,
              getAdminAuditLogsByAction: admin.getAuditLogsByAction,
              getAdminAuditLogsByDateRange: admin.getAuditLogsByDateRange,
              searchAdminUsers: admin.searchUsers,
              getAdminSystemHealthSummary: admin.getSystemHealthSummary,
              resetAdmin: admin.resetAdmin,
            };
          })(),
          
          // UI slice
          ...uiSlice(...a),
        };
        console.log('🔍 Store: Combined store created successfully');
        console.log('🔍 Store: Available properties:', Object.keys(combinedStore));
        console.log('🔍 Store: bodyParts property exists:', 'bodyParts' in combinedStore);
        console.log('🔍 Store: fetchBodyParts function exists:', 'fetchBodyParts' in combinedStore);
        return combinedStore;
      },
      {
        name: 'mriguys-store',
        partialize: (state) => ({
          // Only persist UI preferences, not sensitive data
          ui: state.ui,
        }),
      }
    ),
    {
      name: 'mriguys-store',
    }
  )
);

// Export individual slices for direct access if needed
export { useCentersStore } from './slices/centersSlice';
export { useSlotsStore } from './slices/slotsSlice';
export { useReferralsStore } from './slices/referralsSlice';
export { useAppointmentsStore } from './slices/appointmentsSlice';
export { useReportsStore } from './slices/reportsSlice';
export { usePatientsStore } from './slices/patientsSlice';
export { useProvidersStore } from './slices/providersSlice';
export { useInsurersStore } from './slices/insurersSlice';
export { useBillsStore } from './slices/billsSlice';
export { useLiensStore } from './slices/liensSlice';
export { useSettlementsStore } from './slices/settlementsSlice';
export { useClaimsStore } from './slices/claimsSlice';
export { useBodyPartsStore } from './slices/bodyPartsSlice';
export { useSafetyQuestionsStore } from './slices/safetyQuestionsSlice';
export { useTechnologistsStore } from './slices/technologistsSlice';
export { useRadiologistsStore } from './slices/radiologistsSlice';
export { useAttorneysStore } from './slices/attorneysSlice';
export { useSystemStore } from './slices/systemSlice';
export { useAdminStore } from './slices/adminSlice';
export { useUIStore } from './slices/uiSlice';
