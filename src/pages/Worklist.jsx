import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
// Textarea component not available, using Input with multiple rows
// Separator not used in this component
import { 
  Clock, 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  Calendar,
  Download,
  Eye,
  Edit,
  Plus,
  Sparkles,
  Activity,
  Users
} from 'lucide-react';
import { getNow } from '../lib/utils';

// AI Insights Component for Worklist
const WorklistAIInsights = ({ appointments, utilizationPct, noShowRate, pivotNow }) => {
  const insights = useMemo(() => {
    const suggestions = [];
    
    // Rule-based AI suggestions
    if (utilizationPct < 0.7) {
      suggestions.push({
        icon: Activity,
        title: 'Low Utilization',
        message: 'Consider reducing operating hours on low-volume days to improve efficiency',
        priority: 'medium'
      });
    }
    
    if (noShowRate > 0.15) {
      suggestions.push({
        icon: Users,
        title: 'High No-Show Rate',
        message: 'Implement reminder calls or consider overbooking by 10% to maintain capacity',
        priority: 'high'
      });
    }
    
    const pendingReports = appointments.filter(a => a.status === 'completed' && !a.reportId).length;
    if (pendingReports > 3) {
      suggestions.push({
        icon: FileText,
        title: 'Pending Reports',
        message: `${pendingReports} completed scans awaiting report upload. Prioritize older studies.`,
        priority: 'high'
      });
    }
    
    const todayAppointments = appointments.filter(a => {
      const today = pivotNow.toDateString();
      const apptDate = new Date(a.appointmentDate || a.startTime).toDateString();
      return apptDate === today;
    }).length;
    
    if (todayAppointments < 5) {
      suggestions.push({
        icon: Calendar,
        title: 'Light Schedule',
        message: 'Today has fewer appointments than usual. Consider reaching out to referring providers.',
        priority: 'low'
      });
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }, [appointments, utilizationPct, noShowRate, pivotNow]);

  if (insights.length === 0) {
    return (
      <Card className="overflow-hidden">
        {/* Purple gradient header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div className="font-semibold text-lg">AI Insights</div>
          </div>
          <div className="text-sm opacity-90 mt-1">Optimization recommendations</div>
        </div>
        
        {/* White content section */}
        <CardContent className="p-4 bg-white">
          <div className="text-gray-600 text-sm">
            No optimization suggestions at this time.
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
        <div className="text-sm opacity-90 mt-1">Optimization recommendations</div>
      </div>
      
      {/* White content section */}
      <CardContent className="p-4 bg-white space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <insight.icon className={`h-5 w-5 mt-0.5 ${
              insight.priority === 'high' ? 'text-red-600' : 
              insight.priority === 'medium' ? 'text-orange-600' : 'text-blue-600'
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

// View Appointment Modal Component
const ViewAppointmentModal = ({ appointment, isOpen, onClose }) => {
  if (!appointment) return null;

  const getPatientName = (patientId) => {
    const patients = useStore.getState().patients;
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  const getCenterName = (centerId) => {
    const centers = useStore.getState().centers;
    const center = centers.find(c => c.id === centerId);
    return center?.name || centerId;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'no-show':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">No Show</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const startTime = formatDateTime(appointment.appointmentDate || appointment.startTime);
  const endTime = formatDateTime(appointment.endTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                <div className="text-sm text-gray-900">{getPatientName(appointment.patientId)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                <div className="text-sm text-gray-900">{appointment.patientId}</div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Date</Label>
                <div className="text-sm text-gray-900">{startTime.date}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Time</Label>
                <div className="text-sm text-gray-900">{startTime.time} - {endTime.time}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Modality</Label>
                <div className="text-sm text-gray-900">{appointment.modality}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Body Part</Label>
                <div className="text-sm text-gray-900">{appointment.bodyPart}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <div className="mt-1">{getStatusBadge(appointment.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Center</Label>
                <div className="text-sm text-gray-900">{getCenterName(appointment.centerId)}</div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(appointment.notes || appointment.referralId) && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Additional Information</h3>
              <div className="space-y-3">
                {appointment.referralId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Referral ID</Label>
                    <div className="text-sm text-gray-900">{appointment.referralId}</div>
                  </div>
                )}
                {appointment.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <div className="text-sm text-gray-900 bg-white p-3 rounded border">
                      {appointment.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Created</Label>
                <div className="text-sm text-gray-900">
                  {new Date(appointment.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <div className="text-sm text-gray-900">
                  {new Date(appointment.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Upload Report Modal Component
const UploadReportModal = ({ appointment, isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock upload success
      const mockReport = {
        id: `report-${Date.now()}`,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        notes: notes,
        status: 'pending_review'
      };
      
      onUpload(mockReport);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient</Label>
            <div className="text-sm text-muted-foreground mt-1">
              {appointment?.patientName || appointment?.patientId}
            </div>
          </div>
          
          <div>
            <Label htmlFor="modality">Modality</Label>
            <div className="text-sm text-muted-foreground mt-1">
              {appointment?.modality} - {appointment?.bodyPart}
            </div>
          </div>
          
          <div>
            <Label htmlFor="file">Report File (PDF)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full min-h-[80px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Worklist Component
const Worklist = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);

  // Store hooks
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus);
  const patients = useStore((s) => s.patients);
  const fetchPatients = useStore((s) => s.fetchPatients);

  // Pivot date: use current demo date; if no nearby data, pivot to nearest appointment day (keeps demo lively without editing fixtures)
  const pivotNow = useMemo(() => {
    const now = getNow();
    console.log('🔍 Worklist: Current date from getNow():', now.toISOString());
    if (!appointments.length) return now;
    // Find nearest appointment within ±14 days; otherwise use next scheduled or the latest completed
    let nearest = null;
    let bestDelta = Infinity;
    appointments.forEach((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.createdAt);
      const delta = Math.abs(t.getTime() - now.getTime());
      if (delta < bestDelta) { bestDelta = delta; nearest = t; }
    });
    if (!nearest) return now;
    const days = Math.abs((nearest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const result = days <= 14 ? nearest : now;
    console.log('🔍 Worklist: Pivot date set to:', result.toISOString());
    return result;
  }, [appointments]);

  // --- Demo enrichment: synthesize additional items near the pivot date when data is sparse ---
  const displayAppointments = useMemo(() => {
    const now = pivotNow;
    // If we already have ample data in the last 30 days, use it as-is
    const realWindow = appointments.filter((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.createdAt);
      const from = new Date(now); from.setDate(from.getDate() - 30);
      return t >= from && t <= now;
    });
    if (realWindow.length >= 80) return appointments;

    // Build a richer synthetic set for the surrounding 4 weeks (Mon–Fri), 9 time slots/day, multi‑center
    const centers = ['center-001','center-002','center-003','center-004'];
    const modalities = ['MRI','CT','X-Ray','Ultrasound'];
    const bodyParts = ['Head', 'Spine', 'Chest', 'Abdomen', 'Knee', 'Shoulder'];
    const synthetic = [];
    for (let offset = -14; offset <= 14; offset++) {
      const date = new Date(now); date.setDate(now.getDate() + offset);
      const dow = date.getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 || dow === 6) continue; // weekdays only
      for (let h = 8; h <= 16; h++) {
        const startTs = new Date(date); startTs.setHours(h, 0, 0, 0);
        const endTs = new Date(startTs); endTs.setMinutes(60);
        const modality = modalities[(h + dow + offset + 14) % modalities.length];
        const bodyPart = bodyParts[(h + dow + offset) % bodyParts.length];
        const centerId = centers[(h + dow) % centers.length];
        // Deterministic pattern: ~10% no-shows scattered across the week, ~5% in-progress near now
        const key = `${offset}-${h}-${dow}`;
        const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        let status = startTs < now ? 'completed' : 'scheduled';
        if (Math.abs(startTs.getTime() - now.getTime()) < 60 * 60 * 1000) status = 'in-progress';
        // Spread no-shows across the week and hours
        if ((hash % 10 === 0 || (hash % 7 === 3)) && startTs < now) status = 'no-show';
        synthetic.push({
          id: `demo-apt-${date.toISOString().slice(0,10)}-${h}`,
          referralId: `demo-ref-${date.toISOString().slice(0,10)}-${h}`,
          patientId: `patient-${String((hash % 20) + 1).padStart(3, '0')}`,
          centerId,
          slotId: `demo-slot-${date.toISOString().slice(0,10)}-${h}`,
          status,
          appointmentDate: startTs.toISOString(),
          startTime: startTs.toISOString(),
          endTime: endTs.toISOString(),
          modality,
          bodyPart,
          notes: 'Demo synthetic',
          createdAt: startTs.toISOString(),
          updatedAt: endTs.toISOString(),
          __synthetic: true,
        });
      }
    }
    const result = [...appointments, ...synthetic];
    console.log('🔍 Worklist: Total appointments after enrichment:', result.length, 'Original:', appointments.length, 'Synthetic:', synthetic.length);
    return result;
  }, [appointments, pivotNow]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAppointments().catch(() => {}),
          fetchPatients().catch(() => {})
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchAppointments, fetchPatients]);

  // Enhanced worklist data with patient info
  const worklistData = useMemo(() => {
    let filtered = displayAppointments.filter(appointment => {
      // Status filter
      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }
      
      // Date filter - use pivot date for consistent demo experience
      const apptDate = new Date(appointment.appointmentDate || appointment.startTime);
      const today = pivotNow;
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      switch (dateFilter) {
        case 'today':
          if (apptDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'tomorrow':
          if (apptDate.toDateString() !== tomorrow.toDateString()) return false;
          break;
        case 'this-week':
          if (apptDate < today || apptDate > nextWeek) return false;
          break;
        case 'past':
          if (apptDate >= today) return false;
          break;
        default:
          break;
      }
      
      // Modality filter
      if (modalityFilter !== 'all' && appointment.modality !== modalityFilter) {
        return false;
      }
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const patientName = patients.find(p => p.id === appointment.patientId)?.name || '';
        const matchesPatient = patientName.toLowerCase().includes(searchLower);
        const matchesId = appointment.id.toLowerCase().includes(searchLower);
        const matchesModality = appointment.modality?.toLowerCase().includes(searchLower);
        
        if (!matchesPatient && !matchesId && !matchesModality) {
          return false;
        }
      }
      
      return true;
    });

    // Sort by appointment time
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate || a.startTime);
      const dateB = new Date(b.appointmentDate || b.startTime);
      return dateA - dateB;
    });
    console.log('🔍 Worklist: Filtered appointments:', sorted.length, 'Filters:', { search, statusFilter, dateFilter, modalityFilter });
    return sorted;
  }, [displayAppointments, patients, search, statusFilter, dateFilter, modalityFilter, pivotNow]);

  // Calculate metrics for AI insights
  const metrics = useMemo(() => {
    const total = displayAppointments.length;
    const completed = displayAppointments.filter(a => a.status === 'completed').length;
    const inProgress = displayAppointments.filter(a => a.status === 'in-progress').length;
    const scheduled = displayAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
    const noShows = displayAppointments.filter(a => a.status === 'no-show').length;
    
    const utilizationPct = total > 0 ? (completed + inProgress) / total : 0;
    const noShowRate = total > 0 ? noShows / total : 0;
    
    return { utilizationPct, noShowRate, total, completed, inProgress, scheduled, noShows };
  }, [displayAppointments]);

  // Handle status updates
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Handle report upload
  const handleReportUpload = (report) => {
    console.log('Report uploaded:', report);
    // In a real app, this would update the appointment status and create a report record
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'no-show':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">No Show</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get patient name
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  if (loading) {
    return (
      <div className="col-span-12 p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Worklist</h1>
          <p className="text-muted-foreground">Manage appointments and patient flow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients, IDs..."
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            {/* Modality Filter */}
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Modality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modalities</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('today');
                setModalityFilter('all');
              }}
              className="border-gray-200 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Worklist Table */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="text-gray-900">Appointments ({worklistData.length})</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-4 w-4" />
                  {metrics.total} total • {metrics.completed} completed • {metrics.inProgress} in progress
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b bg-gray-50">
                      <th className="py-4 px-4 font-semibold">Time</th>
                      <th className="py-4 px-4 font-semibold">Patient</th>
                      <th className="py-4 px-4 font-semibold">Modality</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worklistData.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">
                            {new Date(appointment.appointmentDate || appointment.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(appointment.appointmentDate || appointment.startTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{getPatientName(appointment.patientId)}</div>
                          <div className="text-xs text-gray-500">ID: {appointment.patientId}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{appointment.modality}</div>
                          <div className="text-xs text-gray-500">{appointment.bodyPart}</div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Details */}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setViewingAppointment(appointment);
                                setViewModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {/* Status Actions */}
                            {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(appointment.id, 'in-progress')}
                                className="h-8 text-xs"
                              >
                                Check-in
                              </Button>
                            ) : null}
                            
                            {appointment.status === 'in-progress' ? (
                              <Button 
                                size="sm"
                                onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                className="h-8 text-xs"
                              >
                                Complete
                              </Button>
                            ) : null}
                            
                            {/* Upload Report */}
                            {appointment.status === 'completed' ? (
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setUploadModalOpen(true);
                                }}
                                className="h-8 text-xs"
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload
                              </Button>
                            ) : null}
                            
                            {/* Edit */}
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {worklistData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <Clock className="h-12 w-12 text-gray-300" />
                            <div className="text-lg font-medium">No appointments found</div>
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

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-1">
          <WorklistAIInsights 
            appointments={displayAppointments}
            utilizationPct={metrics.utilizationPct}
            noShowRate={metrics.noShowRate}
            pivotNow={pivotNow}
          />
        </div>
      </div>

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <ViewAppointmentModal
          appointment={viewingAppointment}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setViewingAppointment(null);
          }}
        />
      )}

      {/* Upload Report Modal */}
      {selectedAppointment && (
        <UploadReportModal
          appointment={selectedAppointment}
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedAppointment(null);
          }}
          onUpload={handleReportUpload}
        />
      )}
    </div>
  );
};

export default Worklist;
