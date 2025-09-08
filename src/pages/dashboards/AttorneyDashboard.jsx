import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import KPICard from '../../components/KPICard';
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
      <Card className="overflow-hidden">
        {/* Purple gradient header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div className="font-semibold text-lg">AI Insights</div>
          </div>
          <div className="text-sm opacity-90 mt-1">Case management recommendations</div>
        </div>
        
        {/* White content section */}
        <CardContent className="p-4 bg-white">
          <div className="text-gray-600 text-sm">
            No critical alerts at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Purple gradient header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div className="font-semibold text-lg">AI Insights</div>
        </div>
        <div className="text-sm opacity-90 mt-1">Case management recommendations</div>
      </div>
      
      {/* White content section */}
      <CardContent className="p-4 bg-white space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <insight.icon className={`h-5 w-5 mt-0.5 ${
              insight.priority === 'high' ? 'text-red-600' : 
              insight.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{insight.title}</div>
              <div className="text-sm text-gray-600">{insight.message}</div>
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
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Briefcase className="h-5 w-5" />
          Case Packet Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
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
  const [viewCaseModal, setViewCaseModal] = useState(false);
  const [viewingCase, setViewingCase] = useState(null);

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

  // Demo enrichment: synthesize additional liens for exposure calculation
  const displayLiens = useMemo(() => {
    const now = pivotNow;
    const currentLiens = liens || [];
    
    // If we already have ample data, use it as-is
    if (currentLiens.length >= 10) return currentLiens;

    // Build synthetic liens for the surrounding 4 weeks
    const synthetic = [];
    const claimIds = displayClaims.map(c => c.id);
    
    for (let offset = -14; offset <= 14; offset++) {
      const date = new Date(now); date.setDate(now.getDate() + offset);
      const dow = date.getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 || dow === 6) continue; // weekdays only
      
      // Create 1-2 liens per day
      const liensPerDay = (offset + dow) % 2 + 1;
      for (let i = 0; i < liensPerDay; i++) {
        const claimId = claimIds[(offset + i) % claimIds.length];
        const amount = Math.floor(Math.random() * 150000) + 10000; // $10K-$160K
        
        // Deterministic pattern for status
        const key = `${offset}-${i}-${dow}`;
        const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const status = hash % 3 === 0 ? 'active' : hash % 3 === 1 ? 'settled' : 'pending';
        
        synthetic.push({
          id: `lien-${date.toISOString().slice(0,10)}-${i}`,
          claimId,
          amount,
          status,
          createdAt: date.toISOString(),
          updatedAt: new Date().toISOString(),
          __synthetic: true,
        });
      }
    }
    
    const result = [...currentLiens, ...synthetic];
    console.log('🔍 Attorney Dashboard: Total liens after enrichment:', result.length, 'Original:', currentLiens.length, 'Synthetic:', synthetic.length);
    return result;
  }, [liens, displayClaims, pivotNow]);

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

  // Generate trend data for the last 6 months
  const generateTrendData = (baseValue, variation = 0.2) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendData = months.map((month, index) => {
      // Create more pronounced variation for better visibility
      const variationFactor = (Math.random() - 0.5) * variation;
      const value = Math.max(0, baseValue + (baseValue * variationFactor));
      
      // For very small values, ensure minimum variation
      const minVariation = baseValue < 5 ? 1 : 0;
      const finalValue = Math.max(minVariation, Math.round(value * 100) / 100);
      
      return { month, value: finalValue };
    });
    
    return trendData;
  };

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const currentLiens = displayLiens || [];
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
  }, [displayClaims, displayLiens]);

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

  const handleViewCase = (caseData) => {
    setViewingCase(caseData);
    setViewCaseModal(true);
  };

  const handleCloseViewModal = () => {
    setViewCaseModal(false);
    setViewingCase(null);
  };

  // Case Details Modal Component
  const CaseDetailsModal = ({ caseData, isOpen, onClose }) => {
    if (!caseData) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Case Details - {caseData.caseNumber || caseData.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Client Information</Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-lg font-semibold text-gray-900">{caseData.clientName}</p>
                    <p className="text-sm text-gray-600">Case ID: {caseData.id}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Case Type</Label>
                  <p className="mt-1 text-gray-900">{caseData.type}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(caseData.status)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Risk Assessment</Label>
                  <div className="mt-1">
                    {getRiskBadge(caseData.riskLevel)}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Case Value</Label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">${(caseData.estimatedValue || caseData.value || 0).toLocaleString()}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">No-Show Risk</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${caseData.noShowRisk || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{caseData.noShowRisk || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Timeline */}
            <div>
              <Label className="text-sm font-medium text-gray-600">Case Timeline</Label>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Case Opened</p>
                    <p className="text-xs text-gray-600">{new Date(caseData.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-600">{new Date(caseData.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {caseData.status === 'settled' && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Case Settled</p>
                      <p className="text-xs text-gray-600">Settlement completed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Status */}
            <div>
              <Label className="text-sm font-medium text-gray-600">Document Status</Label>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Missing Documents</span>
                  <span className="text-sm font-medium text-red-600">{caseData.missingDocuments || 0}</span>
                </div>
                {caseData.missingDocuments > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Action required: Complete documentation
                  </p>
                )}
              </div>
            </div>

            {/* Related Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Appointments</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {caseData.appointmentCount || 0} scheduled appointments
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Reports</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {caseData.reportCount || 0} medical reports
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Case Packet
              </Button>
              <Button variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Case
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Clients"
          value={kpiMetrics.active}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          trendData={generateTrendData(kpiMetrics.active, 0.3)}
          trendColor="#3b82f6" // Blue
        />
        
        <KPICard
          title="Total Exposure"
          value={`$${kpiMetrics.totalExposure.toLocaleString()}`}
          change={`$${kpiMetrics.activeExposure.toLocaleString()} High Risk`}
          changeType="neutral"
          icon={DollarSign}
          trendData={generateTrendData(kpiMetrics.totalExposure / 1000, 0.4).map(d => ({ ...d, value: Math.round(d.value) }))}
          trendColor="#10b981" // Green
        />
        
        <KPICard
          title="Settlement Rate"
          value={`${Math.round((kpiMetrics.settled / kpiMetrics.total) * 100)}%`}
          change={`${kpiMetrics.settled} cases settled`}
          changeType="neutral"
          icon={Target}
          trendData={generateTrendData((kpiMetrics.settled / kpiMetrics.total) * 100, 0.3).map(d => ({ ...d, value: Math.round(d.value) }))}
          trendColor="#f59e0b" // Orange
        />
        
        <KPICard
          title="High Risk Cases"
          value={kpiMetrics.highRisk}
          change={`${Math.round((kpiMetrics.highRisk / kpiMetrics.total) * 100)}% of total`}
          changeType="negative"
          icon={AlertCircle}
          trendData={generateTrendData(kpiMetrics.highRisk, 0.4)}
          trendColor="#ef4444" // Red
        />
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
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Filter className="h-5 w-5" />
            Case Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases, clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="text-gray-900">Active Cases ({filteredClaims.length})</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-4 w-4" />
                  {kpiMetrics.active} active • {kpiMetrics.highRisk} high-risk • {kpiMetrics.claimsWithMissingDocs} need docs
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b bg-gray-50">
                      <th className="py-4 px-4 font-semibold">Case Number</th>
                      <th className="py-4 px-4 font-semibold">Client</th>
                      <th className="py-4 px-4 font-semibold">Type</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold">Risk</th>
                      <th className="py-4 px-4 font-semibold">Value</th>
                      <th className="py-4 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claimItem) => (
                      <tr key={claimItem.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{claimItem.caseNumber || claimItem.claimNumber}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(claimItem.accidentDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{getPatientName(claimItem.patientId)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{claimItem.accidentType}</div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(claimItem.status)}
                        </td>
                        <td className="py-4 px-4">
                          {getRiskBadge(claimItem.riskLevel)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">${claimItem.estimatedValue?.toLocaleString()}</div>
                          {claimItem.missingDocuments > 0 && (
                            <div className="text-xs text-red-600">
                              {claimItem.missingDocuments} docs missing
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewCase(claimItem)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredClaims.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <Briefcase className="h-12 w-12 text-gray-300" />
                            <div className="text-lg font-medium">No cases found</div>
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
            liens={displayLiens}
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

      {/* Case Details Modal */}
      <CaseDetailsModal 
        caseData={viewingCase}
        isOpen={viewCaseModal}
        onClose={handleCloseViewModal}
      />
    </div>
  );
};
