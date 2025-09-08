import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Clock, AlertTriangle, CheckCircle, Users, Activity, TrendingUp, 
  AlertCircle, RefreshCw, Eye, Settings, Filter, Search, 
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Calendar, MapPin, Phone, Mail, Star, Zap, Target, Shield
} from 'lucide-react';

// Mock data for operations
const QUEUE_DATA = [
  { id: 1, patient: 'John Smith', case: 'CASE-2024-001', priority: 'high', waitTime: '2h 15m', status: 'pending', center: 'Downtown MRI', modality: 'MRI Brain' },
  { id: 2, patient: 'Sarah Johnson', case: 'CASE-2024-002', priority: 'medium', waitTime: '45m', status: 'in-progress', center: 'Westside Imaging', modality: 'CT Chest' },
  { id: 3, patient: 'Mike Davis', case: 'CASE-2024-003', priority: 'low', waitTime: '1h 30m', status: 'pending', center: 'Central Radiology', modality: 'MRI Spine' },
  { id: 4, patient: 'Lisa Wilson', case: 'CASE-2024-004', priority: 'high', waitTime: '3h 45m', status: 'urgent', center: 'Emergency MRI', modality: 'MRI Brain' },
  { id: 5, patient: 'Tom Brown', case: 'CASE-2024-005', priority: 'medium', waitTime: '1h 10m', status: 'completed', center: 'Northside Imaging', modality: 'CT Abdomen' }
];

const CENTER_SCORECARDS = [
  { 
    id: 1, 
    name: 'Downtown MRI', 
    location: '123 Main St, Downtown', 
    score: 94, 
    status: 'excellent',
    cases: 156,
    avgWaitTime: '1.2h',
    satisfaction: 4.8,
    capacity: 85,
    lastUpdated: '2024-12-15T10:30:00Z'
  },
  { 
    id: 2, 
    name: 'Westside Imaging', 
    location: '456 Oak Ave, Westside', 
    score: 87, 
    status: 'good',
    cases: 134,
    avgWaitTime: '1.8h',
    satisfaction: 4.6,
    capacity: 92,
    lastUpdated: '2024-12-15T09:45:00Z'
  },
  { 
    id: 3, 
    name: 'Central Radiology', 
    location: '789 Pine St, Central', 
    score: 91, 
    status: 'excellent',
    cases: 98,
    avgWaitTime: '1.5h',
    satisfaction: 4.7,
    capacity: 78,
    lastUpdated: '2024-12-15T11:15:00Z'
  },
  { 
    id: 4, 
    name: 'Emergency MRI', 
    location: '321 Emergency Blvd', 
    score: 76, 
    status: 'needs-attention',
    cases: 203,
    avgWaitTime: '2.3h',
    satisfaction: 4.2,
    capacity: 95,
    lastUpdated: '2024-12-15T08:20:00Z'
  },
  { 
    id: 5, 
    name: 'Northside Imaging', 
    location: '654 North Rd, Northside', 
    score: 89, 
    status: 'good',
    cases: 112,
    avgWaitTime: '1.6h',
    satisfaction: 4.5,
    capacity: 88,
    lastUpdated: '2024-12-15T10:00:00Z'
  }
];

const PERFORMANCE_DATA = [
  { name: 'Mon', cases: 45, waitTime: 1.2, satisfaction: 4.6 },
  { name: 'Tue', cases: 52, waitTime: 1.4, satisfaction: 4.7 },
  { name: 'Wed', cases: 48, waitTime: 1.1, satisfaction: 4.8 },
  { name: 'Thu', cases: 61, waitTime: 1.6, satisfaction: 4.5 },
  { name: 'Fri', cases: 58, waitTime: 1.3, satisfaction: 4.7 },
  { name: 'Sat', cases: 32, waitTime: 1.0, satisfaction: 4.9 },
  { name: 'Sun', cases: 28, waitTime: 0.9, satisfaction: 4.8 }
];

const MODALITY_DISTRIBUTION = [
  { name: 'MRI Brain', value: 35, color: '#3B82F6' },
  { name: 'MRI Spine', value: 25, color: '#10B981' },
  { name: 'CT Chest', value: 20, color: '#F59E0B' },
  { name: 'CT Abdomen', value: 15, color: '#EF4444' },
  { name: 'Other', value: 5, color: '#8B5CF6' }
];

export default function OperationsDashboard() {
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [showQueueDetails, setShowQueueDetails] = useState(false);
  const [showCenterDetails, setShowCenterDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtered data
  const filteredQueue = useMemo(() => {
    let filtered = QUEUE_DATA;
    if (selectedQueue !== 'all') {
      filtered = filtered.filter(item => item.status === selectedQueue);
    }
    return filtered;
  }, [selectedQueue]);

  const filteredCenters = useMemo(() => {
    let filtered = CENTER_SCORECARDS;
    if (selectedCenter !== 'all') {
      filtered = filtered.filter(center => center.status === selectedCenter);
    }
    return filtered;
  }, [selectedCenter]);

  // KPI calculations
  const kpiMetrics = useMemo(() => {
    const totalCases = QUEUE_DATA.length;
    const pendingCases = QUEUE_DATA.filter(item => item.status === 'pending').length;
    const urgentCases = QUEUE_DATA.filter(item => item.status === 'urgent').length;
    const avgWaitTime = QUEUE_DATA.reduce((acc, item) => {
      const hours = parseFloat(item.waitTime.split('h')[0]);
      const minutes = parseFloat(item.waitTime.split('h')[1]?.split('m')[0] || 0) / 60;
      return acc + hours + minutes;
    }, 0) / totalCases;
    const avgCenterScore = CENTER_SCORECARDS.reduce((acc, center) => acc + center.score, 0) / CENTER_SCORECARDS.length;

    return {
      totalCases,
      pendingCases,
      urgentCases,
      avgWaitTime: avgWaitTime.toFixed(1),
      avgCenterScore: Math.round(avgCenterScore)
    };
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCenterStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs-attention': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewQueueItem = (item) => {
    setSelectedItem(item);
    setShowQueueDetails(true);
  };

  const handleViewCenter = (center) => {
    setSelectedItem(center);
    setShowCenterDetails(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-600 mt-2">Queue management and center scorecards</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.totalCases}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Cases</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.pendingCases}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Cases</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.urgentCases}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.avgWaitTime}h</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Center Score</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.avgCenterScore}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 border-b">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Operations Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-900">Bottleneck Alert</h4>
              </div>
              <p className="text-sm text-gray-600">Emergency MRI center is operating at 95% capacity with 2.3h average wait time. Consider redistributing cases.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-medium text-gray-900">Optimization Opportunity</h4>
              </div>
              <p className="text-sm text-gray-600">Central Radiology has 22% unused capacity. Recommend routing more cases to improve efficiency.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Performance Excellence</h4>
              </div>
              <p className="text-sm text-gray-600">Downtown MRI and Central Radiology are exceeding performance targets. Consider replicating their processes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Weekly Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="cases" fill="#3B82F6" name="Cases" />
                <Line yAxisId="right" type="monotone" dataKey="waitTime" stroke="#10B981" strokeWidth={2} name="Wait Time (h)" />
                <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#F59E0B" strokeWidth={2} name="Satisfaction" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Management */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Queue Management
              </CardTitle>
              <Select value={selectedQueue} onValueChange={setSelectedQueue}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-gray-600 border-b bg-gray-50">
                  <tr>
                    <th className="py-4 px-4 font-semibold text-left">Patient</th>
                    <th className="py-4 px-4 font-semibold text-left">Priority</th>
                    <th className="py-4 px-4 font-semibold text-left">Wait Time</th>
                    <th className="py-4 px-4 font-semibold text-left">Status</th>
                    <th className="py-4 px-4 font-semibold text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.patient}</div>
                          <div className="text-sm text-gray-500">{item.case}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {item.waitTime}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQueueItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Center Scorecards */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Center Scorecards
              </CardTitle>
              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Centers</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="needs-attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-gray-600 border-b bg-gray-50">
                  <tr>
                    <th className="py-4 px-4 font-semibold text-left">Center</th>
                    <th className="py-4 px-4 font-semibold text-left">Score</th>
                    <th className="py-4 px-4 font-semibold text-left">Cases</th>
                    <th className="py-4 px-4 font-semibold text-left">Status</th>
                    <th className="py-4 px-4 font-semibold text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCenters.map((center) => (
                    <tr key={center.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{center.name}</div>
                          <div className="text-sm text-gray-500">{center.location}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{center.score}</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ width: `${center.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {center.cases}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getCenterStatusColor(center.status)}>
                          {center.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCenter(center)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modality Distribution */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Modality Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MODALITY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MODALITY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {MODALITY_DISTRIBUTION.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Details Modal */}
      <Dialog open={showQueueDetails} onOpenChange={setShowQueueDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Queue Item Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected queue item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Patient Name</Label>
                  <p className="text-gray-900">{selectedItem.patient}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Case Number</Label>
                  <p className="text-gray-900">{selectedItem.case}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Priority</Label>
                  <Badge className={getPriorityColor(selectedItem.priority)}>
                    {selectedItem.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Wait Time</Label>
                  <p className="text-gray-900">{selectedItem.waitTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Center</Label>
                  <p className="text-gray-900">{selectedItem.center}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Modality</Label>
                  <p className="text-gray-900">{selectedItem.modality}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowQueueDetails(false)}>
                  Close
                </Button>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Process Case
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Center Details Modal */}
      <Dialog open={showCenterDetails} onOpenChange={setShowCenterDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Center Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive scorecard and performance metrics
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Center Name</Label>
                  <p className="text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <p className="text-gray-900">{selectedItem.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Performance Score</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{selectedItem.score}</span>
                    <Badge className={getCenterStatusColor(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Total Cases</Label>
                  <p className="text-gray-900">{selectedItem.cases}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Average Wait Time</Label>
                  <p className="text-gray-900">{selectedItem.avgWaitTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Satisfaction Rating</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900">{selectedItem.satisfaction}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Capacity Utilization</Label>
                  <p className="text-gray-900">{selectedItem.capacity}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-gray-900">{new Date(selectedItem.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCenterDetails(false)}>
                  Close
                </Button>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Center
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
