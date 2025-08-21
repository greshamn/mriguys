import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Settings, Users, Palette, Database, Shield } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system settings and user access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        {/* Theme Management */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Palette className="h-5 w-5" />
              Theme Management
            </CardTitle>
            <CardDescription>Customize system appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Customize Themes
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>Configure system parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Configure System
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage system data and backups</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Data
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Security settings and monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
