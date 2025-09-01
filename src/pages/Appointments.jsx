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
import { Clock, MapPin, CalendarPlus, X } from 'lucide-react';

const EMPTY_ARRAY = [];

const selectAppointments = (state) => Array.isArray(state?.appointments) ? state.appointments : EMPTY_ARRAY;
const selectPatients = (state) => Array.isArray(state?.patients) ? state.patients : EMPTY_ARRAY;
const selectCenters = (state) => Array.isArray(state?.centers) ? state.centers : EMPTY_ARRAY;
const selectSelectedPatientId = (state) => state?.selectedPatientId;

const formatDateTime = (iso) => new Date(iso).toLocaleString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
});

const isWithin24h = (iso) => {
  const dt = new Date(iso);
  const diffMs = dt.getTime() - Date.now();
  return diffMs <= 24 * 60 * 60 * 1000;
};

function makeICS(apt, center) {
  const start = new Date(apt.appointmentDate || apt.startTime);
  const end = new Date(start.getTime() + (apt.duration || 60) * 60000);
  const dt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MRIGuys//Appointments//EN',
    'BEGIN:VEVENT',
    `UID:${apt.id}@mriguys.com`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${apt.modality ? apt.modality + ' • ' : ''}${apt.bodyPart || 'Imaging Appointment'}`,
    `LOCATION:${center ? `${center.address?.street || ''} ${center.address?.city || ''}`.trim() : ''}`,
    `DESCRIPTION:Center ${center?.name || ''} — Bring ID.`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return new Blob([lines], { type: 'text/calendar;charset=utf-8' });
}

export default function Appointments() {
  const [loading, setLoading] = useState(true);
  const [detailApt, setDetailApt] = useState(null);
  const [reschedApt, setReschedApt] = useState(null);
  const [reslots, setReslots] = useState([]);
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [search, setSearch] = useState('');

  const appointments = useStore(selectAppointments);
  const patients = useStore(selectPatients);
  const centers = useStore(selectCenters);
  const selectedPatientId = useStore(selectSelectedPatientId);

  const store = useStore.getState();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([
          store.fetchPatients && store.fetchPatients(),
          store.fetchCenters && store.fetchCenters(),
          store.fetchAppointments && store.fetchAppointments()
        ]);
      } catch (e) {
        console.error('Failed to load appointments:', e);
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

  const patientAppointments = useMemo(() => (
    appointments.filter(a => a.patientId === currentPatient.id)
  ), [appointments, currentPatient]);

  const filtered = useMemo(() => {
    let list = [...patientAppointments];
    if (statusFilter === 'upcoming') {
      list = list.filter(a => a.status === 'scheduled' || a.status === 'confirmed');
      list.sort((a, b) => new Date(a.appointmentDate || a.startTime) - new Date(b.appointmentDate || b.startTime));
    } else if (statusFilter === 'past') {
      list = list.filter(a => a.status === 'completed' || a.status === 'no-show' || a.status === 'cancelled');
      list.sort((a, b) => new Date(b.appointmentDate || b.startTime) - new Date(a.appointmentDate || a.startTime));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => (a.modality || '').toLowerCase().includes(q) || (a.notes || '').toLowerCase().includes(q));
    }
    return list;
  }, [patientAppointments, statusFilter, search]);

  const stats = useMemo(() => {
    const total = patientAppointments.length;
    const upcoming = patientAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
    const past = patientAppointments.filter(a => ['completed', 'no-show', 'cancelled'].includes(a.status)).length;
    const cancelled = patientAppointments.filter(a => a.status === 'cancelled').length;
    return { total, upcoming, past, cancelled };
  }, [patientAppointments]);

  const getCenterById = (id) => centers.find(c => c.id === id);
  const getCenterName = (id) => getCenterById(id)?.name || 'Unknown Center';
  const getCenterAddress = (id) => {
    const c = getCenterById(id);
    if (!c || !c.address) return '';
    const { street, city, state, zip } = c.address;
    return `${street}, ${city}, ${state} ${zip}`;
  };

  const openDirections = (centerId) => {
    const center = getCenterById(centerId);
    if (!center) return;
    const { geo, address } = center;
    let mapsURL = '';
    if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
      mapsURL = `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`;
    } else if (address) {
      const addr = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
      mapsURL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
    }
    if (mapsURL) window.open(mapsURL, '_blank');
  };

  const onAddToCalendar = (apt) => {
    const blob = makeICS(apt, getCenterById(apt.centerId));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apt.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const startReschedule = async (apt) => {
    setReschedApt(apt);
    try {
      const fromDate = new Date();
      const toDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const qs = new URLSearchParams({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        status: 'available',
        limit: '10',
        sortBy: 'startTime',
        sortOrder: 'asc'
      });
      const resp = await fetch(`/api/centers/${apt.centerId}/availability?${qs.toString()}`);
      const data = await resp.json();
      const slots = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []));
      // normalize: expect items to have startTime
      let normalized = slots
        .map(s => ({ id: s.id || s.slotId || s.startTime, startTime: s.startTime || s.begin || s.appointmentDate }))
        .filter(s => s.startTime)
        .slice(0, 5);
      // Fallback: synthesize 5 future slots if none returned
      if (normalized.length === 0) {
        const base = new Date();
        normalized = Array.from({ length: 5 }).map((_, i) => {
          const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i + 2, 9, 0, 0);
          return { id: `synth-${apt.centerId}-${i}`, startTime: d.toISOString() };
        });
      }
      setReslots(normalized);
    } catch (e) {
      console.error('Failed to load availability:', e);
      setReslots([]);
    }
  };

  const confirmReschedule = async (slot) => {
    if (!reschedApt) return;
    // Local update only (mock)
    if (store.rescheduleAppointmentLocal) {
      store.rescheduleAppointmentLocal(reschedApt.id, slot.startTime);
    }
    setReschedApt(null);
    setReslots([]);
  };

  const onCancel = (apt) => {
    if (isWithin24h(apt.appointmentDate || apt.startTime)) return;
    if (store.cancelAppointmentLocal) {
      store.cancelAppointmentLocal(apt.id, 'Patient requested');
    } else if (store.updateAppointmentStatus) {
      store.updateAppointmentStatus(apt.id, 'cancelled');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="col-span-12 mb-2">
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground">Manage and review your imaging appointments</p>
      </div>

      {/* Main Column */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Filters */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-card-foreground">Filters</CardTitle>
            <CardDescription>Refine your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Search</label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Modality, notes..." className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">{loading ? 'Loading…' : `${filtered.length} Appointment${filtered.length !== 1 ? 's' : ''}`}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No appointments found.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((a) => {
                  const when = a.appointmentDate || a.startTime;
                  const centerName = getCenterName(a.centerId);
                  const disableChange = isWithin24h(when) || a.status !== 'scheduled' && a.status !== 'confirmed';
                  return (
                    <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-card-foreground">{formatDateTime(when)}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-sm text-muted-foreground">{centerName}</span>
                          <Badge variant="secondary" className="ml-1 capitalize">{a.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {(a.modality || 'Imaging')} {a.bodyPart ? `• ${a.bodyPart}` : ''}
                        </p>
                        {a.notes && (
                          <p className="text-sm mt-1 line-clamp-2 text-card-foreground/90">{a.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:self-end sm:ml-4">
                        <Button size="sm" variant="outline" onClick={() => setDetailApt(a)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDirections(a.centerId)}>
                          <MapPin className="h-4 w-4 mr-2" />
                          Directions
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onAddToCalendar(a)}>
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Add to Calendar
                        </Button>
                        <Button size="sm" variant="default" disabled={disableChange} onClick={() => startReschedule(a)}>Reschedule</Button>
                        <Button size="sm" variant="destructive" disabled={disableChange} onClick={() => onCancel(a)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Upcoming</span><span className="font-semibold text-card-foreground">{stats.upcoming}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Past</span><span className="font-semibold text-card-foreground">{stats.past}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Cancelled</span><span className="font-semibold text-card-foreground">{stats.cancelled}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailApt} onOpenChange={(open) => !open && setDetailApt(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {detailApt ? `${formatDateTime(detailApt.appointmentDate || detailApt.startTime)} • ${getCenterName(detailApt.centerId)}` : ''}
            </DialogDescription>
          </DialogHeader>
          {detailApt && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><span className="capitalize">{detailApt.status}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Modality</span><span>{detailApt.modality || '—'}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Body Part</span><span>{detailApt.bodyPart || '—'}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Center</span><span>{getCenterName(detailApt.centerId)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Address</span><span className="text-right">{getCenterAddress(detailApt.centerId)}</span></div>
              {detailApt.notes && <div><span className="text-muted-foreground">Notes</span><p className="mt-1 text-card-foreground/90">{detailApt.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!reschedApt} onOpenChange={(open) => !open && (setReschedApt(null), setReslots([]))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pick a new time</DialogTitle>
            <DialogDescription>{reschedApt ? getCenterName(reschedApt.centerId) : ''}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {reslots.length === 0 && (
              <div className="text-sm text-muted-foreground">No slots found. Please contact the center.</div>
            )}
            {reslots.map(slot => (
              <Button key={slot.id} variant="outline" className="w-full justify-start" onClick={() => confirmReschedule(slot)}>
                {formatDateTime(slot.startTime)}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


