import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdditionalCharts = () => {
  // Pie Chart data for Revenue Distribution
  const pieData = [
    { name: 'MRI Scans', value: 44, color: 'var(--chart-1)' },
    { name: 'Consultations', value: 55, color: 'var(--chart-2)' },
    { name: 'Equipment', value: 13, color: 'var(--chart-3)' },
    { name: 'Maintenance', value: 43, color: 'var(--chart-4)' },
    { name: 'Other', value: 22, color: 'var(--chart-5)' }
  ];

  // Bar Chart data for Monthly Performance
  const barData = [
    { month: 'Jan', revenue: 400, expenses: 300 },
    { month: 'Feb', revenue: 430, expenses: 320 },
    { month: 'Mar', revenue: 448, expenses: 340 },
    { month: 'Apr', revenue: 470, expenses: 360 },
    { month: 'May', revenue: 540, expenses: 400 },
    { month: 'Jun', revenue: 580, expenses: 420 },
    { month: 'Jul', revenue: 690, expenses: 480 },
    { month: 'Aug', revenue: 1100, expenses: 800 },
    { month: 'Sep', revenue: 1200, expenses: 850 },
    { month: 'Oct', revenue: 1380, expenses: 900 },
    { month: 'Nov', revenue: 1400, expenses: 950 },
    { month: 'Dec', revenue: 1500, expenses: 1000 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Distribution Pie Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance Bar Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `$${value}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)'
                }}
                formatter={(value, name) => [`$${value}k`, name]}
              />
              <Legend 
                wrapperStyle={{
                  color: 'var(--foreground)'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="var(--chart-1)" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="var(--chart-2)" 
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdditionalCharts;
