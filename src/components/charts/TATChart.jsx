import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TATChart = ({ data, loading = false, timeRange: controlledRange, onChangeRange }) => {
  const [internalRange, setInternalRange] = useState(controlledRange || '7'); // '7' | '30' | '90'
  const timeRange = controlledRange || internalRange;
  useEffect(() => {
    if (controlledRange) setInternalRange(controlledRange)
  }, [controlledRange])

  // Generate TAT data based on real items with fallback mock
  const chartData = useMemo(() => {
    if (loading) return [];

    const days = parseInt(timeRange);

    // If we have finalized reports with appointment start/end times, compute real TATs
    if (Array.isArray(data) && data.length > 0) {
      // Accept either report items with appointment fields or pre-aggregated {date, tat}
      const items = data.map((item) => {
        if (item.date && item.tat) return item;
        // Try to compute TAT from appointment times on the item
        const start = item.startTime || item.appointmentStart || item.createdAt;
        const end = item.endTime || item.appointmentEnd || item.finalizedAt || item.updatedAt;
        const tatDays = start && end ? (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) : 2.2;
        return {
          date: (item.reportDate || item.createdAt || item.endTime || new Date()).toLocaleString('en-US', { month: 'short', day: 'numeric' }),
          tat: Math.max(0.5, parseFloat(tatDays.toFixed(1))),
          iso: end || item.reportDate || item.updatedAt || item.createdAt,
        };
      });

      // Bucket into last N days
      const byDay = new Map();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        byDay.set(key, []);
      }
      items.forEach((it) => {
        if (byDay.has(it.date)) byDay.get(it.date).push(it.tat);
      });

      return Array.from(byDay.entries()).map(([date, tats]) => {
        const avg = tats.length ? tats.reduce((a, b) => a + b, 0) / tats.length : 2.2;
        return { date, tat: parseFloat(avg.toFixed(1)), target: 3.0, avg: 2.2 };
      });
    }

    // Fallback mock generation
    const mock = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const baseTAT = 2.2;
      const variation = Math.random() * 1.0 - 0.5;
      const tat = Math.max(0.5, baseTAT + variation);
      mock.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tat: parseFloat(tat.toFixed(1)),
        target: 3.0,
        avg: 2.2,
      });
    }
    return mock;
  }, [timeRange, data, loading]);

  const avgTAT = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.tat, 0);
    return parseFloat((sum / chartData.length).toFixed(1));
  }, [chartData]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 'stable';
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, item) => acc + item.tat, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, item) => acc + item.tat, 0) / secondHalf.length;
    
    if (secondAvg < firstAvg - 0.1) return 'improving';
    if (secondAvg > firstAvg + 0.1) return 'declining';
    return 'stable';
  }, [chartData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Turnaround Time (TAT)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Average: {avgTAT} days • Target: 3.0 days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === '7' ? 'default' : 'outline'}
              size="sm"
              onClick={() => (onChangeRange ? onChangeRange('7') : setInternalRange('7'))}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === '30' ? 'default' : 'outline'}
              size="sm"
              onClick={() => (onChangeRange ? onChangeRange('30') : setInternalRange('30'))}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === '90' ? 'default' : 'outline'}
              size="sm"
              onClick={() => (onChangeRange ? onChangeRange('90') : setInternalRange('90'))}
            >
              90 Days
            </Button>
          </div>
        </div>
        
        {/* Trend indicator */}
        <div className="flex items-center gap-2 mt-2">
          {trend === 'improving' && (
            <>
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Improving</span>
            </>
          )}
          {trend === 'declining' && (
            <>
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Declining</span>
            </>
          )}
          {trend === 'stable' && (
            <>
              <div className="h-4 w-4 text-blue-600">—</div>
              <span className="text-sm text-blue-600 font-medium">Stable</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Days', angle: -90, position: 'insideLeft', className: 'text-xs' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Legend />
            
            {/* Actual TAT line */}
            <Line
              type="monotone"
              dataKey="tat"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              name="Actual TAT"
            />
            
            {/* Target TAT line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target TAT"
            />
            
            {/* Average TAT line */}
            <Line
              type="monotone"
              dataKey="avg"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name="Average TAT"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{avgTAT}</div>
            <div className="text-xs text-muted-foreground">Avg TAT (days)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">3.0</div>
            <div className="text-xs text-muted-foreground">Target (days)</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${trend === 'improving' ? 'text-green-600' : trend === 'declining' ? 'text-red-600' : 'text-blue-600'}`}>
              {trend === 'improving' ? '↓' : trend === 'declining' ? '↑' : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Trend</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TATChart;
