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
  FileText,
  Download,
  Eye,
  Package,
  FileCheck,
  FileX,
  Clock,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2,
  Scale,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Archive,
  Share2,
  ExternalLink,
  Copy,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  Zap,
  Star,
  Award,
  Shield,
  Heart,
  Briefcase,
  Target,
  TrendingUp,
  CalendarDays,
  Car,
  User,
  MoreHorizontal,
  ArrowUpRight,
  AlertTriangle,
  Info,
  Trash2,
} from 'lucide-react';

// Main Case Packet Component
export default function CasePacket() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showPacketPreview, setShowPacketPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

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
  const attorneys = useStore((s) => s.attorneys);
  const fetchAttorneys = useStore((s) => s.fetchAttorneys);

  // Pivot date: use current demo date; if no nearby data, pivot to nearest lien day
  const pivotNow = useMemo(() => {
    const now = getNow();
    console.log('🔍 Case Packet: Current date from getNow():', now.toISOString());
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
    console.log('🔍 Case Packet: Pivot date set to:', result.toISOString());
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
    console.log('🔍 Case Packet: Total liens after enrichment:', result.length, 'Original:', currentLiens.length, 'Synthetic:', synthetic.length);
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
          fetchCenters().catch(() => {}),
          fetchAttorneys().catch(() => {})
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchLiens, fetchPatients, fetchAppointments, fetchReports, fetchBills, fetchCenters, fetchAttorneys]);

  // Filtered cases data
  const filteredCases = useMemo(() => {
    let filtered = displayLiens.filter(lienItem => {
      // Status filter
      if (statusFilter !== 'all' && lienItem.status !== statusFilter) {
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
    console.log('🔍 Case Packet: Filtered cases:', sorted.length, 'Filters:', { search, statusFilter });
    return sorted;
  }, [displayLiens, patients, search, statusFilter]);

  // Calculate KPI metrics for case packets
  const kpiMetrics = useMemo(() => {
    const total = displayLiens.length;
    const active = displayLiens.filter(l => l.status === 'active').length;
    const pending = displayLiens.filter(l => l.status === 'pending').length;
    const settled = displayLiens.filter(l => l.status === 'settled').length;
    
    const totalExposure = displayLiens.reduce((sum, l) => sum + (l.amount || 0), 0);
    const activeExposure = displayLiens.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.amount || 0), 0);
    
    const avgCaseValue = total > 0 ? totalExposure / total : 0;
    
    // Calculate packet readiness
    const casesWithCompletePackets = displayLiens.filter(l => {
      const caseReports = reports.filter(r => r.appointmentId === l.appointmentId);
      const caseBills = bills.filter(b => b.appointmentId === l.appointmentId);
      return caseReports.length > 0 && caseBills.length > 0;
    }).length;
    
    const casesWithPartialPackets = displayLiens.filter(l => {
      const caseReports = reports.filter(r => r.appointmentId === l.appointmentId);
      const caseBills = bills.filter(b => b.appointmentId === l.appointmentId);
      return (caseReports.length > 0 || caseBills.length > 0) && !(caseReports.length > 0 && caseBills.length > 0);
    }).length;
    
    const casesWithNoPackets = total - casesWithCompletePackets - casesWithPartialPackets;
    
    return {
      total,
      active,
      pending,
      settled,
      totalExposure,
      activeExposure,
      avgCaseValue,
      casesWithCompletePackets,
      casesWithPartialPackets,
      casesWithNoPackets,
      packetReadinessRate: total > 0 ? Math.round((casesWithCompletePackets / total) * 100) : 0
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

  const getPacketStatusBadge = (caseItem) => {
    const caseReports = reports.filter(r => r.appointmentId === caseItem.appointmentId);
    const caseBills = bills.filter(b => b.appointmentId === caseItem.appointmentId);
    
    if (caseReports.length > 0 && caseBills.length > 0) {
      return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Complete</Badge>;
    } else if (caseReports.length > 0 || caseBills.length > 0) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Partial</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Missing</Badge>;
    }
  };

  const getPatientName = (patientId) => {
    const currentPatients = patients || [];
    const patient = currentPatients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  const getCasePacketData = (caseItem) => {
    const caseReports = reports.filter(r => r.appointmentId === caseItem.appointmentId);
    const caseBills = bills.filter(b => b.appointmentId === caseItem.appointmentId);
    const caseAppointments = appointments.filter(a => a.id === caseItem.appointmentId);
    const caseCenters = centers.filter(c => caseAppointments.some(a => a.centerId === c.id));
    const currentPatients = patients || [];
    const patient = currentPatients.find(p => p.id === caseItem.patientId);
    
    return {
      case: caseItem,
      patient,
      reports: caseReports,
      bills: caseBills,
      appointments: caseAppointments,
      centers: caseCenters,
      totalDocuments: caseReports.length + caseBills.length,
      isComplete: caseReports.length > 0 && caseBills.length > 0
    };
  };

  const handlePacketAction = (action, caseData) => {
    console.log(`Action: ${action} for case:`, caseData.caseNumber);
    
    switch (action) {
      case 'preview':
        setSelectedCase(caseData);
        setShowPacketPreview(true);
        break;
      case 'export':
        setSelectedCase(caseData);
        setShowExportModal(true);
        break;
      case 'generate':
        alert(`Generate complete packet for ${caseData.caseNumber} - This would create a comprehensive PDF packet`);
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
          <h1 className="text-3xl font-bold text-foreground">Case Packet Management</h1>
          <p className="text-muted-foreground">Compile and export comprehensive case documentation for legal proceedings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Packet
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Bulk Export
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
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Complete Packets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Packets</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiMetrics.casesWithCompletePackets}</div>
            <p className="text-xs text-muted-foreground">
              {kpiMetrics.packetReadinessRate}% readiness rate
            </p>
          </CardContent>
        </Card>

        {/* Partial Packets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial Packets</CardTitle>
            <FileX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{kpiMetrics.casesWithPartialPackets}</div>
            <p className="text-xs text-muted-foreground">
              Need completion
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

        {/* Missing Packets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Packets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpiMetrics.casesWithNoPackets}</div>
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
              <CardTitle className="text-lg">Packet Filters</CardTitle>
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
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Case Packets ({filteredCases.length})</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {kpiMetrics.casesWithCompletePackets} complete • {kpiMetrics.casesWithPartialPackets} partial • {kpiMetrics.casesWithNoPackets} missing
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
                    <TableHead>Packet Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => {
                    const packetData = getCasePacketData(caseItem);
                    return (
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
                          {getPacketStatusBadge(caseItem)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              {packetData.totalDocuments} docs
                            </div>
                            {packetData.reports.length > 0 && (
                              <Badge variant="outline" className="text-xs">Reports: {packetData.reports.length}</Badge>
                            )}
                            {packetData.bills.length > 0 && (
                              <Badge variant="outline" className="text-xs">Bills: {packetData.bills.length}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${caseItem.amount?.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handlePacketAction('preview', caseItem)}
                              title="Preview Packet"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handlePacketAction('export', caseItem)}
                              title="Export Packet"
                              disabled={!packetData.isComplete}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handlePacketAction('generate', caseItem)}
                              title="Generate Complete Packet"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8" />
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
                <FileCheck className="h-5 w-5 mt-0.5 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Packet Readiness</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpiMetrics.packetReadinessRate}% of cases have complete packets. Focus on completing documentation for the remaining {kpiMetrics.casesWithPartialPackets + kpiMetrics.casesWithNoPackets} cases.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Missing Documentation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpiMetrics.casesWithNoPackets} cases have no documentation. These cases need immediate attention to build strong legal positions.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <Target className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Export Opportunities</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpiMetrics.casesWithCompletePackets} cases are ready for immediate export. Consider bulk export for efficient case management.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Packet Preview Modal */}
      <Dialog open={showPacketPreview} onOpenChange={setShowPacketPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Case Packet Preview: {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Comprehensive case documentation ready for export
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (() => {
            const packetData = getCasePacketData(selectedCase);
            return (
              <div className="space-y-6">
                {/* Packet Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Case Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Case Number</Label>
                          <div className="font-medium">{selectedCase.caseNumber}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                          <div>{getStatusBadge(selectedCase.status)}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Accident Date</Label>
                          <div>{new Date(selectedCase.accidentDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Accident Type</Label>
                          <div className="font-medium">{selectedCase.accidentType}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
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
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Packet Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Document Count</Label>
                          <div className="text-xl font-bold">{packetData.totalDocuments}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Reports</Label>
                          <div className="text-lg">{packetData.reports.length}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Bills</Label>
                          <div className="text-lg">{packetData.bills.length}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Completeness</Label>
                          <div>{getPacketStatusBadge(selectedCase)}</div>
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

                {/* Document Library */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Medical Reports */}
                      <div>
                        <h4 className="font-medium mb-2">Medical Reports ({packetData.reports.length})</h4>
                        <div className="space-y-2">
                          {packetData.reports.map((report, index) => (
                            <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                  <div className="font-medium">Medical Report #{index + 1}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {report.impression || 'Radiological findings and clinical correlation'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Generated on {new Date(report.reportDate || report.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          ))}
                          {packetData.reports.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              <FileX className="h-8 w-8 mx-auto mb-2" />
                              <div>No medical reports available</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bills */}
                      <div>
                        <h4 className="font-medium mb-2">Bills & Invoices ({packetData.bills.length})</h4>
                        <div className="space-y-2">
                          {packetData.bills.map((bill, index) => (
                            <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-green-500" />
                                <div>
                                  <div className="font-medium">Bill #{index + 1}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Total: ${bill.total?.toLocaleString() || 'N/A'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Generated on {new Date(bill.billingDate || bill.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          ))}
                          {packetData.bills.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              <FileX className="h-8 w-8 mx-auto mb-2" />
                              <div>No bills available</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPacketPreview(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => handlePacketAction('export', selectedCase)}
                    disabled={!packetData.isComplete}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Packet
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              Export Case Packet: {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Choose export format and options for your case packet
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (() => {
            const packetData = getCasePacketData(selectedCase);
            return (
              <div className="space-y-6">
                {/* Export Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">PDF Packet</div>
                          <div className="text-sm text-muted-foreground">Complete case packet in PDF format</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">Professional</div>
                          <div className="text-xs text-muted-foreground">Court-ready format</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">ZIP Archive</div>
                          <div className="text-sm text-muted-foreground">All documents in organized folder structure</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">Complete</div>
                          <div className="text-xs text-muted-foreground">All source files</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Individual Files</div>
                          <div className="text-sm text-muted-foreground">Download each document separately</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">Selective</div>
                          <div className="text-xs text-muted-foreground">Choose specific documents</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Packet Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Packet Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total Documents</Label>
                        <div className="font-bold">{packetData.totalDocuments}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Medical Reports</Label>
                        <div className="font-bold">{packetData.reports.length}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Bills & Invoices</Label>
                        <div className="font-bold">{packetData.bills.length}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Case Value</Label>
                        <div className="font-bold">${selectedCase.amount?.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Notes */}
                <div className="space-y-2">
                  <Label htmlFor="export-notes">Export Notes (Optional)</Label>
                  <textarea
                    id="export-notes"
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                    placeholder="Add notes about this export (e.g., purpose, recipient, special instructions)..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowExportModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Packet
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
