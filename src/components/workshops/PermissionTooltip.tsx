"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lock } from "lucide-react";
import { WorkshopRole } from "@/types/workshop";
import { getFeatureRequirements } from "@/lib/workshop-permission-helpers";
import { getRoleConfig } from "@/lib/workshop-roles-config";

interface PermissionTooltipProps {
  children: ReactNode;
  resource: string;
  action: string;
  currentRole?: WorkshopRole;
  disabled?: boolean;
}

/**
 * Tooltip that shows permission requirements when hovering over disabled controls
 */
export function PermissionTooltip({
  children,
  resource,
  action,
  currentRole,
  disabled = false,
}: PermissionTooltipProps) {
  if (!disabled || !currentRole) {
    return <>{children}</>;
  }

  const currentRoleConfig = getRoleConfig(currentRole);
  
  // Find which role has this permission
  const requirements = getFeatureRequirements(`${resource}_${action}`);
  const minimumRole = requirements[0]?.minimumRole || 'host';
  const minimumRoleConfig = getRoleConfig(minimumRole);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            {children}
            <div className="absolute top-0 right-0 -mt-1 -mr-1">
              <Lock className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm bg-gray-800 border-gray-700 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <p className="font-medium">Permission Required</p>
            </div>
            <p className="text-sm text-gray-300">
              {resource}.{action}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Your role:</span>
              <Badge className={currentRoleConfig.color}>
                {currentRoleConfig.displayName}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Required:</span>
              <Badge className={minimumRoleConfig.color}>
                {minimumRoleConfig.displayName}
              </Badge>
              <span className="text-gray-400">or higher</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Wrapper component that automatically handles permission checks
 */
interface PermissionGateProps {
  children: ReactNode;
  role?: WorkshopRole;
  resource: string;
  action: string;
  fallback?: ReactNode;
  showTooltip?: boolean;
}

export function PermissionGate({
  children,
  role,
  resource,
  action,
  fallback = null,
  showTooltip = true,
}: PermissionGateProps) {
  if (!role) return <>{fallback}</>;

  const hasPermission = getRoleConfig(role).permissions.some(
    (p) => p.resource === resource && p.action === action
  );

  if (!hasPermission) {
    if (showTooltip && fallback) {
      return (
        <PermissionTooltip
          resource={resource}
          action={action}
          currentRole={role}
          disabled={true}
        >
          {fallback}
        </PermissionTooltip>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}