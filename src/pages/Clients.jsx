import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import {
  Users,
  Activity,
  CalendarDays,
  HeartPulse,
  ClipboardList,
  AlertCircle,
  Search,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  FileText,
  Shield,
  Star,
  Download,
  Eye,
  Copy,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

export default function Clients() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const patients = useStore((s) => s.patients);
  const fetchPatients = useStore((s) => s.fetchPatients);
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);
  const reports = useStore((s) => s.reports);
  const fetchReports = useStore((s) => s.fetchReports);
  const liens = useStore((s) => s.liens);
  const fetchLiens = useStore((s) => s.fetchLiens);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPatients().catch(() => {}),
          fetchAppointments().catch(() => {}),
          fetchReports().catch(() => {}),
          fetchLiens().catch(() => {}),
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchPatients, fetchAppointments, fetchReports, fetchLiens]);

  // Derived per-patient stats
  const clients = useMemo(() => {
    const pts = patients || [];
    return pts.map((p, idx) => {
      const aps = (appointments || []).filter((a) => a.patientId === p.id);
      const reps = (reports || []).filter((r) => {
        const ap = (appointments || []).find((a) => a.id === r.appointmentId);
        return ap && ap.patientId === p.id;
      });
      const hasUpcoming = aps.some((a) => String(a.status).toLowerCase() !== 'completed');
      const lien = (liens || []).find((l) => l.patientId === p.id);
      // Simple risk heuristic per PRD idea: no-show risk if no upcoming + no report
      const risk = reps.length === 0 || aps.length === 0 ? 'high' : hasUpcoming ? 'low' : 'medium';
      return {
        id: p.id,
        name: p.name || `Client ${idx + 1}`,
        email: p.email || 'client@example.com',
        phone: p.phone || '(305) 555-1212',
        address: p.address?.city ? `${p.address.city}, ${p.address.state || 'FL'}` : 'Miami, FL',
        appointments: aps.length,
        reports: reps.length,
        upcoming: hasUpcoming,
        risk,
        lienAmount: lien?.amount || 0,
      };
    });
  }, [patients, appointments, reports, liens]);

  const filtered = useMemo(() => {
    let list = clients;
    if (riskFilter !== 'all') list = list.filter((c) => c.risk === riskFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.address.toLowerCase().includes(s));
    }
    return list;
  }, [clients, riskFilter, search]);

  const kpis = useMemo(() => {
    const total = clients.length;
    const withUpcoming = clients.filter((c) => c.upcoming).length;
    const withReports = clients.filter((c) => c.reports > 0).length;
    const highRisk = clients.filter((c) => c.risk === 'high').length;
    const exposure = clients.reduce((sum, c) => sum + (c.lienAmount || 0), 0);
    const avgDocs = total ? Math.round(clients.reduce((s, c) => s + c.reports, 0) / total) : 0;
    return { total, withUpcoming, withReports, highRisk, exposure, avgDocs };
  }, [clients]);

  // Small charts data
  const modalityData = useMemo(() => {
    // Use appointments counts as proxy categories
    const buckets = [
      { name: '0 appts', value: clients.filter((c) => c.appointments === 0).length },
      { name: '1 appt', value: clients.filter((c) => c.appointments === 1).length },
      { name: '2 appts', value: clients.filter((c) => c.appointments === 2).length },
      { name: '3+ appts', value: clients.filter((c) => c.appointments >= 3).length },
    ];
    return buckets;
  }, [clients]);

  const reportTrend = useMemo(() => {
    // 12 points trend of reports count growth
    const pts = [];
    let acc = 0;
    for (let i = 0; i < 12; i++) {
      acc += Math.round((clients.length / 12) * (0.6 + (i % 3 === 0 ? 0.9 : 0.3)));
      pts.push({ month: `M${i + 1}`, reports: acc });
    }
    return pts;
  }, [clients]);

  const openClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
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
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage attorney clients, their appointments, documents, and risk</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-xs text-muted-foreground">Active in portfolio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.withUpcoming}</div>
            <p className="text-xs text-muted-foreground">Scheduled or in-progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.withReports}</div>
            <p className="text-xs text-muted-foreground">At least one report</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.highRisk}</div>
            <p className="text-xs text-muted-foreground">No-show or missing docs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exposure</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.exposure.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lien exposure</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Docs/Client</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgDocs}</div>
            <p className="text-xs text-muted-foreground">Reports per client</p>
          </CardContent>
        </Card>
      </div>

      {/* Visuals row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Clients by Appointment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={modalityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }} />
                <Legend />
                <defs>
                  <linearGradient id="clientsBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <Bar dataKey="value" name="Clients" fill="url(#clientsBar)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Accumulation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={reportTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }} />
                <Legend />
                <Line type="monotone" dataKey="reports" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} name="Reports" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Search name, email, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="risk">Risk</Label>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Clients ({filtered.length})</span>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" /> {kpis.highRisk} high risk
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">{c.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-3">
                          <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{c.phone}</span>
                          <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{c.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.address}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{c.appointments}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{c.reports}</div>
                      </TableCell>
                      <TableCell>
                        {c.risk === 'high' && <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">High</Badge>}
                        {c.risk === 'medium' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>}
                        {c.risk === 'low' && <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Low</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openClient(c)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(c.email)} title="Copy Email">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {/* Insights */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" />AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Complete Missing Docs</div>
                  <div className="text-xs text-muted-foreground mt-1">Prioritize {kpis.highRisk} high-risk clients lacking reports to reduce settlement delays.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <CalendarDays className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Schedule Follow-ups</div>
                  <div className="text-xs text-muted-foreground mt-1">{kpis.withUpcoming} clients have upcoming visits. Confirm attendance and prep requirements.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <Shield className="h-5 w-5 mt-0.5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Exposure Watch</div>
                  <div className="text-xs text-muted-foreground mt-1">Current exposure ${kpis.exposure.toLocaleString()}. Consider early settlement on older cases.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client Modal */}
      <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedClient?.name}
            </DialogTitle>
            <DialogDescription>Client overview, documents, and upcoming steps</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Top summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{selectedClient.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{selectedClient.email}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{selectedClient.address}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{selectedClient.appointments}</div>
                      <div className="text-xs text-muted-foreground">Appointments</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedClient.reports}</div>
                      <div className="text-xs text-muted-foreground">Reports</div>
                    </div>
                    <div>
                      {selectedClient.risk === 'high' && <Badge variant="destructive" className="text-xs">High Risk</Badge>}
                      {selectedClient.risk === 'medium' && <Badge variant="outline" className="text-xs">Medium Risk</Badge>}
                      {selectedClient.risk === 'low' && <Badge variant="default" className="text-xs">Low Risk</Badge>}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(selectedClient.email)}><Copy className="h-4 w-4 mr-2" />Copy Email</Button>
                    <Button size="sm">Create Packet</Button>
                    <Button size="sm" variant="secondary">Open Case</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline-like simple list */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" /> Latest report or appointment updates appear here (demo)</li>
                    <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" /> Contacted center for scheduling</li>
                    <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-500" /> Awaiting document upload</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowClientModal(false)}>Close</Button>
                <Button>Message Client</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


