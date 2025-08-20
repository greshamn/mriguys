import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartArea = () => {
  const [activeTimeRange, setActiveTimeRange] = useState('30');

  const timeRanges = [
    { value: '3', label: 'Last 3 months' },
    { value: '30', label: 'Last 30 days' },
    { value: '7', label: 'Last 7 days' }
  ];

  // Sample data for the chart
  const data = [
    { date: 'Jun 1', total: 31, returning: 11 },
    { date: 'Jun 2', total: 40, returning: 32 },
    { date: 'Jun 3', total: 28, returning: 45 },
    { date: 'Jun 4', total: 51, returning: 32 },
    { date: 'Jun 5', total: 42, returning: 34 },
    { date: 'Jun 6', total: 109, returning: 52 },
    { date: 'Jun 7', total: 100, returning: 41 },
    { date: 'Jun 8', total: 120, returning: 80 },
    { date: 'Jun 9', total: 80, returning: 96 },
    { date: 'Jun 10', total: 95, returning: 54 },
    { date: 'Jun 11', total: 110, returning: 67 },
    { date: 'Jun 12', total: 125, returning: 89 },
    { date: 'Jun 13', total: 140, returning: 76 },
    { date: 'Jun 14', total: 135, returning: 98 },
    { date: 'Jun 15', total: 150, returning: 87 },
    { date: 'Jun 16', total: 160, returning: 120 },
    { date: 'Jun 17', total: 145, returning: 134 },
    { date: 'Jun 18', total: 170, returning: 145 },
    { date: 'Jun 19', total: 180, returning: 156 },
    { date: 'Jun 20', total: 175, returning: 167 },
    { date: 'Jun 21', total: 190, returning: 178 },
    { date: 'Jun 22', total: 200, returning: 189 },
    { date: 'Jun 23', total: 195, returning: 190 },
    { date: 'Jun 24', total: 210, returning: 201 },
    { date: 'Jun 25', total: 220, returning: 212 },
    { date: 'Jun 26', total: 215, returning: 223 },
    { date: 'Jun 27', total: 230, returning: 234 },
    { date: 'Jun 28', total: 240, returning: 245 },
    { date: 'Jun 29', total: 235, returning: 256 },
    { date: 'Jun 30', total: 250, returning: 267 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Total Visitors</h2>
          <p className="text-sm text-muted-foreground">Total for the last 3 months</p>
        </div>
        
        {/* Time Range Filters */}
        <div className="flex bg-muted rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActiveTimeRange(range.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTimeRange === range.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="totalVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="returningVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)'
              }}
            />
            <Legend 
              wrapperStyle={{
                color: 'var(--foreground)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stackId="1"
              stroke="var(--chart-1)" 
              fill="url(#totalVisitors)" 
              strokeWidth={2}
              name="Total Visitors"
            />
            <Area 
              type="monotone" 
              dataKey="returning" 
              stackId="1"
              stroke="var(--chart-2)" 
              fill="url(#returningVisitors)" 
              strokeWidth={2}
              name="Returning Visitors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartArea;
