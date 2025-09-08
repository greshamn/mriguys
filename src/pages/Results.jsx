import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FileText, Download, Search } from 'lucide-react';
import { AIInsightsButton } from '../components/public/AIInsightsButton';
import { ReportInsightsDrawer } from '../components/public/ReportInsightsDrawer';

const EMPTY_ARRAY = [];

const selectReports = (state) => Array.isArray(state?.reports) ? state.reports : EMPTY_ARRAY;
const selectPatients = (state) => Array.isArray(state?.patients) ? state.patients : EMPTY_ARRAY;
const selectCenters = (state) => Array.isArray(state?.centers) ? state.centers : EMPTY_ARRAY;
const selectSelectedPatientId = (state) => state?.selectedPatientId;

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [previewReport, setPreviewReport] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);

  const reports = useStore(selectReports);
  const patients = useStore(selectPatients);
  const centers = useStore(selectCenters);
  const selectedPatientId = useStore(selectSelectedPatientId);

  const [modality, setModality] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const store = useStore.getState();
        await Promise.all([
          store.fetchPatients && store.fetchPatients(),
          store.fetchCenters && store.fetchCenters(),
          store.fetchReports && store.fetchReports({ patientId: selectedPatientId || undefined })
        ]);
      } catch (e) {
        console.error('Failed to load results:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedPatientId]);

  const currentPatient = useMemo(() => {
    if (patients.length === 0) return { id: 'patient-001', name: 'Patient' };
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const filtered = useMemo(() => {
    let list = reports.filter(r => r.patientId === currentPatient.id);
    if (modality && modality !== 'all') list = list.filter(r => r.modality === modality);
    if (from) list = list.filter(r => new Date(r.reportDate) >= new Date(from));
    if (to) list = list.filter(r => new Date(r.reportDate) <= new Date(to));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.impression || '').toLowerCase().includes(q) ||
        (r.findings || '').toLowerCase().includes(q) ||
        (r.bodyPart || '').toLowerCase().includes(q) ||
        (r.modality || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
  }, [reports, currentPatient, modality, from, to, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const finalized = filtered.filter(r => r.status === 'finalized').length;
    const byModality = filtered.reduce((acc, r) => {
      acc[r.modality] = (acc[r.modality] || 0) + 1;
      return acc;
    }, {});
    const topModality = Object.entries(byModality).sort((a,b) => b[1]-a[1])[0]?.[0];
    const lastDate = filtered[0]?.reportDate ? formatDate(filtered[0].reportDate) : undefined;
    return { total, finalized, byModality, topModality, lastDate };
  }, [filtered]);

  const getCenterName = (id) => centers.find(c => c.id === id)?.name || 'Unknown Center';

  return (
    <>
      {/* Header */}
      <div className="col-span-12 mb-2">
        <h1 className="text-3xl font-bold text-foreground">My Results</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-muted-foreground">View and download your imaging reports</p>
          <AIInsightsButton onClick={() => setAiOpen(true)} recommendationsCount={filtered.length} />
        </div>
      </div>

      {/* Main Column */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Filters */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-card-foreground">Filters</CardTitle>
            <CardDescription>Refine your results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Modality</label>
                <Select value={modality} onValueChange={setModality}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="CT">CT</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Findings, impression..." className="pl-9" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">{loading ? 'Loading…' : `${filtered.length} Result${filtered.length !== 1 ? 's' : ''}`}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No results found for your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((r) => (
                  <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-card-foreground">{r.modality}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-sm text-muted-foreground">{r.bodyPart}</span>
                        <Badge variant="secondary" className="ml-1">{r.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {formatDate(r.reportDate)} • {getCenterName(r.centerId)}
                      </p>
                      {r.impression && (
                        <p className="text-sm mt-1 line-clamp-2 text-card-foreground/90">{r.impression}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:self-end sm:ml-4">
                      <Button size="sm" variant="outline" onClick={() => setPreviewReport(r)}>View</Button>
                      <Button size="sm" onClick={() => {
                        const url = r.reportPdfUrl || (r.attachments && r.attachments[0] ? `/files/${r.attachments[0]}` : '');
                        if (url) window.open(url, '_blank');
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Rail */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-card-foreground">Summary</CardTitle>
            <CardDescription>{currentPatient.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Results</span>
              <span className="font-semibold text-card-foreground">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Finalized</span>
              <span className="font-semibold text-card-foreground">{stats.finalized}</span>
            </div>
            <Separator />
            <div className="space-y-1">
              {Object.entries(stats.byModality).map(([m, n]) => (
                <div key={m} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{m}</span>
                  <span className="text-card-foreground">{n}</span>
                </div>
              ))}
              {Object.keys(stats.byModality).length === 0 && (
                <p className="text-sm text-muted-foreground">No modality data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewReport} onOpenChange={(open) => !open && setPreviewReport(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewReport ? `${previewReport.modality} • ${previewReport.bodyPart}` : 'Report'}</DialogTitle>
            <DialogDescription>
              {previewReport ? `${formatDate(previewReport.reportDate)} • ${getCenterName(previewReport.centerId)}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] bg-muted rounded-md overflow-hidden">
            <div className="w-full h-full overflow-y-auto bg-white text-foreground">
              {previewReport && (
                <DummyReport
                  report={previewReport}
                  patient={currentPatient}
                  centerName={getCenterName(previewReport.centerId)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Drawer */}
      <ReportInsightsDrawer 
        isOpen={aiOpen}
        onToggle={setAiOpen}
        insights={generateReportInsights(filtered)}
        summary={{ total: stats.total, finalized: stats.finalized, topModality: stats.topModality, lastDate: stats.lastDate }}
      />
    </>
  );
}

// Simple rule-based insights generator (offline, deterministic)
function generateReportInsights(reports) {
  if (!Array.isArray(reports) || reports.length === 0) return [];
  const insights = [];

  const modalities = reports.reduce((acc, r) => { acc[r.modality] = (acc[r.modality]||0)+1; return acc; }, {});
  const topModality = Object.entries(modalities).sort((a,b)=>b[1]-a[1])[0];
  if (topModality) {
    insights.push({
      icon: 'file',
      title: `${topModality[0]} findings overview`,
      details: `Most of your recent reports are ${topModality[0]} studies. This helps your care team focus follow-up on that modality.`,
      badges: [{ label: `${topModality[1]} reports` }]
    });
  }

  const hasImpressionRisk = reports.some(r => /herniation|tear|fracture|calcification|stenosis/i.test(r.impression || ''));
  if (hasImpressionRisk) {
    insights.push({
      icon: 'steth',
      title: 'Key findings detected',
      details: 'Some reports include notable findings (e.g., herniation, tears, or stenosis).',
      recommendation: 'Share these reports with your primary provider and consider scheduling a follow-up visit.'
    });
  }

  const newest = [...reports].sort((a,b)=>new Date(b.reportDate)-new Date(a.reportDate))[0];
  if (newest) {
    insights.push({
      icon: 'activity',
      title: 'Most recent report ready',
      details: `${new Date(newest.reportDate).toLocaleString('en-US', {dateStyle:'medium'})}: ${newest.modality} • ${newest.bodyPart}.`,
      badges: [{ label: newest.status || 'finalized', variant: 'outline' }],
      recommendation: newest.reportPdfUrl ? 'Open your latest report and review the impression summary first.' : undefined
    });
  }

  return insights;
}

// Dummy structured report component shown when no PDF is available
function DummyReport({ report, patient, centerName }) {
  const format = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="border-b border-border pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{centerName}</h2>
            <p className="text-sm text-muted-foreground">Radiology Report</p>
          </div>
          <div className="text-right text-sm">
            <div><span className="text-muted-foreground">Report Date:</span> {format(report.reportDate)}</div>
            <div><span className="text-muted-foreground">Accession:</span> {report.id || 'BP-000'}</div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <div className="text-muted-foreground">Patient</div>
          <div className="font-medium">{patient?.name || 'Patient'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Modality / Body Part</div>
          <div className="font-medium">{report.modality} • {report.bodyPart}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Status</div>
          <div className="font-medium capitalize">{report.status || 'finalized'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Ordering Provider</div>
          <div className="font-medium">N/A</div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Clinical History</h3>
        <p className="text-sm leading-relaxed text-card-foreground/90">
          {report.clinicalHistory || 'History of pain. Evaluation requested for suspected injury.'}
        </p>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Technique</h3>
        <p className="text-sm leading-relaxed text-card-foreground/90">
          {report.modality} examination performed with standard protocol sequences. Contrast not administered unless otherwise stated.
        </p>
      </section>

      {report.findings && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Findings</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">{report.findings}</p>
        </section>
      )}

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Impression</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {(report.impression ? report.impression.split(/\n+|;+/) : ['No acute abnormality identified.']).map((item, idx) => (
            <li key={idx}>{item.trim() || '—'}</li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
        Electronically signed by: Staff Radiologist
      </footer>
    </div>
  );
}

