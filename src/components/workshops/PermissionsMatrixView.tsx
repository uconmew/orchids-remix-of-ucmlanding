"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Info } from "lucide-react";
import {
  getAllRolesSorted,
  ALL_PERMISSIONS,
  hasPermission,
  getRoleConfig,
} from "@/lib/workshop-roles-config";
import { WorkshopRole } from "@/types/workshop";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Visual matrix showing all permissions across all roles
 * Useful for administrators to understand the permission structure
 */
export function PermissionsMatrixView() {
  const roles = getAllRolesSorted();
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Get all unique resources
  const resources = Object.keys(ALL_PERMISSIONS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Permissions Matrix</h3>
          <p className="text-sm text-gray-400">
            Complete overview of permissions across all roles
          </p>
        </div>
        <Badge variant="outline">
          {resources.length} Resources • {roles.length} Roles
        </Badge>
      </div>

      <ScrollArea className="h-[600px] border border-gray-800 rounded-lg">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="sticky left-0 bg-gray-900 z-10 w-[200px]">
                  Permission
                </TableHead>
                {roles.map((role) => {
                  const roleConfig = getRoleConfig(role.name);
                  return (
                    <TableHead
                      key={role.name}
                      className="text-center min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={roleConfig.color}>
                          {roleConfig.displayName}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          L{roleConfig.level}
                        </span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const permissions = ALL_PERMISSIONS[resource];
                return permissions.map((permission, idx) => (
                  <TableRow
                    key={`${resource}-${permission.action}`}
                    className={`border-gray-800 hover:bg-gray-800/50 ${
                      idx === 0 ? "border-t-2" : ""
                    }`}
                  >
                    <TableCell className="sticky left-0 bg-gray-900 z-10">
                      <div>
                        {idx === 0 && (
                          <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                            {resource}
                          </div>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help">
                                <span className="text-sm">
                                  {permission.action}
                                </span>
                                <Info className="w-3 h-3 text-gray-500" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{permission.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    {roles.map((role) => {
                      const hasAccess = hasPermission(
                        role.name,
                        permission.resource,
                        permission.action
                      );
                      return (
                        <TableCell
                          key={`${resource}-${permission.action}-${role.name}`}
                          className="text-center"
                        >
                          {hasAccess ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-500" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                                <X className="w-4 h-4 text-gray-600" />
                              </div>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-500" />
          </div>
          <span>Has Permission</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </div>
          <span>No Permission</span>
        </div>
      </div>
    </div>
  );
}
