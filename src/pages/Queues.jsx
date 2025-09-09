import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Clock, AlertTriangle, CheckCircle, Users, Activity, TrendingUp, 
  AlertCircle, RefreshCw, Eye, Settings, Filter, Search, 
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Calendar, MapPin, Phone, Mail, Star, Zap, Target, Shield,
  Play, Pause, Square, ArrowRight, ArrowLeft, MoreHorizontal,
  User, FileText, Timer, AlertCircle as AlertIcon, CheckCircle2
} from 'lucide-react';

// Mock data for queues
const QUEUE_ITEMS = [
  { 
    id: 1, 
    patient: 'John Smith', 
    case: 'CASE-2024-001', 
    priority: 'high', 
    waitTime: '2h 15m', 
    status: 'pending', 
    center: 'Downtown MRI', 
    modality: 'MRI Brain',
    patientId: 'PAT-001',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    age: 45,
    gender: 'Male',
    insurance: 'Blue Cross',
    referringPhysician: 'Dr. Sarah Johnson',
    reason: 'Headache and dizziness',
    scheduledTime: '2024-12-15T14:30:00Z',
    estimatedDuration: '45 minutes',
    notes: 'Patient has claustrophobia - may need sedation',
    previousScans: 2,
    allergies: 'None known',
    medications: 'Lisinopril 10mg daily'
  },
  { 
    id: 2, 
    patient: 'Sarah Johnson', 
    case: 'CASE-2024-002', 
    priority: 'medium', 
    waitTime: '45m', 
    status: 'in-progress', 
    center: 'Westside Imaging', 
    modality: 'CT Chest',
    patientId: 'PAT-002',
    phone: '(555) 234-5678',
    email: 'sarah.johnson@email.com',
    age: 38,
    gender: 'Female',
    insurance: 'Aetna',
    referringPhysician: 'Dr. Michael Chen',
    reason: 'Chest pain and shortness of breath',
    scheduledTime: '2024-12-15T15:00:00Z',
    estimatedDuration: '30 minutes',
    notes: 'Contrast allergy - use non-iodinated contrast',
    previousScans: 1,
    allergies: 'Iodine contrast',
    medications: 'Metformin 500mg twice daily'
  },
  { 
    id: 3, 
    patient: 'Mike Davis', 
    case: 'CASE-2024-003', 
    priority: 'low', 
    waitTime: '1h 30m', 
    status: 'pending', 
    center: 'Central Radiology', 
    modality: 'MRI Spine',
    patientId: 'PAT-003',
    phone: '(555) 345-6789',
    email: 'mike.davis@email.com',
    age: 52,
    gender: 'Male',
    insurance: 'Cigna',
    referringPhysician: 'Dr. Lisa Wilson',
    reason: 'Lower back pain',
    scheduledTime: '2024-12-15T16:00:00Z',
    estimatedDuration: '60 minutes',
    notes: 'Patient prefers morning appointments',
    previousScans: 0,
    allergies: 'None known',
    medications: 'Ibuprofen as needed'
  },
  { 
    id: 4, 
    patient: 'Lisa Wilson', 
    case: 'CASE-2024-004', 
    priority: 'high', 
    waitTime: '3h 45m', 
    status: 'urgent', 
    center: 'Emergency MRI', 
    modality: 'MRI Brain',
    patientId: 'PAT-004',
    phone: '(555) 456-7890',
    email: 'lisa.wilson@email.com',
    age: 29,
    gender: 'Female',
    insurance: 'Medicaid',
    referringPhysician: 'Dr. Emergency',
    reason: 'Trauma - possible concussion',
    scheduledTime: '2024-12-15T13:00:00Z',
    estimatedDuration: '45 minutes',
    notes: 'STAT - Trauma case, expedite processing',
    previousScans: 0,
    allergies: 'None known',
    medications: 'None'
  },
  { 
    id: 5, 
    patient: 'Tom Brown', 
    case: 'CASE-2024-005', 
    priority: 'medium', 
    waitTime: '1h 10m', 
    status: 'completed', 
    center: 'Northside Imaging', 
    modality: 'CT Abdomen',
    patientId: 'PAT-005',
    phone: '(555) 567-8901',
    email: 'tom.brown@email.com',
    age: 61,
    gender: 'Male',
    insurance: 'Medicare',
    referringPhysician: 'Dr. Robert Kim',
    reason: 'Abdominal pain and weight loss',
    scheduledTime: '2024-12-15T11:30:00Z',
    estimatedDuration: '30 minutes',
    notes: 'Completed successfully',
    previousScans: 3,
    allergies: 'None known',
    medications: 'Omeprazole 20mg daily'
  },
  { 
    id: 6, 
    patient: 'Emma Garcia', 
    case: 'CASE-2024-006', 
    priority: 'low', 
    waitTime: '2h 20m', 
    status: 'pending', 
    center: 'Downtown MRI', 
    modality: 'MRI Knee',
    patientId: 'PAT-006',
    phone: '(555) 678-9012',
    email: 'emma.garcia@email.com',
    age: 34,
    gender: 'Female',
    insurance: 'UnitedHealth',
    referringPhysician: 'Dr. Jennifer Lee',
    reason: 'Knee injury from sports',
    scheduledTime: '2024-12-15T17:00:00Z',
    estimatedDuration: '40 minutes',
    notes: 'Athlete - needs quick turnaround for treatment',
    previousScans: 1,
    allergies: 'None known',
    medications: 'Naproxen 220mg twice daily'
  }
];

const QUEUE_STATS = [
  { name: 'Mon', pending: 12, inProgress: 8, completed: 15, urgent: 2 },
  { name: 'Tue', pending: 15, inProgress: 6, completed: 18, urgent: 1 },
  { name: 'Wed', pending: 8, inProgress: 10, completed: 12, urgent: 3 },
  { name: 'Thu', pending: 18, inProgress: 7, completed: 20, urgent: 2 },
  { name: 'Fri', pending: 14, inProgress: 9, completed: 16, urgent: 1 },
  { name: 'Sat', pending: 6, inProgress: 4, completed: 8, urgent: 0 },
  { name: 'Sun', pending: 4, inProgress: 3, completed: 6, urgent: 1 }
];

export default function Queues() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState('waitTime');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtered and sorted data
  const filteredAndSortedItems = useMemo(() => {
    let filtered = QUEUE_ITEMS;
    
    // Apply filters
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }
    if (selectedCenter !== 'all') {
      filtered = filtered.filter(item => item.center === selectedCenter);
    }
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.case.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.center.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'waitTime':
          aValue = parseFloat(a.waitTime.split('h')[0]) + (parseFloat(a.waitTime.split('h')[1]?.split('m')[0] || 0) / 60);
          bValue = parseFloat(b.waitTime.split('h')[0]) + (parseFloat(b.waitTime.split('h')[1]?.split('m')[0] || 0) / 60);
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'patient':
          aValue = a.patient;
          bValue = b.patient;
          break;
        case 'center':
          aValue = a.center;
          bValue = b.center;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return filtered;
  }, [selectedStatus, selectedPriority, selectedCenter, searchTerm, sortBy, sortOrder]);

  // KPI calculations
  const kpiMetrics = useMemo(() => {
    const total = QUEUE_ITEMS.length;
    const pending = QUEUE_ITEMS.filter(item => item.status === 'pending').length;
    const inProgress = QUEUE_ITEMS.filter(item => item.status === 'in-progress').length;
    const urgent = QUEUE_ITEMS.filter(item => item.status === 'urgent').length;
    const completed = QUEUE_ITEMS.filter(item => item.status === 'completed').length;
    const avgWaitTime = QUEUE_ITEMS.reduce((acc, item) => {
      const hours = parseFloat(item.waitTime.split('h')[0]);
      const minutes = parseFloat(item.waitTime.split('h')[1]?.split('m')[0] || 0) / 60;
      return acc + hours + minutes;
    }, 0) / total;

    return {
      total,
      pending,
      inProgress,
      urgent,
      completed,
      avgWaitTime: avgWaitTime.toFixed(1)
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

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredAndSortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAndSortedItems.map(item => item.id));
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems);
    setShowBulkActions(false);
    setSelectedItems([]);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage patient queues across all centers</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.total}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.pending}</p>
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.urgent}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wait</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.avgWaitTime}h</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Timer className="h-6 w-6 text-purple-600" />
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
            AI Queue Insights
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
              <p className="text-sm text-gray-600">Lisa Wilson (CASE-2024-004) has been waiting 3h 45m. Consider expediting or reassigning to available center.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-medium text-gray-900">Optimization Opportunity</h4>
              </div>
              <p className="text-sm text-gray-600">Downtown MRI has 2 pending cases. Consider batching similar modalities for efficiency.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Performance Excellence</h4>
              </div>
              <p className="text-sm text-gray-600">Northside Imaging completed Tom Brown's case efficiently. Consider routing more cases there.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Trends Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Weekly Queue Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={QUEUE_STATS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
                <Line type="monotone" dataKey="inProgress" stroke="#3B82F6" strokeWidth={2} name="In Progress" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
                <Line type="monotone" dataKey="urgent" stroke="#EF4444" strokeWidth={2} name="Urgent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Patient, case, center..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
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
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="center">Center</Label>
              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Centers</SelectItem>
                  <SelectItem value="Downtown MRI">Downtown MRI</SelectItem>
                  <SelectItem value="Westside Imaging">Westside Imaging</SelectItem>
                  <SelectItem value="Central Radiology">Central Radiology</SelectItem>
                  <SelectItem value="Emergency MRI">Emergency MRI</SelectItem>
                  <SelectItem value="Northside Imaging">Northside Imaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                  setSelectedCenter('all');
                  setSearchTerm('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Queue Items ({filteredAndSortedItems.length})
            </CardTitle>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(true)}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-gray-600 border-b bg-gray-50">
                <tr>
                  <th className="py-4 px-4 font-semibold text-left w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('patient')}
                  >
                    <div className="flex items-center gap-2">
                      Patient
                      {getSortIcon('patient')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      {getSortIcon('priority')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('waitTime')}
                  >
                    <div className="flex items-center gap-2">
                      Wait Time
                      {getSortIcon('waitTime')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('center')}
                  >
                    <div className="flex items-center gap-2">
                      Center
                      {getSortIcon('center')}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-semibold text-left">Modality</th>
                  <th className="py-4 px-4 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                      />
                    </td>
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
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {item.center}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {item.modality}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Item Details Modal */}
      <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Queue Item Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected queue item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">{selectedItem.patient}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Patient ID</Label>
                      <p className="text-gray-900">{selectedItem.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Age</Label>
                      <p className="text-gray-900">{selectedItem.age} years</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Gender</Label>
                      <p className="text-gray-900">{selectedItem.gender}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{selectedItem.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-gray-900">{selectedItem.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Insurance</Label>
                      <p className="text-gray-900">{selectedItem.insurance}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Allergies</Label>
                      <p className="text-gray-900">{selectedItem.allergies}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Case Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Case Number</Label>
                      <p className="text-gray-900">{selectedItem.case}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Referring Physician</Label>
                      <p className="text-gray-900">{selectedItem.referringPhysician}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Reason for Scan</Label>
                      <p className="text-gray-900">{selectedItem.reason}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Scheduled Time</Label>
                      <p className="text-gray-900">{new Date(selectedItem.scheduledTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Estimated Duration</Label>
                      <p className="text-gray-900">{selectedItem.estimatedDuration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Previous Scans</Label>
                      <p className="text-gray-900">{selectedItem.previousScans}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Current Medications</Label>
                    <p className="text-gray-900">{selectedItem.medications}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Special Notes</Label>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                </div>
              </div>

              {/* Queue Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Queue Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowItemDetails(false)}>
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

      {/* Bulk Actions Modal */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Select an action to perform on {selectedItems.length} selected items
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleBulkAction('mark-pending')}>
              <Clock className="h-4 w-4 mr-2" />
              Mark as Pending
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('mark-in-progress')}>
              <Play className="h-4 w-4 mr-2" />
              Mark as In Progress
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('mark-urgent')}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark as Urgent
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('mark-completed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('reassign')}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Reassign Center
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('export')}>
              <FileText className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
