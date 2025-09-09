import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  FileText, 
  Building2, 
  Calendar, 
  Download, 
  Scale, 
  DollarSign, 
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Eye,
  BarChart3,
  Activity,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const Workflow = () => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [selectedStep, setSelectedStep] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStepDetails, setShowStepDetails] = useState(false);
  const [currentStepDetails, setCurrentStepDetails] = useState(null);

  // Mock data for workflow steps with patient counts
  const workflowSteps = [
    {
      id: 1,
      title: 'Initial Case Intake',
      icon: Scale,
      color: 'blue',
      totalPatients: 45,
      activePatients: 12,
      completedToday: 8,
      avgDuration: '2.5 days',
      description: 'The initial phase where personal injury cases are established and the need for diagnostic imaging is identified.',
      keyMetrics: {
        conversionRate: '78%',
        avgResponseTime: '2.3 hours',
        satisfactionScore: '4.7/5'
      },
      bottlenecks: ['Case documentation', 'Client communication'],
      substeps: [
        { id: '1.1', title: 'Client calls attorney', patients: 45, status: 'active', avgTime: '15 min', description: 'Initial client contact and case intake' },
        { id: '1.2', title: 'Attorney creates case', patients: 42, status: 'active', avgTime: '30 min', description: 'Case file creation and documentation' },
        { id: '1.3', title: 'Attorney identifies imaging need', patients: 38, status: 'active', avgTime: '45 min', description: 'Medical evaluation and imaging requirement assessment' },
        { id: '1.4', title: 'Attorney refers to doctor', patients: 35, status: 'active', avgTime: '20 min', description: 'Provider referral and coordination' }
      ]
    },
    {
      id: 2,
      title: 'Medical Evaluation',
      icon: FileText,
      color: 'green',
      totalPatients: 35,
      activePatients: 18,
      completedToday: 5,
      avgDuration: '1.2 days',
      description: 'Healthcare provider evaluation and referral creation process.',
      keyMetrics: {
        conversionRate: '91%',
        avgResponseTime: '4.1 hours',
        satisfactionScore: '4.8/5'
      },
      bottlenecks: ['Provider availability', 'Medical documentation'],
      substeps: [
        { id: '2.1', title: 'Doctor evaluates patient', patients: 35, status: 'active', avgTime: '45 min', description: 'Comprehensive medical examination and assessment' },
        { id: '2.2', title: 'Doctor determines imaging need', patients: 32, status: 'active', avgTime: '20 min', description: 'Diagnostic imaging requirement evaluation' },
        { id: '2.3', title: 'Doctor creates referral', patients: 28, status: 'active', avgTime: '15 min', description: 'Referral documentation and submission' }
      ]
    },
    {
      id: 3,
      title: 'Center Selection & Booking',
      icon: Building2,
      color: 'purple',
      totalPatients: 28,
      activePatients: 15,
      completedToday: 7,
      avgDuration: '0.8 days',
      description: 'Patient center selection, appointment booking, and safety screening process.',
      keyMetrics: {
        conversionRate: '85%',
        avgResponseTime: '1.2 hours',
        satisfactionScore: '4.6/5'
      },
      bottlenecks: ['Center availability', 'Safety screening delays'],
      substeps: [
        { id: '3.1', title: 'Patient receives referral', patients: 28, status: 'active', avgTime: '5 min', description: 'Referral notification and access' },
        { id: '3.2', title: 'Patient searches centers', patients: 25, status: 'active', avgTime: '20 min', description: 'Center discovery and comparison' },
        { id: '3.3', title: 'Patient reviews center profiles', patients: 22, status: 'active', avgTime: '15 min', description: 'Detailed center information review' },
        { id: '3.4', title: 'Patient books appointment', patients: 20, status: 'active', avgTime: '10 min', description: 'Appointment scheduling and confirmation' },
        { id: '3.5', title: 'Patient completes safety screening', patients: 18, status: 'active', avgTime: '25 min', description: 'Safety questionnaire and contraindication screening' },
        { id: '3.6', title: 'Appointment confirmed', patients: 15, status: 'completed', avgTime: '5 min', description: 'Final confirmation and preparation instructions' }
      ]
    },
    {
      id: 4,
      title: 'Imaging Center Operations',
      icon: Calendar,
      color: 'orange',
      totalPatients: 15,
      activePatients: 8,
      completedToday: 12,
      avgDuration: '1.0 days',
      description: 'Imaging center workflow from referral receipt to report generation.',
      keyMetrics: {
        conversionRate: '95%',
        avgResponseTime: '30 min',
        satisfactionScore: '4.9/5'
      },
      bottlenecks: ['Radiologist availability', 'Equipment scheduling'],
      substeps: [
        { id: '4.1', title: 'Center receives referral', patients: 15, status: 'active', avgTime: '10 min', description: 'Referral processing and worklist entry' },
        { id: '4.2', title: 'Center manages scheduling', patients: 12, status: 'active', avgTime: '20 min', description: 'Slot management and patient coordination' },
        { id: '4.3', title: 'Patient arrives for scan', patients: 10, status: 'active', avgTime: '15 min', description: 'Patient check-in and preparation' },
        { id: '4.4', title: 'Center performs imaging', patients: 8, status: 'active', avgTime: '45 min', description: 'Diagnostic imaging procedure' },
        { id: '4.5', title: 'Radiologist reviews', patients: 6, status: 'active', avgTime: '60 min', description: 'Image interpretation and analysis' },
        { id: '4.6', title: 'Center uploads report', patients: 4, status: 'active', avgTime: '15 min', description: 'Report generation and upload' },
        { id: '4.7', title: 'Status updates to Report Ready', patients: 2, status: 'completed', avgTime: '5 min', description: 'Status notification and distribution' }
      ]
    },
    {
      id: 5,
      title: 'Report Distribution',
      icon: Download,
      color: 'cyan',
      totalPatients: 2,
      activePatients: 1,
      completedToday: 15,
      avgDuration: '0.2 days',
      description: 'Multi-party report distribution and access management.',
      keyMetrics: {
        conversionRate: '98%',
        avgResponseTime: '5 min',
        satisfactionScore: '4.7/5'
      },
      bottlenecks: ['Notification delivery', 'Access permissions'],
      substeps: [
        { id: '5.1', title: 'Patient receives notification', patients: 2, status: 'active', avgTime: '2 min', description: 'Patient notification and access instructions' },
        { id: '5.2', title: 'Referring doctor gets access', patients: 2, status: 'active', avgTime: '3 min', description: 'Provider portal access and notification' },
        { id: '5.3', title: 'Attorney receives notification', patients: 2, status: 'active', avgTime: '2 min', description: 'Legal team notification and case update' },
        { id: '5.4', title: 'All parties download report', patients: 1, status: 'completed', avgTime: '5 min', description: 'Report download and case packet compilation' }
      ]
    },
    {
      id: 6,
      title: 'Legal & Financial Processing',
      icon: Scale,
      color: 'indigo',
      totalPatients: 1,
      activePatients: 1,
      completedToday: 3,
      avgDuration: '3.2 days',
      description: 'Legal case packet compilation and lien creation process.',
      keyMetrics: {
        conversionRate: '88%',
        avgResponseTime: '2.5 hours',
        satisfactionScore: '4.5/5'
      },
      bottlenecks: ['Document compilation', 'Legal review'],
      substeps: [
        { id: '6.1', title: 'Attorney compiles case packet', patients: 1, status: 'active', avgTime: '2 hours', description: 'Medical reports, bills, and supporting documentation compilation' },
        { id: '6.2', title: 'Attorney creates lien', patients: 1, status: 'active', avgTime: '1 hour', description: 'Medical lien creation and documentation' },
        { id: '6.3', title: 'Attorney submits to funder', patients: 1, status: 'active', avgTime: '30 min', description: 'Funder submission and case evaluation request' }
      ]
    },
    {
      id: 7,
      title: 'Funding Decision',
      icon: DollarSign,
      color: 'emerald',
      totalPatients: 1,
      activePatients: 1,
      completedToday: 2,
      avgDuration: '1.5 days',
      description: 'Medical lien funder evaluation and approval process.',
      keyMetrics: {
        conversionRate: '75%',
        avgResponseTime: '4 hours',
        satisfactionScore: '4.3/5'
      },
      bottlenecks: ['Risk assessment', 'Underwriting review'],
      substeps: [
        { id: '7.1', title: 'Funder reviews case packet', patients: 1, status: 'active', avgTime: '1 hour', description: 'Comprehensive case documentation review' },
        { id: '7.2', title: 'Funder evaluates risk', patients: 1, status: 'active', avgTime: '2 hours', description: 'Risk assessment and financial analysis' },
        { id: '7.3', title: 'Funder approves/rejects', patients: 1, status: 'active', avgTime: '30 min', description: 'Funding decision and notification' },
        { id: '7.4', title: 'Funder provides funding', patients: 1, status: 'pending', avgTime: '1 hour', description: 'Fund disbursement and tracking setup' },
        { id: '7.5', title: 'Funder tracks exposure', patients: 1, status: 'pending', avgTime: '15 min', description: 'Ongoing exposure monitoring and reporting' }
      ]
    },
    {
      id: 8,
      title: 'Case Resolution',
      icon: CheckCircle,
      color: 'teal',
      totalPatients: 1,
      activePatients: 0,
      completedToday: 1,
      avgDuration: '14.5 days',
      description: 'Settlement negotiation and case resolution process.',
      keyMetrics: {
        conversionRate: '92%',
        avgResponseTime: '1 day',
        satisfactionScore: '4.6/5'
      },
      bottlenecks: ['Settlement negotiations', 'Insurance processing'],
      substeps: [
        { id: '8.1', title: 'Attorney negotiates settlement', patients: 1, status: 'pending', avgTime: '10 days', description: 'Settlement negotiations with insurance and opposing parties' },
        { id: '8.2', title: 'Settlement reached', patients: 1, status: 'pending', avgTime: '2 days', description: 'Settlement agreement finalization and execution' },
        { id: '8.3', title: 'Attorney manages disbursements', patients: 1, status: 'pending', avgTime: '2.5 days', description: 'Fund distribution and lien repayment management' }
      ]
    },
    {
      id: 9,
      title: 'Reconciliation & Closure',
      icon: TrendingUp,
      color: 'rose',
      totalPatients: 0,
      activePatients: 0,
      completedToday: 0,
      avgDuration: '2.0 days',
      description: 'Final reconciliation, performance tracking, and case closure.',
      keyMetrics: {
        conversionRate: '100%',
        avgResponseTime: '1 hour',
        satisfactionScore: '4.8/5'
      },
      bottlenecks: ['Final reconciliation', 'Performance reporting'],
      substeps: [
        { id: '9.1', title: 'Funder receives settlement', patients: 0, status: 'pending', avgTime: '1 day', description: 'Settlement fund receipt and processing' },
        { id: '9.2', title: 'Funder reconciles returns', patients: 0, status: 'pending', avgTime: '4 hours', description: 'ROI calculation and performance analysis' },
        { id: '9.3', title: 'Case closed in system', patients: 0, status: 'pending', avgTime: '30 min', description: 'System closure and archival' },
        { id: '9.4', title: 'Performance metrics updated', patients: 0, status: 'pending', avgTime: '15 min', description: 'Analytics and reporting updates' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      cyan: 'bg-cyan-500',
      indigo: 'bg-indigo-500',
      emerald: 'bg-emerald-500',
      teal: 'bg-teal-500',
      rose: 'bg-rose-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getStepBorderColor = (color) => {
    const colors = {
      blue: 'border-blue-200 hover:border-blue-300',
      green: 'border-green-200 hover:border-green-300',
      purple: 'border-purple-200 hover:border-purple-300',
      orange: 'border-orange-200 hover:border-orange-300',
      cyan: 'border-cyan-200 hover:border-cyan-300',
      indigo: 'border-indigo-200 hover:border-indigo-300',
      emerald: 'border-emerald-200 hover:border-emerald-300',
      teal: 'border-teal-200 hover:border-teal-300',
      rose: 'border-rose-200 hover:border-rose-300'
    };
    return colors[color] || 'border-gray-200 hover:border-gray-300';
  };

  const toggleStep = (stepId) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleViewDetails = (step) => {
    setCurrentStepDetails(step);
    setShowStepDetails(true);
  };

  const filteredSteps = useMemo(() => {
    return workflowSteps.filter(step => {
      const matchesSearch = step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           step.substeps.some(sub => sub.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && step.activePatients > 0) ||
                           (statusFilter === 'completed' && step.completedToday > 0);
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalActivePatients = workflowSteps.reduce((sum, step) => sum + step.activePatients, 0);
  const totalCompletedToday = workflowSteps.reduce((sum, step) => sum + step.completedToday, 0);
  const avgWorkflowDuration = workflowSteps.reduce((sum, step) => sum + parseFloat(step.avgDuration), 0) / workflowSteps.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Workflow</h1>
          <p className="text-muted-foreground mt-2">End-to-end journey from attorney intake to settlement</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold text-foreground">{totalActivePatients}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-foreground">{totalCompletedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold text-foreground">{avgWorkflowDuration.toFixed(1)}d</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bottlenecks</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workflow steps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option value="all">All Steps</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Today</option>
          </select>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {filteredSteps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${getStepBorderColor(step.color)} ${
              selectedStep === step.id ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
          >
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                toggleStep(step.id);
                setSelectedStep(selectedStep === step.id ? null : step.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getStepColor(step.color)} text-white`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Step {step.id}</span>
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {step.activePatients} active
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        {step.completedToday} completed today
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg: {step.avgDuration} • Total: {step.totalPatients}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {expandedSteps.has(step.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            {expandedSteps.has(step.id) && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-sm font-medium text-muted-foreground px-2">Sub-steps</span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {step.substeps.map((substep, subIndex) => (
                      <div 
                        key={substep.id}
                        className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {substep.id}
                            </span>
                            <Badge className={getStatusColor(substep.status)}>
                              {substep.status}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {substep.patients}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{substep.title}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Next
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(step)}
                      >
                        View Details
                      </Button>
                      <Button size="sm">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Workflow Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-semibold text-foreground">68%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{ width: '68%' }} />
            </div>
            <div className="grid grid-cols-9 gap-2">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getStepColor(step.color)} ${
                    step.activePatients > 0 ? 'animate-pulse' : ''
                  }`} />
                  <span className="text-xs text-muted-foreground">{step.id}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Details Modal */}
      <Dialog open={showStepDetails} onOpenChange={setShowStepDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {currentStepDetails && (
                <>
                  <div className={`p-2 rounded-lg ${getStepColor(currentStepDetails.color)} text-white`}>
                    <currentStepDetails.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Step {currentStepDetails.id}</span>
                    <h2 className="text-2xl font-bold text-foreground">{currentStepDetails.title}</h2>
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentStepDetails?.description}
            </DialogDescription>
          </DialogHeader>

          {currentStepDetails && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold text-foreground">{currentStepDetails.keyMetrics.conversionRate}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold text-foreground">{currentStepDetails.keyMetrics.avgResponseTime}</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
                        <p className="text-2xl font-bold text-foreground">{currentStepDetails.keyMetrics.satisfactionScore}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                      <p className="text-3xl font-bold text-foreground">{currentStepDetails.totalPatients}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                      <p className="text-3xl font-bold text-blue-600">{currentStepDetails.activePatients}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                      <p className="text-3xl font-bold text-green-600">{currentStepDetails.completedToday}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                      <p className="text-3xl font-bold text-orange-600">{currentStepDetails.avgDuration}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottlenecks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Current Bottlenecks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentStepDetails.bottlenecks.map((bottleneck, index) => (
                      <Badge key={index} variant="destructive" className="text-sm">
                        {bottleneck}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Sub-steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Detailed Sub-steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentStepDetails.substeps.map((substep, index) => (
                      <div key={substep.id} className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              {substep.id}
                            </span>
                            <h4 className="font-semibold text-foreground">{substep.title}</h4>
                            <Badge className={getStatusColor(substep.status)}>
                              {substep.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{substep.patients} patients</p>
                              <p className="text-xs text-muted-foreground">Avg: {substep.avgTime}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{substep.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Step
                  </Button>
                  <Button variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Next Step
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workflow;
