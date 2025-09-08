import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  RefreshCw, 
  BarChart3, 
  FolderOpen, 
  Users, 
  FileText, 
  FileSpreadsheet, 
  MessageSquare, 
  MoreHorizontal,
  Settings,
  HelpCircle,
  Search,
  Plus,
  ChevronDown,
  Building2,
  Scale,
  DollarSign,
  Clock,
  Download,
  Upload,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

const Sidebar = ({ isOpen, onToggle, collapsed = false, onCollapse }) => {
  const { viewingAsRole } = useRole();
  const location = useLocation();

  // Role-specific navigation based on PRD
  const getNavigationItems = () => {
    switch (viewingAsRole) {
      case 'patient':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: FileText, label: 'My Results', path: '/results', active: location.pathname === '/results' },
          { icon: Clock, label: 'Appointments', path: '/appointments', active: location.pathname === '/appointments' },
          { icon: MessageSquare, label: 'Messages', path: '/messages', active: location.pathname === '/messages' }
        ];
      
      case 'referrer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: Plus, label: 'New Referral', path: '/referral', active: location.pathname === '/referral' },
          { icon: FileText, label: 'Referrals', path: '/referrals', active: location.pathname === '/referrals' },
          { icon: Users, label: 'Patients', path: '/patients', active: location.pathname === '/patients' },
          { icon: MessageSquare, label: 'Messages', path: '/messages', active: location.pathname === '/messages' }
        ];
      
      case 'imaging-center':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: Clock, label: 'Worklist', path: '/worklist', active: location.pathname === '/worklist' },
          { icon: Settings, label: 'Slots', path: '/slots', active: location.pathname === '/slots' },
          { icon: FileSpreadsheet, label: 'Billing', path: '/billing', active: location.pathname === '/billing' }
        ];
      
      case 'attorney':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: Download, label: 'Case Packet', path: '/case-packet', active: location.pathname === '/case-packet' },
          { icon: Scale, label: 'Lien Ledger', path: '/lien', active: location.pathname === '/lien' },
          { icon: Users, label: 'Clients', path: '/clients', active: location.pathname === '/clients' }
        ];
      
      case 'funder':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: RefreshCw, label: 'Pipeline', path: '/pipeline', active: location.pathname === '/pipeline' },
          { icon: BarChart3, label: 'Reports', path: '/reports', active: location.pathname === '/reports' }
        ];
      
      case 'ops':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: Clock, label: 'Queues', path: '/queues', active: location.pathname === '/queues' },
          { icon: BarChart3, label: 'Scorecards', path: '/scorecards', active: location.pathname === '/scorecards' },
          { icon: RefreshCw, label: 'Reports', path: '/reports', active: location.pathname === '/reports' },
          { icon: Settings, label: 'Settings', path: '/settings', active: location.pathname === '/settings' }
        ];
      
      default: // admin
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
          { icon: Users, label: 'Users & Roles', path: '/users', active: location.pathname === '/users' },
          { icon: Settings, label: 'System Settings', path: '/settings', active: location.pathname === '/settings' },
          { icon: BarChart3, label: 'Analytics', path: '/analytics', active: location.pathname === '/analytics' },
          { icon: FileText, label: 'Master Data', path: '/master-data', active: location.pathname === '/master-data' }
        ];
    }
  };

  const navigationItems = getNavigationItems();
  const navigate = useNavigate();

  // Common navigation items that appear for all roles
  const commonItems = [
    { icon: Search, label: 'Find Centers', path: '/centers', active: location.pathname === '/centers' }
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Get Help', path: '/help' },
  ];

  const handleNavigationClick = (path) => {
    navigate(path);
  };

  // Helper function to get quick action label based on current role
  const getQuickActionLabel = () => {
    switch (viewingAsRole) {
      case 'referrer':
        return 'New Referral';
      case 'imaging-center':
        return 'View Worklist';
      case 'attorney':
        return 'New Case';
      case 'funder':
        return 'Review App';
      case 'ops':
        return 'Triage Queue';
      case 'patient':
        return 'Book Scan';
      default:
        return 'Quick Action';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-card border-r border-border
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and Quick Create */}
          <div className={`border-b border-border ${collapsed ? 'p-2' : 'p-6'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} ${collapsed ? 'mb-6' : 'mb-4'}`}>
              {!collapsed && <h1 className="text-xl font-bold text-card-foreground">MRIGuys</h1>}
              {collapsed && <h1 className="text-lg font-bold text-card-foreground">MG</h1>}
              
              {/* Collapse Toggle Button - Only show on desktop when expanded */}
              {!collapsed && (
                <button
                  onClick={onCollapse}
                  className="p-1 rounded hover:bg-accent transition-colors lg:block hidden"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4 text-card-foreground" />
                </button>
              )}
            </div>
            
            {/* Quick Action Button */}
            <button 
              className={`bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors ${
                collapsed ? 'w-12 h-12' : 'w-full px-4 py-2'
              }`}
              title={collapsed ? getQuickActionLabel() : undefined}
              onClick={() => handleNavigationClick(
                viewingAsRole === 'referrer' 
                  ? '/referral' 
                  : (viewingAsRole === 'imaging-center' 
                      ? '/worklist' 
                      : (viewingAsRole === 'patient' ? '/centers' : '/dashboard'))
              )}
            >
              <Plus className={`${collapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
              {!collapsed && getQuickActionLabel()}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${collapsed ? 'p-2' : 'p-4'}`}>
            <ul className="space-y-2">
              {/* Common items for all roles */}
              {commonItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigationClick(item.path)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`${collapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                    {!collapsed && item.label}
                  </button>
                </li>
              ))}
              
              {/* Separator */}
              {!collapsed && (
                <li className="py-2">
                  <div className="border-t border-border"></div>
                </li>
              )}
              
              {/* Role-specific items */}
              {navigationItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigationClick(item.path)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`${collapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                    {!collapsed && item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className={`border-t border-border space-y-2 ${collapsed ? 'p-2' : 'p-4'}`}>
            {bottomItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigationClick(item.path)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`${collapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                {!collapsed && item.label}
              </button>
            ))}
            
            {/* Search - Hide when collapsed */}
            {!collapsed && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 bg-muted/50 text-card-foreground placeholder-muted-foreground rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {/* User Profile */}
            <div className={`flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}>
              <div className={`bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium ${
                collapsed ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
              }`}>
                MG
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">N4Mative</p>
                  <p className="text-xs text-muted-foreground truncate">admin@n4mative.com</p>
                </div>
              )}
              {!collapsed && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Expand Button - Show when collapsed */}
      {collapsed && (
        <button
          onClick={onCollapse}
          className="fixed left-16 top-20 z-50 p-1.5 bg-card border border-border rounded-md shadow-lg hover:bg-accent transition-colors lg:block hidden"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-3 h-3 text-card-foreground" />
        </button>
      )}
    </>
  );
};



export default Sidebar;
