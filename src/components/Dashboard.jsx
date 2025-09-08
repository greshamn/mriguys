import React from 'react';
import { useRole } from '../context/RoleContext';
import { AdminDashboard } from '../pages/dashboards/AdminDashboard';
import { PatientDashboard } from '../pages/dashboards/PatientDashboard';
import { ReferrerDashboard } from '../pages/dashboards/ReferrerDashboard';
import { ImagingCenterDashboard } from '../pages/dashboards/ImagingCenterDashboard';
import { AttorneyDashboard } from '../pages/dashboards/AttorneyDashboard';
import { FunderDashboard } from '../pages/dashboards/FunderDashboard';
import OperationsDashboard from '../pages/dashboards/OperationsDashboard';

// Placeholder components for other roles (you can expand these later)

export const Dashboard = () => {
  const { viewingAsRole, isAdmin } = useRole();

  // Render dashboard based on viewing role
  switch (viewingAsRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'patient':
      return <PatientDashboard />;
    case 'referrer':
      return <ReferrerDashboard />;
    case 'imaging-center':
      return <ImagingCenterDashboard />;
    case 'attorney':
      return <AttorneyDashboard />;
    case 'funder':
      return <FunderDashboard />;
    case 'ops':
      return <OperationsDashboard />;
    default:
      return <AdminDashboard />;
  }
};
