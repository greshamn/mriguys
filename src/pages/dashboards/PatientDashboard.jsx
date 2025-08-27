import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  User,
  Phone,
  X
} from 'lucide-react';
import { Timeline } from '../../components/Timeline';
import { AITip, generateAITip } from '../../components/AITip';
import { useStore } from '../../store';

// Shared constants to ensure referential stability
const EMPTY_ARRAY = [];

// Memoized selectors to prevent infinite loops
const selectAppointments = (state) => {
  const data = state?.appointments;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectReports = (state) => {
  const data = state?.reports;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectPatients = (state) => {
  const data = state?.patients;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectCenters = (state) => {
  const data = state?.centers;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectReferrals = (state) => {
  const data = state?.referrals;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectSelectedPatientId = (state) => state?.selectedPatientId;
// Avoid subscribing to function identities; we'll call via getState in effects

export const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Get data from Zustand store using memoized selectors
  const appointments = useStore(selectAppointments);
  const reports = useStore(selectReports);
  const patients = useStore(selectPatients);
  const selectedPatientId = useStore(selectSelectedPatientId);
  const centers = useStore(selectCenters);
  const referrals = useStore(selectReferrals);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get functions directly from store to avoid dependency issues
        const store = useStore.getState();
        await Promise.all([
          store.fetchAppointments && store.fetchAppointments(),
          store.fetchReports && store.fetchReports(),
          store.fetchPatients && store.fetchPatients(),
          store.fetchCenters && store.fetchCenters(),
          store.fetchReferrals && store.fetchReferrals()
        ]);
      } catch (error) {
        console.error('Error loading patient dashboard data:', error);
      } finally {
        // Simulate realistic loading time
        setTimeout(() => setLoading(false), 0);
      }
    };

    loadData();
  }, []); // Empty dependency array to avoid infinite loop!

  // Get selected patient from store variables above
  const selectedPatient = Array.isArray(patients) && patients.length > 0
    ? (patients.find(p => p.id === selectedPatientId) || patients[0])
    : {
    id: 'patient-001',
    name: 'John Doe',
    pipFlag: false
  };

  // Get patient-specific data
  const patientAppointments = Array.isArray(appointments) 
    ? appointments.filter(apt => apt.patientId === selectedPatient.id)
    : [];
  const patientReports = Array.isArray(reports)
    ? reports.filter(report => report.patientId === selectedPatient.id)
    : [];
  const patientReferrals = Array.isArray(referrals)
    ? referrals.filter(ref => ref.patientId === selectedPatient.id)
    : [];
  
  // Get next appointment (sorted by date) for this specific patient
  const nextAppointmentData = patientAppointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0] || null;

  // Get center information for the appointment
  const nextAppointment = nextAppointmentData ? {
    ...nextAppointmentData,
    center: Array.isArray(centers) && centers.length > 0
      ? (centers.find(c => c.id === nextAppointmentData.centerId) || {
          name: 'Unknown Center',
          address: { street: '', city: '', state: '' },
          phone: ''
        })
      : {
      name: 'Unknown Center',
      address: { street: '', city: '', state: '' },
      phone: ''
    }
  } : null;

  // Get previous appointments for AI context
  const previousAppointments = patientAppointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 3); // Get last 3 completed appointments

  // Generate AI tip with enhanced context using patient-specific data
  const aiTipData = generateAITip(nextAppointment, selectedPatient, patientReports, previousAppointments);

  // Determine timeline step based on patient's actual data
  const getTimelineStep = () => {
    // Check if patient has reports - this means scan is completed and report is ready
    if (patientReports.length > 0) {
      return 'report';
    }
    
    // Check if patient has completed appointments - this means scan is completed
    const completedAppointments = patientAppointments.filter(apt => apt.status === 'completed');
    if (completedAppointments.length > 0) {
      return 'scan';
    }
    
    // Check if patient has confirmed/scheduled appointments - this means appointment is booked
    const confirmedAppointments = patientAppointments.filter(apt => 
      apt.status === 'confirmed' || apt.status === 'scheduled'
    );
    if (confirmedAppointments.length > 0) {
      return 'booking';
    }
    
    // Check if patient has pending appointments - still at referral stage, appointment not confirmed
    const pendingAppointments = patientAppointments.filter(apt => apt.status === 'pending');
    if (pendingAppointments.length > 0) {
      return 'referral';
    }
    
    // Check if patient has referrals - this means referral is received
    if (patientReferrals.length > 0) {
      return 'referral';
    }
    
    // Default to referral if no data found
    return 'referral';
  };

  const currentTimelineStep = getTimelineStep();

  // Patient-specific CTA availability states
  const ctaStates = {
    viewResults: {
      available: patientReports.length > 0,
      count: patientReports.length,
      label: patientReports.length > 0 ? `View ${patientReports.length} Result${patientReports.length !== 1 ? 's' : ''}` : 'No Results Available'
    },
    messageCenter: {
      available: true, // Always available
      unreadCount: 2, // Mock unread messages
      label: 'Message Center'
    },
    scheduleAppointment: {
      available: !nextAppointment, // Only if no appointment scheduled
      label: 'Schedule Appointment'
    },
    cancelAppointment: {
      available: !!nextAppointment && nextAppointment.status !== 'completed',
      label: 'Cancel Appointment'
    }
  };

  // Format appointment date
  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatAppointmentTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {/* Page Header */}
      <div className="col-span-12 mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {selectedPatient.name}'s Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your imaging appointments and results
          {selectedPatient.pipFlag && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              PIP Patient
            </span>
          )}
        </p>
      </div>

      {/* Main Content Area - RE-ENABLED */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Next Appointment Hero Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Your Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : nextAppointment ? (
              <div className="space-y-4">
                {/* Appointment Date & Time */}
                <div>
                  <h3 className="text-2xl font-bold text-card-foreground">
                    {formatAppointmentDate(nextAppointment.appointmentDate)}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {formatAppointmentTime(nextAppointment.appointmentDate)} • {nextAppointment.modality} - {nextAppointment.bodyPart}
                  </p>
                </div>

                <Separator />

                {/* Center Information */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-card-foreground">{nextAppointment.center.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {nextAppointment.center.address?.street || ''}{nextAppointment.center.address?.street ? ', ' : ''}{nextAppointment.center.address?.city || ''}{nextAppointment.center.address?.city ? ', ' : ''}{nextAppointment.center.address?.state || ''}
                      </p>
                    </div>
                  </div>
                  
                  {nextAppointment.center.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{nextAppointment.center.phone}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Preparation Checklist */}
                <div>
                  <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Preparation Checklist
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">Remove all metal objects (jewelry, watches, belts)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">Wear comfortable, loose-fitting clothing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">Arrive 15 minutes early for safety screening</span>
                    </div>
                    {nextAppointment.preparation?.instructions && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm text-muted-foreground">{nextAppointment.preparation.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming appointments scheduled</p>
                <Button className="mt-4" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care Timeline - RE-ENABLED WITH FIX */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Your Care Timeline
            </CardTitle>
            <CardDescription>Track your progress through the imaging process</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-3 w-16 mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <Timeline currentStep={currentTimelineStep} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - RESTORED */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* AI Tip Card */}
        {loading ? (
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ) : (
          <AITip tip={aiTipData.tip} type={aiTipData.type} />
        )}

        {/* Enhanced Quick Actions with CTA Logic */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* View Results CTA */}
            <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full justify-start" 
                  variant={ctaStates.viewResults.available ? "default" : "outline"}
                  disabled={!ctaStates.viewResults.available}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {ctaStates.viewResults.label}
                  {ctaStates.viewResults.available && ctaStates.viewResults.count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {ctaStates.viewResults.count}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Your Imaging Results</DialogTitle>
                  <DialogDescription>
                    View and download your completed imaging reports.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {patientReports.length > 0 ? patientReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{report.modality} - {report.bodyPart} Report</h4>
                          <p className="text-sm text-muted-foreground">
                            Completed: {new Date(report.reportDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Status: {report.status}</p>
                        </div>
                        <Button size="sm">Download</Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No results available yet</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Message Center CTA */}
            <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {ctaStates.messageCenter.label}
                  {ctaStates.messageCenter.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {ctaStates.messageCenter.unreadCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Message Center</DialogTitle>
                  <DialogDescription>
                    Communicate with your healthcare providers and imaging centers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Dynamic messages based on patient's actual data */}
                  {nextAppointment && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Preparation Reminder</h4>
                          <p className="text-sm text-muted-foreground">From: {nextAppointment.center.name}</p>
                          <p className="text-sm mt-1">
                            Your {nextAppointment.modality} appointment is on {formatAppointmentDate(nextAppointment.appointmentDate)}. 
                            Please remember to remove all metal objects and arrive 15 minutes early.
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      </div>
                    </div>
                  )}
                  
                  {patientReports.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Results Available</h4>
                          <p className="text-sm text-muted-foreground">From: Radiology Department</p>
                          <p className="text-sm mt-1">
                            You have {patientReports.length} imaging result{patientReports.length !== 1 ? 's' : ''} available for review.
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      </div>
                    </div>
                  )}
                  
                  {/* Default message if no specific messages */}
                  {!nextAppointment && patientReports.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No new messages</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Conditional CTA: Schedule or Cancel Appointment */}
            {ctaStates.scheduleAppointment.available ? (
              <Button 
                size="lg" 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  // Navigate to Find Centers page
                  window.location.href = '/find-centers';
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {ctaStates.scheduleAppointment.label}
              </Button>
            ) : ctaStates.cancelAppointment.available ? (
              <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {ctaStates.cancelAppointment.label}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your upcoming appointment?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-yellow-50">
                      <h4 className="font-medium">Appointment Details</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nextAppointment && formatAppointmentDate(nextAppointment.appointmentDate)} at {nextAppointment && formatAppointmentTime(nextAppointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nextAppointment?.center?.name}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                        Keep Appointment
                      </Button>
                      <Button variant="destructive" onClick={() => {
                        setShowCancelModal(false);
                        // TODO: Implement actual cancellation logic
                        alert('Appointment cancelled successfully');
                      }}>
                        Cancel Appointment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : null}

            {/* Update Profile - Always available */}
            <Button 
              size="lg" 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                alert('Profile update feature coming soon!');
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Referrals</p>
                  <div className="text-2xl font-bold text-card-foreground">
                    {loading ? <Skeleton className="h-8 w-8" /> : patientAppointments.filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled').length}
                  </div>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Results</p>
                  <div className="text-2xl font-bold text-card-foreground">
                    {loading ? <Skeleton className="h-8 w-8" /> : patientReports.length}
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
