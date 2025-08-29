import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, Search } from 'lucide-react';

export function PopularSearches({ popularSearches = [], onSearchClick }) {
  if (!popularSearches || popularSearches.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 text-lg">
          <TrendingUp className="h-5 w-5" />
          Popular Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-green-700 text-sm mb-3">
          Common imaging needs and their estimated results
        </p>
        
        {popularSearches.map((search, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors cursor-pointer"
            onClick={() => onSearchClick(search)}
          >
            <div className="flex-1">
              <div className="font-medium text-foreground text-sm">
                {search.description}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {search.bodyPart}
                </Badge>
                {search.modalities.map(modality => (
                  <Badge key={modality} variant="secondary" className="text-xs">
                    {modality}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {search.estimatedResults}
              </div>
              <div className="text-xs text-muted-foreground">centers</div>
            </div>
          </div>
        ))}
        
        <div className="text-center text-xs text-green-600 mt-3">
          Click any search to see results
        </div>
      </CardContent>
    </Card>
  );
}
