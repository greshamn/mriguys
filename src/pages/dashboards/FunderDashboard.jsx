import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { getNow } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  Award,
  Shield,
  Heart,
  Users,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Building2,
  Scale,
  Briefcase,
  TrendingDown,
  Percent,
  Timer,
  Wallet,
  Banknote,
  CreditCard,
  Receipt,
  Calculator,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';

// Import chart components
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';

// Mock AI Service for demo
const MockAIService = {
  getTopApprovals: (cases) => {
    return cases
      .filter(c => c.status === 'pending' && c.requirementsSatisfied)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3);
  },
  
  calculateAIScore: (caseData) => {
    let score = 50; // Base score
    
    // Injury severity bonus
    if (caseData.injurySeverity === 'high') score += 20;
    else if (caseData.injurySeverity === 'medium') score += 10;
    
    // Documentation completeness
    if (caseData.documentationComplete) score += 15;
    
    // Case age (newer is better)
    const daysSinceAccident = (new Date() - new Date(caseData.accidentDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceAccident < 30) score += 10;
    else if (daysSinceAccident < 90) score += 5;
    
    // Amount reasonableness
    if (caseData.amount > 10000 && caseData.amount < 50000) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }
};

export const FunderDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [timeRange, setTimeRange] = useState('30');

  // Store hooks
  const liens = useStore((s) => s.liens);
  const fetchLiens = useStore((s) => s.fetchLiens);
  const patients = useStore((s) => s.patients);
  const fetchPatients = useStore((s) => s.fetchPatients);
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);
  const reports = useStore((s) => s.reports);
  const fetchReports = useStore((s) => s.fetchReports);
  const bills = useStore((s) => s.bills);
  const fetchBills = useStore((s) => s.fetchBills);
  const centers = useStore((s) => s.centers);
  const fetchCenters = useStore((s) => s.fetchCenters);

  // Enhanced cases data with AI scoring
  const enhancedCases = useMemo(() => {
    const currentLiens = liens || [];
    
    return currentLiens.map(lien => ({
      ...lien,
      aiScore: MockAIService.calculateAIScore(lien),
      requirementsSatisfied: Math.random() > 0.3, // 70% have complete requirements
      injurySeverity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      documentationComplete: Math.random() > 0.2, // 80% have complete docs
      expectedROI: Math.random() * 0.3 + 0.1, // 10-40% ROI
      decisionTime: Math.floor(Math.random() * 5) + 1, // 1-5 days
    }));
  }, [liens]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchLiens().catch(() => {}),
          fetchPatients().catch(() => {}),
          fetchAppointments().catch(() => {}),
          fetchReports().catch(() => {}),
          fetchBills().catch(() => {}),
          fetchCenters().catch(() => {})
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchLiens, fetchPatients, fetchAppointments, fetchReports, fetchBills, fetchCenters]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const total = enhancedCases.length;
    const pending = enhancedCases.filter(c => c.status === 'pending').length;
    const approved = enhancedCases.filter(c => c.status === 'approved').length;
    const active = enhancedCases.filter(c => c.status === 'active').length;
    
    const totalExposure = enhancedCases.reduce((sum, c) => sum + (c.amount || 0), 0);
    const pendingExposure = enhancedCases.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);
    const approvedExposure = enhancedCases.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.amount || 0), 0);
    
    const avgDecisionTime = enhancedCases.reduce((sum, c) => sum + c.decisionTime, 0) / total;
    const avgROI = enhancedCases.reduce((sum, c) => sum + c.expectedROI, 0) / total;
    
    const readyForApproval = enhancedCases.filter(c => c.status === 'pending' && c.requirementsSatisfied).length;
    const highPriority = enhancedCases.filter(c => c.aiScore > 80).length;
    
    return {
      total,
      pending,
      approved,
      active,
      totalExposure,
      pendingExposure,
      approvedExposure,
      avgDecisionTime,
      avgROI,
      readyForApproval,
      highPriority
    };
  }, [enhancedCases]);

  // Generate exposure over time chart data
  const exposureChartData = useMemo(() => {
    const days = parseInt(timeRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate exposure growth over time
      const baseExposure = 1000000;
      const growth = (days - i) * 50000;
      const variation = Math.random() * 100000 - 50000;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        exposure: baseExposure + growth + variation,
        approved: (baseExposure + growth + variation) * 0.3,
        pending: (baseExposure + growth + variation) * 0.7,
      });
    }
    
    return data;
  }, [timeRange]);

  // Generate approval funnel data
  const approvalFunnelData = useMemo(() => {
    return [
      { stage: 'Submitted', count: kpiMetrics.total, color: '#4F46E5' },
      { stage: 'Under Review', count: kpiMetrics.pending, color: '#F59E0B' },
      { stage: 'Approved', count: kpiMetrics.approved, color: '#059669' },
      { stage: 'Active', count: kpiMetrics.active, color: '#7C3AED' },
    ];
  }, [kpiMetrics]);

  // Filtered cases for table
  const filteredCases = useMemo(() => {
    return enhancedCases.filter(caseItem => {
      if (statusFilter !== 'all' && caseItem.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && caseItem.aiScore < (priorityFilter === 'high' ? 80 : priorityFilter === 'medium' ? 60 : 0)) return false;
      
      if (search) {
        const searchLower = search.toLowerCase();
        const patientName = patients?.find(p => p.id === caseItem.patientId)?.name || '';
        return patientName.toLowerCase().includes(searchLower) || 
               caseItem.caseNumber?.toLowerCase().includes(searchLower);
      }
      
      return true;
    }).sort((a, b) => b.aiScore - a.aiScore);
  }, [enhancedCases, patients, search, statusFilter, priorityFilter]);

  // AI recommendations
  const aiRecommendations = useMemo(() => {
    return MockAIService.getTopApprovals(enhancedCases);
  }, [enhancedCases]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAIScoreBadge = (score) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">High</Badge>;
    if (score >= 60) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Low</Badge>;
  };

  const getPatientName = (patientId) => {
    const currentPatients = patients || [];
    const patient = currentPatients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  const handleCaseAction = (action, caseData) => {
    console.log(`Action: ${action} for case:`, caseData.caseNumber);
    
    switch (action) {
      case 'view':
        setSelectedCase(caseData);
        setShowCaseDetails(true);
        break;
      case 'approve':
        setSelectedCase(caseData);
        setShowApprovalModal(true);
        break;
      case 'reject':
        alert(`Reject case ${caseData.caseNumber} - This would reject the funding request`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funder Dashboard</h1>
          <p className="text-muted-foreground">Funding applications and approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Review Applications
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Exposure
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Exposure */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiMetrics.totalExposure.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.pending}</div>
            <p className="text-xs text-muted-foreground">
              ${kpiMetrics.pendingExposure.toLocaleString()} exposure
            </p>
          </CardContent>
        </Card>

        {/* Avg Decision Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Decision Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.avgDecisionTime.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        {/* Expected ROI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(kpiMetrics.avgROI * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> vs target
            </p>
          </CardContent>
        </Card>

        {/* Ready for Approval */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Approval</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiMetrics.readyForApproval}</div>
            <p className="text-xs text-muted-foreground">
              Complete requirements
            </p>
          </CardContent>
        </Card>

        {/* High Priority */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpiMetrics.highPriority}</div>
            <p className="text-xs text-muted-foreground">
              AI Score {'>'} 80
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exposure Over Time */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Exposure Over Time</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total exposure and approved amounts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={timeRange === '7' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('7')}
                >
                  7D
                </Button>
                <Button
                  variant={timeRange === '30' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('30')}
                >
                  30D
                </Button>
                <Button
                  variant={timeRange === '90' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('90')}
                >
                  90D
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={exposureChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <defs>
                  <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="exposure"
                  stackId="1"
                  stroke="#1E40AF"
                  strokeWidth={2}
                  fill="url(#exposureGradient)"
                  name="Total Exposure"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stackId="2"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#approvedGradient)"
                  name="Approved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Approval Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approval Funnel</CardTitle>
            <p className="text-sm text-muted-foreground">
              Case progression through approval stages
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={approvalFunnelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="stage" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {approvalFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Funnel Summary */}
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
              {approvalFunnelData.map((stage) => (
                <div key={stage.stage} className="text-center">
                  <div className="text-lg font-bold" style={{ color: stage.color }}>
                    {stage.count}
                  </div>
                  <div className="text-xs text-muted-foreground">{stage.stage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle className="text-gray-900">Case Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search cases, patients..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="text-gray-900">Case Queue ({filteredCases.length})</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-4 w-4" />
                  {kpiMetrics.pending} pending • {kpiMetrics.readyForApproval} ready • {kpiMetrics.highPriority} high-priority
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-gray-600 border-b bg-gray-50">
                    <TableHead className="py-4 px-4 font-semibold">Case Number</TableHead>
                    <TableHead className="py-4 px-4 font-semibold">Patient</TableHead>
                    <TableHead className="py-4 px-4 font-semibold">Amount</TableHead>
                    <TableHead className="py-4 px-4 font-semibold">Status</TableHead>
                    <TableHead className="py-4 px-4 font-semibold">AI Score</TableHead>
                    <TableHead className="py-4 px-4 font-semibold">Requirements</TableHead>
                    <TableHead className="py-4 px-4 text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium">{caseItem.caseNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(caseItem.accidentDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getPatientName(caseItem.patientId)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${caseItem.amount?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          ROI: {(caseItem.expectedROI * 100).toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(caseItem.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAIScoreBadge(caseItem.aiScore)}
                          <span className="text-sm font-medium">{caseItem.aiScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {caseItem.requirementsSatisfied ? (
                          <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Incomplete
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCaseAction('view', caseItem)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {caseItem.status === 'pending' && caseItem.requirementsSatisfied && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleCaseAction('approve', caseItem)}
                              title="Approve Case"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {caseItem.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleCaseAction('reject', caseItem)}
                              title="Reject Case"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-8 w-8 text-gray-400" />
                          <div className="font-medium">No cases found</div>
                          <div className="text-sm">Try adjusting your filters</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            {/* Purple gradient header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <div className="font-semibold text-lg">AI Insights</div>
              </div>
              <div className="text-sm opacity-90 mt-1">Funding optimization recommendations</div>
            </div>
            
            {/* White content section */}
            <CardContent className="p-4 bg-white space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                <Target className="h-5 w-5 mt-0.5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">Top 3 to Approve Today</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Based on AI scoring algorithm considering injury severity, documentation completeness, and case strength.
                  </div>
                </div>
              </div>
              
              {aiRecommendations.map((rec, index) => (
                <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{rec.caseNumber}</div>
                    <div className="text-xs text-gray-600">
                      ${rec.amount?.toLocaleString()} • Score: {rec.aiScore}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCaseAction('approve', rec)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">Risk Assessment</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {kpiMetrics.highPriority} high-priority cases require immediate attention. Consider expedited processing.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                <TrendingUp className="h-5 w-5 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">ROI Optimization</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Expected ROI of {(kpiMetrics.avgROI * 100).toFixed(1)}% exceeds target. Focus on high-scoring cases for maximum returns.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Case Details Modal */}
      <Dialog open={showCaseDetails} onOpenChange={setShowCaseDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Case Details: {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Comprehensive case information and funding analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-6">
              {/* Case Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Case Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Case Number</Label>
                        <div className="font-medium">{selectedCase.caseNumber}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div>{getStatusBadge(selectedCase.status)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">AI Score</Label>
                        <div className="flex items-center gap-2">
                          {getAIScoreBadge(selectedCase.aiScore)}
                          <span className="font-medium">{selectedCase.aiScore}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Accident Date</Label>
                        <div>{new Date(selectedCase.accidentDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Accident Type</Label>
                        <div className="font-medium">{selectedCase.accidentType}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Injury Severity</Label>
                        <div className="font-medium capitalize">{selectedCase.injurySeverity}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Requested Amount</Label>
                        <div className="text-xl font-bold text-green-600">${selectedCase.amount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Expected ROI</Label>
                        <div className="text-xl font-bold">{(selectedCase.expectedROI * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Decision Time</Label>
                        <div className="text-lg">{selectedCase.decisionTime} days</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
                        <div>
                          {selectedCase.requirementsSatisfied ? (
                            <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Incomplete
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCaseDetails(false)}>
                  Close
                </Button>
                {selectedCase.status === 'pending' && selectedCase.requirementsSatisfied && (
                  <Button onClick={() => handleCaseAction('approve', selectedCase)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Case
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approve Funding: {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Review case details and approve funding request
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-6">
              {/* Case Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
                      <div className="font-medium">{getPatientName(selectedCase.patientId)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Accident Type</Label>
                      <div>{selectedCase.accidentType}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Requested Amount</Label>
                      <div className="text-xl font-bold text-green-600">${selectedCase.amount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">AI Score</Label>
                      <div className="flex items-center gap-2">
                        {getAIScoreBadge(selectedCase.aiScore)}
                        <span className="font-medium">{selectedCase.aiScore}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approval Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div>
                        <div className="font-medium">Full Approval</div>
                        <div className="text-sm text-muted-foreground">Approve for the full requested amount</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${selectedCase.amount?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">100% of request</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div>
                        <div className="font-medium">Recommended Approval</div>
                        <div className="text-sm text-muted-foreground">Based on AI analysis and case strength</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">${Math.round((selectedCase.amount || 0) * 0.9).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">90% of request</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Conservative Approval</div>
                        <div className="text-sm text-muted-foreground">Lower risk with reduced amount</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-600">${Math.round((selectedCase.amount || 0) * 0.75).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">75% of request</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Notes */}
              <div className="space-y-2">
                <Label htmlFor="approval-notes">Approval Notes</Label>
                <textarea
                  id="approval-notes"
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  placeholder="Add notes about the approval decision..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Funding
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
