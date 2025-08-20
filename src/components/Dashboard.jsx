import React from 'react';
import KPICard from './KPICard';
import ChartArea from './ChartArea';
import DocumentsTable from './DocumentsTable';
import AdditionalCharts from './AdditionalCharts';

const Dashboard = () => {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value="$1,250.00"
          change="+12.5%"
          changeType="positive"
        />
        <KPICard
          title="New Customers"
          value="1,234"
          change="-20%"
          changeType="negative"
        />
        <KPICard
          title="Active Accounts"
          value="45,678"
          change="+12.5%"
          changeType="positive"
        />
        <KPICard
          title="Growth Rate"
          value="4.5%"
          change="+2.1%"
          changeType="positive"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <ChartArea />
      </div>

      {/* Additional Charts */}
      <AdditionalCharts />

      {/* Documents Table */}
      <div className="bg-card rounded-lg border border-border p-6">
        <DocumentsTable />
      </div>
    </div>
  );
};

export default Dashboard;
