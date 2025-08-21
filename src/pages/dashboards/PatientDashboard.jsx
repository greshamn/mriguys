import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Calendar, User, Activity } from 'lucide-react';

export const PatientDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
          <p className="text-muted-foreground">View your referrals and results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Referrals */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <FileText className="h-5 w-5" />
              My Referrals
            </CardTitle>
            <CardDescription>View your current referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-card-foreground">3</div>
              <p className="text-sm text-muted-foreground">Active referrals</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-card-foreground">1</div>
              <p className="text-sm text-muted-foreground">Next appointment: Tomorrow</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Activity className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>View your latest results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-card-foreground">5</div>
              <p className="text-sm text-muted-foreground">Available results</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
