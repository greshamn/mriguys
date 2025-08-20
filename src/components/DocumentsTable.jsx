import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';

const DocumentsTable = () => {
  const [activeTab, setActiveTab] = useState('outline');

  const tabs = [
    { id: 'outline', label: 'Outline', count: null },
    { id: 'past-performance', label: 'Past Performance', count: 3 },
    { id: 'key-personnel', label: 'Key Personnel', count: 2 },
    { id: 'focus-documents', label: 'Focus Documents', count: null }
  ];

  const documents = [
    {
      header: 'Cover page',
      sectionType: 'Cover page',
      target: '18',
      limit: '5',
      reviewer: 'Eddie Lake'
    }
  ];

  return (
    <div>
      {/* Tabs and Actions */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
            Customize Columns
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Header</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Section Type</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Target</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Limit</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-foreground">{doc.header}</td>
                  <td className="py-3 px-4 text-foreground">{doc.sectionType}</td>
                  <td className="py-3 px-4 text-foreground">{doc.target}</td>
                  <td className="py-3 px-4 text-foreground">{doc.limit}</td>
                  <td className="py-3 px-4 text-foreground">{doc.reviewer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTable;
