import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Calendar as CalendarIcon,
  Settings,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Activity,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getNow } from '../lib/utils';

// Main Slots Component
const Slots = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Store hooks
  const slots = useStore((s) => s.slots);
  const fetchSlots = useStore((s) => s.fetchSlots);
  const centers = useStore((s) => s.centers);
  const fetchCenters = useStore((s) => s.fetchCenters);
  const appointments = useStore((s) => s.appointments);
  const fetchAppointments = useStore((s) => s.fetchAppointments);

  // Pivot date: use current demo date; if no nearby data, pivot to nearest slot day
  const pivotNow = useMemo(() => {
    const now = getNow();
    console.log('🔍 Slots: Current date from getNow():', now.toISOString());
    if (!slots.length) return now;
    // Find nearest slot within ±14 days
    let nearest = null;
    let bestDelta = Infinity;
    slots.forEach((s) => {
      const t = new Date(s.startTime);
      const delta = Math.abs(t.getTime() - now.getTime());
      if (delta < bestDelta) { bestDelta = delta; nearest = t; }
    });
    if (!nearest) return now;
    const days = Math.abs((nearest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const result = days <= 14 ? nearest : now;
    console.log('🔍 Slots: Pivot date set to:', result.toISOString());
    return result;
  }, [slots]);

  // Demo enrichment: synthesize additional slots near the pivot date
  const displaySlots = useMemo(() => {
    const now = pivotNow;
    // If we already have ample data in the last 30 days, use it as-is
    const realWindow = slots.filter((s) => {
      const t = new Date(s.startTime);
      const from = new Date(now); from.setDate(from.getDate() - 30);
      return t >= from && t <= now;
    });
    if (realWindow.length >= 50) return slots;

    // Build synthetic slots for the surrounding 4 weeks (Mon–Fri), 9 time slots/day
    const centers = ['center-001','center-002','center-003','center-004'];
    const modalities = ['MRI','CT','X-Ray','Ultrasound'];
    const bodyParts = ['Head', 'Spine', 'Chest', 'Abdomen', 'Knee', 'Shoulder'];
    const synthetic = [];
    
    for (let offset = -14; offset <= 14; offset++) {
      const date = new Date(now); date.setDate(now.getDate() + offset);
      const dow = date.getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 || dow === 6) continue; // weekdays only
      
      for (let h = 8; h <= 16; h++) {
        const startTs = new Date(date); startTs.setHours(h, 0, 0, 0);
        const endTs = new Date(startTs); endTs.setMinutes(60);
        const modality = modalities[(h + dow + offset + 14) % modalities.length];
        const bodyPart = bodyParts[(h + dow + offset) % bodyParts.length];
        const centerId = centers[(h + dow) % centers.length];
        
        // Deterministic pattern for status
        const key = `${offset}-${h}-${dow}`;
        const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        let status = 'available';
        if (startTs < now) {
          status = hash % 3 === 0 ? 'booked' : hash % 3 === 1 ? 'completed' : 'available';
        }
        
        synthetic.push({
          id: `demo-slot-${date.toISOString().slice(0,10)}-${h}`,
          centerId,
          modality,
          bodyPart,
          startTime: startTs.toISOString(),
          endTime: endTs.toISOString(),
          status,
          price: Math.floor(Math.random() * 500) + 100,
          notes: 'Demo synthetic slot',
          createdAt: startTs.toISOString(),
          updatedAt: endTs.toISOString(),
          __synthetic: true,
        });
      }
    }
    
    const result = [...slots, ...synthetic];
    console.log('🔍 Slots: Total slots after enrichment:', result.length, 'Original:', slots.length, 'Synthetic:', synthetic.length);
    return result;
  }, [slots, pivotNow]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSlots().catch(() => {}),
          fetchCenters().catch(() => {}),
          fetchAppointments().catch(() => {})
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchSlots, fetchCenters, fetchAppointments]);

  // Filtered slots data
  const filteredSlots = useMemo(() => {
    let filtered = displaySlots.filter(slot => {
      // Status filter
      if (statusFilter !== 'all' && slot.status !== statusFilter) {
        return false;
      }
      
      // Modality filter
      if (modalityFilter !== 'all' && slot.modality !== modalityFilter) {
        return false;
      }
      
      // Center filter
      if (centerFilter !== 'all' && slot.centerId !== centerFilter) {
        return false;
      }
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const centerName = centers.find(c => c.id === slot.centerId)?.name || '';
        const matchesCenter = centerName.toLowerCase().includes(searchLower);
        const matchesModality = slot.modality?.toLowerCase().includes(searchLower);
        const matchesBodyPart = slot.bodyPart?.toLowerCase().includes(searchLower);
        
        if (!matchesCenter && !matchesModality && !matchesBodyPart) {
          return false;
        }
      }
      
      return true;
    });

    // Sort by start time
    const sorted = filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    console.log('🔍 Slots: Filtered slots:', sorted.length, 'Filters:', { search, statusFilter, modalityFilter, centerFilter });
    return sorted;
  }, [displaySlots, centers, search, statusFilter, modalityFilter, centerFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = displaySlots.length;
    const available = displaySlots.filter(s => s.status === 'available').length;
    const booked = displaySlots.filter(s => s.status === 'booked').length;
    const completed = displaySlots.filter(s => s.status === 'completed').length;
    const cancelled = displaySlots.filter(s => s.status === 'cancelled').length;
    
    const utilizationPct = total > 0 ? (booked + completed) / total : 0;
    
    return { total, available, booked, completed, cancelled, utilizationPct };
  }, [displaySlots]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>;
      case 'booked':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Booked</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCenterName = (centerId) => {
    const center = centers.find(c => c.id === centerId);
    return center?.name || centerId;
  };

  if (loading) {
    return (
      <div className="col-span-12 p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Slot Management</h1>
          <p className="text-muted-foreground">Manage appointment slots and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setSelectedSlot(null);
              setSlotModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search centers, modalities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Modality Filter */}
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Modality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modalities</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
              </SelectContent>
            </Select>

            {/* Center Filter */}
            <Select value={centerFilter} onValueChange={setCenterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {centers.map(center => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setModalityFilter('all');
                setCenterFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slots Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Slots ({filteredSlots.length})</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {metrics.total} total • {metrics.available} available • {metrics.booked} booked
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3 px-2">Date & Time</th>
                      <th className="py-3 px-2">Center</th>
                      <th className="py-3 px-2">Modality</th>
                      <th className="py-3 px-2">Body Part</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.map((slot) => (
                      <tr key={slot.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {new Date(slot.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">{getCenterName(slot.centerId)}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">{slot.modality}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">{slot.bodyPart}</div>
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(slot.status)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">${slot.price || '—'}</div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSlots.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Clock className="h-8 w-8" />
                            <div>No slots found</div>
                            <div className="text-sm">Try adjusting your filters</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                Slot optimization suggestions will appear here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Slots;
