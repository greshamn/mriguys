import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, TrendingUp, Clock, FileText, Users, Activity } from 'lucide-react';
import { useStore } from '../../store';
import { ReferrerSelector } from '../../components/ReferrerSelector';
import { getNow, setDemoDate } from '../../lib/utils';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import TATChart from '../../components/charts/TATChart';
import ModalitiesChart from '../../components/charts/ModalitiesChart';

export const ReferrerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpiRange, setKpiRange] = useState('7'); // '7' | '30' | '90'

  // Get data from Zustand store using memoized selectors
  const referrals = useStore(selectReferrals);
  const appointments = useStore(selectAppointments);
  const reports = useStore(selectReports);
  const patients = useStore(selectPatients);
  const selectedReferrerId = useStore(selectSelectedReferrerId);

  // Memoized filtered data calculations
  const referrerReferrals = useMemo(() => {
    return referrals.filter(ref => ref.referrerId === selectedReferrerId);
  }, [referrals, selectedReferrerId]);

  const referrerAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const referral = referrals.find(ref => ref.id === apt.referralId);
      return referral && referral.referrerId === selectedReferrerId;
    });
  }, [appointments, referrals, selectedReferrerId]);

  const referrerReports = useMemo(() => {
    return reports.filter(report => {
      const appointment = appointments.find(apt => apt.id === report.appointmentId);
      if (!appointment) return false;
      const referral = referrals.find(ref => ref.id === appointment.referralId);
      return referral && referral.referrerId === selectedReferrerId;
    });
  }, [reports, appointments, referrals, selectedReferrerId]);

  const referrerPatientCount = useMemo(() => {
    // Count unique patients from referrals to avoid dependence on full patients dataset
    const ids = new Set(referrerReferrals.map((r) => r.patientId));
    return ids.size;
  }, [referrerReferrals]);

  // Precompute TAT items for charts (appointment → report finalization)
  const tatItems = useMemo(() => {
    if (!referrerReports.length) return [];
    const formatDay = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return referrerReports.map((report) => {
      const apt = referrerAppointments.find((a) => a.id === report.appointmentId);
      const start = apt?.appointmentDate || apt?.startTime || report.createdAt;
      const end = report.finalizedAt || report.reportDate || apt?.endTime || report.updatedAt;
      const tatDays = start && end ? (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) : 2.2;
      return { date: formatDay(end || new Date()), tat: Math.max(0.5, parseFloat(tatDays.toFixed(1))) };
    });
  }, [referrerReports, referrerAppointments]);

  // KPI calculations - derive from live data (with sensible defaults)
  const kpis = useMemo(() => {
    // New results = finalized reports in last 7 days
    const now = getNow();
    const from = new Date(now);
    from.setDate(from.getDate() - parseInt(kpiRange));
    const newResults = referrerReports.filter((r) => {
      const when = new Date(r.finalizedAt || r.reportDate || r.updatedAt || r.createdAt);
      return (r.status === 'finalized' || r.status === 'completed') && when >= from;
    }).length;

    // Upcoming scans = scheduled appointments in the future
    const upcomingScans = referrerAppointments.filter((a) => {
      const when = new Date(a.appointmentDate || a.startTime || a.createdAt);
      return a.status === 'scheduled' && when > now;
    }).length;

    // Avg TAT from computed tat items
    const avgTAT = tatItems.length
      ? parseFloat((tatItems.reduce((s, i) => s + i.tat, 0) / tatItems.length).toFixed(1))
      : 0;

    // No-show rate
    const totalApts = referrerAppointments.length || 0;
    const noShows = referrerAppointments.filter((a) => a.status === 'no-show').length;
    const noShowRate = totalApts ? Math.round((noShows / totalApts) * 100) : 0;

    return { newResults, upcomingScans, avgTAT, noShowRate };
  }, [referrerReports, referrerAppointments, tatItems, kpiRange]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const store = useStore.getState();
        await Promise.all([
          store.fetchReferrals(),
          store.fetchAppointments(),
          store.fetchReports(),
          store.fetchPatients(),
          store.fetchProviders()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNewReferral = useCallback(() => {
    // TODO: Implement new referral flow
    console.log('New referral clicked');
  }, []);

  const handleViewReports = useCallback(() => {
    // TODO: Implement view reports flow
    console.log('View reports clicked');
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-6 p-6">
        <div className="col-span-12">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </div>
        
        {/* KPI Cards Skeleton */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted animate-pulse rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-80 bg-muted animate-pulse rounded" />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="h-80 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 p-6 space-y-8 max-w-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referrer Dashboard</h1>
          <p className="text-muted-foreground">Manage your referrals and track patient outcomes</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Demo Controls */}
          <div className="hidden md:flex items-center gap-2">
            <Select
              onValueChange={(val) => {
                const nowReal = new Date()
                let target = new Date(nowReal)
                if (val === 'today') target = nowReal
                if (val === 'minus7') target.setDate(target.getDate() - 7)
                if (val === 'minus30') target.setDate(target.getDate() - 30)
                if (val === 'plus14') target.setDate(target.getDate() + 14)
                if (val === 'plus60') target.setDate(target.getDate() + 60)
                setDemoDate(target)
                setLoading(true); setTimeout(() => setLoading(false), 0)
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Demo Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="minus7">- 7 days</SelectItem>
                <SelectItem value="minus30">- 30 days</SelectItem>
                <SelectItem value="plus14">+ 14 days</SelectItem>
                <SelectItem value="plus60">+ 60 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ReferrerSelector />
          <Button 
            onClick={handleNewReferral}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Referral
          </Button>
        </div>
      </div>

      {/* KPI Controls + Cards */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">KPI Range</div>
        <div className="flex items-center gap-2">
          <Button variant={kpiRange==='7'?'default':'outline'} size="sm" onClick={()=>setKpiRange('7')}>7d</Button>
          <Button variant={kpiRange==='30'?'default':'outline'} size="sm" onClick={()=>setKpiRange('30')}>30d</Button>
          <Button variant={kpiRange==='90'?'default':'outline'} size="sm" onClick={()=>setKpiRange('90')}>90d</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* New Results */}
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-100 text-sm font-medium">New Results</CardTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-200" />
              <span className="text-2xl font-bold">{kpis.newResults}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-sm">
              {kpis.newResults === 1 ? 'Report ready for review' : 'Reports ready for review'}
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Scans */}
        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-100 text-sm font-medium">Upcoming Scans</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-200" />
              <span className="text-2xl font-bold">{kpis.upcomingScans}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-emerald-100 text-sm">
              {kpis.upcomingScans === 1 ? 'Appointment scheduled' : 'Appointments scheduled'}
            </p>
          </CardContent>
        </Card>

        {/* Avg TAT */}
        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-100 text-sm font-medium">Avg TAT</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-200" />
              <span className="text-2xl font-bold">{kpis.avgTAT}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 text-sm">
              {kpis.avgTAT === 1 ? 'Day average' : 'Days average'}
            </p>
          </CardContent>
        </Card>

        {/* No-Show Rate */}
        <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-100 text-sm font-medium">No-Show Rate</CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-200" />
              <span className="text-2xl font-bold">{kpis.noShowRate}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-100 text-sm">Perfect attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Info Cards */}
        <div className="space-y-3 lg:col-span-1">
          {/* Patient Overview */}
          <Card className="py-0">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Patient Overview</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Your patient population</p>
            </CardHeader>
            <CardContent className="pt-2 pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary leading-none">{referrerPatientCount}</div>
                  <div className="text-xs text-muted-foreground">Total Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary leading-none">{referrerReferrals.length}</div>
                  <div className="text-xs text-muted-foreground">Total Referrals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Status */}
          <Card className="py-0">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Referral Status</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Current referral breakdown</p>
            </CardHeader>
            <CardContent className="pt-2 pb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">Pending</span>
                  </div>
                  <Badge variant="secondary">
                    {referrerReferrals.filter(ref => ref.status === 'pending').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs">Approved</span>
                  </div>
                  <Badge variant="secondary">
                    {referrerReferrals.filter(ref => ref.status === 'approved').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Completed</span>
                  </div>
                  <Badge variant="secondary">
                    {referrerReferrals.filter(ref => ref.status === 'completed').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Modalities Chart */}
        <div className="min-h-[400px] lg:col-span-2">
          <ModalitiesChart data={referrerReferrals} loading={loading} />
        </div>
      </div>

      {/* TAT Chart - Full Width */}
      <div className="min-h-[400px]">
        <TATChart data={tatItems} loading={loading} timeRange={kpiRange==='90'?'30':kpiRange} onChangeRange={(r)=>setKpiRange(r)} />
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleViewReports}>
          <FileText className="h-4 w-4 mr-2" />
          View Reports
        </Button>
        <Button onClick={handleNewReferral}>
          <Plus className="h-4 w-4 mr-2" />
          New Referral
        </Button>
      </div>
    </div>
  );
};

// Memoized selectors to prevent infinite loops
const EMPTY_ARRAY = [];

const selectReferrals = (state) => state.referrals || EMPTY_ARRAY;
const selectAppointments = (state) => state.appointments || EMPTY_ARRAY;
const selectReports = (state) => state.reports || EMPTY_ARRAY;
const selectPatients = (state) => state.patients || EMPTY_ARRAY;
const selectSelectedReferrerId = (state) => state.selectedReferrerId || 'provider-001';

export default ReferrerDashboard;
