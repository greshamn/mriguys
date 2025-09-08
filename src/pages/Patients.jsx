import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import KPICard from '../components/KPICard';
import { Sparkles, UserPlus, Building2, FileText, Calendar as CalendarIcon, Download, ArrowRight, Check } from 'lucide-react';

// Referrer Patients Page per PRD (worklist + KPIs + AI tips)
const Patients = () => {
  const s = useStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modality, setModality] = useState('all');
  const [bodyPart, setBodyPart] = useState('all');
  const [pipOnly, setPipOnly] = useState('all');
  const [centerId, setCenterId] = useState('all');
  
  // Reassignment modal state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignPatient, setReassignPatient] = useState(null);
  const [reassignStep, setReassignStep] = useState(1); // 1: Choose type, 2: Choose center
  const [selectedReassignType, setSelectedReassignType] = useState('');
  const [selectedReassignCenter, setSelectedReassignCenter] = useState('');

  // Load data from MSW via slices
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        s.fetchPatients?.(),
        s.fetchReferrals?.(),
        s.fetchAppointments?.(),
        s.fetchReports?.(),
        s.fetchCenters?.(),
        s.fetchBodyParts?.(),
      ]);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patients = useStore(state => state.patients || []);
  const referrals = useStore(state => state.referrals || []);
  const appointments = useStore(state => state.appointments || []);
  const reports = useStore(state => state.reports || []);
  const centers = useStore(state => state.centers || []);
  const bodyPartsOptions = useStore(state => state.bodyParts || []);

  // Build joined rows: one row per active patient/referral
  const rows = useMemo(() => {
    const byPatient = patients.map(p => {
      const patientReferrals = referrals.filter(r => r.patientId === p.id);
      const active = patientReferrals[0];
      const apt = active ? appointments.find(a => a.referralId === active.id) : undefined;
      const rpt = apt ? reports.find(rep => rep.appointmentId === apt.id) : undefined;
      const center = centers.find(c => c.id === (apt?.centerId || active?.preferredCenterId));

      const statusVal = rpt?.status ? 'Report Ready' : (apt?.status ? apt.status : (active?.status || 'draft'));

      return {
        id: p.id,
        name: p.name,
        pipFlag: !!p.pipFlag,
        modality: active?.modality,
        bodyPart: active?.bodyPart,
        status: statusVal,
        centerId: center?.id,
        centerName: center?.name,
        appointmentAt: apt?.startTime || apt?.scheduledAt,
        reportUrl: rpt?.reportPdfUrl,
        referralId: active?.id,
      };
    });

    const filtered = byPatient
      .filter(r => (search ? (r.name?.toLowerCase().includes(search.toLowerCase()) || r.id?.toLowerCase().includes(search.toLowerCase())) : true))
      .filter(r => (pipOnly === 'pip' ? r.pipFlag : pipOnly === 'nonpip' ? !r.pipFlag : true))
      .filter(r => (status === 'all' ? true : (r.status || '').toLowerCase() === status))
      .filter(r => (modality === 'all' ? true : r.modality === modality))
      .filter(r => (bodyPart === 'all' ? true : r.bodyPart === bodyPart))
      .filter(r => (centerId === 'all' ? true : r.centerId === centerId));

    return filtered;
  }, [patients, referrals, appointments, reports, centers, search, pipOnly, status, modality, bodyPart, centerId]);

  // KPI computations
  const kpis = useMemo(() => {
    const total = rows.length;
    const upcoming = rows.filter(r => r.appointmentAt && new Date(r.appointmentAt) > new Date()).length;
    const reportReady = rows.filter(r => r.reportUrl).length;
    const noShowRate = '3.2%'; // mocked metric per PRD demo
    const avgTAT = '24h'; // mocked metric
    return { total, upcoming, reportReady, noShowRate, avgTAT };
  }, [rows]);

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setModality('all');
    setBodyPart('all');
    setPipOnly('all');
    setCenterId('all');
  };

  // Reassignment handlers
  const handleReassignClick = (patient) => {
    setReassignPatient(patient);
    setReassignModalOpen(true);
    setReassignStep(1);
    setSelectedReassignType('');
    setSelectedReassignCenter('');
  };

  const handleReassignTypeSelect = (type) => {
    setSelectedReassignType(type);
    if (type === 'mri-guys') {
      // Direct assignment to MRI Guys
      handleConfirmReassign();
    } else {
      // Move to step 2: Choose imaging center
      setReassignStep(2);
    }
  };

  const handleConfirmReassign = () => {
    if (selectedReassignType === 'mri-guys') {
      // Handle MRI Guys assignment
      console.log('Reassigning to MRI Guys:', reassignPatient);
      // TODO: Implement actual reassignment logic
    } else if (selectedReassignType === 'imaging-center' && selectedReassignCenter) {
      // Handle imaging center assignment
      console.log('Reassigning to imaging center:', selectedReassignCenter, 'for patient:', reassignPatient);
      // TODO: Implement actual reassignment logic
    }
    
    // Close modal and reset state
    setReassignModalOpen(false);
    setReassignPatient(null);
    setReassignStep(1);
    setSelectedReassignType('');
    setSelectedReassignCenter('');
  };

  const handleCancelReassign = () => {
    setReassignModalOpen(false);
    setReassignPatient(null);
    setReassignStep(1);
    setSelectedReassignType('');
    setSelectedReassignCenter('');
  };

  return (
    <div className="col-span-12 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {loading ? 'Loading…' : `${rows.length} results`}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Active Patients" value={kpis.total} change="+2 this week" changeType="positive" />
        <KPICard title="Upcoming Scans" value={kpis.upcoming} change="+1 today" changeType="positive" />
        <KPICard title="Results Ready" value={kpis.reportReady} change="review now" changeType="neutral" />
        <KPICard title="No‑show Rate" value={kpis.noShowRate} change="-1.2% vs last wk" changeType="positive" />
        <KPICard title="Avg TAT" value={kpis.avgTAT} change="24/30d" changeType="neutral" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Search</label>
              <Input placeholder="Search name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Booked</SelectItem>
                  <SelectItem value="in-progress">In‑progress</SelectItem>
                  <SelectItem value="report ready">Report Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Modality</label>
              <Select value={modality} onValueChange={setModality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="CT">CT</SelectItem>
                  <SelectItem value="X-Ray">X‑Ray</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Body Part</label>
              <Select value={bodyPart} onValueChange={setBodyPart}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {bodyPartsOptions.slice(0, 20).map(bp => (
                    <SelectItem key={bp.id} value={bp.name || bp.id}>{bp.name || bp.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">PIP</label>
              <Select value={pipOnly} onValueChange={setPipOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pip">PIP Only</SelectItem>
                  <SelectItem value="nonpip">Exclude PIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Center</label>
              <Select value={centerId} onValueChange={setCenterId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {centers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
              <Button asChild>
                <a href="/referral" className="inline-flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> New Referral
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Worklist + AI Tips */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-base">Worklist</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Patient</th>
                    <th className="text-left px-4 py-2">Exam</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Appointment</th>
                    <th className="text-left px-4 py-2">Center</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>Loading…</td></tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                        No patients match your filters. <a href="/referral" className="text-primary underline">Create a new referral</a>.
                      </td>
                    </tr>
                  ) : (
                    rows.map(r => (
                      <tr key={r.id} className="border-t border-border hover:bg-accent/40">
                        <td className="px-4 py-2">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.id}{r.pipFlag ? ' • PIP' : ''}</div>
                        </td>
                        <td className="px-4 py-2">{r.modality || '-'} {r.bodyPart ? `• ${r.bodyPart}` : ''}</td>
                        <td className="px-4 py-2">
                          <Badge variant="secondary" className="capitalize">{r.status || '-'}</Badge>
                        </td>
                        <td className="px-4 py-2">{r.appointmentAt ? new Date(r.appointmentAt).toLocaleString() : '—'}</td>
                        <td className="px-4 py-2">{r.centerName || '—'}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm"><a href="/referral"><CalendarIcon className="w-3.5 h-3.5" /> Rebook</a></Button>
                            {r.centerId && (
                              <Button variant="outline" size="sm" onClick={() => handleReassignClick(r)}>
                                <Building2 className="w-3.5 h-3.5" /> Reassign
                              </Button>
                            )}
                            {r.reportUrl ? (
                              <Button asChild size="sm"><a href={r.reportUrl} target="_blank" rel="noreferrer"><Download className="w-3.5 h-3.5" /> Results</a></Button>
                            ) : (
                              <Button asChild variant="secondary" size="sm"><a href="/results"><FileText className="w-3.5 h-3.5" /> Pending</a></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right rail: AI insights (mocked heuristics) */}
        <div className="col-span-12 xl:col-span-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div className="font-semibold">AI Insights</div>
              </div>
              <div className="text-xs opacity-90">Best center suggestions • Risk flags • Next best action</div>
            </div>
            <CardContent className="space-y-2 pt-4">
              {/* Best centers suggestion (mock) */}
              <div className="p-3 rounded border border-purple-200 bg-purple-50">
                <div className="text-sm font-medium text-purple-900">Best Center Suggestion</div>
                <div className="text-xs text-purple-800">Based on TAT, rating, distance</div>
                <div className="mt-2 text-sm">Try <span className="font-medium">Downtown Imaging</span> for 2 unbooked MRI referrals</div>
                <a href="/centers" className="inline-flex items-center gap-1 text-purple-700 text-xs mt-2">Open Finder <ArrowRight className="w-3 h-3" /></a>
              </div>

              {/* Risk flags */}
              <div className="p-3 rounded border border-amber-200 bg-amber-50">
                <div className="text-sm font-medium text-amber-900">Risk Flags</div>
                <div className="text-xs text-amber-800">Contraindications or no‑show risk</div>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {rows.filter(r => r.modality === 'MRI').slice(0, 2).map(r => (
                    <li key={r.id}>Complete safety questions for {r.name}</li>
                  ))}
                  {rows.filter(r => r.modality === 'MRI').length === 0 && (
                    <li className="text-muted-foreground">No current risks detected</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="p-3 rounded border border-green-200 bg-green-50">
                <div className="text-sm font-medium text-green-900">Next‑Best Actions</div>
                <ul className="list-disc pl-5 mt-2 text-sm text-green-900">
                  <li>Review {kpis.reportReady} results ready today</li>
                  <li>Reassign 1 patient to earlier slot at Downtown Imaging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reassignment Modal */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Patient</DialogTitle>
            <DialogDescription>
              {reassignPatient && `Reassign ${reassignPatient.patientName} to a different provider`}
            </DialogDescription>
          </DialogHeader>
          
          {reassignStep === 1 && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Choose assignment type:</div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleReassignTypeSelect('mri-guys')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Assign to MRI Guys</div>
                      <div className="text-sm text-muted-foreground">Internal MRI Guys team will handle this case</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleReassignTypeSelect('imaging-center')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Assign to Imaging Center</div>
                      <div className="text-sm text-muted-foreground">Choose from available imaging centers</div>
                    </div>
                  </div>
                </Button>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancelReassign}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {reassignStep === 2 && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Select Imaging Center:</div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {centers.map((center) => (
                  <div
                    key={center.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReassignCenter === center.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedReassignCenter(center.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{center.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {center.address.city}, {center.address.state}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Rating: {center.rating}/5 • TAT: {center.avgTat} days
                        </div>
                      </div>
                      {selectedReassignCenter === center.id && (
                        <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setReassignStep(1)}>
                  Back
                </Button>
                <Button variant="outline" onClick={handleCancelReassign}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmReassign}
                  disabled={!selectedReassignCenter}
                >
                  Confirm Reassignment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;


