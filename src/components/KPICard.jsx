import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

// Custom tooltip component for the trend chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = typeof value === 'number' && value % 1 !== 0 
      ? value.toFixed(1) 
      : value;
    
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
        <p className="text-xs font-medium text-gray-600 mb-1">{`${label}`}</p>
        <p className="text-sm font-semibold text-gray-900">
          {formattedValue}
        </p>
      </div>
    );
  }
  return null;
};

const KPICard = ({ title, value, change, changeType, icon: Icon, trendData = [], trendColor = "#3b82f6" }) => {
  // Default icons based on title
  const getDefaultIcon = () => {
    if (title.toLowerCase().includes('revenue')) return DollarSign;
    if (title.toLowerCase().includes('customer')) return Users;
    if (title.toLowerCase().includes('account')) return BarChart3;
    if (title.toLowerCase().includes('growth') || title.toLowerCase().includes('rate')) return Activity;
    return Activity; // fallback
  };

  // Use provided icon or default icon
  const IconComponent = Icon || getDefaultIcon();

  // Convert changeType to trend for icon logic
  const trend = changeType === 'positive' ? 'up' : changeType === 'negative' ? 'down' : 'neutral';

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-foreground';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
      {/* Main KPI Layout: Icon on left, Title below icon, Value on right */}
      <div className="flex items-start justify-between">
        {/* Left side: Icon and Title */}
        <div className="flex flex-col items-start gap-2">
          <IconComponent className="w-6 h-6 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground leading-tight">{title}</h3>
        </div>
        
        {/* Right side: Value and Change */}
        <div className="flex flex-col items-end text-right">
          <span className="text-4xl font-bold text-foreground leading-none">{value}</span>
          {change && (
            <span className={`text-sm font-medium mt-1 ${getChangeColor()}`}>
              {change}
            </span>
          )}
        </div>
      </div>
      
      {/* Mini trend chart */}
      {trendData && trendData.length > 0 && (
        <div className="space-y-1 mt-4">
          <div className="h-16 w-full bg-gray-50 rounded-md p-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={trendColor} 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: trendColor, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-sm text-gray-600 text-center font-medium">6 month trend</div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
