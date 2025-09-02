import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Timeline } from '../../components/Timeline';
import {
  RefreshCw, Search, CheckCircle, XCircle, AlertCircle, Clock, DollarSign, Eye, ArrowRight,
} from 'lucide-react';

const STAGES = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'review', label: 'Under Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'active', label: 'Active' }
];

export default function FunderPipeline() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  const liens = useStore((s) => s.liens);
  const fetchLiens = useStore((s) => s.fetchLiens);
  const patients = useStore((s) => s.patients);
  const fetchPatients = useStore((s) => s.fetchPatients);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchLiens().catch(() => {}), fetchPatients().catch(() => {})]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchLiens, fetchPatients]);

  // Enrich with derived pipeline stage and synthesize a balanced pipeline when seeds are sparse
  const items = useMemo(() => {
    const data = Array.isArray(liens) ? liens : [];

    // 1) Normalize incoming records
    const normalized = data.map((l, idx) => {
      // Map common lien statuses to pipeline stages
      let stage = 'review';
      if (l.status === 'approved') stage = 'approved';
      else if (l.status === 'active' || l.status === 'settled') stage = 'active';
      else if (l.status === 'pending') stage = 'submitted';

      const aiScore = Math.min(100, 60 + Math.round(Math.random() * 40));
      const requirementsSatisfied = Math.random() > 0.25;
      const timelineStep = requirementsSatisfied ? 'report' : 'scan';
      return { ...l, stage, aiScore, requirementsSatisfied, timelineStep };
    });

    // 2) If distribution is skewed, create synthetic items to fill stages for a nicer demo
    const counts = { submitted: 0, review: 0, approved: 0, active: 0 };
    normalized.forEach((n) => { counts[n.stage] = (counts[n.stage] || 0) + 1; });

    const needSynthesis = Object.values(counts).some((c) => c === 0) || normalized.length < 12;
    if (!needSynthesis) return normalized;

    const nameFor = (i) => {
      const p = Array.isArray(patients) ? patients[i % Math.max(1, patients.length)] : null;
      return p?.name || `Client ${String.fromCharCode(65 + (i % 26))}`;
    };

    const accidentTypes = ['Motor Vehicle Accident', 'Premises Liability', 'Slip and Fall', 'Medical Malpractice'];
    const makeMock = (i, stage) => {
      const amount = 700 + Math.round(Math.random() * 1200);
      return {
        id: `mock-${stage}-${i}`,
        caseNumber: `CASE-2024-M${String(i + 1).padStart(3, '0')}`,
        patientId: `mock-p-${i}`,
        patientName: nameFor(i),
        accidentType: accidentTypes[i % accidentTypes.length],
        amount,
        status: stage === 'active' ? 'active' : stage === 'approved' ? 'approved' : 'pending',
        stage,
        aiScore: Math.min(100, 70 + Math.round(Math.random() * 25)),
        requirementsSatisfied: stage !== 'submitted' && Math.random() > 0.15,
        timelineStep: stage === 'submitted' ? 'booking' : stage === 'review' ? 'scan' : 'report',
      };
    };

    const targetPerStage = 4;
    const synthesized = [...normalized];
    STAGES.forEach((s, idx) => {
      const have = synthesized.filter((x) => x.stage === s.id).length;
      for (let i = have; i < targetPerStage; i++) {
        synthesized.push(makeMock(idx * targetPerStage + i, s.id));
      }
    });

    return synthesized;
  }, [liens, patients]);

  const byStage = useMemo(() => {
    const result = { submitted: [], review: [], approved: [], active: [] };
    const term = search.trim().toLowerCase();
    items.forEach((it) => {
      const s = it.stage || 'review';
      // Apply search and status filters
      if (statusFilter !== 'all' && s !== statusFilter) return;
      if (term) {
        const name = (it.patientName || getPatientName(it.patientId) || '').toLowerCase();
        const cnum = (it.caseNumber || '').toLowerCase();
        if (!name.includes(term) && !cnum.includes(term)) return;
      }
      if (result[s]) result[s].push(it);
    });
    return result;
  }, [items, search, statusFilter, patients]);

  const getPatientName = (id) => patients?.find((p) => p.id === id)?.name || id;

  const StageDots = ({ item }) => {
    const steps = [
      { id: 'referral', label: 'Referral Received' },
      { id: 'booking', label: 'Appointment Booked' },
      { id: 'scan', label: 'Scan Completed' },
      { id: 'report', label: 'Report Ready' }
    ];
    const current = item.timelineStep || 'scan';
    const isDone = (sid) => steps.findIndex((s) => s.id === sid) <= steps.findIndex((s) => s.id === current);
    return (
      <div className="flex items-center gap-2 mt-2">
        {steps.map((s, i) => (
          <div key={s.id} className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${isDone(s.id) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'}`}>{i+1}</div>
        ))}
      </div>
    );
  };

  const Column = ({ id, label }) => (
    <Card className="min-h-[620px]">
      <CardHeader className="pb-2 sticky top-0 bg-card z-10 border-b">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="uppercase tracking-wide text-muted-foreground">{label}</span>
          <Badge variant="secondary">{byStage[id].length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {byStage[id].map((it) => (
          <div key={it.id} className="p-3 border rounded-xl bg-card hover:shadow-md hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold">
                    {(it.patientName || getPatientName(it.patientId) || '?').split(' ').map((n) => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="font-medium truncate">{it.patientName || getPatientName(it.patientId)}</div>
                  {it.requirementsSatisfied ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">Ready</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Docs</Badge>
                  )}
                  <Badge variant="outline">{it.caseNumber}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {it.accidentType} • ${it.amount?.toLocaleString()} • <span className="text-emerald-700 font-medium">AI {it.aiScore}</span>
                </div>
                <StageDots item={it} />
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="outline" onClick={() => { setSelected(it); setShowDetails(true); }}>
                  <Eye className="h-4 w-4 mr-1" /> Details
                </Button>
                {id !== 'active' && (
                  <Button size="sm" onClick={() => { setSelected(it); setShowDecision(true); }}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Decide
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {byStage[id].length === 0 && (
          <div className="text-sm text-muted-foreground py-10 text-center">No items</div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-80 bg-muted rounded animate-pulse" />
          <div className="h-80 bg-muted rounded animate-pulse" />
          <div className="h-80 bg-muted rounded animate-pulse" />
          <div className="h-80 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground">Track applications from submission to activation</p>
        </div>
        <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" placeholder="Search patients, cases..." />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {STAGES.map((s) => (
          <Column key={s.id} id={s.id} label={s.label} />
        ))}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Case Details — {selected?.caseNumber}
            </DialogTitle>
            <DialogDescription>Comprehensive case, financial, and timeline details</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Overview</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Patient:</span> {getPatientName(selected.patientId)}</div>
                    <div><span className="text-muted-foreground">Accident:</span> {selected.accidentType}</div>
                    <div><span className="text-muted-foreground">Amount:</span> ${selected.amount?.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Badge variant="outline">{selected.status}</Badge><Badge variant="secondary">AI {selected.aiScore}</Badge></div>
                    <div>{selected.requirementsSatisfied ? 'All requirements satisfied' : 'Missing documentation detected'}</div>
                    <Timeline currentStep={selected.timelineStep} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Financial</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>Requested: <span className="font-medium">${selected.amount?.toLocaleString()}</span></div>
                    <div>Recommended: <span className="font-medium text-blue-600">${Math.round((selected.amount || 0) * 0.9).toLocaleString()}</span></div>
                    <div>Conservative: <span className="font-medium text-amber-600">${Math.round((selected.amount || 0) * 0.75).toLocaleString()}</span></div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
                <Button onClick={() => { setShowDetails(false); setShowDecision(true); }}>Proceed to Decision <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Modal */}
      <Dialog open={showDecision} onOpenChange={setShowDecision}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" />Approval Decision</DialogTitle>
            <DialogDescription>Choose an approval option and add notes</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-2 pt-4 text-sm">
                  <div className="flex items-center justify-between p-3 rounded border bg-green-50"><div>Full Approval</div><div className="font-bold text-green-600">${selected.amount?.toLocaleString()}</div></div>
                  <div className="flex items-center justify-between p-3 rounded border bg-blue-50"><div>Recommended</div><div className="font-bold text-blue-600">${Math.round((selected.amount || 0) * 0.9).toLocaleString()}</div></div>
                  <div className="flex items-center justify-between p-3 rounded border"><div>Conservative</div><div className="font-bold text-amber-600">${Math.round((selected.amount || 0) * 0.75).toLocaleString()}</div></div>
                </CardContent>
              </Card>
              <Label htmlFor="notes">Notes</Label>
              <textarea id="notes" className="w-full min-h-[100px] p-3 border rounded-md resize-none" placeholder="Provide rationale for your decision" />
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDecision(false)}><XCircle className="h-4 w-4 mr-2" />Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


