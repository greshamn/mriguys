import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const timelineSteps = [
  { id: 'referral', label: 'Referral Received', icon: CheckCircle },
  { id: 'booking', label: 'Appointment Booked', icon: CheckCircle },
  { id: 'scan', label: 'Scan Completed', icon: Clock },
  { id: 'report', label: 'Report Ready', icon: AlertCircle }
];

export function Timeline({ currentStep = 'scan', className }) {
  const getStepStatus = (stepId, currentStep) => {
    const stepIndex = timelineSteps.findIndex(step => step.id === stepId);
    const currentIndex = timelineSteps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'text-green-600 bg-green-100 border-green-300',
          line: 'bg-green-300',
          text: 'text-green-700'
        };
      case 'current':
        return {
          icon: 'text-blue-600 bg-blue-100 border-blue-300 animate-pulse',
          line: 'bg-gray-300',
          text: 'text-blue-700 font-medium'
        };
      default:
        return {
          icon: 'text-gray-400 bg-gray-100 border-gray-300',
          line: 'bg-gray-300',
          text: 'text-gray-500'
        };
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-center justify-between">
        {timelineSteps.map((step, index) => {
          const status = getStepStatus(step.id, currentStep);
          const styles = getStepStyles(status);
          const IconComponent = step.icon;
          const isLast = index === timelineSteps.length - 1;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 relative z-10",
                styles.icon
              )}>
                <IconComponent className="w-5 h-5" />
              </div>
              
              {/* Label */}
              <div className={cn(
                "text-xs text-center mt-2 transition-colors duration-200",
                styles.text
              )}>
                {step.label}
              </div>
              
              {/* Connecting Line - Fixed positioning */}
              {!isLast && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 hidden sm:block" style={{ transform: 'translateY(-50%)', zIndex: 1 }}>
                  <div className={cn(
                    "h-full w-full transition-colors duration-200",
                    styles.line
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile connecting lines */}
      <div className="flex sm:hidden mt-4 space-x-2">
        {timelineSteps.map((_, index) => {
          if (index === timelineSteps.length - 1) return null;
          const status = getStepStatus(timelineSteps[index].id, currentStep);
          const styles = getStepStyles(status);
          
          return (
            <div
              key={index}
              className={cn(
                "flex-1 h-1 rounded transition-colors duration-200",
                styles.line
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
