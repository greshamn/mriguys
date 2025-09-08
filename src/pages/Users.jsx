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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Users, UserPlus, Shield, Settings, Search, Filter, RefreshCw, Eye, Edit, Trash2, 
  MoreHorizontal, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, AlertCircle,
  UserCheck, UserX, Crown, Zap, Target, Shield as ShieldIcon, Activity, TrendingUp,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Clock, Star, Download
} from 'lucide-react';

// Mock data for users
const USERS_DATA = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    role: 'referrer',
    status: 'active',
    lastLogin: '2024-12-15T10:30:00Z',
    joinDate: '2024-01-15T00:00:00Z',
    phone: '(555) 123-4567',
    organization: 'City General Hospital',
    department: 'Radiology',
    location: 'New York, NY',
    permissions: ['view_patients', 'create_referrals', 'view_reports'],
    totalReferrals: 156,
    activeCases: 23,
    completionRate: 94.2
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@imaging.com',
    role: 'imaging-center',
    status: 'active',
    lastLogin: '2024-12-15T09:45:00Z',
    joinDate: '2024-02-20T00:00:00Z',
    phone: '(555) 234-5678',
    organization: 'Downtown MRI Center',
    department: 'Operations',
    location: 'Los Angeles, CA',
    permissions: ['view_worklist', 'manage_slots', 'view_billing'],
    totalReferrals: 89,
    activeCases: 12,
    completionRate: 97.8
  },
  {
    id: 3,
    name: 'Lisa Wilson',
    email: 'lisa.wilson@patient.com',
    role: 'patient',
    status: 'active',
    lastLogin: '2024-12-14T16:20:00Z',
    joinDate: '2024-03-10T00:00:00Z',
    phone: '(555) 345-6789',
    organization: 'N/A',
    department: 'N/A',
    location: 'Chicago, IL',
    permissions: ['view_appointments', 'view_results', 'book_scans'],
    totalReferrals: 0,
    activeCases: 2,
    completionRate: 100
  },
  {
    id: 4,
    name: 'Robert Kim',
    email: 'robert.kim@lawfirm.com',
    role: 'attorney',
    status: 'active',
    lastLogin: '2024-12-15T08:15:00Z',
    joinDate: '2024-01-05T00:00:00Z',
    phone: '(555) 456-7890',
    organization: 'Kim & Associates Law Firm',
    department: 'Personal Injury',
    location: 'Miami, FL',
    permissions: ['view_cases', 'manage_liens', 'view_clients'],
    totalReferrals: 0,
    activeCases: 45,
    completionRate: 88.5
  },
  {
    id: 5,
    name: 'Jennifer Lee',
    email: 'jennifer.lee@funding.com',
    role: 'funder',
    status: 'active',
    lastLogin: '2024-12-15T11:30:00Z',
    joinDate: '2024-02-01T00:00:00Z',
    phone: '(555) 567-8901',
    organization: 'MedFunding Solutions',
    department: 'Underwriting',
    location: 'Dallas, TX',
    permissions: ['view_pipeline', 'approve_funding', 'view_reports'],
    totalReferrals: 0,
    activeCases: 78,
    completionRate: 92.1
  },
  {
    id: 6,
    name: 'David Martinez',
    email: 'david.martinez@ops.com',
    role: 'ops',
    status: 'active',
    lastLogin: '2024-12-15T12:00:00Z',
    joinDate: '2024-01-20T00:00:00Z',
    phone: '(555) 678-9012',
    organization: 'MRIGuys Operations',
    department: 'Operations',
    location: 'Phoenix, AZ',
    permissions: ['manage_queues', 'view_dashboards', 'manage_centers'],
    totalReferrals: 0,
    activeCases: 0,
    completionRate: 100
  },
  {
    id: 7,
    name: 'Admin User',
    email: 'admin@mriguys.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-12-15T13:45:00Z',
    joinDate: '2023-12-01T00:00:00Z',
    phone: '(555) 789-0123',
    organization: 'MRIGuys',
    department: 'Administration',
    location: 'San Francisco, CA',
    permissions: ['all_permissions'],
    totalReferrals: 0,
    activeCases: 0,
    completionRate: 100
  },
  {
    id: 8,
    name: 'Dr. Michael Brown',
    email: 'michael.brown@clinic.com',
    role: 'referrer',
    status: 'inactive',
    lastLogin: '2024-11-20T14:30:00Z',
    joinDate: '2024-04-15T00:00:00Z',
    phone: '(555) 890-1234',
    organization: 'Community Health Clinic',
    department: 'Internal Medicine',
    location: 'Seattle, WA',
    permissions: ['view_patients', 'create_referrals'],
    totalReferrals: 67,
    activeCases: 8,
    completionRate: 89.3
  }
];

const ROLES_DATA = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access and management capabilities',
    userCount: 1,
    permissions: ['all_permissions'],
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'ops',
    name: 'Operations',
    description: 'Queue management and center oversight',
    userCount: 1,
    permissions: ['manage_queues', 'view_dashboards', 'manage_centers'],
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'referrer',
    name: 'Referrer',
    description: 'Healthcare providers who refer patients',
    userCount: 2,
    permissions: ['view_patients', 'create_referrals', 'view_reports'],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'imaging-center',
    name: 'Imaging Center',
    description: 'Imaging facilities and technicians',
    userCount: 1,
    permissions: ['view_worklist', 'manage_slots', 'view_billing'],
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'attorney',
    name: 'Attorney',
    description: 'Legal professionals handling cases',
    userCount: 1,
    permissions: ['view_cases', 'manage_liens', 'view_clients'],
    color: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'funder',
    name: 'Funder',
    description: 'Funding organizations and underwriters',
    userCount: 1,
    permissions: ['view_pipeline', 'approve_funding', 'view_reports'],
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'patient',
    name: 'Patient',
    description: 'End users accessing their medical information',
    userCount: 1,
    permissions: ['view_appointments', 'view_results', 'book_scans'],
    color: 'bg-gray-100 text-gray-800'
  }
];

const USER_ACTIVITY_DATA = [
  { name: 'Mon', logins: 45, newUsers: 2, activeUsers: 38 },
  { name: 'Tue', logins: 52, newUsers: 3, activeUsers: 42 },
  { name: 'Wed', logins: 48, newUsers: 1, activeUsers: 40 },
  { name: 'Thu', logins: 61, newUsers: 4, activeUsers: 45 },
  { name: 'Fri', logins: 58, newUsers: 2, activeUsers: 43 },
  { name: 'Sat', logins: 32, newUsers: 1, activeUsers: 28 },
  { name: 'Sun', logins: 28, newUsers: 0, activeUsers: 25 }
];

const ROLE_DISTRIBUTION = [
  { name: 'Referrer', value: 2, color: '#3B82F6' },
  { name: 'Imaging Center', value: 1, color: '#10B981' },
  { name: 'Attorney', value: 1, color: '#F59E0B' },
  { name: 'Funder', value: 1, color: '#8B5CF6' },
  { name: 'Operations', value: 1, color: '#EF4444' },
  { name: 'Patient', value: 1, color: '#6B7280' },
  { name: 'Admin', value: 1, color: '#DC2626' }
];

export default function UsersPage() {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserStep, setAddUserStep] = useState(1);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    organization: '',
    department: '',
    location: '',
    status: 'active',
    permissions: []
  });

  // Filtered data
  const filteredUsers = useMemo(() => {
    let filtered = USERS_DATA;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedRole, selectedStatus, searchTerm]);

  // KPI calculations
  const kpiMetrics = useMemo(() => {
    const totalUsers = USERS_DATA.length;
    const activeUsers = USERS_DATA.filter(user => user.status === 'active').length;
    const inactiveUsers = USERS_DATA.filter(user => user.status === 'inactive').length;
    const totalRoles = ROLES_DATA.length;
    const avgCompletionRate = USERS_DATA.reduce((acc, user) => acc + user.completionRate, 0) / totalUsers;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      avgCompletionRate: avgCompletionRate.toFixed(1)
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'ops': return Settings;
      case 'referrer': return Users;
      case 'imaging-center': return Shield;
      case 'attorney': return ShieldIcon;
      case 'funder': return TrendingUp;
      case 'patient': return UserCheck;
      default: return Users;
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleViewUser = (user) => {
    setSelectedItem(user);
    setShowUserDetails(true);
  };

  const handleViewRole = (role) => {
    setSelectedItem(role);
    setShowRoleDetails(true);
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on users:`, selectedUsers);
    setShowBulkActions(false);
    setSelectedUsers([]);
  };

  const handleEditRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setIsEditingRole(true);
  };

  const handleSaveRole = () => {
    if (editingUser && newRole) {
      // In a real app, this would update the user's role in the database
      console.log(`Changing role for ${editingUser.name} from ${editingUser.role} to ${newRole}`);
      // Update the selectedItem if it's the same user
      if (selectedItem && selectedItem.id === editingUser.id) {
        setSelectedItem({ ...selectedItem, role: newRole });
      }
    }
    setIsEditingRole(false);
    setEditingUser(null);
    setNewRole('');
  };

  const handleCancelEditRole = () => {
    setIsEditingRole(false);
    setEditingUser(null);
    setNewRole('');
  };

  const handleAddUser = () => {
    setShowAddUser(true);
    setAddUserStep(1);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: '',
      organization: '',
      department: '',
      location: '',
      status: 'active',
      permissions: []
    });
  };

  const handleNextStep = () => {
    if (addUserStep < 3) {
      setAddUserStep(addUserStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (addUserStep > 1) {
      setAddUserStep(addUserStep - 1);
    }
  };

  const handleSaveUser = () => {
    // In a real app, this would save the user to the database
    console.log('Saving new user:', newUser);
    // Add the new user to the mock data (for demo purposes)
    const newUserWithId = {
      ...newUser,
      id: USERS_DATA.length + 1,
      patientId: `PAT-${String(USERS_DATA.length + 1).padStart(3, '0')}`,
      lastLogin: new Date().toISOString(),
      joinDate: new Date().toISOString(),
      totalReferrals: 0,
      activeCases: 0,
      completionRate: 100,
      allergies: 'None known',
      medications: 'None'
    };
    
    // Reset form and close modal
    setShowAddUser(false);
    setAddUserStep(1);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: '',
      organization: '',
      department: '',
      location: '',
      status: 'active',
      permissions: []
    });
  };

  const handleCancelAddUser = () => {
    setShowAddUser(false);
    setAddUserStep(1);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: '',
      organization: '',
      department: '',
      location: '',
      status: 'active',
      permissions: []
    });
  };

  const updateNewUser = (field, value) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const getRolePermissions = (roleId) => {
    const role = ROLES_DATA.find(r => r.id === roleId);
    return role ? role.permissions : [];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and role permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.activeUsers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.inactiveUsers}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <UserX className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.totalRoles}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.avgCompletionRate}%</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Star className="h-6 w-6 text-amber-600" />
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
            AI User Management Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-900">Inactive User Alert</h4>
              </div>
              <p className="text-sm text-gray-600">Dr. Michael Brown hasn't logged in for 25 days. Consider reaching out or deactivating the account.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-medium text-gray-900">Role Optimization</h4>
              </div>
              <p className="text-sm text-gray-600">Referrer role has the highest activity. Consider creating specialized sub-roles for different specialties.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Security Excellence</h4>
              </div>
              <p className="text-sm text-gray-600">All active users have appropriate permissions. No security vulnerabilities detected.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Weekly User Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USER_ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={2} name="Daily Logins" />
                <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} name="New Users" />
                <Line type="monotone" dataKey="activeUsers" stroke="#F59E0B" strokeWidth={2} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Users and Roles */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles ({ROLES_DATA.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Name, email, organization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {ROLES_DATA.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRole('all');
                      setSelectedStatus('all');
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

          {/* Users Table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({filteredUsers.length})
                </CardTitle>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
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
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="py-4 px-4 font-semibold text-left">User</th>
                      <th className="py-4 px-4 font-semibold text-left">Role</th>
                      <th className="py-4 px-4 font-semibold text-left">Status</th>
                      <th className="py-4 px-4 font-semibold text-left">Organization</th>
                      <th className="py-4 px-4 font-semibold text-left">Last Login</th>
                      <th className="py-4 px-4 font-semibold text-left">Completion Rate</th>
                      <th className="py-4 px-4 font-semibold text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {user.organization}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900">{user.completionRate}%</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-green-500 rounded-full" 
                                  style={{ width: `${user.completionRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(user)}
                                title="Change Role"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="More Actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES_DATA.map((role) => {
              const RoleIcon = getRoleIcon(role.id);
              return (
                <Card key={role.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewRole(role)}>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <RoleIcon className="h-5 w-5" />
                      {role.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={role.color}>
                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Role Distribution Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ROLE_DISTRIBUTION}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {ROLE_DISTRIBUTION.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.value} user{item.value !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">{selectedItem.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-gray-900">{selectedItem.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{selectedItem.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Location</Label>
                      <p className="text-gray-900">{selectedItem.location}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Organization</Label>
                      <p className="text-gray-900">{selectedItem.organization}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Department</Label>
                      <p className="text-gray-900">{selectedItem.department}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Role</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {React.createElement(getRoleIcon(selectedItem.role), { className: "h-4 w-4 text-gray-500" })}
                        <span className="text-gray-900 capitalize">{selectedItem.role}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(selectedItem)}
                          className="ml-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge className={getStatusColor(selectedItem.status)}>
                        {selectedItem.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                      <p className="text-gray-900">{new Date(selectedItem.lastLogin).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Join Date</Label>
                      <p className="text-gray-900">{new Date(selectedItem.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Completion Rate</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-900">{selectedItem.completionRate}%</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${selectedItem.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Total Referrals</Label>
                    <p className="text-gray-900">{selectedItem.totalReferrals}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Active Cases</Label>
                    <p className="text-gray-900">{selectedItem.activeCases}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Permissions</Label>
                    <p className="text-gray-900">{selectedItem.permissions.length} assigned</p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedItem.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900">{permission.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Details Modal */}
      <Dialog open={showRoleDetails} onOpenChange={setShowRoleDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Details
            </DialogTitle>
            <DialogDescription>
              Information about the selected role and its permissions
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Role Name</Label>
                  <p className="text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">User Count</Label>
                  <p className="text-gray-900">{selectedItem.userCount} user{selectedItem.userCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedItem.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900">{permission.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowRoleDetails(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Role
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
              Select an action to perform on {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleBulkAction('activate')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate Users
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('deactivate')}>
              <UserX className="h-4 w-4 mr-2" />
              Deactivate Users
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('change-role')}>
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('reset-password')}>
              <Settings className="h-4 w-4 mr-2" />
              Reset Passwords
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Users
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Modal */}
      <Dialog open={isEditingRole} onOpenChange={setIsEditingRole}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assign Role
            </DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-select">Select New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_DATA.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          {React.createElement(getRoleIcon(role.id), { className: "h-4 w-4" })}
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Role Information</h4>
                {newRole && ROLES_DATA.find(r => r.id === newRole) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {ROLES_DATA.find(r => r.id === newRole)?.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Permissions: {ROLES_DATA.find(r => r.id === newRole)?.permissions.length} assigned
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelEditRole}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveRole}
                  disabled={!newRole || newRole === editingUser.role}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Wizard Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Step {addUserStep} of 3: {addUserStep === 1 ? 'Basic Information' : addUserStep === 2 ? 'Role & Organization' : 'Review & Create'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= addUserStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step < addUserStep ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Information */}
            {addUserStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => updateNewUser('name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => updateNewUser('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => updateNewUser('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newUser.location}
                      onChange={(e) => updateNewUser('location', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Role & Organization */}
            {addUserStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Role & Organization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select value={newUser.role} onValueChange={(value) => {
                      updateNewUser('role', value);
                      updateNewUser('permissions', getRolePermissions(value));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES_DATA.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              {React.createElement(getRoleIcon(role.id), { className: "h-4 w-4" })}
                              {role.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newUser.status} onValueChange={(value) => updateNewUser('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={newUser.organization}
                      onChange={(e) => updateNewUser('organization', e.target.value)}
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => updateNewUser('department', e.target.value)}
                      placeholder="Enter department name"
                    />
                  </div>
                </div>

                {/* Role Information */}
                {newUser.role && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Role Information</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {ROLES_DATA.find(r => r.id === newUser.role)?.description}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {getRolePermissions(newUser.role).map((permission, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {permission.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Create */}
            {addUserStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">{newUser.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-gray-900">{newUser.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{newUser.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Location</Label>
                      <p className="text-gray-900">{newUser.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Role</Label>
                      <div className="flex items-center gap-2">
                        {newUser.role && React.createElement(getRoleIcon(newUser.role), { className: "h-4 w-4 text-gray-500" })}
                        <span className="text-gray-900 capitalize">{newUser.role || 'Not specified'}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge className={getStatusColor(newUser.status)}>
                        {newUser.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Organization</Label>
                      <p className="text-gray-900">{newUser.organization || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Department</Label>
                      <p className="text-gray-900">{newUser.department || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                {addUserStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCancelAddUser}>
                  Cancel
                </Button>
                {addUserStep < 3 ? (
                  <Button 
                    onClick={handleNextStep}
                    disabled={addUserStep === 1 && (!newUser.name || !newUser.email)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSaveUser}
                    disabled={!newUser.name || !newUser.email || !newUser.role}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
