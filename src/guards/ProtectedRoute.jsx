import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { primaryRole, viewingAsRole, canAccess } = useRole();
  const location = useLocation();

  // For now, we'll assume all users are authenticated
  // In a real app, you'd check authentication here
  
  // If no specific role is required, just render the children
  if (!requiredRole) {
    return children;
  }

  // Check if user can access this route
  const hasAccess = canAccess(`access-${requiredRole}`) || 
                   (primaryRole === 'admin') || 
                   (primaryRole === requiredRole);

  if (!hasAccess) {
    // Redirect to unauthorized page or dashboard
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export const RoleBasedRoute = ({ children, requiredRole }) => {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  );
};
