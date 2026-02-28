/**
 * Workshop Permission System
 * Integrates RBAC with workshop-specific roles and permissions
 */

import { WorkshopRole } from '@/types/workshop';
import { hasPermission, getRoleConfig, canAssignRole } from './workshop-roles-config';

/**
 * Workshop Permission Checker Class
 * Provides convenient methods to check permissions for a specific role
 */
export class WorkshopPermissionChecker {
  constructor(private role: WorkshopRole) {}

  can(resource: string, action: string): boolean {
    return hasPermission(this.role, resource, action);
  }

  canManageParticipants(): boolean {
    return this.can('participants', 'mute') || 
           this.can('participants', 'remove');
  }

  canPresent(): boolean {
    return this.can('screen', 'share');
  }

  canModerate(): boolean {
    return this.can('chat', 'manage') || 
           this.can('questions', 'manage');
  }

  canManagePolls(): boolean {
    return this.can('polls', 'create') || 
           this.can('polls', 'manage');
  }

  canManageBreakout(): boolean {
    return this.can('breakout', 'create');
  }

  canRecord(): boolean {
    return this.can('session', 'record');
  }

  canEndSession(): boolean {
    return this.can('session', 'end');
  }

  canAssignRoles(): boolean {
    return this.can('roles', 'assign');
  }

  canLockSession(): boolean {
    return this.can('session', 'lock');
  }

  canChangeSettings(): boolean {
    return this.can('session', 'settings');
  }

  canManageFiles(): boolean {
    return this.can('files', 'delete');
  }

  canSpotlight(): boolean {
    return this.can('participants', 'spotlight');
  }

  canAdmitWaiting(): boolean {
    return this.can('participants', 'admitWaiting');
  }

  canBroadcast(): boolean {
    return this.can('breakout', 'broadcast');
  }

  getRoleLevel(): number {
    return getRoleConfig(this.role).level;
  }

  getRoleName(): string {
    return getRoleConfig(this.role).displayName;
  }
}

/**
 * Check if a role has a specific workshop permission
 */
export function hasWorkshopPermission(
  role: WorkshopRole,
  resource: string,
  action: string
): boolean {
  return hasPermission(role, resource, action);
}

/**
 * Get all available actions for a resource by role
 */
export function getAvailableActions(
  role: WorkshopRole,
  resource: string
): string[] {
  const permissions = getRoleConfig(role).permissions;
  return permissions
    .filter((p) => p.resource === resource)
    .map((p) => p.action);
}

/**
 * Check multiple permissions at once
 */
export function hasAllPermissions(
  role: WorkshopRole,
  checks: Array<{ resource: string; action: string }>
): boolean {
  return checks.every((check) =>
    hasPermission(role, check.resource, check.action)
  );
}

/**
 * Check if role has any of the specified permissions
 */
export function hasAnyPermission(
  role: WorkshopRole,
  checks: Array<{ resource: string; action: string }>
): boolean {
  return checks.some((check) =>
    hasPermission(role, check.resource, check.action)
  );
}

/**
 * Permission validation for API requests
 */
export function validatePermission(
  role: WorkshopRole | undefined,
  resource: string,
  action: string
): { allowed: boolean; reason?: string } {
  if (!role) {
    return { allowed: false, reason: 'No role assigned' };
  }

  if (!hasPermission(role, resource, action)) {
    return {
      allowed: false,
      reason: `Role '${getRoleConfig(role).displayName}' does not have permission to ${action} ${resource}`,
    };
  }

  return { allowed: true };
}

/**
 * Get permission summary for a role
 */
export function getPermissionSummary(role: WorkshopRole): {
  total: number;
  byResource: Record<string, number>;
  canManage: boolean;
  canPresent: boolean;
  canModerate: boolean;
} {
  const permissions = getRoleConfig(role).permissions;
  const byResource: Record<string, number> = {};

  permissions.forEach((perm) => {
    byResource[perm.resource] = (byResource[perm.resource] || 0) + 1;
  });

  const checker = new WorkshopPermissionChecker(role);

  return {
    total: permissions.length,
    byResource,
    canManage: checker.canManageParticipants(),
    canPresent: checker.canPresent(),
    canModerate: checker.canModerate(),
  };
}

/**
 * Helper: return commonly used booleans for the current role (for UI components)
 */
export function getWorkshopPermissions(role: WorkshopRole): {
  canMuteParticipants: boolean;
  canRemoveParticipants: boolean;
  canAssignRoles: boolean;
} {
  return {
    canMuteParticipants: hasWorkshopPermission(role, 'participants', 'mute'),
    canRemoveParticipants: hasWorkshopPermission(role, 'participants', 'remove'),
    canAssignRoles: hasWorkshopPermission(role, 'roles', 'assign'),
  };
}

/**
 * Helper: get display name for a role
 */
export function getRoleDisplayName(role: WorkshopRole): string {
  return getRoleConfig(role).displayName;
}

/**
 * Helper: get Tailwind color classes for a role badge
 */
export function getRoleBadgeColor(role: WorkshopRole): string {
  return getRoleConfig(role).color;
}

/**
 * Check if requester can change another participant's role to the target role
 */
export function canChangeParticipantRole(
  requesterRole: WorkshopRole,
  targetCurrentRole: WorkshopRole,
  newRole: WorkshopRole
): boolean {
  // Must have assign permission
  if (!hasWorkshopPermission(requesterRole, 'roles', 'assign')) return false;

  const requester = getRoleConfig(requesterRole);
  const target = getRoleConfig(targetCurrentRole);
  const targetNew = getRoleConfig(newRole);

  // Requester must outrank the target and the new role
  if (requester.level <= target.level) return false;
  if (requester.level < targetNew.level) return false;

  // And assignment must be allowed per config
  if (!canAssignRole(requesterRole, newRole)) return false;

  return true;
}