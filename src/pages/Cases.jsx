import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { getNow } from '../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Users,
  DollarSign,
  Target,
  AlertCircle,
  UserX,
  FileX,
  Scale,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  Briefcase,
  TrendingUp,
  CalendarDays,
  Building2,
  Car,
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Share2,
  Archive,
  Trash2,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  Award,
  Shield,
  Heart,

} from 'lucide-react';

// Main Cases Component
export default function Cases() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

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

  // Pivot date: use current demo date; if no nearby data, pivot to nearest lien day
  const pivotNow = useMemo(() => {
    const now = getNow();
    console.log('🔍 Cases: Current date from getNow():', now.toISOString());
    if (!liens || !liens.length) return now;
    // Find nearest lien within ±14 days
    let nearest = null;
    let bestDelta = Infinity;
    liens.forEach((l) => {
      const t = new Date(l.createdAt || l.lienDate);
      const delta = Math.abs(t.getTime() - now.getTime());
      if (delta < bestDelta) { bestDelta = delta; nearest = t; }
    });
    if (!nearest) return now;
    const days = Math.abs((nearest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const result = days <= 14 ? nearest : now;
    console.log('🔍 Cases: Pivot date set to:', result.toISOString());
    return result;
  }, [liens]);

  // Demo enrichment: synthesize additional liens near the pivot date
  const displayLiens = useMemo(() => {
    const now = pivotNow;
    const currentLiens = liens || [];
    
    // If we already have ample data in the last 30 days, use it as-is
    const realWindow = currentLiens.filter((l) => {
      const t = new Date(l.createdAt || l.lienDate);
      const from = new Date(now); from.setDate(from.getDate() - 30);
      return t >= from && t <= now;
    });
    if (realWindow.length >= 15) return currentLiens;

    // Build synthetic liens for the surrounding 4 weeks
    const synthetic = [];
    const accidentTypes = ['Motor Vehicle Accident', 'Premises Liability', 'Slip and Fall', 'Medical Malpractice', 'Product Liability'];
    const injuryTypes = ['Whiplash', 'Fracture', 'Soft Tissue', 'Head Injury', 'Back Injury'];
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['active', 'pending', 'settled'];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 60) + 30);
      
      const accidentType = accidentTypes[Math.floor(Math.random() * accidentTypes.length)];
      const injuryType = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 5000) + 500;
      
      synthetic.push({
        id: `synthetic-lien-${i}`,
        patientId: `patient-${Math.floor(Math.random() * 10) + 1}`,
        appointmentId: `apt-${Math.floor(Math.random() * 12) + 1}`,
        billId: `bill-${Math.floor(Math.random() * 10) + 1}`,
        attorneyId: `attorney-${Math.floor(Math.random() * 5) + 1}`,
        caseNumber: `CASE-2024-${String(i + 100).padStart(3, '0')}`,
        status,
        accidentDate: date.toISOString(),
        accidentType,
        accidentDescription: `${accidentType} case with ${injuryType} injury. Patient seeking medical treatment and legal representation.`,
        injuryDescription: `${injuryType} injury requiring medical attention and ongoing treatment. Patient reports pain and limited mobility.`,
        amount,
        balance: amount,
        lienDate: date.toISOString(),
        expirationDate: new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        priority,
        settlementDate: null,
        settlementAmount: null,
        attorneyName: `Attorney ${i + 1}`,
        attorneyFirm: `Law Firm ${i + 1}`,
        attorneyPhone: `(305) 555-${String(1000 + i).padStart(4, '0')}`,
        attorneyEmail: `attorney${i + 1}@lawfirm${i + 1}.com`,
        attorneyAddress: {
          street: `${100 + i} Legal St`,
          city: 'Miami',
          state: 'FL',
          zip: '33101',
          country: 'USA'
        },
        defendantName: `Defendant ${i + 1}`,
        defendantInsurance: `Insurance ${i + 1}`,
        defendantPolicyNumber: `POL-${String(100000 + i).padStart(6, '0')}`,
        defendantPolicyLimit: Math.floor(Math.random() * 100000) + 25000,
        settlementStatus: 'pending',
        notes: `Case ${i + 1} notes: ${accidentType} case with ${injuryType} injury. Currently in ${status} status with ${priority} priority.`,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
        __synthetic: true,
      });
    }
    
    const result = [...currentLiens, ...synthetic];
    console.log('🔍 Cases: Total liens after enrichment:', result.length, 'Original:', currentLiens.length, 'Synthetic:', synthetic.length);
    return result;
  }, [liens, pivotNow]);

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

  // Filtered cases data
  const filteredCases = useMemo(() => {
    let filtered = displayLiens.filter(lienItem => {
      // Status filter
      if (statusFilter !== 'all' && lienItem.status !== statusFilter) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && lienItem.priority !== priorityFilter) {
        return false;
      }
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const currentPatients = patients || [];
        const patientName = currentPatients.find(p => p.id === lienItem.patientId)?.name || '';
        const matchesPatient = patientName.toLowerCase().includes(searchLower);
        const matchesCaseNumber = lienItem.caseNumber?.toLowerCase().includes(searchLower);
        const matchesAccidentType = lienItem.accidentType?.toLowerCase().includes(searchLower);
        
        if (!matchesPatient && !matchesCaseNumber && !matchesAccidentType) {
          return false;
        }
      }
      
      return true;
    });

    // Sort by creation date (newest first)
    const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log('🔍 Cases: Filtered cases:', sorted.length, 'Filters:', { search, statusFilter, priorityFilter });
    return sorted;
  }, [displayLiens, patients, search, statusFilter, priorityFilter]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const total = displayLiens.length;
    const active = displayLiens.filter(l => l.status === 'active').length;
    const pending = displayLiens.filter(l => l.status === 'pending').length;
    const settled = displayLiens.filter(l => l.status === 'settled').length;
    
    const highPriority = displayLiens.filter(l => l.priority === 'high').length;
    const mediumPriority = displayLiens.filter(l => l.priority === 'medium').length;
    const lowPriority = displayLiens.filter(l => l.priority === 'low').length;
    
    const totalExposure = displayLiens.reduce((sum, l) => sum + (l.amount || 0), 0);
    const activeExposure = displayLiens.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.amount || 0), 0);
    
    const avgCaseValue = total > 0 ? totalExposure / total : 0;
    const casesWithMissingDocs = displayLiens.filter(l => {
      const caseReports = reports.filter(r => r.appointmentId === l.appointmentId);
      const caseBills = bills.filter(b => b.appointmentId === l.appointmentId);
      return caseReports.length === 0 || caseBills.length === 0;
    }).length;
    
    return {
      total,
      active,
      pending,
      settled,
      highPriority,
      mediumPriority,
      lowPriority,
      totalExposure,
      activeExposure,
      avgCaseValue,
      casesWithMissingDocs
    };
  }, [displayLiens, reports, bills]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'settled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Settled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
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
      case 'settle':
        setSelectedCase(caseData);
        setShowSettlementModal(true);
        break;
      case 'edit':
        alert(`Edit case ${caseData.caseNumber} - This would open an edit form`);
        break;
      case 'contact':
        alert(`Contact patient for case ${caseData.caseNumber} - This would open contact options`);
        break;
      case 'packet':
        alert(`Generate case packet for ${caseData.caseNumber} - This would create a PDF packet`);
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
          <h1 className="text-3xl font-bold text-foreground">Case Management</h1>
          <p className="text-muted-foreground">Manage your personal injury cases and liens</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((kpiMetrics.active / kpiMetrics.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        {/* Total Exposure */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiMetrics.totalExposure.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${kpiMetrics.activeExposure.toLocaleString()} active
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
              Need attention
            </p>
          </CardContent>
        </Card>

        {/* Avg Case Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Case Value</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(kpiMetrics.avgCaseValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per case
            </p>
          </CardContent>
        </Card>

        {/* Missing Docs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Docs</CardTitle>
            <FileX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{kpiMetrics.casesWithMissingDocs}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search cases, patients, accident types..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Cases ({filteredCases.length})</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {kpiMetrics.active} active • {kpiMetrics.highPriority} high-priority • {kpiMetrics.casesWithMissingDocs} need docs
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Accident Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
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
                        <div className="font-medium">{caseItem.accidentType}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(caseItem.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(caseItem.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${caseItem.amount?.toLocaleString()}</div>
                        {caseItem.balance !== caseItem.amount && (
                          <div className="text-xs text-muted-foreground">
                            ${caseItem.balance?.toLocaleString()} balance
                          </div>
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
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCaseAction('edit', caseItem)}
                            title="Edit Case"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCaseAction('contact', caseItem)}
                            title="Contact Patient"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCaseAction('packet', caseItem)}
                            title="Generate Packet"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCaseAction('settle', caseItem)}
                            title="Settle Case"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-8 w-8" />
                          <div>No cases found</div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <AlertCircle className="h-5 w-5 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">High-Priority Cases</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpiMetrics.highPriority} high-priority cases require immediate attention. Consider expedited processing and settlement negotiations.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <FileX className="h-5 w-5 mt-0.5 text-amber-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Missing Documentation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpiMetrics.casesWithMissingDocs} cases have missing documents. Complete documentation to strengthen case positions.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <Target className="h-5 w-5 mt-0.5 text-amber-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Settlement Opportunities</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpiMetrics.active} active cases are ready for settlement negotiations. Review case details and initiate discussions.
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
              Comprehensive case information and documentation
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
                        <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                        <div>{getPriorityBadge(selectedCase.priority)}</div>
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
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <div>{new Date(selectedCase.createdAt || selectedCase.lienDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                        <div className="text-xl font-bold text-green-600">${selectedCase.amount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Balance</Label>
                        <div className="text-xl font-bold">${selectedCase.balance?.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Paid Amount</Label>
                        <div className="text-lg">${((selectedCase.amount || 0) - (selectedCase.balance || 0)).toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                        <div>
                          {selectedCase.balance === selectedCase.amount ? (
                            <Badge variant="destructive">Unpaid</Badge>
                          ) : selectedCase.balance === 0 ? (
                            <Badge variant="default">Paid</Badge>
                          ) : (
                            <Badge variant="secondary">Partial</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Patient Name</Label>
                      <div className="font-medium">{getPatientName(selectedCase.patientId)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Patient ID</Label>
                      <div className="font-mono text-sm">{selectedCase.patientId}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Contact Patient</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Medical Report</div>
                          <div className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Lien Document</div>
                          <div className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCaseDetails(false)}>
                  Close
                </Button>
                <Button onClick={() => handleCaseAction('edit', selectedCase)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Case
                </Button>
                <Button onClick={() => handleCaseAction('packet', selectedCase)}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Packet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settlement Modal */}
      <Dialog open={showSettlementModal} onOpenChange={setShowSettlementModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Initiate Settlement: {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Review case details and initiate settlement negotiations
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
                      <Label className="text-sm font-medium text-muted-foreground">Current Amount</Label>
                      <div className="text-xl font-bold text-green-600">${selectedCase.amount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Balance</Label>
                      <div className="text-xl font-bold">${selectedCase.balance?.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settlement Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settlement Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Full Settlement</div>
                        <div className="text-sm text-muted-foreground">Settle for the full amount</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${selectedCase.amount?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">100% of claim</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">Recommended Settlement</div>
                        <div className="text-sm text-muted-foreground">Based on case strength and documentation</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-600">${Math.round((selectedCase.amount || 0) * 0.85).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">85% of claim</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Quick Settlement</div>
                        <div className="text-sm text-muted-foreground">Expedited processing with discount</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">${Math.round((selectedCase.amount || 0) * 0.75).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">75% of claim</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settlement Notes */}
              <div className="space-y-2">
                <Label htmlFor="settlement-notes">Settlement Notes</Label>
                <textarea
                  id="settlement-notes"
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  placeholder="Add notes about the settlement negotiation..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSettlementModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Settlement Letter
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Initiate Settlement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
