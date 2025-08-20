import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Activity } from 'lucide-react';

const KPICard = ({ title, value, change, changeType, icon: Icon }) => {
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
      <div className="flex items-center justify-between mb-4">
        <IconComponent className="w-8 h-8 text-primary" />
        {getTrendIcon()}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {change && (
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
