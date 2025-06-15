
import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, BarChart3, UserCog } from 'lucide-react';
import { MassUserGeneration } from './MassUserGeneration';
import { UserManagement } from './UserManagement';

export const AdminLayout: React.FC = () => {
  const { userRole, currentOrganization } = useOrganization();

  // Only allow org_admin and super_admin access
  if (!userRole || !['org_admin', 'super_admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This area is only accessible to organization administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>No Organization Selected</CardTitle>
            <CardDescription>
              Please select an organization to access admin features.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Organization Admin Console</h1>
          <p className="text-muted-foreground">
            Managing {currentOrganization.name} • {userRole?.replace('_', ' ')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="user-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="user-management" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Manage Users
          </TabsTrigger>
          <TabsTrigger value="mass-generation" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mass Generation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" disabled>
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" disabled>
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2" disabled>
            <BarChart3 className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user-management">
          <UserManagement />
        </TabsContent>

        <TabsContent value="mass-generation">
          <MassUserGeneration />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Coming in Phase 4</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User performance analytics will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Coming in Phase 3</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Organization configuration options will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Coming in Phase 5</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed reporting features will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
