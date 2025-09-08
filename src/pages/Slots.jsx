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

// View Slot Modal Component
const ViewSlotModal = ({ slot, isOpen, onClose }) => {
  if (!slot) return null;

  const getCenterName = (centerId) => {
    const centers = useStore.getState().centers;
    const center = centers.find(c => c.id === centerId);
    return center?.name || centerId;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

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

  const startTime = formatDateTime(slot.startTime);
  const endTime = formatDateTime(slot.endTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Slot Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Slot Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Slot Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Date</Label>
                <div className="text-sm text-gray-900">{startTime.date}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Time</Label>
                <div className="text-sm text-gray-900">{startTime.time} - {endTime.time}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Modality</Label>
                <div className="text-sm text-gray-900">{slot.modality}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Body Part</Label>
                <div className="text-sm text-gray-900">{slot.bodyPart}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <div className="mt-1">{getStatusBadge(slot.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Price</Label>
                <div className="text-sm text-gray-900">${slot.price || '—'}</div>
              </div>
            </div>
          </div>

          {/* Center Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Center Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Center Name</Label>
                <div className="text-sm text-gray-900">{getCenterName(slot.centerId)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Center ID</Label>
                <div className="text-sm text-gray-900">{slot.centerId}</div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {slot.notes && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Additional Information</h3>
              <div>
                <Label className="text-sm font-medium text-gray-600">Notes</Label>
                <div className="text-sm text-gray-900 bg-white p-3 rounded border mt-1">
                  {slot.notes}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Created</Label>
                <div className="text-sm text-gray-900">
                  {new Date(slot.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <div className="text-sm text-gray-900">
                  {new Date(slot.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingSlot, setViewingSlot] = useState(null);
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
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search centers, modalities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
              className="border-gray-200 hover:bg-gray-50"
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
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="text-gray-900">Slots ({filteredSlots.length})</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-4 w-4" />
                  {metrics.total} total • {metrics.available} available • {metrics.booked} booked
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b bg-gray-50">
                      <th className="py-4 px-4 font-semibold">Date & Time</th>
                      <th className="py-4 px-4 font-semibold">Center</th>
                      <th className="py-4 px-4 font-semibold">Modality</th>
                      <th className="py-4 px-4 font-semibold">Body Part</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold">Price</th>
                      <th className="py-4 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.map((slot) => (
                      <tr key={slot.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">
                            {new Date(slot.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{getCenterName(slot.centerId)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{slot.modality}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{slot.bodyPart}</div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(slot.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">${slot.price || '—'}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setViewingSlot(slot);
                                setViewModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSlots.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <Clock className="h-12 w-12 text-gray-300" />
                            <div className="text-lg font-medium">No slots found</div>
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
          <Card className="overflow-hidden">
            {/* Purple gradient header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <div className="font-semibold text-lg">AI Insights</div>
              </div>
              <div className="text-sm opacity-90 mt-1">Slot optimization recommendations</div>
            </div>
            
            {/* White content section */}
            <CardContent className="p-4 bg-white">
              <div className="text-gray-600 text-sm">
                Slot optimization suggestions will appear here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Slot Modal */}
      {viewingSlot && (
        <ViewSlotModal
          slot={viewingSlot}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setViewingSlot(null);
          }}
        />
      )}
    </div>
  );
};

export default Slots;
