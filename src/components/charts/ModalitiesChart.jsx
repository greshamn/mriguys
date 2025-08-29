import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, Zap, Monitor, X } from 'lucide-react';

const ModalitiesChart = ({ data, loading = false, distribution }) => {
  // Generate modalities distribution, prioritizing provided distribution → derive from data → fallback mock
  const chartData = useMemo(() => {
    if (loading) return [];

    // Palette and icon map
    const palette = {
      MRI: { color: '#3B82F6', icon: Monitor },
      CT: { color: '#10B981', icon: Activity },
      'X-Ray': { color: '#8B5CF6', icon: X },
      Ultrasound: { color: '#F59E0B', icon: Zap },
      PET: { color: '#EF4444', icon: Activity },
    };

    // 1) If a precomputed distribution is provided, normalize it
    if (Array.isArray(distribution) && distribution.length > 0) {
      return distribution.map((d) => ({
        name: d.name,
        count: d.count,
        color: d.color || palette[d.name]?.color || '#64748B',
        icon: palette[d.name]?.icon || Activity,
      }));
    }

    // 2) Derive from incoming data if it contains modality field
    if (Array.isArray(data) && data.length > 0 && data[0]?.modality) {
      const counts = data.reduce((acc, item) => {
        const key = item.modality || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        color: palette[name]?.color || '#64748B',
        icon: palette[name]?.icon || Activity,
      }));
    }

    // 3) Fallback to pleasant mock values
    return [
      { name: 'MRI', count: 45, color: '#3B82F6', icon: Monitor },
      { name: 'CT', count: 32, color: '#10B981', icon: Activity },
      { name: 'X-Ray', count: 28, color: '#8B5CF6', icon: X },
      { name: 'Ultrasound', count: 18, color: '#F59E0B', icon: Zap },
      { name: 'PET', count: 12, color: '#EF4444', icon: Activity },
    ];
  }, [data, loading, distribution]);

  const totalStudies = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  const topModality = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, item) => item.count > max.count ? item : max);
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
            <CardTitle className="text-lg">Modalities Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total studies: {totalStudies} • Top: {topModality?.name} ({topModality?.count})
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-1 pb-1">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 2, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickMargin={0}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 11 }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft', className: 'text-xs' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value, name) => [value, 'Studies']}
            />
            
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Breakdown + Summary in one compact row */}
        <div className="mt-2 pt-2 border-t flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {chartData.slice(0, 4).map((modality) => {
              const IconComponent = modality.icon;
              const percentage = ((modality.count / totalStudies) * 100).toFixed(1);
              return (
                <div key={modality.name} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: modality.color }} />
                  <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{modality.name}</span>
                  <span className="text-muted-foreground">{modality.count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center min-w-[60px]">
              <div className="text-base font-bold text-primary leading-none">{totalStudies}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-center min-w-[60px]">
              <div className="text-base font-bold text-secondary leading-none">{chartData.length}</div>
              <div className="text-muted-foreground">Modalities</div>
            </div>
            <div className="text-center min-w-[60px]">
              <div className="text-base font-bold text-accent leading-none">{topModality ? ((topModality.count / totalStudies) * 100).toFixed(0) : 0}%</div>
              <div className="text-muted-foreground">Top</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModalitiesChart;
