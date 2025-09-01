import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  DollarSign, 
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
  CreditCard,
  Receipt,
  Calendar,
  Users
} from 'lucide-react';
import { getNow } from '../lib/utils';

// AI Insights Component for Billing
const BillingAIInsights = ({ bills, appointments, revenuePct, pivotNow }) => {
  const insights = useMemo(() => {
    const suggestions = [];
    
    // Calculate billing metrics
    const totalBills = bills.length;
    const paidBills = bills.filter(b => b.status === 'paid').length;
    const overdueBills = bills.filter(b => b.status === 'overdue').length;
    const pendingBills = bills.filter(b => b.status === 'pending').length;
    
    const paymentRate = totalBills > 0 ? paidBills / totalBills : 0;
    const overdueRate = totalBills > 0 ? overdueBills / totalBills : 0;
    
    // Rule-based AI suggestions
    if (overdueRate > 0.2) {
      suggestions.push({
        icon: AlertCircle,
        title: 'High Overdue Rate',
        message: `${Math.round(overdueRate * 100)}% of bills are overdue. Consider implementing payment reminders or payment plans.`,
        priority: 'high'
      });
    }
    
    if (paymentRate < 0.7) {
      suggestions.push({
        icon: TrendingDown,
        title: 'Low Payment Rate',
        message: `Only ${Math.round(paymentRate * 100)}% payment rate. Review billing processes and consider early payment incentives.`,
        priority: 'medium'
      });
    }
    
    // Check for high-value overdue bills
    const highValueOverdue = bills.filter(b => 
      b.status === 'overdue' && b.total > 1000
    );
    
    if (highValueOverdue.length > 0) {
      const totalOverdue = highValueOverdue.reduce((sum, bill) => sum + bill.total, 0);
      suggestions.push({
        icon: DollarSign,
        title: 'High-Value Overdue Bills',
        message: `${highValueOverdue.length} high-value bills overdue ($${totalOverdue.toLocaleString()}). Prioritize collection efforts.`,
        priority: 'high'
      });
    }
    
    // Check for billing delays
    const recentAppointments = appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.startTime);
      const from = new Date(pivotNow); from.setDate(from.getDate() - 30);
      return apptDate >= from && a.status === 'completed';
    });
    
    const appointmentsWithoutBills = recentAppointments.filter(appt => {
      return !bills.some(bill => bill.appointmentId === appt.id);
    });
    
    if (appointmentsWithoutBills.length > 0) {
      suggestions.push({
        icon: Clock,
        title: 'Missing Bills',
        message: `${appointmentsWithoutBills.length} completed appointments without bills. Generate bills promptly to improve cash flow.`,
        priority: 'medium'
      });
    }
    
    // Check for average payment time
    const paidBillsWithDates = bills.filter(b => b.status === 'paid' && b.paidDate);
    if (paidBillsWithDates.length > 5) {
      const avgPaymentDays = paidBillsWithDates.reduce((sum, bill) => {
        const billedDate = new Date(bill.billingDate);
        const paidDate = new Date(bill.paidDate);
        return sum + (paidDate - billedDate) / (1000 * 60 * 60 * 24);
      }, 0) / paidBillsWithDates.length;
      
      if (avgPaymentDays > 30) {
        suggestions.push({
          icon: Calendar,
          title: 'Slow Payment Cycle',
          message: `Average payment time is ${Math.round(avgPaymentDays)} days. Consider early payment discounts or stricter terms.`,
          priority: 'medium'
        });
      }
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }, [bills, appointments, revenuePct, pivotNow]);

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
            No billing optimization suggestions at this time.
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

// Bill Details Modal Component
const BillModal = ({ bill, isOpen, onClose, patients, appointments }) => {
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  const getAppointmentInfo = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    return appointment ? {
      date: new Date(appointment.appointmentDate || appointment.startTime).toLocaleDateString(),
      modality: appointment.modality,
      bodyPart: appointment.bodyPart
    } : null;
  };

  if (!bill) return null;

  const appointmentInfo = getAppointmentInfo(bill.appointmentId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bill Details - {bill.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Bill Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Bill ID</Label>
              <div className="text-sm">{bill.id}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="text-sm">
                <Badge variant={
                  bill.status === 'paid' ? 'default' : 
                  bill.status === 'overdue' ? 'destructive' : 'outline'
                }>
                  {bill.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
              <div className="text-sm">{getPatientName(bill.patientId)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
              <div className="text-lg font-bold text-green-600">${bill.total?.toLocaleString()}</div>
            </div>
          </div>

          {/* Appointment Info */}
          {appointmentInfo && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground">Appointment Details</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="text-sm">{appointmentInfo.date}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Modality</div>
                  <div className="text-sm">{appointmentInfo.modality}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Body Part</div>
                  <div className="text-sm">{appointmentInfo.bodyPart}</div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Details */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-muted-foreground">Billing Details</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="text-xs text-muted-foreground">Billing Date</div>
                <div className="text-sm">{new Date(bill.billingDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Due Date</div>
                <div className="text-sm">{new Date(bill.dueDate).toLocaleDateString()}</div>
              </div>
              {bill.paidDate && (
                <div>
                  <div className="text-xs text-muted-foreground">Paid Date</div>
                  <div className="text-sm">{new Date(bill.paidDate).toLocaleDateString()}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground">Insurance Amount</div>
                <div className="text-sm">${bill.insuranceAmount?.toLocaleString() || '0'}</div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {bill.lineItems && bill.lineItems.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground">Line Items</Label>
              <div className="mt-2 space-y-2">
                {bill.lineItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div>
                      <div className="text-sm font-medium">{item.description}</div>
                      <div className="text-xs text-muted-foreground">{item.code}</div>
                    </div>
                    <div className="text-sm">${item.amount?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Billing Component
const Billing = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Store hooks
  const bills = useStore((s) => s.bills);
  const fetchBills = useStore((s) => s.fetchBills);
  const patients = useStore((s) => s.patients);
  const fetchPatients = useStore((s) => s.fetchPatients);
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);

  // Pivot date: use current demo date; if no nearby data, pivot to nearest bill day
  const pivotNow = useMemo(() => {
    const now = getNow();
    console.log('🔍 Billing: Current date from getNow():', now.toISOString());
    if (!bills.length) return now;
    // Find nearest bill within ±14 days
    let nearest = null;
    let bestDelta = Infinity;
    bills.forEach((b) => {
      const t = new Date(b.billingDate);
      const delta = Math.abs(t.getTime() - now.getTime());
      if (delta < bestDelta) { bestDelta = delta; nearest = t; }
    });
    if (!nearest) return now;
    const days = Math.abs((nearest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const result = days <= 14 ? nearest : now;
    console.log('🔍 Billing: Pivot date set to:', result.toISOString());
    return result;
  }, [bills]);

  // Demo enrichment: synthesize additional bills near the pivot date
  const displayBills = useMemo(() => {
    const now = pivotNow;
    // If we already have ample data in the last 30 days, use it as-is
    const realWindow = bills.filter((b) => {
      const t = new Date(b.billingDate);
      const from = new Date(now); from.setDate(from.getDate() - 30);
      return t >= from && t <= now;
    });
    if (realWindow.length >= 20) return bills;

    // Build synthetic bills for the surrounding 4 weeks
    const patients = ['patient-001','patient-002','patient-003','patient-004','patient-005'];
    const appointments = ['apt-001','apt-002','apt-003','apt-004','apt-005'];
    const synthetic = [];
    
    for (let offset = -14; offset <= 14; offset++) {
      const date = new Date(now); date.setDate(now.getDate() + offset);
      const dow = date.getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 || dow === 6) continue; // weekdays only
      
      // Create 1-3 bills per day
      const billsPerDay = (offset + dow) % 3 + 1;
      for (let i = 0; i < billsPerDay; i++) {
        const patientId = patients[(offset + i) % patients.length];
        const appointmentId = appointments[(offset + i) % appointments.length];
        const total = Math.floor(Math.random() * 2000) + 500; // $500-$2500
        const insuranceAmount = Math.floor(total * (0.6 + Math.random() * 0.3)); // 60-90% coverage
        const patientResponsibility = total - insuranceAmount;
        
        // Deterministic pattern for status
        const key = `${offset}-${i}-${dow}`;
        const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        let status = 'pending';
        if (date < now) {
          status = hash % 4 === 0 ? 'paid' : hash % 4 === 1 ? 'overdue' : hash % 4 === 2 ? 'pending' : 'cancelled';
        }
        
        const billingDate = new Date(date);
        const dueDate = new Date(billingDate); dueDate.setDate(dueDate.getDate() + 30);
        const paidDate = status === 'paid' ? new Date(billingDate.getTime() + (hash % 30 + 1) * 24 * 60 * 60 * 1000) : null;
        
        synthetic.push({
          id: `bill-${date.toISOString().slice(0,10)}-${i}`,
          patientId,
          appointmentId,
          total,
          insuranceAmount,
          patientResponsibility,
          status,
          billingDate: billingDate.toISOString(),
          dueDate: dueDate.toISOString(),
          paidDate: paidDate?.toISOString(),
          lineItems: [
            {
              code: '70551',
              description: 'MRI Brain without contrast',
              amount: Math.floor(total * 0.7)
            },
            {
              code: '70552',
              description: 'MRI Brain with contrast',
              amount: Math.floor(total * 0.3)
            }
          ],
          createdAt: billingDate.toISOString(),
          updatedAt: new Date().toISOString(),
          __synthetic: true,
        });
      }
    }
    
    const result = [...bills, ...synthetic];
    console.log('🔍 Billing: Total bills after enrichment:', result.length, 'Original:', bills.length, 'Synthetic:', synthetic.length);
    return result;
  }, [bills, pivotNow]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBills().catch(() => {}),
          fetchPatients().catch(() => {}),
          fetchAppointments().catch(() => {})
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchBills, fetchPatients, fetchAppointments]);

  // Filtered bills data
  const filteredBills = useMemo(() => {
    let filtered = displayBills.filter(bill => {
      // Status filter
      if (statusFilter !== 'all' && bill.status !== statusFilter) {
        return false;
      }
      
      // Date filter
      const billDate = new Date(bill.billingDate);
      const today = pivotNow;
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
      const lastMonth = new Date(today); lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      switch (dateFilter) {
        case 'today':
          if (billDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'this-week':
          if (billDate < today || billDate > nextWeek) return false;
          break;
        case 'this-month':
          if (billDate < lastMonth || billDate > today) return false;
          break;
        case 'overdue':
          if (bill.status !== 'overdue') return false;
          break;
        default:
          break;
      }
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const patientName = patients.find(p => p.id === bill.patientId)?.name || '';
        const matchesPatient = patientName.toLowerCase().includes(searchLower);
        const matchesBillId = bill.id.toLowerCase().includes(searchLower);
        
        if (!matchesPatient && !matchesBillId) {
          return false;
        }
      }
      
      return true;
    });

    // Sort by billing date (newest first)
    const sorted = filtered.sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate));
    console.log('🔍 Billing: Filtered bills:', sorted.length, 'Filters:', { search, statusFilter, dateFilter });
    return sorted;
  }, [displayBills, patients, search, statusFilter, dateFilter, pivotNow]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const total = displayBills.length;
    const paid = displayBills.filter(b => b.status === 'paid').length;
    const pending = displayBills.filter(b => b.status === 'pending').length;
    const overdue = displayBills.filter(b => b.status === 'overdue').length;
    const cancelled = displayBills.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = displayBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const paidRevenue = displayBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.total || 0), 0);
    const overdueAmount = displayBills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + (b.total || 0), 0);
    const pendingAmount = displayBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.total || 0), 0);
    
    const paymentRate = total > 0 ? paid / total : 0;
    const overdueRate = total > 0 ? overdue / total : 0;
    
    return {
      total,
      paid,
      pending,
      overdue,
      cancelled,
      totalRevenue,
      paidRevenue,
      overdueAmount,
      pendingAmount,
      paymentRate,
      overdueRate
    };
  }, [displayBills]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || patientId;
  };

  if (loading) {
    return (
      <div className="col-span-12 p-6 space-y-6">
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
    <div className="col-span-12 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
          <p className="text-muted-foreground">Manage patient bills and revenue tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {kpiMetrics.total} total bills
            </p>
          </CardContent>
        </Card>

        {/* Paid Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${kpiMetrics.paidRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(kpiMetrics.paymentRate * 100)}% payment rate
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${(kpiMetrics.pendingAmount + kpiMetrics.overdueAmount).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {kpiMetrics.pending + kpiMetrics.overdue} bills pending
            </p>
          </CardContent>
        </Card>

        {/* Overdue Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${kpiMetrics.overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {kpiMetrics.overdue} overdue bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills, patients..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="overdue">Overdue Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bills Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Bills ({filteredBills.length})</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {kpiMetrics.total} total • {kpiMetrics.paid} paid • {kpiMetrics.overdue} overdue
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3 px-2">Bill ID</th>
                      <th className="py-3 px-2">Patient</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Billing Date</th>
                      <th className="py-3 px-2">Due Date</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="font-medium">{bill.id}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">{getPatientName(bill.patientId)}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">${bill.total?.toLocaleString()}</div>
                          {bill.insuranceAmount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Insurance: ${bill.insuranceAmount?.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(bill.status)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {new Date(bill.billingDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </div>
                          {bill.status === 'overdue' && (
                            <div className="text-xs text-red-600">
                              {Math.ceil((new Date() - new Date(bill.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedBill(bill);
                                setBillModalOpen(true);
                              }}
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
                    {filteredBills.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Receipt className="h-8 w-8" />
                            <div>No bills found</div>
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
          <BillingAIInsights 
            bills={displayBills}
            appointments={appointments}
            revenuePct={kpiMetrics.paymentRate}
            pivotNow={pivotNow}
          />
        </div>
      </div>

      {/* Bill Details Modal */}
      <BillModal
        bill={selectedBill}
        isOpen={billModalOpen}
        onClose={() => {
          setBillModalOpen(false);
          setSelectedBill(null);
        }}
        patients={patients}
        appointments={appointments}
      />
    </div>
  );
};

export default Billing;
