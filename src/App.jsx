import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <RoleProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Default route - redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard route - renders based on viewing role */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Add more routes here as needed */}
            <Route path="/referral" element={<div className="p-6">Referral Wizard - Coming Soon</div>} />
            <Route path="/cases" element={<div className="p-6">Case Management - Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
                <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </Layout>
      </Router>
    </RoleProvider>
  );
}

export default App;
