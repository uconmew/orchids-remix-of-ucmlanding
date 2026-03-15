"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, ArrowRight } from "lucide-react";
import {
  getAllRolesSorted,
  getRoleConfig,
  hasPermission,
  ALL_PERMISSIONS,
  compareRoles,
} from "@/lib/workshop-roles-config";
import { WorkshopRole } from "@/types/workshop";

/**
 * Side-by-side comparison of two roles
 */
export function RoleComparisonView() {
  const roles = getAllRolesSorted();
  const [role1, setRole1] = useState<WorkshopRole>("host");
  const [role2, setRole2] = useState<WorkshopRole>("participant");

  const role1Config = getRoleConfig(role1);
  const role2Config = getRoleConfig(role2);

  const comparison = compareRoles(role1, role2);

  // Get all permissions
  const allPermissions = Object.values(ALL_PERMISSIONS).flat();

  // Categorize permissions
  const bothHave: typeof allPermissions = [];
  const onlyRole1Has: typeof allPermissions = [];
  const onlyRole2Has: typeof allPermissions = [];
  const neitherHas: typeof allPermissions = [];

  allPermissions.forEach((perm) => {
    const has1 = hasPermission(role1, perm.resource, perm.action);
    const has2 = hasPermission(role2, perm.resource, perm.action);

    if (has1 && has2) {
      bothHave.push(perm);
    } else if (has1 && !has2) {
      onlyRole1Has.push(perm);
    } else if (!has1 && has2) {
      onlyRole2Has.push(perm);
    } else {
      neitherHas.push(perm);
    }
  });

  return (
    <div className="space-y-6">
      {/* Role Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <Select value={role1} onValueChange={(v) => setRole1(v as WorkshopRole)}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.name} value={r.name}>
                {r.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-center">
          <div className="text-2xl text-gray-400 font-bold">VS</div>
        </div>

        <Select value={role2} onValueChange={(v) => setRole2(v as WorkshopRole)}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.name} value={r.name}>
                {r.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Result */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center">
            {comparison > 0 ? (
              <span className="text-green-500">
                {role1Config.displayName} has higher authority
              </span>
            ) : comparison < 0 ? (
              <span className="text-red-500">
                {role2Config.displayName} has higher authority
              </span>
            ) : (
              <span className="text-yellow-500">Equal authority level</span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-500">Both Have</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{bothHave.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-500">
              Only {role1Config.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">
              {onlyRole1Has.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-500">
              Only {role2Config.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-500">
              {onlyRole2Has.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-500/10 border-gray-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Neither Has</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-500">
              {neitherHas.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Role */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={role1Config.color}>
                {role1Config.displayName}
              </Badge>
              <span className="text-sm text-gray-400">
                Level {role1Config.level}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-400">
                Unique Permissions ({onlyRole1Has.length}):
              </p>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {onlyRole1Has.map((perm) => (
                  <div
                    key={`${perm.resource}-${perm.action}`}
                    className="flex items-start gap-2 text-sm p-2 bg-blue-500/10 rounded border border-blue-500/20"
                  >
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{perm.action}</span>
                      <span className="text-gray-400 text-xs block">
                        {perm.description}
                      </span>
                    </div>
                  </div>
                ))}
                {onlyRole1Has.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No unique permissions
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Role */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={role2Config.color}>
                {role2Config.displayName}
              </Badge>
              <span className="text-sm text-gray-400">
                Level {role2Config.level}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-400">
                Unique Permissions ({onlyRole2Has.length}):
              </p>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {onlyRole2Has.map((perm) => (
                  <div
                    key={`${perm.resource}-${perm.action}`}
                    className="flex items-start gap-2 text-sm p-2 bg-purple-500/10 rounded border border-purple-500/20"
                  >
                    <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{perm.action}</span>
                      <span className="text-gray-400 text-xs block">
                        {perm.description}
                      </span>
                    </div>
                  </div>
                ))}
                {onlyRole2Has.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No unique permissions
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Permissions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Shared Permissions ({bothHave.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {bothHave.map((perm) => (
              <div
                key={`${perm.resource}-${perm.action}`}
                className="flex items-start gap-2 text-sm p-2 bg-green-500/10 rounded border border-green-500/20"
              >
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">{perm.action}</span>
                  <span className="text-gray-400 text-xs block">
                    {perm.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
