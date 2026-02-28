"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Settings, 
  FileText,
  Download,
  Eye,
  GitCompare,
} from "lucide-react";
import { PermissionsMatrixView } from "@/components/workshops/PermissionsMatrixView";
import { RoleComparisonView } from "@/components/workshops/RoleComparisonView";
import { getAllRolesSorted, getRoleConfig } from "@/lib/workshop-roles-config";

/**
 * Admin page for managing workshop RBAC system
 * Provides visual tools for understanding and configuring roles and permissions
 */
export default function WorkshopRolesAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "matrix" | "comparison" | "docs">("overview");
  
  const roles = getAllRolesSorted();

  const exportRolesJSON = () => {
    const data = JSON.stringify(roles, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workshop-roles-config.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-[#A92FFA]" />
              Workshop RBAC Management
            </h1>
            <p className="text-gray-400">
              Comprehensive role-based access control configuration and management
            </p>
          </div>
          <Button
            onClick={exportRolesJSON}
            variant="outline"
            className="border-[#A92FFA] text-[#A92FFA]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Configuration
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#A92FFA]">{roles.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#F28C28]">
                {roles.reduce((sum, role) => sum + role.permissions.length, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Permission Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">12</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Authority Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">
                {new Set(roles.map(r => r.level)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#A92FFA]">
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="matrix" className="data-[state=active]:bg-[#A92FFA]">
                  <Settings className="w-4 h-4 mr-2" />
                  Permissions Matrix
                </TabsTrigger>
                <TabsTrigger value="comparison" className="data-[state=active]:bg-[#A92FFA]">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Role Comparison
                </TabsTrigger>
                <TabsTrigger value="docs" className="data-[state=active]:bg-[#A92FFA]">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Role Hierarchy</h3>
                  <div className="space-y-3">
                    {roles.map((role, index) => {
                      const config = getRoleConfig(role.name);
                      return (
                        <Card key={role.name} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="text-2xl font-bold text-gray-600">
                                    {index + 1}
                                  </div>
                                  <Badge className={config.color}>
                                    {config.displayName}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Level {config.level}
                                  </Badge>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-400">
                                    {config.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <p className="text-gray-400">Permissions</p>
                                  <p className="text-lg font-bold text-[#A92FFA]">
                                    {config.permissions.length}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400">Can Assign</p>
                                  <p className="text-lg font-bold text-[#F28C28]">
                                    {config.canAssign.length}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Permission Categories */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Permission Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { name: "Session", icon: "🎯", count: 4 },
                      { name: "Participants", icon: "👥", count: 6 },
                      { name: "Roles", icon: "🔐", count: 4 },
                      { name: "Screen", icon: "🖥️", count: 2 },
                      { name: "Chat", icon: "💬", count: 4 },
                      { name: "Whiteboard", icon: "🎨", count: 4 },
                      { name: "Polls", icon: "📊", count: 5 },
                      { name: "Questions", icon: "❓", count: 4 },
                      { name: "Files", icon: "📁", count: 4 },
                      { name: "Breakout", icon: "🚪", count: 5 },
                      { name: "Video", icon: "🎥", count: 3 },
                      { name: "Reactions", icon: "😊", count: 2 },
                    ].map((category) => (
                      <Card key={category.name} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{category.icon}</div>
                          <div className="font-semibold">{category.name}</div>
                          <div className="text-sm text-gray-400">
                            {category.count} permissions
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Permissions Matrix Tab */}
              <TabsContent value="matrix" className="mt-6">
                <PermissionsMatrixView />
              </TabsContent>

              {/* Role Comparison Tab */}
              <TabsContent value="comparison" className="mt-6">
                <RoleComparisonView />
              </TabsContent>

              {/* Documentation Tab */}
              <TabsContent value="docs" className="space-y-6 mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Workshop RBAC System Documentation</CardTitle>
                    <CardDescription>
                      Complete guide to understanding and using the role-based access control system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <h3>Overview</h3>
                    <p>
                      The Workshop RBAC (Role-Based Access Control) system provides granular control
                      over participant permissions in workshop sessions. It supports 6 distinct roles
                      with varying levels of authority and capabilities.
                    </p>

                    <h3>Role Hierarchy</h3>
                    <ul>
                      <li><strong>Host (Level 100):</strong> Full control over all workshop features</li>
                      <li><strong>Co-Host (Level 80):</strong> Can manage participants and assist with session management</li>
                      <li><strong>Facilitator (Level 60):</strong> Can present, share screen, and moderate discussions</li>
                      <li><strong>Moderator (Level 50):</strong> Focuses on chat, Q&A, and participant interactions</li>
                      <li><strong>Presenter (Level 40):</strong> Can share screen and present content</li>
                      <li><strong>Participant (Level 10):</strong> Basic viewing and interaction permissions</li>
                    </ul>

                    <h3>Permission Categories</h3>
                    <p>
                      Permissions are organized into 12 categories covering all workshop functionality:
                    </p>
                    <ul>
                      <li><strong>Session:</strong> Control over session lifecycle (start, end, lock, record)</li>
                      <li><strong>Participants:</strong> Manage participant permissions and actions</li>
                      <li><strong>Roles:</strong> Ability to assign and manage roles</li>
                      <li><strong>Screen:</strong> Screen sharing capabilities</li>
                      <li><strong>Chat:</strong> Messaging and communication</li>
                      <li><strong>Whiteboard:</strong> Collaborative drawing</li>
                      <li><strong>Polls:</strong> Create and manage polls</li>
                      <li><strong>Questions:</strong> Q&A management</li>
                      <li><strong>Files:</strong> File sharing and management</li>
                      <li><strong>Breakout:</strong> Breakout room management</li>
                      <li><strong>Video:</strong> Video playback control</li>
                      <li><strong>Reactions:</strong> Emoji reactions</li>
                    </ul>

                    <h3>Role Assignment Rules</h3>
                    <p>
                      Roles can only be assigned by users with sufficient authority:
                    </p>
                    <ul>
                      <li><strong>Host:</strong> Can assign any role</li>
                      <li><strong>Co-Host:</strong> Can assign facilitator, moderator, presenter, participant</li>
                      <li><strong>Facilitator:</strong> Can assign presenter, participant</li>
                      <li><strong>Moderator:</strong> Can assign participant</li>
                      <li><strong>Presenter:</strong> Cannot assign roles</li>
                      <li><strong>Participant:</strong> Cannot assign roles</li>
                    </ul>

                    <h3>Integration Guide</h3>
                    <p>
                      To use the RBAC system in your components:
                    </p>
                    <pre className="bg-gray-950 p-4 rounded">
{`import { useWorkshopPermissions } from "@/hooks/useWorkshopPermissions";

const permissions = useWorkshopPermissions(currentUserRole);

// Check specific permissions
if (permissions.can('screen', 'share')) {
  // Show screen share button
}

// Check role-based features
if (permissions.canManageParticipants) {
  // Show participant management UI
}

if (permissions.canAssignRoles) {
  // Show role management button
}`}
                    </pre>

                    <h3>API Endpoints</h3>
                    <p>
                      Role management is handled through the following endpoint:
                    </p>
                    <pre className="bg-gray-950 p-4 rounded">
{`PUT /api/workshops/[id]/participants/[participantId]/role
Body: { "role": "co-host" }

Returns: Updated participant with new role`}
                    </pre>

                    <h3>Best Practices</h3>
                    <ul>
                      <li>Always validate permissions on both client and server side</li>
                      <li>Use the provided hooks and helper functions for consistency</li>
                      <li>Display role badges to make authority levels visible</li>
                      <li>Provide clear feedback when permission checks fail</li>
                      <li>Consider the user experience when showing/hiding controls</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
