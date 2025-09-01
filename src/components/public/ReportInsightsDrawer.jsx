import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Sparkles, Lightbulb, FileText, Stethoscope, Activity, X, Clock } from 'lucide-react';

export function ReportInsightsDrawer({ isOpen = false, onToggle, insights = [], summary = {} }) {
  const toggleDrawer = () => {
    if (onToggle) onToggle(!isOpen);
  };

  if (!insights || insights.length === 0) return null;

  const top = insights.slice(0, 3);

  return (
    <>
      <div className={`fixed right-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full w-[28rem] bg-background border-l border-border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                <h2 className="text-xl font-bold">AI Insights</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleDrawer} className="text-white hover:bg-purple-800 p-1">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-purple-100 text-sm mt-2">Personalized explanations based on your reports</p>
          </div>

          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Top Insights */}
            <div className="space-y-4">
              {top.map((ins, idx) => (
                <Card key={idx} className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {ins.icon === 'file' && <FileText className="h-4 w-4 text-purple-600" />}
                      {ins.icon === 'steth' && <Stethoscope className="h-4 w-4 text-purple-600" />}
                      {ins.icon === 'activity' && <Activity className="h-4 w-4 text-purple-600" />}
                      <CardTitle className="text-base font-semibold text-foreground">{ins.title}</CardTitle>
                      {ins.badges && ins.badges.map((b, i) => (
                        <Badge key={i} variant={b.variant || 'secondary'} className="ml-1 text-xs">{b.label}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm">
                      {ins.details && <p className="text-card-foreground/90 leading-relaxed">{ins.details}</p>}
                      {ins.recommendation && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-purple-900 mb-1">Recommendation</div>
                              <p className="text-purple-800 text-xs leading-relaxed">{ins.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Total reports</span><span className="font-medium">{summary.total || 0}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Finalized</span><span className="font-medium">{summary.finalized || 0}</span></div>
                {summary.topModality && (
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Most common modality</span><span className="font-medium">{summary.topModality}</span></div>
                )}
                {summary.lastDate && (
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Most recent</span><span className="font-medium">{summary.lastDate}</span></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={toggleDrawer} />
      )}
    </>
  );
}


