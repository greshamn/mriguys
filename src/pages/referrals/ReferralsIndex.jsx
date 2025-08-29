import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { useStore } from '../../store';

const ReferralsIndex = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [modality, setModality] = useState('all');
  const [search, setSearch] = useState('');

  // Load data once
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const s = useStore.getState();
      await Promise.all([
        s.fetchReferrals?.(),
        s.fetchAppointments?.(),
        s.fetchReports?.(),
        s.fetchCenters?.()
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const referrals = useStore(state => state.referrals || []);
  const appointments = useStore(state => state.appointments || []);
  const reports = useStore(state => state.reports || []);
  const centers = useStore(state => state.centers || []);
  const selectedReferrerId = useStore(state => state.selectedReferrerId || 'provider-001');

  const rows = useMemo(() => {
    const joined = referrals
      .filter(r => r.referrerId === selectedReferrerId)
      .map(r => {
        const apt = appointments.find(a => a.referralId === r.id);
        const rpt = reports.find(rep => rep.appointmentId === apt?.id);
        const center = centers.find(c => c.id === apt?.centerId || r.preferredCenterId);
        return {
          id: r.id,
          patientId: r.patientId,
          modality: r.modality,
          bodyPart: r.bodyPart,
          status: r.status,
          center: center?.name || '- ',
          updatedAt: rpt?.updatedAt || apt?.updatedAt || r.updatedAt || r.createdAt,
        };
      });

    return joined
      .filter(row => (status === 'all' ? true : row.status === status))
      .filter(row => (modality === 'all' ? true : row.modality === modality))
      .filter(row => (search ? (row.id?.toLowerCase().includes(search.toLowerCase()) || row.center?.toLowerCase().includes(search.toLowerCase())) : true))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [referrals, appointments, reports, centers, status, modality, search, selectedReferrerId]);

  return (
    <div className="col-span-12 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referrals</h1>
        <div className="text-sm text-muted-foreground">{loading ? 'Loading…' : `${rows.length} results`}</div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
            <div className="md:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Search</label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by referral id or center…" />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => { setStatus('all'); setModality('all'); setSearch(''); }}>Reset</Button>
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
                    <th className="text-left px-4 py-2">Modality</th>
                    <th className="text-left px-4 py-2">Body Part</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Center</th>
                    <th className="text-left px-4 py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>Loading…</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>No referrals match your filters.</td></tr>
                  ) : (
                    rows.map(r => (
                      <tr key={r.id} className="border-t border-border hover:bg-accent/40">
                        <td className="px-4 py-2 font-medium">{r.id}</td>
                        <td className="px-4 py-2">{r.modality}</td>
                        <td className="px-4 py-2">{r.bodyPart}</td>
                        <td className="px-4 py-2 capitalize">{r.status}</td>
                        <td className="px-4 py-2">{r.center}</td>
                        <td className="px-4 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-base">AI Suggestions</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon: ranked centers based on distance, TAT, and rating using MockAIService.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralsIndex;


