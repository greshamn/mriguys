import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Receipt,
  Calendar,
  Shield,
  Target,
  Award,
  Briefcase,
  Gavel,
  Scale,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Timer,
  Star
} from 'lucide-react';
import { getNow } from '../../lib/utils';

// AI Insights Component for Attorney Dashboard
const AttorneyAIInsights = ({ claims, liens, appointments, pivotNow }) => {
  const insights = useMemo(() => {
    const suggestions = [];
    
    // Calculate case metrics
    const totalCases = claims.length;
    const activeCases = claims.filter(c => c.status === 'active').length;
    const atRiskCases = claims.filter(c => c.riskLevel === 'high').length;
    const casesWithMissingDocs = claims.filter(c => c.missingDocuments > 0).length;
    
    // Rule-based AI suggestions
    if (atRiskCases > 0) {
      suggestions.push({
        icon: AlertCircle,
        title: 'High-Risk Cases',
        message: `${atRiskCases} cases flagged as high-risk. Prioritize these for immediate attention and review.`,
        priority: 'high'
      });
    }
    
    if (casesWithMissingDocs > 0) {
      suggestions.push({
        icon: FileX,
        title: 'Missing Documentation',
        message: `${casesWithMissingDocs} cases have missing documents. Complete documentation to strengthen case positions.`,
        priority: 'medium'
      });
    }
    
    // Check for no-show risk
    const currentAppointments = appointments || [];
    const upcomingAppointments = currentAppointments.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.startTime);
      const from = new Date(pivotNow);
      const to = new Date(pivotNow); to.setDate(to.getDate() + 7);
      return apptDate >= from && apptDate <= to && a.status === 'confirmed';
    });
    
    const highNoShowRisk = upcomingAppointments.filter(a => {
      const patient = claims.find(c => c.patientId === a.patientId);
      return patient && patient.noShowRisk > 0.3;
    });
    
    if (highNoShowRisk.length > 0) {
      suggestions.push({
        icon: UserX,
        title: 'No-Show Risk Alert',
        message: `${highNoShowRisk.length} upcoming appointments with high no-show risk. Send reminder communications.`,
        priority: 'medium'
      });
    }
    
    // Check for lien exposure
    const currentLiens = liens || [];
    const totalExposure = currentLiens.reduce((sum, lien) => sum + (lien.amount || 0), 0);
    const highExposureCases = currentLiens.filter(lien => lien.amount > 50000).length;
    
    if (highExposureCases > 0) {
      suggestions.push({
        icon: DollarSign,
        title: 'High-Value Cases',
        message: `${highExposureCases} cases with exposure over $50K (total: $${totalExposure.toLocaleString()}). Focus on settlement negotiations.`,
        priority: 'high'
      });
    }
    
    // Check for settlement opportunities
    const readyForSettlement = claims.filter(c => 
      c.status === 'active' && c.settlementReadiness > 0.8
    ).length;
    
    if (readyForSettlement > 0) {
      suggestions.push({
        icon: Target,
        title: 'Settlement Opportunities',
        message: `${readyForSettlement} cases ready for settlement negotiations. Review and initiate settlement discussions.`,
        priority: 'medium'
      });
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }, [claims, liens, appointments, pivotNow]);

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            No critical alerts at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
            <insight.icon className={`h-5 w-5 mt-0.5 ${
              insight.priority === 'high' ? 'text-destructive' : 
              insight.priority === 'medium' ? 'text-warning' : 'text-primary'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-sm">{insight.title}</div>
              <div className="text-sm text-muted-foreground">{insight.message}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Case Packet Preview Component
const CasePacketPreview = ({ caseData, patients, appointments, reports, bills }) => {
  const getPatientName = (patientId) => {
    const currentPatients = patients || [];
    const patient = currentPatients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  const getCaseDocuments = (caseId) => {
    const currentReports = reports || [];
    const currentBills = bills || [];
    const currentAppointments = appointments || [];
    const caseReports = currentReports.filter(r => r.caseId === caseId);
    const caseBills = currentBills.filter(b => b.caseId === caseId);
    const caseAppointments = currentAppointments.filter(a => a.caseId === caseId);
    
    return {
      reports: caseReports.length,
      bills: caseBills.length,
      appointments: caseAppointments.length,
      total: caseReports.length + caseBills.length + caseAppointments.length
    };
  };

  if (!caseData) return null;

  const documents = getCaseDocuments(caseData.id);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="h-5 w-5" />
          Case Packet Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{caseData.caseNumber}</div>
            <div className="text-sm text-muted-foreground">{getPatientName(caseData.patientId)}</div>
          </div>
          <Badge variant={caseData.status === 'active' ? 'default' : 'outline'}>
            {caseData.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{documents.total}</div>
            <div className="text-xs text-muted-foreground">Total Documents</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${(caseData.estimatedValue || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Estimated Value</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Reports</span>
            <span className="font-medium">{documents.reports}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Bills</span>
            <span className="font-medium">{documents.bills}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Appointments</span>
            <span className="font-medium">{documents.appointments}</span>
          </div>
        </div>
        
        <Button className="w-full" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Generate Packet
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Attorney Dashboard Component
export const AttorneyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);

  // Store hooks
  const claims = useStore((s) => s.claims);
  const fetchClaims = useStore((s) => s.fetchClaims);
  const patients = useStore((s) => s.patients);
  const fetchPatients = useStore((s) => s.fetchPatients);
  const liens = useStore((s) => s.liens);
  const fetchLiens = useStore((s) => s.fetchLiens);
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);
  const reports = useStore((s) => s.reports);
  const fetchReports = useStore((s) => s.fetchReports);
  const bills = useStore((s) => s.bills);
  const fetchBills = useStore((s) => s.fetchBills);

  // Pivot date: use current demo date; if no nearby data, pivot to nearest claim day
  const pivotNow = useMemo(() => {
    const now = getNow();
    console.log('🔍 Attorney Dashboard: Current date from getNow():', now.toISOString());
    if (!claims || !claims.length) return now;
    // Find nearest claim within ±14 days
    let nearest = null;
    let bestDelta = Infinity;
    claims.forEach((c) => {
      const t = new Date(c.createdAt || c.accidentDate);
      const delta = Math.abs(t.getTime() - now.getTime());
      if (delta < bestDelta) { bestDelta = delta; nearest = t; }
    });
    if (!nearest) return now;
    const days = Math.abs((nearest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const result = days <= 14 ? nearest : now;
    console.log('🔍 Attorney Dashboard: Pivot date set to:', result.toISOString());
    return result;
  }, [claims]);

  // Demo enrichment: synthesize additional claims near the pivot date
  const displayClaims = useMemo(() => {
    const now = pivotNow;
    const currentClaims = claims || [];
    
    // If we already have ample data in the last 30 days, use it as-is
    const realWindow = currentClaims.filter((c) => {
      const t = new Date(c.createdAt || c.accidentDate);
      const from = new Date(now); from.setDate(from.getDate() - 30);
      return t >= from && t <= now;
    });
    if (realWindow.length >= 15) return currentClaims;

    // Build synthetic cases for the surrounding 4 weeks
    const patients = ['patient-001','patient-002','patient-003','patient-004','patient-005'];
    const accidentTypes = ['Motor Vehicle', 'Slip and Fall', 'Workplace Injury', 'Medical Malpractice', 'Product Liability'];
    const synthetic = [];
    
    for (let offset = -14; offset <= 14; offset++) {
      const date = new Date(now); date.setDate(now.getDate() + offset);
      const dow = date.getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 || dow === 6) continue; // weekdays only
      
      // Create 1-2 cases per day
      const casesPerDay = (offset + dow) % 2 + 1;
      for (let i = 0; i < casesPerDay; i++) {
        const patientId = patients[(offset + i) % patients.length];
        const accidentType = accidentTypes[(offset + i) % accidentTypes.length];
        const estimatedValue = Math.floor(Math.random() * 100000) + 10000; // $10K-$110K
        
        // Deterministic pattern for status and risk
        const key = `${offset}-${i}-${dow}`;
        const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const status = hash % 3 === 0 ? 'active' : hash % 3 === 1 ? 'settled' : 'pending';
        const riskLevel = hash % 3 === 0 ? 'low' : hash % 3 === 1 ? 'medium' : 'high';
        const noShowRisk = (hash % 100) / 100; // 0-1
        const settlementReadiness = (hash % 100) / 100; // 0-1
        const missingDocuments = hash % 4; // 0-3
        
        synthetic.push({
          id: `case-${date.toISOString().slice(0,10)}-${i}`,
          caseNumber: `CASE-${date.getFullYear()}-${String(offset + 100).slice(-3)}`,
          patientId,
          attorneyId: 'attorney-001',
          accidentDate: date.toISOString(),
          accidentType,
          injuryDescription: 'Various injuries requiring medical attention',
          status,
          riskLevel,
          noShowRisk,
          settlementReadiness,
          missingDocuments,
          estimatedValue,
          createdAt: date.toISOString(),
          updatedAt: new Date().toISOString(),
          __synthetic: true,
        });
      }
    }
    
    const result = [...currentClaims, ...synthetic];
    console.log('🔍 Attorney Dashboard: Total claims after enrichment:', result.length, 'Original:', currentClaims.length, 'Synthetic:', synthetic.length);
    return result;
  }, [claims, pivotNow]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClaims().catch(() => {}),
          fetchPatients().catch(() => {}),
          fetchLiens().catch(() => {}),
          fetchAppointments().catch(() => {}),
          fetchReports().catch(() => {}),
          fetchBills().catch(() => {})
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchClaims, fetchPatients, fetchLiens, fetchAppointments, fetchReports, fetchBills]);

  // Filtered claims data
  const filteredClaims = useMemo(() => {
    let filtered = displayClaims.filter(claimItem => {
      // Status filter
      if (statusFilter !== 'all' && claimItem.status !== statusFilter) {
        return false;
      }
      
      // Risk filter
      if (riskFilter !== 'all' && claimItem.riskLevel !== riskFilter) {
        return false;
      }
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const currentPatients = patients || [];
        const patientName = currentPatients.find(p => p.id === claimItem.patientId)?.name || '';
        const matchesPatient = patientName.toLowerCase().includes(searchLower);
        const matchesClaimNumber = claimItem.claimNumber?.toLowerCase().includes(searchLower);
        const matchesAccidentType = claimItem.accidentType?.toLowerCase().includes(searchLower);
        
        if (!matchesPatient && !matchesClaimNumber && !matchesAccidentType) {
          return false;
        }
      }
      
      return true;
    });

    // Sort by creation date (newest first)
    const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log('🔍 Attorney Dashboard: Filtered claims:', sorted.length, 'Filters:', { search, statusFilter, riskFilter });
    return sorted;
  }, [displayClaims, patients, search, statusFilter, riskFilter]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const currentLiens = liens || [];
    const total = displayClaims.length;
    const active = displayClaims.filter(c => c.status === 'active').length;
    const settled = displayClaims.filter(c => c.status === 'settled').length;
    const pending = displayClaims.filter(c => c.status === 'pending').length;
    
    const highRisk = displayClaims.filter(c => c.riskLevel === 'high').length;
    const mediumRisk = displayClaims.filter(c => c.riskLevel === 'medium').length;
    const lowRisk = displayClaims.filter(c => c.riskLevel === 'low').length;
    
    const totalExposure = currentLiens.reduce((sum, lien) => sum + (lien.amount || 0), 0);
    const activeExposure = currentLiens.filter(lien => lien.status === 'active').reduce((sum, lien) => sum + (lien.amount || 0), 0);
    
    const avgNoShowRisk = total > 0 ? displayClaims.reduce((sum, c) => sum + (c.noShowRisk || 0), 0) / total : 0;
    const claimsWithMissingDocs = displayClaims.filter(c => c.missingDocuments > 0).length;
    
    return {
      total,
      active,
      settled,
      pending,
      highRisk,
      mediumRisk,
      lowRisk,
      totalExposure,
      activeExposure,
      avgNoShowRisk,
      claimsWithMissingDocs
    };
  }, [displayClaims, liens]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case 'settled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Settled</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{riskLevel}</Badge>;
    }
  };

  const getPatientName = (patientId) => {
    const currentPatients = patients || [];
    const patient = currentPatients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
          <h1 className="text-3xl font-bold text-foreground">Attorney Dashboard</h1>
          <p className="text-muted-foreground">Case management and client overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Active Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.active}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
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

        {/* Settlement Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlement Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((kpiMetrics.settled / kpiMetrics.total) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              {kpiMetrics.settled} cases settled
            </p>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpiMetrics.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((kpiMetrics.highRisk / kpiMetrics.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* No-Show Risk */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg No-Show Risk</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kpiMetrics.avgNoShowRisk * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all active cases
            </p>
          </CardContent>
        </Card>

        {/* Missing Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
            <FileX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.claimsWithMissingDocs}</div>
            <p className="text-xs text-muted-foreground">
              Cases need attention
            </p>
          </CardContent>
        </Card>

        {/* Average Case Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Case Value</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(kpiMetrics.totalExposure / kpiMetrics.total).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per active case
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Case Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases, clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Risk Filter */}
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cases Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Cases ({filteredClaims.length})</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {kpiMetrics.active} active • {kpiMetrics.highRisk} high-risk • {kpiMetrics.claimsWithMissingDocs} need docs
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3 px-2">Case Number</th>
                      <th className="py-3 px-2">Client</th>
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Risk</th>
                      <th className="py-3 px-2">Value</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claimItem) => (
                                              <tr key={claimItem.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{claimItem.claimNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(claimItem.accidentDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium">{getPatientName(claimItem.patientId)}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium">{claimItem.accidentType}</div>
                          </td>
                          <td className="py-3 px-2">
                            {getStatusBadge(claimItem.status)}
                          </td>
                          <td className="py-3 px-2">
                            {getRiskBadge(claimItem.riskLevel)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium">${claimItem.estimatedValue?.toLocaleString()}</div>
                            {claimItem.missingDocuments > 0 && (
                              <div className="text-xs text-red-600">
                                {claimItem.missingDocuments} docs missing
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setSelectedCase(claimItem)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredClaims.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Briefcase className="h-8 w-8" />
                            <div>No cases found</div>
                            <div className="text-sm">Try adjusting your filters</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Insights */}
          <AttorneyAIInsights 
            claims={displayClaims}
            liens={liens}
            appointments={appointments}
            pivotNow={pivotNow}
          />
          
          {/* Case Packet Preview */}
          {selectedCase && (
            <CasePacketPreview
              caseData={selectedCase}
              patients={patients}
              appointments={appointments}
              reports={reports}
              bills={bills}
            />
          )}
        </div>
      </div>
    </div>
  );
};
