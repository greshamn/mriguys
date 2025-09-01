import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import ReferralWizard from './pages/referrals/Wizard';
import MSWTest from './pages/MSWTest';
import ZustandTest from './pages/ZustandTest';
import PublicFinder from './pages/PublicFinder';
import ReferralsIndex from './pages/referrals/ReferralsIndex';
import Results from './pages/Results';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Worklist from './pages/Worklist';

function App() {
  return (
    <RoleProvider>
      <FavoritesProvider>
        <Router>
        <Routes>
          {/* MSW Test route - standalone for development testing */}
          <Route path="/msw-test" element={<MSWTest />} />
          
          {/* Zustand Test route - standalone for development testing */}
          <Route path="/zustand-test" element={<ZustandTest />} />
          
          {/* All other routes wrapped in Layout */}
          <Route path="/" element={<Layout />}>
            {/* Default route - redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard route - renders based on viewing role */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Public Finder route - integrated with Layout */}
            <Route path="centers" element={<PublicFinder />} />
            {/* Referrer Worklist */}
            <Route path="referrals" element={<ReferralsIndex />} />
            {/* Referrer Patients */}
            <Route path="patients" element={<Patients />} />
            {/* Patient Results */}
            <Route path="results" element={<Results />} />
            {/* Patient Appointments */}
            <Route path="appointments" element={<Appointments />} />
            
            {/* Imaging Center Worklist */}
            <Route path="worklist" element={<Worklist />} />
            
            {/* Add more routes here as needed */}
            <Route path="referral" element={<ReferralWizard />} />
            <Route path="cases" element={<div className="p-6">Case Management - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
                <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Route>
        </Routes>
        </Router>
      </FavoritesProvider>
    </RoleProvider>
  );
}

export default App;
