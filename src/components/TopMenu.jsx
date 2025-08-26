import React, { useState, useEffect } from 'react';
import { Sun, Moon, Maximize2, Minimize2, Menu, Lightbulb, Search, Bell } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { CommandModal } from './CommandModal';

const TopMenu = ({ onThemeChange, onSidebarToggle, onAIToggle, aiDrawerOpen }) => {
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandModalOpen, setCommandModalOpen] = useState(false);

  // Check initial theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Notify parent component
    if (onThemeChange) {
      onThemeChange(newTheme ? 'dark' : 'light');
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Listen for Command-K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      {/* Left side - Logo and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">MG</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            MRIGuys Platform
          </h1>
        </div>
      </div>

      {/* Center - Global Search Input and Find Centers */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients, cases, reports..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 text-foreground placeholder-muted-foreground rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
        
        {/* Find Centers Quick Access */}
        <a
          href="/centers"
          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
        >
          🗺️ Find Centers
        </a>
      </div>

      {/* Right side - Role Switcher, AI Toggle, Command-K, Theme, and Fullscreen buttons */}
      <div className="flex items-center gap-2">
        {/* Role Switcher - Only visible to admins */}
        <RoleSwitcher />
        
        {/* Notifications Bell */}
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors relative group"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-foreground" />
          
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs text-white bg-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            3 new notifications
          </div>
        </button>
        
        {/* AI Insights Toggle */}
        <button
          onClick={onAIToggle}
          className={`p-2 rounded-lg transition-colors relative group ${
            aiDrawerOpen 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted text-foreground'
          }`}
          aria-label="Toggle AI insights"
        >
          <Lightbulb className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs text-white bg-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {aiDrawerOpen ? 'Hide' : 'Show'} AI insights
          </div>
        </button>

        {/* Command-K Button */}
        <button
          onClick={() => setCommandModalOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative group"
          aria-label="Open command palette"
        >
          <Search className="w-5 h-5 text-foreground" />
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs text-white bg-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Quick actions (⌘K)
          </div>
        </button>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative group"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs text-white bg-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Toggle {isDark ? 'light' : 'dark'} mode
          </div>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative group"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-foreground" />
          ) : (
            <Maximize2 className="w-5 h-5 text-foreground" />
          )}
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs text-white bg-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          </div>
        </button>
      </div>
      
      {/* Command Modal */}
      <CommandModal 
        isOpen={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
      />
    </div>
  );
};

export default TopMenu;
