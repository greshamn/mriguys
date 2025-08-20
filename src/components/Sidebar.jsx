import React from 'react';
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
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: RefreshCw, label: 'Lifecycle' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: FolderOpen, label: 'Projects' },
    { icon: Users, label: 'Team' },
    { icon: FileText, label: 'Documents' },
    { icon: BarChart3, label: 'Data Library' },
    { icon: FileSpreadsheet, label: 'Reports' },
    { icon: MessageSquare, label: 'Word Assistant' },
    { icon: MoreHorizontal, label: 'More' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Get Help' },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo and Quick Create */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">MRI Guys</h1>
        </div>
        <button className="w-full bg-sidebar-primary text-sidebar-primary-foreground px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-sidebar-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Quick Create
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <button
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 bg-sidebar-accent/50 text-sidebar-foreground placeholder-sidebar-foreground/50 rounded-lg text-sm border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
            MG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">MRI Guys</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">admin@mriguys.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
