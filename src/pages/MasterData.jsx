import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  RefreshCw,
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

const MasterData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for demonstration
  const masterDataCategories = [
    {
      id: 'users',
      name: 'Users & Roles',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      count: 156,
      lastUpdated: '2 hours ago',
      status: 'active',
      items: [
        { id: 1, name: 'Admin Users', count: 12, status: 'active' },
        { id: 2, name: 'Referrer Users', count: 89, status: 'active' },
        { id: 3, name: 'Imaging Center Users', count: 34, status: 'active' },
        { id: 4, name: 'Attorney Users', count: 15, status: 'active' },
        { id: 5, name: 'Funder Users', count: 6, status: 'active' }
      ]
    },
    {
      id: 'centers',
      name: 'Imaging Centers',
      description: 'Manage imaging center profiles and capabilities',
      icon: Building2,
      count: 47,
      lastUpdated: '1 day ago',
      status: 'active',
      items: [
        { id: 1, name: 'Active Centers', count: 42, status: 'active' },
        { id: 2, name: 'Pending Approval', count: 3, status: 'pending' },
        { id: 3, name: 'Suspended Centers', count: 2, status: 'suspended' }
      ]
    },
    {
      id: 'modalities',
      name: 'Modalities & Body Parts',
      description: 'Configure available imaging modalities and body parts',
      icon: Settings,
      count: 28,
      lastUpdated: '3 days ago',
      status: 'active',
      items: [
        { id: 1, name: 'MRI Modalities', count: 8, status: 'active' },
        { id: 2, name: 'CT Modalities', count: 6, status: 'active' },
        { id: 3, name: 'X-Ray Modalities', count: 4, status: 'active' },
        { id: 4, name: 'Body Parts', count: 10, status: 'active' }
      ]
    },
    {
      id: 'insurance',
      name: 'Insurance Providers',
      description: 'Manage insurance provider information and coverage',
      icon: Shield,
      count: 23,
      lastUpdated: '1 week ago',
      status: 'active',
      items: [
        { id: 1, name: 'Major Insurers', count: 15, status: 'active' },
        { id: 2, name: 'Regional Insurers', count: 6, status: 'active' },
        { id: 3, name: 'Government Programs', count: 2, status: 'active' }
      ]
    },
    {
      id: 'safety',
      name: 'Safety Questions',
      description: 'Configure safety screening questions and protocols',
      icon: AlertCircle,
      count: 45,
      lastUpdated: '5 days ago',
      status: 'active',
      items: [
        { id: 1, name: 'MRI Safety Questions', count: 25, status: 'active' },
        { id: 2, name: 'CT Safety Questions', count: 12, status: 'active' },
        { id: 3, name: 'General Safety Questions', count: 8, status: 'active' }
      ]
    },
    {
      id: 'system',
      name: 'System Configuration',
      description: 'System-wide settings and configuration parameters',
      icon: Database,
      count: 12,
      lastUpdated: '2 weeks ago',
      status: 'active',
      items: [
        { id: 1, name: 'API Endpoints', count: 8, status: 'active' },
        { id: 2, name: 'Notification Templates', count: 4, status: 'active' }
      ]
    }
  ];

  const filteredCategories = masterDataCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Master Data</h1>
          <p className="text-muted-foreground">Manage system-wide data and configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search master data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option value="all">All Categories</option>
            {masterDataCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">
                  {masterDataCategories.reduce((sum, cat) => sum + cat.count, 0)}
                </p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {masterDataCategories.filter(cat => cat.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Updates</p>
                <p className="text-2xl font-bold text-foreground">
                  {masterDataCategories.filter(cat => cat.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm font-bold text-foreground">2 hours ago</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Data Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-card-foreground">{category.name}</CardTitle>
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(category.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(category.status)}
                    {category.status}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-semibold text-foreground">{category.count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">{category.lastUpdated}</span>
              </div>
              
              {/* Sub-items */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Sub-categories:</p>
                <div className="space-y-1">
                  {category.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">{item.count}</span>
                    </div>
                  ))}
                  {category.items.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{category.items.length - 3} more...
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest changes to master data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Updated', item: 'User Roles', user: 'Admin User', time: '2 hours ago', type: 'update' },
              { action: 'Added', item: 'New Imaging Center', user: 'System Admin', time: '1 day ago', type: 'add' },
              { action: 'Modified', item: 'Safety Questions', user: 'Admin User', time: '3 days ago', type: 'modify' },
              { action: 'Exported', item: 'Insurance Providers', user: 'Admin User', time: '1 week ago', type: 'export' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'add' ? 'bg-green-100 text-green-600' :
                    activity.type === 'update' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'modify' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'add' ? <Plus className="h-3 w-3" /> :
                     activity.type === 'update' ? <RefreshCw className="h-3 w-3" /> :
                     activity.type === 'modify' ? <Edit className="h-3 w-3" /> :
                     <Download className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.action} {activity.item}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.user}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterData;
