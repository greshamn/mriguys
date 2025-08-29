import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain, Star, MapPin, Clock, TrendingUp, Lightbulb } from 'lucide-react';

export function AIRecommendations({ recommendations = [], searchCriteria = {} }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            Search for imaging centers to see AI-powered recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  const topRecommendations = recommendations.slice(0, 3);
  const hasSearchCriteria = Object.keys(searchCriteria).some(key => 
    searchCriteria[key] && 
    (Array.isArray(searchCriteria[key]) ? searchCriteria[key].length > 0 : true)
  );

  return (
    <div className="space-y-4">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasSearchCriteria ? (
            <p className="text-blue-700 text-sm">
              Based on your search criteria, here are our top recommendations
            </p>
          ) : (
            <p className="text-blue-700 text-sm">
              Showing top-rated centers in your area
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      {topRecommendations.map((center, index) => (
        <Card key={center.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground">
                  #{center.aiRank} {center.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={center.aiRecommendation === 'Highly Recommended' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {center.aiRecommendation}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Score: {center.aiScore}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {center.aiScore}
                </div>
                <div className="text-xs text-muted-foreground">AI Score</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Center Details */}
            <div className="space-y-3">
              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{center.address.city}, {center.address.state}</span>
                {center.distance && (
                  <Badge variant="outline" className="text-xs">
                    {center.distance} mi
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{center.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({center.reviewCount} reviews)
                </span>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">TAT:</span>
                  <span className="font-medium">{center.avgTat} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">Util:</span>
                  <span className="font-medium">{center.utilization}%</span>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 mb-1">Why Recommended:</div>
                    <p className="text-blue-800 text-xs leading-relaxed">
                      {center.aiReasoning}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Level */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${center.confidence}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-blue-600">{center.confidence}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary Stats */}
      {recommendations.length > 3 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Showing top 3 of {recommendations.length} centers</p>
              <p className="mt-1">
                All recommendations are AI-powered and based on your search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
