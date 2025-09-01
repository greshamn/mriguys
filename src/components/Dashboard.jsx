import React from 'react';
import { useRole } from '../context/RoleContext';
import { AdminDashboard } from '../pages/dashboards/AdminDashboard';
import { PatientDashboard } from '../pages/dashboards/PatientDashboard';
import { ReferrerDashboard } from '../pages/dashboards/ReferrerDashboard';
import { ImagingCenterDashboard } from '../pages/dashboards/ImagingCenterDashboard';
import { AttorneyDashboard } from '../pages/dashboards/AttorneyDashboard';

// Placeholder components for other roles (you can expand these later)

const FunderDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-foreground">Funder Dashboard</h1>
    <p className="text-muted-foreground">Funding applications and approvals</p>
  </div>
);

const OpsDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
    <p className="text-muted-foreground">Queue management and center scorecards</p>
  </div>
);

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
      return <OpsDashboard />;
    default:
      return <AdminDashboard />;
  }
};
