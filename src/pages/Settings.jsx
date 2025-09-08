import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Settings as SettingsIcon, Save, RefreshCw, Shield, Database, Bell, Globe, Lock, 
  Users, Mail, Server, Monitor, Smartphone, Wifi, AlertTriangle,
  CheckCircle, XCircle, Clock, Activity, BarChart3, Shield as ShieldIcon,
  Database as DatabaseIcon, Bell as BellIcon, Globe as GlobeIcon,
  Lock as LockIcon, Users as UsersIcon, Mail as MailIcon, Server as ServerIcon
} from 'lucide-react';

// Mock data for system settings
const SYSTEM_CONFIG = {
  general: {
    systemName: 'MRIGuys',
    version: '3.2.1',
    environment: 'Production',
    timezone: 'America/New_York',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour'
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90
    },
    sessionTimeout: 30,
    twoFactorAuth: true,
    ipWhitelist: false,
    auditLogging: true
  },
  notifications: {
    email: {
      enabled: true,
      smtpHost: 'smtp.mriguys.com',
      smtpPort: 587,
      smtpUser: 'noreply@mriguys.com',
      smtpSecure: true
    },
    push: {
      enabled: true,
      firebaseKey: 'AIzaSyB...',
      vapidKey: 'BEl62iU3gKD...'
    },
    sms: {
      enabled: false,
      provider: 'Twilio',
      apiKey: '',
      phoneNumber: '+1-555-0123'
    }
  },
  integrations: {
    epic: {
      enabled: true,
      endpoint: 'https://epic.mriguys.com/api',
      apiKey: 'epic_***',
      lastSync: '2024-01-15T10:30:00Z'
    },
    cerner: {
      enabled: false,
      endpoint: '',
      apiKey: '',
      lastSync: null
    },
    allscripts: {
      enabled: false,
      endpoint: '',
      apiKey: '',
      lastSync: null
    }
  },
  performance: {
    cacheEnabled: true,
    cacheTTL: 3600,
    maxConnections: 100,
    requestTimeout: 30,
    compressionEnabled: true,
    cdnEnabled: true
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: 30,
    location: 'AWS S3',
    encryption: true,
    lastBackup: '2024-01-15T02:00:00Z'
  }
};

const AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2024-01-15T14:30:00Z',
    user: 'admin@mriguys.com',
    action: 'Updated security settings',
    resource: 'System Settings',
    ip: '192.168.1.100',
    status: 'success'
  },
  {
    id: 2,
    timestamp: '2024-01-15T14:25:00Z',
    user: 'admin@mriguys.com',
    action: 'Modified notification preferences',
    resource: 'Email Settings',
    ip: '192.168.1.100',
    status: 'success'
  },
  {
    id: 3,
    timestamp: '2024-01-15T14:20:00Z',
    user: 'ops@mriguys.com',
    action: 'Failed login attempt',
    resource: 'Authentication',
    ip: '192.168.1.105',
    status: 'failed'
  },
  {
    id: 4,
    timestamp: '2024-01-15T14:15:00Z',
    user: 'admin@mriguys.com',
    action: 'Created new user',
    resource: 'User Management',
    ip: '192.168.1.100',
    status: 'success'
  },
  {
    id: 5,
    timestamp: '2024-01-15T14:10:00Z',
    user: 'admin@mriguys.com',
    action: 'Updated system configuration',
    resource: 'General Settings',
    ip: '192.168.1.100',
    status: 'success'
  }
];

const SYSTEM_STATUS = {
  overall: 'healthy',
  uptime: '99.9%',
  responseTime: '120ms',
  activeUsers: 247,
  database: 'healthy',
  cache: 'healthy',
  integrations: 'healthy',
  lastCheck: '2024-01-15T14:35:00Z'
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(SYSTEM_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedSetting = (category, parentKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasChanges(false);
    setIsSaving(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{SYSTEM_STATUS.overall}</p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(SYSTEM_STATUS.overall)}`}>
                {getStatusIcon(SYSTEM_STATUS.overall)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{SYSTEM_STATUS.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{SYSTEM_STATUS.responseTime}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{SYSTEM_STATUS.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                General Configuration
              </CardTitle>
              <CardDescription>
                Basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      value={settings.general.systemName}
                      onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={settings.general.version}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select 
                      value={settings.general.environment} 
                      onValueChange={(value) => updateSetting('general', 'environment', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Staging">Staging</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settings.general.timezone} 
                      onValueChange={(value) => updateSetting('general', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={settings.general.language} 
                      onValueChange={(value) => updateSetting('general', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={settings.general.dateFormat} 
                      onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Password policies, authentication, and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAge">Maximum Age (days)</Label>
                      <Input
                        id="maxAge"
                        type="number"
                        value={settings.security.passwordPolicy.maxAge}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'maxAge', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">Require Uppercase</Label>
                      <Switch
                        id="requireUppercase"
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireLowercase">Require Lowercase</Label>
                      <Switch
                        id="requireLowercase"
                        checked={settings.security.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireLowercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                      <Switch
                        id="requireNumbers"
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={settings.security.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireSpecialChars', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold mb-4">Authentication</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                    <Switch
                      id="ipWhitelist"
                      checked={settings.security.ipWhitelist}
                      onCheckedChange={(checked) => updateSetting('security', 'ipWhitelist', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auditLogging">Audit Logging</Label>
                    <Switch
                      id="auditLogging"
                      checked={settings.security.auditLogging}
                      onCheckedChange={(checked) => updateSetting('security', 'auditLogging', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Configuration
              </CardTitle>
              <CardDescription>
                Configure email, push, and SMS notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Settings */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Email Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
                    <Switch
                      id="emailEnabled"
                      checked={settings.notifications.email.enabled}
                      onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', 'enabled', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.notifications.email.smtpHost}
                        onChange={(e) => updateNestedSetting('notifications', 'email', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.notifications.email.smtpPort}
                        onChange={(e) => updateNestedSetting('notifications', 'email', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUser">SMTP User</Label>
                      <Input
                        id="smtpUser"
                        value={settings.notifications.email.smtpUser}
                        onChange={(e) => updateNestedSetting('notifications', 'email', 'smtpUser', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                      <Switch
                        id="smtpSecure"
                        checked={settings.notifications.email.smtpSecure}
                        onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', 'smtpSecure', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Push Notifications */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Push Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushEnabled">Enable Push Notifications</Label>
                    <Switch
                      id="pushEnabled"
                      checked={settings.notifications.push.enabled}
                      onCheckedChange={(checked) => updateNestedSetting('notifications', 'push', 'enabled', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firebaseKey">Firebase Key</Label>
                      <Input
                        id="firebaseKey"
                        value={settings.notifications.push.firebaseKey}
                        onChange={(e) => updateNestedSetting('notifications', 'push', 'firebaseKey', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vapidKey">VAPID Key</Label>
                      <Input
                        id="vapidKey"
                        value={settings.notifications.push.vapidKey}
                        onChange={(e) => updateNestedSetting('notifications', 'push', 'vapidKey', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div>
                <h4 className="text-lg font-semibold mb-4">SMS Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsEnabled">Enable SMS Notifications</Label>
                    <Switch
                      id="smsEnabled"
                      checked={settings.notifications.sms.enabled}
                      onCheckedChange={(checked) => updateNestedSetting('notifications', 'sms', 'enabled', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smsProvider">Provider</Label>
                      <Select 
                        value={settings.notifications.sms.provider} 
                        onValueChange={(value) => updateNestedSetting('notifications', 'sms', 'provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Twilio">Twilio</SelectItem>
                          <SelectItem value="AWS SNS">AWS SNS</SelectItem>
                          <SelectItem value="SendGrid">SendGrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="smsApiKey">API Key</Label>
                      <Input
                        id="smsApiKey"
                        value={settings.notifications.sms.apiKey}
                        onChange={(e) => updateNestedSetting('notifications', 'sms', 'apiKey', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smsPhoneNumber">Phone Number</Label>
                      <Input
                        id="smsPhoneNumber"
                        value={settings.notifications.sms.phoneNumber}
                        onChange={(e) => updateNestedSetting('notifications', 'sms', 'phoneNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integration Configuration
              </CardTitle>
              <CardDescription>
                Manage third-party integrations and API connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.integrations).map(([key, integration]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold capitalize">{key}</h4>
                      <Badge className={integration.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {integration.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={(checked) => updateSetting('integrations', key, { ...integration, enabled: checked })}
                    />
                  </div>
                  {integration.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${key}-endpoint`}>Endpoint URL</Label>
                        <Input
                          id={`${key}-endpoint`}
                          value={integration.endpoint}
                          onChange={(e) => updateSetting('integrations', key, { ...integration, endpoint: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${key}-apiKey`}>API Key</Label>
                        <Input
                          id={`${key}-apiKey`}
                          value={integration.apiKey}
                          onChange={(e) => updateSetting('integrations', key, { ...integration, apiKey: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  {integration.lastSync && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Configuration
              </CardTitle>
              <CardDescription>
                Optimize system performance and caching settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cacheEnabled">Enable Caching</Label>
                    <Switch
                      id="cacheEnabled"
                      checked={settings.performance.cacheEnabled}
                      onCheckedChange={(checked) => updateSetting('performance', 'cacheEnabled', checked)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cacheTTL">Cache TTL (seconds)</Label>
                    <Input
                      id="cacheTTL"
                      type="number"
                      value={settings.performance.cacheTTL}
                      onChange={(e) => updateSetting('performance', 'cacheTTL', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxConnections">Max Connections</Label>
                    <Input
                      id="maxConnections"
                      type="number"
                      value={settings.performance.maxConnections}
                      onChange={(e) => updateSetting('performance', 'maxConnections', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requestTimeout">Request Timeout (seconds)</Label>
                    <Input
                      id="requestTimeout"
                      type="number"
                      value={settings.performance.requestTimeout}
                      onChange={(e) => updateSetting('performance', 'requestTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compressionEnabled">Enable Compression</Label>
                    <Switch
                      id="compressionEnabled"
                      checked={settings.performance.compressionEnabled}
                      onCheckedChange={(checked) => updateSetting('performance', 'compressionEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cdnEnabled">Enable CDN</Label>
                    <Switch
                      id="cdnEnabled"
                      checked={settings.performance.cdnEnabled}
                      onCheckedChange={(checked) => updateSetting('performance', 'cdnEnabled', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                System activity and security audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {AUDIT_LOGS.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </div>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-500">{log.resource}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()} • {log.user} • {log.ip}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
