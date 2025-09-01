import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Sparkles, Star, MapPin, Clock, TrendingUp, Lightbulb, ChevronRight, X } from 'lucide-react';

export function AIInsightsDrawer({ recommendations = [], searchCriteria = {}, popularSearches = [], onPopularSearchClick, isOpen = false, onToggle, onCenterClick }) {
  const toggleDrawer = () => {
    if (onToggle) {
      onToggle(!isOpen);
    }
  };

  // If there are no recommendations, do not render the left-floating overlay
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const topRecommendations = recommendations.slice(0, 3);
  const hasSearchCriteria = Object.keys(searchCriteria).some(key => 
    searchCriteria[key] && 
    (Array.isArray(searchCriteria[key]) ? searchCriteria[key].length > 0 : true)
  );

  return (
    <>


      {/* Floating Drawer */}
      <div className={`fixed right-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full w-[28rem] bg-background border-l border-border shadow-2xl overflow-hidden">
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                <h2 className="text-xl font-bold">AI Insights</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDrawer}
                className="text-white hover:bg-purple-800 p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-purple-100 text-sm mt-2">
              {hasSearchCriteria ? 'Based on your search criteria' : 'Top-rated centers in your area'}
            </p>
          </div>

          {/* Drawer Content */}
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Top Recommendations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Recommendations
              </h3>
              
              {topRecommendations.map((center) => (
                <Card 
                  key={center.id} 
                  className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCenterClick && onCenterClick(center)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-foreground">
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
                            {center.aiScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
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
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-muted-foreground">Util:</span>
                          <span className="font-medium">{center.utilization}%</span>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-purple-900 mb-1">Why Recommended:</div>
                            <p className="text-purple-800 text-xs leading-relaxed">
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
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${center.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-purple-600">{center.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Popular Searches */}
            {popularSearches && popularSearches.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Popular Searches
                </h3>
                
                {popularSearches.map((search, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => onPopularSearchClick(search)}
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
              </div>
            )}

            {/* Summary */}
            {recommendations.length > 3 && (
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Showing top 3 of {recommendations.length} centers</p>
                <p className="mt-1 text-xs">
                  All recommendations are AI-powered and based on your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={toggleDrawer}
        />
      )}
    </>
  );
}
