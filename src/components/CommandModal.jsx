import React, { useState, useEffect } from 'react';
import { Search, Command, X, ArrowRight, FileText, Users, Settings, Building2, BarChart3, Plus, Download, Clock, DollarSign, Scale } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';

export const CommandModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { viewingAsRole } = useRole();
  const navigate = useNavigate();

  // Command categories based on PRD
  const commandCategories = [
    {
      name: 'Navigation',
      icon: ArrowRight,
      commands: [
        { id: 'dashboard', label: 'Go to Dashboard', icon: BarChart3, action: () => navigate('/dashboard') },
        { id: 'referral', label: 'New Referral', icon: Plus, action: () => navigate('/referral') },
        { id: 'cases', label: 'Case Management', icon: FileText, action: () => navigate('/cases') },
        { id: 'settings', label: 'Settings', icon: Settings, action: () => navigate('/settings') }
      ]
    },
    {
      name: 'Quick Actions',
      icon: Plus,
      commands: [
        { id: 'new-patient', label: 'Create Patient', icon: Users, action: () => console.log('Create Patient') },
        { id: 'upload-report', label: 'Upload Report', icon: FileText, action: () => console.log('Upload Report') },
        { id: 'generate-packet', label: 'Generate Case Packet', icon: Download, action: () => console.log('Generate Packet') },
        { id: 'approve-funding', label: 'Approve Funding', icon: DollarSign, action: () => console.log('Approve Funding') }
      ]
    },
    {
      name: 'Role-Specific',
      icon: Settings,
      commands: getRoleSpecificCommands()
    }
  ];

  function getRoleSpecificCommands() {
    switch (viewingAsRole) {
      case 'patient':
        return [
          { id: 'view-results', label: 'View Test Results', icon: FileText, action: () => console.log('View Results') },
          { id: 'reschedule', label: 'Reschedule Appointment', icon: Clock, action: () => console.log('Reschedule') }
        ];
      
      case 'referrer':
        return [
          { id: 'referral-wizard', label: 'Referral Wizard', icon: Plus, action: () => navigate('/referral') },
          { id: 'patient-list', label: 'Patient List', icon: Users, action: () => console.log('Patient List') }
        ];
      
      case 'imaging-center':
        return [
          { id: 'worklist', label: 'View Worklist', icon: Clock, action: () => navigate('/worklist') },
          { id: 'slot-manager', label: 'Slot Manager', icon: Settings, action: () => navigate('/slots') },
          { id: 'billing', label: 'Billing Management', icon: DollarSign, action: () => navigate('/billing') }
        ];
      
      case 'attorney':
        return [
          { id: 'case-packet', label: 'Generate Case Packet', icon: Download, action: () => console.log('Case Packet') },
          { id: 'lien-ledger', label: 'Lien Ledger', icon: Scale, action: () => console.log('Lien Ledger') }
        ];
      
      case 'funder':
        return [
          { id: 'review-queue', label: 'Review Queue', icon: Clock, action: () => console.log('Review Queue') },
          { id: 'exposure-chart', label: 'Exposure Chart', icon: BarChart3, action: () => console.log('Exposure Chart') }
        ];
      
      case 'ops':
        return [
          { id: 'triage-queues', label: 'Triage Queues', icon: Clock, action: () => console.log('Triage Queues') },
          { id: 'center-scorecards', label: 'Center Scorecards', icon: BarChart3, action: () => console.log('Scorecards') }
        ];
      
      default: // admin
        return [
          { id: 'user-management', label: 'User Management', icon: Users, action: () => console.log('User Management') },
          { id: 'system-settings', label: 'System Settings', icon: Settings, action: () => console.log('System Settings') }
        ];
    }
  }

  // Flatten all commands for search
  const allCommands = commandCategories.flatMap(category => 
    category.commands.map(cmd => ({ ...cmd, category: category.name }))
  );

  // Filter commands based on search query
  const filteredCommands = allCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Command className="w-4 h-4" />
            <span className="text-sm font-medium">Quick Actions</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 p-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors
                  ${index === selectedIndex ? 'bg-accent text-accent-foreground' : ''}
                `}
              >
                <command.icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{command.label}</div>
                  <div className="text-xs text-muted-foreground">{command.category}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </div>
    </div>
  );
};
