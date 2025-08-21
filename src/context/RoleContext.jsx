import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  // Primary role never changes (user's actual role)
  const [primaryRole, setPrimaryRole] = useState('admin'); // Default for demo
  
  // Viewing role can change (what the user sees in the UI)
  const [viewingAsRole, setViewingAsRole] = useState('admin');
  
  // Available roles for switching
  const availableRoles = [
    'admin',
    'patient', 
    'referrer',
    'imaging-center',
    'attorney',
    'funder',
    'ops'
  ];

  // Role permissions mapping
  const rolePermissions = {
    admin: ['*'], // Admin has all permissions
    patient: ['view-own-referrals', 'view-own-results'],
    referrer: ['create-referrals', 'view-own-referrals', 'view-patients'],
    'imaging-center': ['view-worklist', 'update-status', 'upload-results'],
    attorney: ['view-cases', 'manage-liens', 'view-packets'],
    funder: ['view-applications', 'approve-funding', 'view-reports'],
    ops: ['view-queues', 'reassign-cases', 'view-scorecards']
  };

  // Check if user can access a specific permission
  const canAccess = (permission) => {
    if (primaryRole === 'admin') return true; // Admin can do anything
    return rolePermissions[primaryRole]?.includes(permission) || false;
  };

  // Switch viewing role (only for admins)
  const switchViewingRole = (newRole) => {
    if (primaryRole === 'admin' && availableRoles.includes(newRole)) {
      setViewingAsRole(newRole);
      // Store preference in localStorage
      localStorage.setItem('adminViewingAsRole', newRole);
    }
  };

  // Load admin's preferred viewing role from localStorage
  useEffect(() => {
    if (primaryRole === 'admin') {
      const savedRole = localStorage.getItem('adminViewingAsRole');
      if (savedRole && availableRoles.includes(savedRole)) {
        setViewingAsRole(savedRole);
      }
    }
  }, [primaryRole]);

  const value = {
    primaryRole,
    viewingAsRole,
    availableRoles,
    rolePermissions,
    canAccess,
    switchViewingRole,
    isAdmin: primaryRole === 'admin'
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
