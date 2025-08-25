import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MSWTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState({});

  const testEndpoint = async (endpoint, description) => {
    setLoading(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint);
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: true,
          latency,
          data: data.data || data,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: err.message,
          timestamp: new Date().toISOString()
        }
      }));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    const endpoints = [
      '/api/centers',
      '/api/body-parts',
      '/api/safety-questions',
      '/api/referrals',
      '/api/appointments',
      '/api/reports',
      '/api/liens',
      '/api/exposure',
      '/api/system/health'
    ];

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint, `Testing ${endpoint}`);
      // Small delay between requests to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const testFilteredEndpoints = async () => {
    // Test endpoints with query parameters
    await testEndpoint('/api/centers?modality=MRI', 'Centers with MRI');
    await testEndpoint('/api/centers?city=Miami', 'Centers in Miami');
    await testEndpoint('/api/safety-questions?modality=MRI&bodyPart=Head', 'MRI Head Safety Questions');
    await testEndpoint('/api/referrals?status=pending', 'Pending Referrals');
  };

  const clearResults = () => {
    setTestResults({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-4xl font-bold mb-2 text-primary">MSW Test Page</h1>
          <p className="text-lg text-muted-foreground">
            Test the Mock Service Worker endpoints to ensure they're working correctly
          </p>
          <div className="mt-4">
            <Badge variant="default" className="text-sm">
              Environment: {process.env.NODE_ENV}
            </Badge>
            <Badge variant="default" className="ml-2 text-sm">
              ✅ MSW Active
            </Badge>
          </div>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Test Controls</CardTitle>
              <CardDescription>
                Test individual endpoints or run all tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={testAllEndpoints} 
                  disabled={loading}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {loading ? '🔄 Testing...' : '🚀 Test All Endpoints'}
                </Button>
                
                <Button 
                  onClick={testFilteredEndpoints} 
                  disabled={loading}
                  variant="outline"
                  className="w-full h-10"
                >
                  🔍 Test Filtered Endpoints
                </Button>

                <Button 
                  onClick={clearResults}
                  variant="secondary"
                  className="w-full h-10"
                >
                  🗑️ Clear Results
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Quick Tests:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => testEndpoint('/api/centers', 'Centers')}
                    disabled={loading}
                    size="sm"
                    variant="secondary"
                  >
                    🏥 Centers
                  </Button>
                  
                  <Button 
                    onClick={() => testEndpoint('/api/body-parts', 'Body Parts')}
                    disabled={loading}
                    size="sm"
                    variant="secondary"
                  >
                    🦴 Body Parts
                  </Button>
                  
                  <Button 
                    onClick={() => testEndpoint('/api/safety-questions', 'Safety Qs')}
                    disabled={loading}
                    size="sm"
                    variant="secondary"
                  >
                    ⚠️ Safety Qs
                  </Button>
                  
                  <Button 
                    onClick={() => testEndpoint('/api/system/health', 'Health')}
                    disabled={loading}
                    size="sm"
                    variant="secondary"
                  >
                    💚 Health
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-600">MSW Status</CardTitle>
              <CardDescription>
                Mock Service Worker information and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Environment:</span>
                    <Badge variant="default" className="bg-green-600">
                      {process.env.NODE_ENV}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">MSW Status:</span>
                    <Badge variant="default" className="bg-green-600">
                      ✅ Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Service Worker:</span>
                    <Badge variant="default" className="bg-green-600">
                      ✅ Loaded
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-2">📡 Available Endpoints:</div>
                    <div className="space-y-1 text-xs">
                      <div>• Public: /api/centers, /api/body-parts, /api/safety-questions</div>
                      <div>• Referrals: /api/referrals, /api/slots/hold, /api/appointments</div>
                      <div>• Reports: /api/reports, /api/images/:id/download</div>
                      <div>• Attorney: /api/liens, /api/exposure, /api/cases/:id/packet</div>
                      <div>• System: /api/webhooks/test, /api/audit/:entityId, /api/system/health</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  Check browser console for detailed MSW startup messages
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive border-2">
            <CardContent className="pt-6">
              <div className="text-destructive font-medium text-lg mb-2">❌ Error:</div>
              <div className="text-sm bg-red-50 p-3 rounded">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <Card className="border-2 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-600">🧪 Test Results</CardTitle>
            <CardDescription>
              Results from endpoint testing with latency measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([endpoint, result]) => (
                <div key={endpoint} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <code className="text-sm font-mono bg-muted px-3 py-2 rounded-lg border">
                      {endpoint}
                    </code>
                    <Badge variant={result.success ? 'default' : 'destructive'} className="text-sm">
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </Badge>
                  </div>
                  
                  {result.success ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-800">Latency</div>
                        <div className="text-lg font-bold text-green-600">{result.latency}ms</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">Data</div>
                        <div className="text-lg font-bold text-blue-600">
                          {Array.isArray(result.data) ? `${result.data.length} items` : 'Object'}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-purple-800">Timestamp</div>
                        <div className="text-xs font-mono text-purple-600">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-red-800">Error Details:</div>
                      <div className="text-sm text-red-700 font-mono">{result.error}</div>
                    </div>
                  )}
                </div>
              ))}
              
              {Object.keys(testResults).length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <div className="text-6xl mb-4">🧪</div>
                  <div className="text-xl font-medium mb-2">No tests run yet</div>
                  <div className="text-sm">Click "Test All Endpoints" to start testing the MSW handlers</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>MSW Test Page - MRIGuys Platform v2.2</p>
          <p className="mt-1">Use this page to verify all mock API endpoints are working correctly</p>
        </div>
      </div>
    </div>
  );
};

export default MSWTest;
