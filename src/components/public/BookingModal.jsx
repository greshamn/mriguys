import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MapPin, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDateKey = (iso) => new Date(iso).toISOString().slice(0, 10);

export function BookingModal({ open, onOpenChange, center, onBooked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Fetch availability when opened
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!open || !center) return;
      setLoading(true);
      setError('');
      setSelectedSlotId('');
      setConfirmed(false);
      try {
        // Query without date range (our mock data uses fixed dates in the past).
        const params = new URLSearchParams({ limit: '50', status: 'available' });
        const res = await fetch(`/api/centers/${center.id}/availability?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = (data?.data || data?.items || data || []).map((s) => ({ ...s }));

        let sourceSlots = items;
        // Fallback: generate a generic template if center has no slots in mocks
        if (!Array.isArray(sourceSlots) || sourceSlots.length === 0) {
          const modality = (center?.modalities && center.modalities[0]) || 'MRI';
          const baseTimes = ['09:00', '10:30', '13:00', '14:30'];
          sourceSlots = Array.from({ length: 8 }, (_, i) => {
            const [h, m] = baseTimes[i % baseTimes.length].split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            const end = new Date(d.getTime() + 60 * 60000);
            return {
              id: `gen-${center.id}-${i}`,
              centerId: center.id,
              modality,
              bodyPart: '',
              startTime: d.toISOString(),
              endTime: end.toISOString(),
              duration: 60,
              status: 'available',
              price: 800,
            };
          });
        }

        // Simulate upcoming 3 days by shifting slot dates while preserving time-of-day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const simulated = sourceSlots.map((s, i) => {
          const src = new Date(s.startTime);
          const dayOffset = i % 3; // spread across next 3 days
          const day = new Date(today.getTime() + dayOffset * 86400000);
          day.setHours(src.getHours(), src.getMinutes(), 0, 0);
          const end = new Date(day.getTime() + (s.duration || 60) * 60000);
          return {
            ...s,
            startTime: day.toISOString(),
            endTime: end.toISOString(),
            _uiUnavailable: i % 4 === 2, // mark ~25% as unavailable
          };
        });

        setSlots(simulated);
        if (simulated.length > 0) {
          setSelectedDate(formatDateKey(simulated[0].startTime));
        }
      } catch (e) {
        setError('Failed to load availability.');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [open, center]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const s of slots) {
      const key = formatDateKey(s.startTime);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    // Sort by time within the day
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
    return map;
  }, [slots]);

  const dates = Array.from(groupedByDate.keys());
  const daySlots = selectedDate ? groupedByDate.get(selectedDate) || [] : [];
  const selectedSlot = daySlots.find((s) => s.id === selectedSlotId);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      if (onBooked && selectedSlot) onBooked({ center, slot: selectedSlot });
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Book Appointment</DialogTitle>
          <DialogDescription>
            Select an available timeslot at {center?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Center summary */}
        <div className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card">
          <div className="text-sm">
            <div className="font-medium text-foreground">{center?.name}</div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{center?.address?.street}, {center?.address?.city}</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center justify-end gap-2"><Clock className="w-4 h-4" /> Typical TAT: {center?.avgTat || '3-5'} days</div>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Choose a date</div>
          <div className="flex flex-wrap gap-2">
            {dates.length === 0 && (
              <div className="text-sm text-muted-foreground">No upcoming dates found.</div>
            )}
            {dates.map((d) => (
              <Button key={d} variant={d === selectedDate ? 'default' : 'outline'} size="sm" onClick={() => setSelectedDate(d)}>
                {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </Button>
            ))}
          </div>
        </div>

        {/* Timeslots */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Available times</div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading availability…</div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="w-4 h-4" /> {error}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {daySlots.map((s) => {
                const unavailable = s._uiUnavailable;
                const selected = selectedSlotId === s.id;
                return (
                  <button
                    key={s.id}
                    disabled={unavailable}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`px-3 py-2 rounded-md border text-sm text-left transition ${
                      unavailable
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted/50'
                    }`}
                    title={unavailable ? 'Not available' : 'Select timeslot'}
                  >
                    <div className="font-medium">{formatTime(s.startTime)}–{formatTime(s.endTime)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-2xs">{s.modality}</Badge>
                      {s.price ? <span className="text-xs text-muted-foreground">${s.price}</span> : null}
                    </div>
                  </button>
                );
              })}
              {daySlots.length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground">No times available for this day.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedSlot ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Selected {new Date(selectedSlot.startTime).toLocaleString()} ({selectedSlot.modality})
              </div>
            ) : (
              <span>Select a timeslot to continue.</span>
            )}
          </div>
          <Button onClick={handleConfirm} disabled={!selectedSlot || confirmed}>
            {confirmed ? 'Booking…' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;


