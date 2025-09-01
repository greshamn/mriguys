import React from 'react';
import { Button } from './ui/button';
import { Plus, FileText, Download, Send, CheckCircle, Clock, Search, Settings, Edit, DollarSign } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useLocation } from 'react-router-dom';

export const ActionBar = () => {
  const { viewingAsRole } = useRole();
  const location = useLocation();

  // Get action buttons based on current route and role
  const getActionButtons = () => {
    const path = location.pathname;
    
    // Worklist actions
    if (path === '/worklist') {
      switch (viewingAsRole) {
        case 'imaging-center':
          return [
            { label: 'Add Appointment', icon: Plus, variant: 'default', action: () => console.log('Add Appointment') },
            { label: 'Export Data', icon: Download, variant: 'outline', action: () => console.log('Export Data') },
            { label: 'Upload Report', icon: FileText, variant: 'outline', action: () => console.log('Upload Report') }
          ];
        default:
          return [];
      }
    }
    
    // Slots actions
    if (path === '/slots') {
      switch (viewingAsRole) {
        case 'imaging-center':
          return [
            { label: 'Add Slot', icon: Plus, variant: 'default', action: () => console.log('Add Slot') },
            { label: 'Export Schedule', icon: Download, variant: 'outline', action: () => console.log('Export Schedule') },
            { label: 'Bulk Edit', icon: Edit, variant: 'outline', action: () => console.log('Bulk Edit') }
          ];
        default:
          return [];
      }
    }
    
    // Billing actions
    if (path === '/billing') {
      switch (viewingAsRole) {
        case 'imaging-center':
          return [
            { label: 'Create Bill', icon: Plus, variant: 'default', action: () => console.log('Create Bill') },
            { label: 'Export Reports', icon: Download, variant: 'outline', action: () => console.log('Export Reports') },
            { label: 'Send Reminders', icon: Send, variant: 'outline', action: () => console.log('Send Reminders') }
          ];
        default:
          return [];
      }
    }
    
    // Dashboard actions
    if (path === '/dashboard') {
      switch (viewingAsRole) {
        case 'patient':
          return [
            { label: 'View Results', icon: FileText, variant: 'default', action: () => console.log('View Results') },
            { label: 'Message Center', icon: Send, variant: 'outline', action: () => console.log('Message Center') }
          ];
        
        case 'referrer':
          return [
            { label: 'New Referral', icon: Plus, variant: 'default', action: () => console.log('New Referral') },
            { label: 'View Reports', icon: FileText, variant: 'outline', action: () => console.log('View Reports') }
          ];
        
        case 'imaging-center':
          return [
            { label: 'Upload Report', icon: FileText, variant: 'default', action: () => console.log('Upload Report') },
            { label: 'Manage Slots', icon: Clock, variant: 'outline', action: () => window.location.href = '/slots' },
            { label: 'View Worklist', icon: Clock, variant: 'outline', action: () => window.location.href = '/worklist' },
            { label: 'Billing', icon: DollarSign, variant: 'outline', action: () => window.location.href = '/billing' }
          ];
        
        case 'attorney':
          return [
            { label: 'Generate Packet', icon: Download, variant: 'default', action: () => console.log('Generate Packet') },
            { label: 'Manage Liens', icon: Settings, variant: 'outline', action: () => console.log('Manage Liens') }
          ];
        
        case 'funder':
          return [
            { label: 'Review Applications', icon: CheckCircle, variant: 'default', action: () => console.log('Review Applications') },
            { label: 'View Exposure', icon: Search, variant: 'outline', action: () => console.log('View Exposure') }
          ];
        
        case 'ops':
          return [
            { label: 'Triage Queues', icon: Clock, variant: 'default', action: () => console.log('Triage Queues') },
            { label: 'View Scorecards', icon: FileText, variant: 'outline', action: () => console.log('View Scorecards') }
          ];
        
        default: // admin
          return [
            { label: 'Manage Users', icon: Settings, variant: 'default', action: () => console.log('Manage Users') },
            { label: 'System Settings', icon: Settings, variant: 'outline', action: () => console.log('System Settings') }
          ];
      }
    }
    
    // Referral flow actions
    if (path === '/referral') {
      return [
        { label: 'Save Draft', icon: FileText, variant: 'outline', action: () => console.log('Save Draft') },
        { label: 'Submit Referral', icon: Send, variant: 'default', action: () => console.log('Submit Referral') }
      ];
    }
    
    // Cases actions
    if (path === '/cases') {
      return [
        { label: 'New Case', icon: Plus, variant: 'default', action: () => console.log('New Case') },
        { label: 'Export Data', icon: Download, variant: 'outline', action: () => console.log('Export Data') }
      ];
    }
    
    // Default actions
    return [
      { label: 'Quick Action', icon: Plus, variant: 'default', action: () => console.log('Quick Action') }
    ];
  };

  const actionButtons = getActionButtons();

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <div className="flex flex-col gap-2 items-end">
        {actionButtons.map((button, index) => (
          <Button
            key={index}
            onClick={button.action}
            variant={button.variant}
            size="lg"
            className={`
              shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out
              backdrop-blur-sm bg-opacity-95
              ${button.variant === 'default' 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25' 
                : 'bg-background/95 text-foreground border-border hover:bg-accent hover:text-accent-foreground shadow-black/10'
              }
            `}
          >
            <button.icon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{button.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
