import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopMenu from './components/TopMenu';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('light');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Menu Bar */}
      <TopMenu 
        onThemeChange={handleThemeChange}
        onSidebarToggle={handleSidebarToggle}
      />
      
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
