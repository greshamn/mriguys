import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Sparkles } from 'lucide-react';

export function AIInsightsButton({ onClick, recommendationsCount = 0, className = '' }) {
  return (
    <>
      <style>
        {`
          @keyframes slowPulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
            }
          }
        `}
      </style>
      <Button
        onClick={onClick}
        className={`bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-lg px-4 py-2 h-auto transition-all duration-200 ${className}`}
        style={{
          animation: 'slowPulse 2s ease-in-out infinite'
        }}
        title="Open AI Insights"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">AI Recommendations</span>
        {recommendationsCount > 0 && (
          <Badge variant="secondary" className="ml-2 bg-white text-purple-600">
            {recommendationsCount}
          </Badge>
        )}
      </Button>
    </>
  );
}
