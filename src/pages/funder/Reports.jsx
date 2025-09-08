import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  BarChart3, Download, FileText, TrendingUp, Calendar, Filter, 
  RefreshCw, Eye, Settings, ArrowRight, PieChart, LineChart,
  Activity, DollarSign, Users, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'financial', label: 'Financial Summary', icon: DollarSign, color: 'emerald' },
  { id: 'performance', label: 'Performance Metrics', icon: TrendingUp, color: 'blue' },
  { id: 'cases', label: 'Case Analysis', icon: FileText, color: 'purple' },
  { id: 'trends', label: 'Trend Analysis', icon: LineChart, color: 'orange' },
  { id: 'compliance', label: 'Compliance Report', icon: CheckCircle, color: 'green' },
  { id: 'custom', label: 'Custom Report', icon: Settings, color: 'gray' }
];

const TIME_PERIODS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: '1y', label: 'Last Year' },
  { id: 'custom', label: 'Custom Range' }
];

const GENERATED_REPORTS = [
  {
    id: 1,
    name: 'Q4 2024 Financial Summary',
    type: 'financial',
    generated: '2024-12-15T10:30:00Z',
    size: '2.4 MB',
    status: 'ready',
    downloads: 12
  },
  {
    id: 2,
    name: 'Monthly Performance Dashboard',
    type: 'performance',
    generated: '2024-12-14T15:45:00Z',
    size: '1.8 MB',
    status: 'ready',
    downloads: 8
  },
  {
    id: 3,
    name: 'Case Volume Analysis',
    type: 'cases',
    generated: '2024-12-13T09:15:00Z',
    size: '3.2 MB',
    status: 'ready',
    downloads: 15
  },
  {
    id: 4,
    name: 'Risk Assessment Report',
    type: 'compliance',
    generated: '2024-12-12T14:20:00Z',
    size: '4.1 MB',
    status: 'ready',
    downloads: 6
  },
  {
    id: 5,
    name: 'Custom Investment Analysis',
    type: 'custom',
    generated: '2024-12-11T11:30:00Z',
    size: '2.9 MB',
    status: 'generating',
    downloads: 0
  }
];

export default function FunderReports() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  const handleGenerateReport = async () => {
    if (!selectedType) return;
    
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // Add to generated reports (in a real app, this would be saved to backend)
    const newReport = {
      id: Date.now(),
      name: `${REPORT_TYPES.find(t => t.id === selectedType)?.label} - ${new Date().toLocaleDateString()}`,
      type: selectedType,
      generated: new Date().toISOString(),
      size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      status: 'ready',
      downloads: 0
    };
    
    // In a real app, you'd update the state or call an API
    console.log('Generated report:', newReport);
  };

  const handlePreviewReport = (report) => {
    setPreviewReport(report);
    setShowPreview(true);
  };

  const getReportSample = (reportType) => {
    switch (reportType) {
      case 'financial':
        return {
          title: 'Financial Summary Report',
          subtitle: 'Q4 2024 Investment Performance & ROI Analysis',
          sections: [
            {
              title: 'Investment Overview',
              content: 'Total Investment: $2.4M | Active Cases: 156 | ROI: 23.4%',
              chart: 'pie'
            },
            {
              title: 'Revenue Breakdown',
              content: 'Settled Cases: $1.8M | Pending Cases: $600K | Expected ROI: 18.2%',
              chart: 'bar'
            }
          ]
        };
      case 'performance':
        return {
          title: 'Performance Metrics Dashboard',
          subtitle: 'Monthly KPI Analysis & Trend Monitoring',
          sections: [
            {
              title: 'Key Performance Indicators',
              content: 'Case Resolution Rate: 94% | Average Processing Time: 12 days | Client Satisfaction: 4.8/5',
              chart: 'line'
            },
            {
              title: 'Efficiency Metrics',
              content: 'Automation Rate: 78% | Manual Review: 22% | Cost per Case: $245',
              chart: 'area'
            }
          ]
        };
      case 'cases':
        return {
          title: 'Case Analysis Report',
          subtitle: 'Comprehensive Case Volume & Outcome Analysis',
          sections: [
            {
              title: 'Case Volume Trends',
              content: 'Total Cases: 1,247 | New This Month: 89 | Closed: 156 | Success Rate: 91%',
              chart: 'bar'
            },
            {
              title: 'Outcome Distribution',
              content: 'Settled: 68% | Dismissed: 12% | Pending: 20% | Average Settlement: $8,450',
              chart: 'pie'
            }
          ]
        };
      case 'trends':
        return {
          title: 'Trend Analysis Report',
          subtitle: 'Market Trends & Predictive Analytics',
          sections: [
            {
              title: 'Market Trends',
              content: 'Case Volume Growth: +15% MoM | Settlement Values: +8% YoY | Processing Efficiency: +12%',
              chart: 'line'
            },
            {
              title: 'Predictive Insights',
              content: 'Q1 2025 Forecast: 1,400 cases | Risk Assessment: Low-Medium | Recommended Investment: $2.8M',
              chart: 'area'
            }
          ]
        };
      case 'compliance':
        return {
          title: 'Compliance Report',
          subtitle: 'Regulatory Compliance & Risk Assessment',
          sections: [
            {
              title: 'Compliance Status',
              content: 'Regulatory Compliance: 98.5% | Audit Score: A+ | Risk Level: Low | Last Review: Dec 15, 2024',
              chart: 'gauge'
            },
            {
              title: 'Risk Assessment',
              content: 'High Risk Cases: 3% | Medium Risk: 15% | Low Risk: 82% | Mitigation Actions: 12 Active',
              chart: 'pie'
            }
          ]
        };
      case 'custom':
        return {
          title: 'Custom Investment Analysis',
          subtitle: 'Tailored Analysis Based on Selected Parameters',
          sections: [
            {
              title: 'Custom Metrics',
              content: 'Selected Timeframe: 90 days | Filtered Cases: 234 | Custom ROI: 19.7% | Risk Score: 6.2/10',
              chart: 'mixed'
            },
            {
              title: 'Custom Insights',
              content: 'Portfolio Performance: Above Average | Recommended Actions: 5 | Next Review: Jan 15, 2025',
              chart: 'bar'
            }
          ]
        };
      default:
        return {
          title: 'Report Preview',
          subtitle: 'Generated Report Sample',
          sections: [
            {
              title: 'Sample Data',
              content: 'This is a sample report preview',
              chart: 'pie'
            }
          ]
        };
    }
  };

  const getReportIcon = (type) => {
    const reportType = REPORT_TYPES.find(t => t.id === type);
    return reportType ? reportType.icon : FileText;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    const reportType = REPORT_TYPES.find(t => t.id === type);
    return reportType ? `bg-${reportType.color}-100 text-${reportType.color}-800` : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Generator</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive reports and analytics for your funding operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Report Generator */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Type Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Report Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {REPORT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedType === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                          <Icon className={`h-5 w-5 text-${type.color}-600`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-500">Comprehensive analysis</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Period Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Start Date</Label>
                    <Input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">End Date</Label>
                    <Input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedType || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-gray-600 border-b bg-gray-50">
                <tr>
                  <th className="py-4 px-4 font-semibold text-left">Report Name</th>
                  <th className="py-4 px-4 font-semibold text-left">Type</th>
                  <th className="py-4 px-4 font-semibold text-left">Generated</th>
                  <th className="py-4 px-4 font-semibold text-left">Size</th>
                  <th className="py-4 px-4 font-semibold text-left">Status</th>
                  <th className="py-4 px-4 font-semibold text-left">Downloads</th>
                  <th className="py-4 px-4 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {GENERATED_REPORTS.map((report) => {
                  const Icon = getReportIcon(report.type);
                  return (
                    <tr key={report.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{report.name}</div>
                            <div className="text-xs text-gray-500">Report ID: {report.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getTypeColor(report.type)}>
                          {REPORT_TYPES.find(t => t.id === report.type)?.label || report.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(report.generated).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {report.size}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {report.downloads}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={report.status !== 'ready'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Report Preview — {previewReport?.name}
            </DialogTitle>
            <DialogDescription>
              Preview of your generated report
            </DialogDescription>
          </DialogHeader>
          {previewReport && (() => {
            const reportSample = getReportSample(previewReport.type);
            const reportType = REPORT_TYPES.find(t => t.id === previewReport.type);
            const Icon = reportType?.icon || BarChart3;
            
            return (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className={`w-16 h-16 bg-${reportType?.color || 'blue'}-100 rounded-full flex items-center justify-center mx-auto`}>
                      <Icon className={`h-8 w-8 text-${reportType?.color || 'blue'}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{reportSample.title}</h3>
                      <p className="text-gray-600">{reportSample.subtitle}</p>
                      <p className="text-sm text-gray-500 mt-2">Generated on {new Date(previewReport.generated).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Report Sections */}
                <div className="space-y-4">
                  {reportSample.sections.map((section, index) => {
                    const getChartIcon = (chartType) => {
                      switch (chartType) {
                        case 'pie': return PieChart;
                        case 'bar': return BarChart3;
                        case 'line': return LineChart;
                        case 'area': return Activity;
                        case 'gauge': return TrendingUp;
                        case 'mixed': return Settings;
                        default: return BarChart3;
                      }
                    };
                    
                    const ChartIcon = getChartIcon(section.chart);
                    const chartColors = [
                      'from-blue-50 to-indigo-50 text-blue-400',
                      'from-green-50 to-emerald-50 text-green-400',
                      'from-purple-50 to-violet-50 text-purple-400',
                      'from-orange-50 to-amber-50 text-orange-400',
                      'from-red-50 to-pink-50 text-red-400',
                      'from-cyan-50 to-teal-50 text-cyan-400'
                    ];
                    
                    return (
                      <div key={index} className="bg-white rounded-lg p-4 border">
                        <h4 className="font-medium text-gray-900 mb-3">{section.title}</h4>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">{section.content}</p>
                        </div>
                        <div className={`h-32 bg-gradient-to-r ${chartColors[index % chartColors.length]} rounded flex items-center justify-center`}>
                          <ChartIcon className="h-12 w-12" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Report Footer */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>File Size: {previewReport.size}</span>
                      <span>Downloads: {previewReport.downloads}</span>
                      <span>Status: {previewReport.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(previewReport.status)}>
                        {previewReport.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                  <Button disabled={previewReport.status !== 'ready'}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
