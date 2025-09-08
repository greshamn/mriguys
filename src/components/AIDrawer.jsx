import React from 'react';
import { X, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock, Users, DollarSign, Building2, FileText, Scale, BarChart3 } from 'lucide-react';
import { useRole } from '../context/RoleContext';

export const AIDrawer = ({ isOpen, onClose }) => {
  const { viewingAsRole } = useRole();

  // Role-specific AI insights based on PRD
  const getRoleInsights = () => {
    switch (viewingAsRole) {
      case 'patient':
        return [
          { type: 'tip', icon: Clock, text: 'Arrive 15 minutes early for your appointment', priority: 'high' },
          { type: 'reminder', icon: CheckCircle, text: 'Complete metal object checklist before scan', priority: 'medium' },
          { type: 'info', icon: Lightbulb, text: 'Bring your insurance card and ID', priority: 'low' }
        ];
      
      case 'referrer':
        return [
          { type: 'suggestion', icon: Building2, text: 'Best center for new referral: Downtown Imaging (2.3 miles, 24hr TAT)', priority: 'high' },
          { type: 'alert', icon: AlertCircle, text: '3 patients have reports ready for review', priority: 'medium' },
          { type: 'trend', icon: TrendingUp, text: 'Your no-show rate improved 15% this month', priority: 'low' }
        ];
      
      case 'imaging-center':
        return [
          { type: 'optimization', icon: BarChart3, text: 'Open 2 extra MRI slots Fri 2-4pm to hit 85% utilization', priority: 'high' },
          { type: 'alert', icon: AlertCircle, text: '2 reports pending radiologist review', priority: 'medium' },
          { type: 'trend', icon: TrendingUp, text: 'Average TAT improved to 18 hours', priority: 'low' }
        ];
      
      case 'attorney':
        return [
          { type: 'alert', icon: AlertCircle, text: 'Client Sarah M. at risk of no-show tomorrow', priority: 'high' },
          { type: 'missing', icon: FileText, text: 'Case #1234 missing radiology report', priority: 'medium' },
          { type: 'suggestion', icon: Scale, text: 'Generate case packet for settlement meeting', priority: 'low' }
        ];
      
      case 'funder':
        return [
          { type: 'priority', icon: DollarSign, text: 'Top 3 cases to approve today for best ROI', priority: 'high' },
          { type: 'trend', icon: TrendingUp, text: 'Average decision time: 2.3 days', priority: 'medium' },
          { type: 'info', icon: Users, text: '15 applications pending review', priority: 'low' }
        ];
      
      case 'ops':
        return [
          { type: 'optimization', icon: Building2, text: 'Reassign to Downtown Center - 3 slots available tomorrow', priority: 'high' },
          { type: 'alert', icon: AlertCircle, text: '5 referrals aged >7 days need attention', priority: 'medium' },
          { type: 'trend', icon: BarChart3, text: 'Overall show rate: 87% (+3% vs last week)', priority: 'low' }
        ];
      
      default: // admin
        return [
          { type: 'system', icon: Lightbulb, text: 'System health: All services operational', priority: 'low' },
          { type: 'info', icon: Users, text: 'Active users: 47 across all roles', priority: 'low' },
          { type: 'trend', icon: TrendingUp, text: 'Platform utilization: 89%', priority: 'low' }
        ];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tip':
        return '💡';
      case 'alert':
        return '⚠️';
      case 'suggestion':
        return '💡';
      case 'optimization':
        return '📈';
      case 'trend':
        return '📊';
      case 'missing':
        return '❌';
      case 'priority':
        return '🎯';
      case 'info':
        return 'ℹ️';
      case 'system':
        return '⚙️';
      default:
        return '💡';
    }
  };

  const insights = getRoleInsights();

  return (
    <div className={`
      fixed top-0 right-0 z-40 h-full w-80 bg-card border-l border-border shadow-xl
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      lg:relative lg:translate-x-0 lg:z-auto
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors lg:hidden"
            aria-label="Close AI drawer"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-2 bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Logged in as: {viewingAsRole.replace('-', ' ')}
          </span>
        </div>

        {/* Insights Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No insights available</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getTypeIcon(insight.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-current">
                      {insight.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.priority} priority
                      </span>
                      <span className="text-xs text-current/70 capitalize">
                        {insight.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            AI insights update every 5 minutes
          </div>
        </div>
      </div>
    </div>
  );
};
