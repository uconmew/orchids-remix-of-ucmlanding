"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bug, Check, X, AlertCircle, Info } from "lucide-react";
import { WorkshopRole } from "@/types/workshop";
import {
  getAllRolesSorted,
  getRoleConfig,
  canAssignRole,
  getPermissionsByResource,
  ALL_PERMISSIONS,
} from "@/lib/workshop-roles-config";
import { useWorkshopPermissions } from "@/hooks/useWorkshopPermissions";

interface PermissionDebuggerProps {
  currentRole?: WorkshopRole;
}

export function PermissionDebugger({ currentRole }: PermissionDebuggerProps) {
  const [selectedRole, setSelectedRole] = useState<WorkshopRole>(
    currentRole || "participant"
  );
  const [compareRole, setCompareRole] = useState<WorkshopRole | null>(null);

  const permissions = useWorkshopPermissions(selectedRole);
  const roleConfig = getRoleConfig(selectedRole);
  const permissionsByResource = getPermissionsByResource(selectedRole);

  const comparePermissions = compareRole
    ? useWorkshopPermissions(compareRole)
    : null;
  const compareRoleConfig = compareRole ? getRoleConfig(compareRole) : null;

  const allRoles = getAllRolesSorted();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bug className="w-4 h-4" />
          Debug Permissions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-6 h-6 text-[#A92FFA]" />
            Permission Debugger
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Test and visualize permissions across different roles
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="inspect" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="inspect">Inspect Role</TabsTrigger>
            <TabsTrigger value="compare">Compare Roles</TabsTrigger>
            <TabsTrigger value="matrix">Full Matrix</TabsTrigger>
          </TabsList>

          {/* Inspect Role Tab */}
          <TabsContent value="inspect" className="space-y-4 mt-4">
            {/* Role Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Role:</label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as WorkshopRole)}
              >
                <SelectTrigger className="w-64 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {allRoles.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      <div className="flex items-center gap-2">
                        <Badge className={role.color}>{role.displayName}</Badge>
                        <span className="text-xs text-gray-400">
                          Level {role.level}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              {/* Role Overview */}
              <Card className="mb-4 bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={roleConfig.color}>
                          {roleConfig.displayName}
                        </Badge>
                        <span className="text-sm font-normal text-gray-400">
                          Level {roleConfig.level}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-2">
                        {roleConfig.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#A92FFA]">
                        {roleConfig.permissions.length}
                      </p>
                      <p className="text-xs text-gray-400">Total Permissions</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Quick Checks */}
              <Card className="mb-4 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Can Manage Participants", value: permissions.canManageParticipants },
                      { label: "Can Present", value: permissions.canPresent },
                      { label: "Can Moderate", value: permissions.canModerate },
                      { label: "Can Assign Roles", value: permissions.canAssignRoles },
                      { label: "Can Record", value: permissions.canRecord },
                      { label: "Can End Session", value: permissions.canEndSession },
                      { label: "Can Lock Session", value: permissions.canLockSession },
                      { label: "Can Manage Polls", value: permissions.canManagePolls },
                      { label: "Can Manage Breakout", value: permissions.canManageBreakout },
                      { label: "Can Change Settings", value: permissions.canChangeSettings },
                    ].map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center justify-between p-2 bg-gray-900/50 rounded"
                      >
                        <span className="text-sm">{check.label}</span>
                        {check.value ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Permissions by Resource */}
              <Card className="mb-4 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Permissions by Resource</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(permissionsByResource).map(([resource, perms]) => (
                      <div key={resource}>
                        <h4 className="font-medium text-[#F28C28] mb-2 uppercase text-sm">
                          {resource}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {perms.map((perm) => (
                            <div
                              key={`${perm.resource}-${perm.action}`}
                              className="flex items-start gap-2 p-2 bg-gray-900/30 rounded text-sm"
                            >
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">{perm.action}</span>
                                <span className="text-gray-400 ml-2">
                                  - {perm.description}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Can Assign */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Can Assign Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  {roleConfig.canAssign.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roleConfig.canAssign.map((assignableRole) => {
                        const config = getRoleConfig(assignableRole);
                        return (
                          <Badge key={assignableRole} className={config.color}>
                            {config.displayName}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Cannot assign any roles
                    </p>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Compare Roles Tab */}
          <TabsContent value="compare" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Role A:</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as WorkshopRole)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {allRoles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role B:</label>
                <Select
                  value={compareRole || ""}
                  onValueChange={(value) =>
                    setCompareRole(value as WorkshopRole)
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select role to compare" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {allRoles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {compareRole && comparePermissions && compareRoleConfig && (
              <ScrollArea className="h-[500px]">
                {/* Comparison Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <Badge className={roleConfig.color}>
                        {roleConfig.displayName}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-[#A92FFA]">
                        {roleConfig.permissions.length}
                      </p>
                      <p className="text-sm text-gray-400">permissions</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Level {roleConfig.level}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <Badge className={compareRoleConfig.color}>
                        {compareRoleConfig.displayName}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-[#F28C28]">
                        {compareRoleConfig.permissions.length}
                      </p>
                      <p className="text-sm text-gray-400">permissions</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Level {compareRoleConfig.level}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Permission Comparison */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Permission Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: "Manage Participants", a: permissions.canManageParticipants, b: comparePermissions.canManageParticipants },
                        { label: "Present", a: permissions.canPresent, b: comparePermissions.canPresent },
                        { label: "Moderate", a: permissions.canModerate, b: comparePermissions.canModerate },
                        { label: "Assign Roles", a: permissions.canAssignRoles, b: comparePermissions.canAssignRoles },
                        { label: "Record", a: permissions.canRecord, b: comparePermissions.canRecord },
                        { label: "End Session", a: permissions.canEndSession, b: comparePermissions.canEndSession },
                        { label: "Lock Session", a: permissions.canLockSession, b: comparePermissions.canLockSession },
                        { label: "Manage Polls", a: permissions.canManagePolls, b: comparePermissions.canManagePolls },
                        { label: "Manage Breakout", a: permissions.canManageBreakout, b: comparePermissions.canManageBreakout },
                        { label: "Change Settings", a: permissions.canChangeSettings, b: comparePermissions.canChangeSettings },
                      ].map((check) => (
                        <div
                          key={check.label}
                          className="grid grid-cols-3 gap-4 items-center p-2 bg-gray-900/30 rounded"
                        >
                          <span className="text-sm font-medium">{check.label}</span>
                          <div className="flex items-center justify-center">
                            {check.a ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-center">
                            {check.b ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Role Assignment Check */}
                <Card className="mt-4 bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Role Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                        <span className="text-sm">
                          Can <Badge className={roleConfig.color}>{roleConfig.displayName}</Badge> assign{" "}
                          <Badge className={compareRoleConfig.color}>{compareRoleConfig.displayName}</Badge>?
                        </span>
                        {canAssignRole(selectedRole, compareRole) ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                        <span className="text-sm">
                          Can <Badge className={compareRoleConfig.color}>{compareRoleConfig.displayName}</Badge> assign{" "}
                          <Badge className={roleConfig.color}>{roleConfig.displayName}</Badge>?
                        </span>
                        {canAssignRole(compareRole, selectedRole) ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            )}

            {!compareRole && (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a second role to compare</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Full Matrix Tab */}
          <TabsContent value="matrix" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {Object.entries(ALL_PERMISSIONS).map(([resource, perms]) => (
                  <Card key={resource} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#F28C28] uppercase">
                        {resource}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {perms.map((perm) => (
                          <div key={`${perm.resource}-${perm.action}`}>
                            <p className="text-sm font-medium mb-2">
                              {perm.action} - {perm.description}
                            </p>
                            <div className="flex flex-wrap gap-2 ml-4">
                              {allRoles.map((role) => {
                                const hasPermission = role.permissions.some(
                                  (p) =>
                                    p.resource === perm.resource &&
                                    p.action === perm.action
                                );
                                return hasPermission ? (
                                  <Badge
                                    key={role.name}
                                    className={role.color}
                                  >
                                    {role.displayName}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                            <Separator className="mt-2 bg-gray-700" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
