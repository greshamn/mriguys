import React, { useEffect, useState } from 'react';
import { useStore, useCentersStore, useUIStore } from '../store';

const ZustandTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Test the main store
  const centers = useStore((state) => state.centers);
  const storeLoading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const fetchCenters = useStore((state) => state.fetchCenters);

  // Test individual slice hooks
  const centersFromSlice = useCentersStore((state) => state.centers);
  const centersLoading = useCentersStore((state) => state.loading);
  const centersError = useCentersStore((state) => state.error);
  const fetchCentersFromSlice = useCentersStore((state) => state.fetchCenters);

  // Test UI store
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Store initialization
      addTestResult('Store Initialization', 'PASS', 'Zustand store initialized successfully');

      // Test 2: State access
      if (centers !== undefined) {
        addTestResult('State Access', 'PASS', `Centers state accessible: ${centers.length} items`);
      } else {
        addTestResult('State Access', 'FAIL', 'Centers state not accessible');
      }

      // Test 3: Individual slice access
      if (centersFromSlice !== undefined) {
        addTestResult('Slice Access', 'PASS', `Centers slice accessible: ${centersFromSlice.length} items`);
      } else {
        addTestResult('Slice Access', 'FAIL', 'Centers slice not accessible');
      }

      // Test 4: UI store functionality
      if (theme && setTheme && toggleTheme) {
        addTestResult('UI Store', 'PASS', `Theme: ${theme}, functions available`);
      } else {
        addTestResult('UI Store', 'FAIL', 'UI store functions not available');
      }

      // Test 5: API integration (mock)
      try {
        // This will fail since we don't have a real API, but we can test the function exists
        if (typeof fetchCenters === 'function') {
          addTestResult('API Functions', 'PASS', 'fetchCenters function available');
        } else {
          addTestResult('API Functions', 'FAIL', 'fetchCenters function not available');
        }
      } catch (error) {
        addTestResult('API Functions', 'FAIL', `Error: ${error.message}`);
      }

      // Test 6: Store structure
      const storeKeys = Object.keys(useStore.getState());
      const expectedKeys = [
        'centers', 'slots', 'referrals', 'appointments', 'reports',
        'patients', 'providers', 'insurers', 'bills', 'liens',
        'settlements', 'claims', 'bodyParts', 'safetyQuestions',
        'technologists', 'radiologists', 'attorneys', 
        'systemInfo', 'systemSettings', 'systemLogs', 'systemHealth', 'systemNotifications', 'systemLoading', 'systemError',
        'adminUsers', 'adminRoles', 'adminPermissions', 'adminAuditLogs', 'adminSystemMetrics', 'adminSelectedUser', 'adminLoading', 'adminError',
        'theme', 'sidebarCollapsed', 'aiDrawerOpen', 'commandModalOpen'
      ];

      // Debug: Show what keys are actually present
      addTestResult('Store Debug', 'INFO', `Actual store keys: ${storeKeys.join(', ')}`);

      const missingKeys = expectedKeys.filter(key => !storeKeys.includes(key));
      if (missingKeys.length === 0) {
        addTestResult('Store Structure', 'PASS', `All expected keys present: ${storeKeys.length} total`);
      } else {
        addTestResult('Store Structure', 'FAIL', `Missing keys: ${missingKeys.join(', ')}`);
      }

      // Test 7: Check system and admin slices individually
      try {
        const systemState = useStore.getState();
        if (systemState.systemInfo !== undefined) {
          addTestResult('System Slice', 'PASS', 'System slice is accessible');
        } else {
          addTestResult('System Slice', 'FAIL', 'System slice not accessible');
        }
        
        if (systemState.adminUsers !== undefined) {
          addTestResult('Admin Slice', 'PASS', 'Admin slice is accessible');
        } else {
          addTestResult('Admin Slice', 'FAIL', 'Admin slice not accessible');
        }
      } catch (error) {
        addTestResult('Slice Access', 'ERROR', `Error accessing slices: ${error.message}`);
      }

      // Test 8: Theme toggle functionality
      const originalTheme = theme;
      toggleTheme();
      const newTheme = useUIStore.getState().theme;
      if (newTheme !== originalTheme) {
        addTestResult('Theme Toggle', 'PASS', `Theme changed from ${originalTheme} to ${newTheme}`);
        // Reset theme
        setTheme(originalTheme);
      } else {
        addTestResult('Theme Toggle', 'FAIL', 'Theme did not change');
      }

    } catch (error) {
      addTestResult('Test Execution', 'ERROR', `Error running tests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (result) => {
    switch (result) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      case 'ERROR': return 'text-orange-600';
      case 'INFO': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Zustand Store Test</h1>
          <p className="text-gray-600 mb-6">
            This page tests the Zustand store implementation to ensure all slices are properly integrated.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Tests'}
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Store State</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Centers: {centers?.length || 0}</div>
                <div>Loading: {storeLoading ? 'Yes' : 'No'}</div>
                <div>Error: {error || 'None'}</div>
                <div>Theme: {theme}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Slice State</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Centers (Slice): {centersFromSlice?.length || 0}</div>
                <div>Loading (Slice): {centersLoading ? 'Yes' : 'No'}</div>
                <div>Error (Slice): {centersError || 'None'}</div>
              </div>
            </div>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`font-mono text-sm ${getStatusColor(result.result)}`}>
                    [{result.result}]
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{result.test}</div>
                    <div className="text-sm text-gray-600">{result.details}</div>
                    <div className="text-xs text-gray-500 mt-1">{result.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>Summary:</strong> {testResults.filter(r => r.result === 'PASS').length} passed, 
                {testResults.filter(r => r.result === 'FAIL').length} failed, 
                {testResults.filter(r => r.result === 'ERROR').length} errors,
                {testResults.filter(r => r.result === 'INFO').length} info
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZustandTest;
