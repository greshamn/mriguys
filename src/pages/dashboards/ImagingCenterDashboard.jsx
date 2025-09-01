import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import KPICard from '../../components/KPICard';
import { useStore } from '../../store';
import { Badge } from '../../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { CalendarDays, Users, FileText, Activity, Lightbulb } from 'lucide-react';
import { getNow } from '../../lib/utils';

// Lightweight, dependency-free utilization heatmap using CSS grid
const UtilizationHeatmap = ({ cells = [] }) => {
  // Expect cells as [{ day: 'Mon', hour: '8', value: 0-1 }, ...]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p'];

  const valueFor = (d, h) => {
    const found = cells.find(c => c.day === d && c.hour === h);
    return typeof found?.value === 'number' ? found.value : 0;
  };

  const colorFor = (v) => {
    // Explicit gradient so cells are clearly visible in all themes
    if (v >= 0.9) return '#1d4ed8'; // deep blue
    if (v >= 0.7) return '#2563eb';
    if (v >= 0.5) return '#3b82f6';
    if (v >= 0.3) return '#60a5fa';
    if (v > 0) return '#93c5fd';
    return '#e5e7eb'; // light grey for zero
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Utilization Heatmap (This Week)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-11 gap-1">
              <div />
              {hours.map(h => (
                <div key={h} className="text-xs text-muted-foreground text-center">{h}</div>
              ))}
              {days.map(d => (
                <React.Fragment key={d}>
                  <div className="text-xs text-muted-foreground flex items-center">{d}</div>
                  {hours.map(h => {
                    const v = valueFor(d, h);
                    return (
                      <div
                        key={`${d}-${h}`}
                        title={`${d} ${h}: ${Math.round(v * 100)}%`}
                        className="h-6 rounded"
                        style={{ backgroundColor: colorFor(v), border: '1px solid hsl(var(--border))' }}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NoShowCausesChart = ({ data }) => {
  // data shape: [{ day: 'Mon', forgot: 2, transport: 1, illness: 0 } ...]
  const colors = {
    forgot: '#EF4444',
    transport: '#F59E0B',
    illness: '#10B981',
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">No-show Causes (Last 7d)</CardTitle>
      </CardHeader>
      <CardContent className="pt-1 pb-2">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
            <Legend />
            <Bar dataKey="forgot" stackId="a" fill={colors.forgot} name="Forgot" />
            <Bar dataKey="transport" stackId="a" fill={colors.transport} name="Transport" />
            <Bar dataKey="illness" stackId="a" fill={colors.illness} name="Illness" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const AISuggestionsCard = ({ utilizationPct, noShowRate, avgReportLagHrs }) => {
  const suggestions = [];
  if (utilizationPct < 0.7) suggestions.push('Utilization is low. Tighten hours on low-volume days.');
  if (utilizationPct > 0.9) suggestions.push('High utilization. Open 2 extra MRI slots Fri 2–4pm.');
  if (noShowRate > 0.15) suggestions.push('No-show rate elevated. Send reminder texts and consider 10% overbooking.');
  if (avgReportLagHrs > 24) suggestions.push('Report lag is high. Prioritize older studies in reading queue.');

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length ? (
          <ul className="space-y-2 list-disc pl-5">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground">No optimization suggestions at this time.</div>
        )}
      </CardContent>
    </Card>
  );
};

export const ImagingCenterDashboard = () => {
  const [loading, setLoading] = useState(true);

  // Grab stores
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);
  const reports = useStore((s) => s.reports);
  const fetchReports = useStore((s) => s.fetchReports);
  const slots = useStore((s) => s.slots);
  const fetchSlots = useStore((s) => s.fetchSlots);
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        await Promise.all([
          fetchAppointments().catch(() => {}),
          fetchReports().catch(() => {}),
          fetchSlots().catch(() => {}),
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    boot();
    return () => { mounted = false; };
  }, [fetchAppointments, fetchReports, fetchSlots]);

  

  // Pivot date: use current demo date; if no nearby data, pivot to nearest appointment day (keeps demo lively without editing fixtures)
  const pivotNow = useMemo(() => {
    const now = getNow();
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
    return days <= 14 ? nearest : now;
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
    const synthetic = [];
    for (let offset = -14; offset <= 14; offset++) {
      const date = new Date(now); date.setDate(now.getDate() + offset);
      const dow = date.getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 || dow === 6) continue; // weekdays only
      for (let h = 8; h <= 16; h++) {
        const startTs = new Date(date); startTs.setHours(h, 0, 0, 0);
        const endTs = new Date(startTs); endTs.setMinutes(60);
        const modality = modalities[(h + dow + offset + 14) % modalities.length];
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
          notes: 'Demo synthetic',
          createdAt: startTs.toISOString(),
          updatedAt: endTs.toISOString(),
          __synthetic: true,
        });
      }
    }
    return [...appointments, ...synthetic];
  }, [appointments, pivotNow]);

  // KPI calculations
  const todayKey = pivotNow.toDateString();
  const todaysScans = useMemo(() => {
    return displayAppointments.filter((a) => {
      const d = new Date(a.appointmentDate || a.startTime || a.scheduledAt || a.createdAt);
      return d.toDateString() === todayKey && (a.status === 'completed' || a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'in-progress');
    }).length;
  }, [displayAppointments, todayKey]);

  const utilizationPct = useMemo(() => {
    // Prefer this week's slots; if empty (fixtures in past), fallback to overall utilization derived from appointments
    const now = pivotNow;
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start); end.setDate(start.getDate() + 5);
    const weekSlots = slots.filter((s) => { const t = new Date(s.startTime); return t >= start && t <= end; });
    if (weekSlots.length > 0) {
      const total = weekSlots.length || 1;
      const utilized = weekSlots.filter((s) => ['booked','completed','held','confirmed','in-progress'].includes(s.status)).length;
      return utilized / total;
    }
    // Fallback: approximate utilization as ratio of appointments to (appointments + available slots) over last 30 days
    const from = new Date(pivotNow); from.setDate(from.getDate() - 30);
    const aIn30 = displayAppointments.filter((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.createdAt);
      return t >= from && t <= pivotNow;
    });
    const sIn30 = slots.filter((s) => { const t = new Date(s.startTime); return t >= from && t <= pivotNow; });
    const denom = (aIn30.length + sIn30.length) || 1;
    return aIn30.length / denom;
  }, [slots, displayAppointments, pivotNow]);

  const noShowRate = useMemo(() => {
    const now = pivotNow.getTime();
    const inWindow = (days) => displayAppointments.filter((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.createdAt).getTime();
      const diff = (now - t) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= days;
    });
    let windowData = inWindow(7);
    if (!windowData.length) windowData = inWindow(30); // fallback for sparse data
    if (!windowData.length) return 0.05;
    const ns = windowData.filter((a) => a.status === 'no-show').length;
    return ns / windowData.length;
  }, [displayAppointments, pivotNow]);

  const avgReportLagHrs = useMemo(() => {
    // Difference between appointment end and report updatedAt when available
    const completed = appointments.filter((a) => a.endTime && a.status === 'completed');
    if (!completed.length) return 18;
    let sum = 0, count = 0;
    completed.forEach((a) => {
      const related = reports.find((r) => r.appointmentId === a.id);
      if (related) {
        const end = new Date(a.endTime).getTime();
        const rep = new Date(related.updatedAt || related.createdAt || a.endTime).getTime();
        const hrs = Math.max(0, (rep - end) / (1000 * 60 * 60));
        sum += hrs; count += 1;
      }
    });
    return count ? Math.round((sum / count) * 10) / 10 : 18;
  }, [appointments, reports]);

  // Heatmap cells for the pivot week (Mon–Fri, 8a–5p) derived from appointments
  const heatmapCells = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri'];
    const hours = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p'];
    // Compute start/end of current week around pivot
    const monday = new Date(pivotNow); const day = monday.getDay(); const diff = (day === 0 ? -6 : 1 - day); monday.setDate(monday.getDate() + diff); monday.setHours(0,0,0,0);
    const weekEnd = new Date(monday); weekEnd.setDate(monday.getDate() + 5); weekEnd.setHours(23,59,59,999);
    const recent = displayAppointments.filter((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.createdAt);
      return t >= monday && t <= weekEnd;
    });
    const bucket = new Map();
    days.forEach((d) => hours.forEach((h) => bucket.set(`${d}-${h}`, 0)));
    recent.forEach((a) => {
      const d = new Date(a.appointmentDate || a.startTime || a.createdAt);
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0
      if (dayIdx > 4) return; // Mon-Fri only
      const hour = d.getHours();
      const idx = hour - 8;
      if (idx < 0 || idx > 9) return;
      const key = `${days[dayIdx]}-${hours[idx]}`;
      bucket.set(key, (bucket.get(key) || 0) + 1);
    });
    const max = Math.max(1, ...Array.from(bucket.values()));
    const cells = [];
    days.forEach((d) => {
      hours.forEach((h) => {
        const count = bucket.get(`${d}-${h}`) || 0;
        const value = count / max; // normalize
        cells.push({ day: d, hour: h, value });
      });
    });
    return cells;
  }, [displayAppointments, pivotNow]);

  // No-show causes distribution (deterministic by id hash)
  const noShowChartData = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const buckets = Object.fromEntries(days.map((d) => [d, { day: d, forgot: 0, transport: 0, illness: 0 }]));
    const pickWindow = (daysBack) => displayAppointments.filter((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.createdAt);
      return (pivotNow.getTime() - t.getTime()) / (1000 * 60 * 60 * 24) <= daysBack;
    });
    let windowData = pickWindow(7);
    if (!windowData.length) windowData = pickWindow(30);
    windowData.filter((a) => a.status === 'no-show').forEach((a) => {
      const d = new Date(a.appointmentDate || a.startTime || a.createdAt);
      const key = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const hash = (a.id || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const mod = hash % 3;
      if (mod === 0) buckets[key].forgot += 1;
      if (mod === 1) buckets[key].transport += 1;
      if (mod === 2) buckets[key].illness += 1;
    });
    return days.map((d) => buckets[d]);
  }, [displayAppointments, pivotNow]);

  // Worklist (upcoming today)
  const worklist = useMemo(() => {
    const start = new Date(pivotNow); start.setHours(0,0,0,0);
    const end = new Date(pivotNow); end.setHours(23,59,59,999);
    let list = displayAppointments.filter((a) => {
      const t = new Date(a.appointmentDate || a.startTime || a.scheduledAt || a.createdAt);
      return t >= start && t <= end && ['scheduled','confirmed','in-progress'].includes(a.status);
    });
    if (!list.length) {
      // Fallback to next 7 days
      const end7 = new Date(pivotNow); end7.setDate(end7.getDate() + 7); end7.setHours(23,59,59,999);
      list = displayAppointments.filter((a) => {
        const t = new Date(a.appointmentDate || a.startTime || a.scheduledAt || a.createdAt);
        return t > end && t <= end7 && ['scheduled','confirmed','in-progress'].includes(a.status);
      });
    }
    return list
      .sort((a, b) => new Date(a.appointmentDate || a.startTime) - new Date(b.appointmentDate || b.startTime))
      .slice(0, 6);
  }, [displayAppointments, pivotNow]);

  const kpiItems = [
    { title: "Today's Scans", value: todaysScans, change: '', changeType: 'neutral', icon: CalendarDays },
    { title: 'Utilization', value: `${Math.round(utilizationPct * 100)}%`, change: '', changeType: 'neutral', icon: Activity },
    { title: 'No-show Rate', value: `${Math.round(noShowRate * 100)}%`, change: '', changeType: 'neutral', icon: Users },
    { title: 'Avg Report Lag', value: `${avgReportLagHrs}h`, change: '', changeType: 'neutral', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="col-span-12 p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 p-6 space-y-8 max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imaging Center Dashboard</h1>
          <p className="text-muted-foreground">Worklist and scheduling management</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((k) => (
          <KPICard key={k.title} {...k} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UtilizationHeatmap cells={heatmapCells} />
        <NoShowCausesChart data={noShowChartData} />
        <AISuggestionsCard utilizationPct={utilizationPct} noShowRate={noShowRate} avgReportLagHrs={avgReportLagHrs} />
      </div>

      {/* Worklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today\'s Worklist</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Time</th>
                  <th className="py-2">Patient</th>
                  <th className="py-2">Modality</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {worklist.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="py-2">{new Date(a.appointmentDate || a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2">{a.patientName || a.patientId}</td>
                    <td className="py-2">{a.modality || '—'}</td>
                    <td className="py-2">
                      <Badge variant="outline">{a.status}</Badge>
                    </td>
                    <td className="py-2 text-right space-x-2">
                      {a.status === 'scheduled' || a.status === 'confirmed' ? (
                        <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(a.id, 'in-progress')}>Check-in</Button>
                      ) : null}
                      {a.status === 'in-progress' ? (
                        <Button size="sm" onClick={() => updateAppointmentStatus(a.id, 'completed')}>Complete</Button>
                      ) : null}
                      <Button size="sm" variant="secondary">Upload Report</Button>
                    </td>
                  </tr>
                ))}
                {worklist.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">No appointments for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagingCenterDashboard;


