/**
 * Workshop Permission Helper Utilities
 * Convenience functions for common permission-related tasks
 */

import { WorkshopRole } from '@/types/workshop';
import { getRoleConfig, hasPermission, canAssignRole } from './workshop-roles-config';
import { toast } from 'sonner';

/**
 * Show permission denied message with helpful context
 */
export function showPermissionDenied(
  action: string,
  currentRole?: WorkshopRole,
  requiredPermission?: string
) {
  const roleInfo = currentRole ? getRoleConfig(currentRole) : null;
  
  const message = roleInfo
    ? `Your role (${roleInfo.displayName}) cannot ${action}. ${requiredPermission || ''}`
    : `You do not have permission to ${action}`;
  
  toast.error(message, {
    description: 'Contact the host if you need elevated permissions',
    duration: 5000,
  });
}

/**
 * Check permission and show error if denied
 * Returns true if allowed, false if denied (and shows toast)
 */
export function checkAndNotify(
  role: WorkshopRole | undefined,
  resource: string,
  action: string,
  actionDescription: string
): boolean {
  if (!role) {
    showPermissionDenied(actionDescription);
    return false;
  }

  if (!hasPermission(role, resource, action)) {
    showPermissionDenied(
      actionDescription,
      role,
      `Required: ${resource}.${action}`
    );
    return false;
  }

  return true;
}

/**
 * Get permission-aware button props
 */
export function getPermissionButtonProps(
  role: WorkshopRole | undefined,
  resource: string,
  action: string,
  actionDescription: string
): {
  disabled: boolean;
  onClick: (originalHandler: () => void) => void;
  title?: string;
} {
  const allowed = role ? hasPermission(role, resource, action) : false;

  return {
    disabled: !allowed,
    onClick: (originalHandler: () => void) => {
      if (!checkAndNotify(role, resource, action, actionDescription)) {
        return;
      }
      originalHandler();
    },
    title: !allowed ? `Requires permission to ${action} ${resource}` : undefined,
  };
}

/**
 * Get user-friendly action description
 */
export function getActionDescription(resource: string, action: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    screen: {
      share: 'share your screen',
    },
    participants: {
      mute: 'mute participants',
      remove: 'remove participants',
      spotlight: 'spotlight participants',
    },
    session: {
      end: 'end the session',
      lock: 'lock the meeting',
      record: 'start recording',
      settings: 'change settings',
    },
    roles: {
      assign: 'assign roles',
    },
    polls: {
      create: 'create polls',
      manage: 'manage polls',
    },
    chat: {
      manage: 'manage chat',
    },
    breakout: {
      create: 'create breakout rooms',
      assign: 'assign participants to rooms',
    },
  };

  return descriptions[resource]?.[action] || `${action} ${resource}`;
}

/**
 * Validate role assignment with user feedback
 */
export function validateAndNotifyRoleAssignment(
  requesterRole: WorkshopRole,
  targetRole: WorkshopRole,
  newRole: WorkshopRole
): boolean {
  if (!canAssignRole(requesterRole, newRole)) {
    const requesterConfig = getRoleConfig(requesterRole);
    const newRoleConfig = getRoleConfig(newRole);
    
    toast.error(
      `Your role (${requesterConfig.displayName}) cannot assign ${newRoleConfig.displayName}`,
      {
        description: `You can only assign: ${requesterConfig.canAssign.map(r => getRoleConfig(r).displayName).join(', ')}`,
        duration: 5000,
      }
    );
    return false;
  }

  return true;
}

/**
 * Get role comparison info
 */
export function getRoleComparison(role1: WorkshopRole, role2: WorkshopRole): {
  higherRole: WorkshopRole;
  lowerRole: WorkshopRole;
  levelDifference: number;
  canRole1AssignRole2: boolean;
  canRole2AssignRole1: boolean;
} {
  const config1 = getRoleConfig(role1);
  const config2 = getRoleConfig(role2);

  return {
    higherRole: config1.level > config2.level ? role1 : role2,
    lowerRole: config1.level > config2.level ? role2 : role1,
    levelDifference: Math.abs(config1.level - config2.level),
    canRole1AssignRole2: canAssignRole(role1, role2),
    canRole2AssignRole1: canAssignRole(role2, role1),
  };
}

/**
 * Get permission summary for display
 */
export function getPermissionSummaryForDisplay(role: WorkshopRole): {
  category: string;
  count: number;
  total: number;
  percentage: number;
}[] {
  const config = getRoleConfig(role);
  const byResource: Record<string, number> = {};

  config.permissions.forEach((perm) => {
    byResource[perm.resource] = (byResource[perm.resource] || 0) + 1;
  });

  const allResources = Object.keys(ALL_PERMISSIONS);
  
  return allResources.map((resource) => {
    const total = ALL_PERMISSIONS[resource as keyof typeof ALL_PERMISSIONS]?.length || 0;
    const count = byResource[resource] || 0;
    
    return {
      category: resource.charAt(0).toUpperCase() + resource.slice(1),
      count,
      total,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

/**
 * Generate permission report for logging/debugging
 */
export function generatePermissionReport(role: WorkshopRole): string {
  const config = getRoleConfig(role);
  const summary = getPermissionSummaryForDisplay(role);
  
  let report = `\n=== Workshop Role Report ===\n`;
  report += `Role: ${config.displayName} (Level ${config.level})\n`;
  report += `Description: ${config.description}\n`;
  report += `Total Permissions: ${config.permissions.length}\n\n`;
  
  report += `Can Assign Roles:\n`;
  if (config.canAssign.length > 0) {
    config.canAssign.forEach((r) => {
      report += `  - ${getRoleConfig(r).displayName}\n`;
    });
  } else {
    report += `  (None)\n`;
  }
  
  report += `\nPermissions by Resource:\n`;
  summary.forEach((s) => {
    report += `  ${s.category}: ${s.count}/${s.total} (${s.percentage}%)\n`;
  });
  
  report += `\nDetailed Permissions:\n`;
  Object.entries(getPermissionsByResource(role)).forEach(([resource, perms]) => {
    report += `\n  ${resource.toUpperCase()}:\n`;
    perms.forEach((p) => {
      report += `    - ${p.action}: ${p.description}\n`;
    });
  });
  
  return report;
}

/**
 * Export permission report as downloadable file
 */
export function downloadPermissionReport(role: WorkshopRole) {
  const report = generatePermissionReport(role);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workshop-role-${role}-permissions.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format role for display
 */
export function formatRoleDisplay(role: WorkshopRole): {
  displayName: string;
  color: string;
  level: number;
  icon: string;
} {
  const config = getRoleConfig(role);
  return {
    displayName: config.displayName,
    color: config.color,
    level: config.level,
    icon: config.icon,
  };
}

/**
 * Get permission requirements for a feature
 */
export function getFeatureRequirements(feature: string): {
  resource: string;
  action: string;
  minimumRole: WorkshopRole;
}[] {
  const featureMap: Record<string, Array<{ resource: string; action: string }>> = {
    screenShare: [{ resource: 'screen', action: 'share' }],
    recording: [{ resource: 'session', action: 'record' }],
    lockMeeting: [{ resource: 'session', action: 'lock' }],
    endMeeting: [{ resource: 'session', action: 'end' }],
    roleManagement: [{ resource: 'roles', action: 'assign' }],
    muteParticipants: [{ resource: 'participants', action: 'mute' }],
    createPolls: [{ resource: 'polls', action: 'create' }],
    moderateChat: [{ resource: 'chat', action: 'manage' }],
    breakoutRooms: [{ resource: 'breakout', action: 'create' }],
    whiteboard: [{ resource: 'whiteboard', action: 'draw' }],
  };

  const requirements = featureMap[feature] || [];
  
  return requirements.map((req) => {
    // Find minimum role that has this permission
    const roleWithPerm = getAllRolesSorted().find((r) =>
      hasPermission(r.name, req.resource, req.action)
    );

    return {
      ...req,
      minimumRole: roleWithPerm?.name || 'host',
    };
  });
}

/**
 * Import ALL_PERMISSIONS from config
 */
import { ALL_PERMISSIONS, getPermissionsByResource } from './workshop-roles-config';
import { getAllRolesSorted } from './workshop-roles-config';
