import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { useStore } from '../../store';
import { Badge } from '../../components/ui/badge';
import { Sparkles } from 'lucide-react';

const ReferralsIndex = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [modality, setModality] = useState('all');
  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('all');
  const [centerId, setCenterId] = useState('all');
  const [updatedRange, setUpdatedRange] = useState('all'); // days

  // Load data once
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const s = useStore.getState();
      await Promise.all([
        s.fetchReferrals?.(),
        s.fetchAppointments?.(),
        s.fetchReports?.(),
        s.fetchCenters?.(),
        s.fetchPatients?.()
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const referrals = useStore(state => state.referrals || []);
  const appointments = useStore(state => state.appointments || []);
  const reports = useStore(state => state.reports || []);
  const centers = useStore(state => state.centers || []);
  const patients = useStore(state => state.patients || []);
  const bodyParts = useStore(state => state.bodyParts || []);
  const selectedReferrerId = useStore(state => state.selectedReferrerId || 'provider-001');

  const rows = useMemo(() => {
    const joined = referrals
      .map(r => {
        const apt = appointments.find(a => a.referralId === r.id);
        const rpt = reports.find(rep => rep.appointmentId === apt?.id);
        const center = centers.find(c => c.id === apt?.centerId || r.preferredCenterId);
        const patient = patients.find(p => p.id === r.patientId);
        return {
          id: r.id,
          referrerId: r.referrerId,
          patientId: r.patientId,
          patientName: patient?.name,
          modality: r.modality,
          bodyPart: r.bodyPart,
          status: r.status,
          centerId: center?.id,
          center: center?.name || '- ',
          appointmentAt: apt?.startTime || apt?.scheduledAt,
          reportId: rpt?.id,
          reportUrl: rpt?.reportPdfUrl,
          updatedAt: rpt?.updatedAt || apt?.updatedAt || r.updatedAt || r.createdAt,
        };
      });

    const withinDays = (dateStr, days) => {
      if (!dateStr) return true;
      if (days === 'all') return true;
      const d = new Date(dateStr);
      const now = new Date();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= Number(days);
    };

    return joined
      .filter(row => (status === 'all' ? true : row.status === status))
      .filter(row => (modality === 'all' ? true : row.modality === modality))
      .filter(row => (bodyPart === 'all' ? true : row.bodyPart === bodyPart))
      .filter(row => (centerId === 'all' ? true : row.centerId === centerId))
      .filter(row => (search ? (row.id?.toLowerCase().includes(search.toLowerCase()) || row.center?.toLowerCase().includes(search.toLowerCase())) : true))
      .filter(row => withinDays(row.updatedAt, updatedRange))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [referrals, appointments, reports, centers, patients, status, modality, bodyPart, centerId, updatedRange, search, selectedReferrerId]);

  return (
    <div className="col-span-12 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referrals</h1>
        <div className="text-sm text-muted-foreground">{loading ? 'Loading…' : `${rows.length} results`}</div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <SelectItem value="X-Ray">X-Ray</SelectItem>
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
                  {bodyParts.slice(0, 20).map(bp => (
                    <SelectItem key={bp.id} value={bp.name || bp.id}>{bp.name || bp.id}</SelectItem>
                  ))}
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
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Updated Within</label>
              <Select value={updatedRange} onValueChange={setUpdatedRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Search</label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by referral id or center…" />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => { setStatus('all'); setModality('all'); setBodyPart('all'); setCenterId('all'); setUpdatedRange('all'); setSearch(''); }}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main grid: table + right rail (AI suggestions placeholder) */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-base">Worklist</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Referral</th>
                    <th className="text-left px-4 py-2">Patient</th>
                    <th className="text-left px-4 py-2">Exam</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Appointment</th>
                    <th className="text-left px-4 py-2">Center</th>
                    <th className="text-left px-4 py-2">Report</th>
                    <th className="text-left px-4 py-2">Updated</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan={9}>Loading…</td></tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={9}>
                        No referrals match your filters. <a href="/referral" className="text-primary underline">Create a new referral</a>.
                      </td>
                    </tr>
                  ) : (
                    rows.map(r => (
                      <tr key={r.id} className="border-t border-border hover:bg-accent/40">
                        <td className="px-4 py-2 font-medium">{r.id}</td>
                        <td className="px-4 py-2">
                          {r.patientName || r.patientId}
                          {r.patientName && (
                            <span className="text-xs text-muted-foreground block">{r.patientId}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{r.modality} • {r.bodyPart}</td>
                        <td className="px-4 py-2">
                          <Badge className="capitalize" variant="secondary">{r.status}</Badge>
                        </td>
                        <td className="px-4 py-2">{r.appointmentAt ? new Date(r.appointmentAt).toLocaleString() : '-'}</td>
                        <td className="px-4 py-2">{r.center}</td>
                        <td className="px-4 py-2">
                          {r.reportUrl ? (
                            <a href={r.reportUrl} target="_blank" rel="noreferrer" className="text-primary underline">View report</a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm"><a href={`/referral`}>Rebook</a></Button>
                            {r.reportUrl && (
                              <Button asChild size="sm"><a href={r.reportUrl} target="_blank" rel="noreferrer">Download</a></Button>
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

        <div className="col-span-12 xl:col-span-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 text-white p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div className="font-semibold">AI Insights</div>
              </div>
              <div className="text-xs opacity-90">Ranked suggestions from MockAIService</div>
            </div>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Unbooked referrals (mock):</p>
              <ul className="list-disc pl-5 text-sm">
                {rows
                  .filter(r => !r.appointmentAt)
                  .slice(0, 3)
                  .map(r => (
                    <li key={r.id}>
                      {r.id} — try top recommended center for {r.modality} • {r.bodyPart}
                    </li>
                  ))}
                {rows.filter(r => !r.appointmentAt).length === 0 && (
                  <li className="text-muted-foreground">All set — no unbooked referrals.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralsIndex;


