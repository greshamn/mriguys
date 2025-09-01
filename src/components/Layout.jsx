import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';
import { AIDrawer } from './AIDrawer';
import { ActionBar } from './ActionBar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [aiDrawerOpen, setAIDrawerOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  const handleAIToggle = () => {
    setAIDrawerOpen(!aiDrawerOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Menu Bar */}
      <TopMenu 
        onThemeChange={handleThemeChange}
        onSidebarToggle={handleSidebarToggle}
        onAIToggle={handleAIToggle}
        aiDrawerOpen={aiDrawerOpen}
      />
      
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          collapsed={sidebarCollapsed}
          onCollapse={handleSidebarCollapse}
        />
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
          
          {/* Right AI Insights Drawer */}
          {aiDrawerOpen && (
            <AIDrawer 
              isOpen={aiDrawerOpen}
              onClose={() => setAIDrawerOpen(false)}
            />
          )}
        </div>
      </div>
      
      {/* Sticky Action Bar */}
      <ActionBar />
    </div>
  );
}
