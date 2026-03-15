/**
 * Custom React hooks for workshop permission checking
 */

import { useMemo } from 'react';
import { WorkshopRole } from '@/types/workshop';
import { WorkshopPermissionChecker, hasWorkshopPermission } from '@/lib/workshop-permissions';

export function useWorkshopPermissions(role: WorkshopRole | undefined) {
  const checker = useMemo(() => {
    if (!role) return null;
    return new WorkshopPermissionChecker(role);
  }, [role]);

  return {
    can: (resource: string, action: string) => {
      if (!role) return false;
      return hasWorkshopPermission(role, resource, action);
    },
    canManageParticipants: checker?.canManageParticipants() ?? false,
    canPresent: checker?.canPresent() ?? false,
    canModerate: checker?.canModerate() ?? false,
    canManagePolls: checker?.canManagePolls() ?? false,
    canManageBreakout: checker?.canManageBreakout() ?? false,
    canRecord: checker?.canRecord() ?? false,
    canEndSession: checker?.canEndSession() ?? false,
    canAssignRoles: checker?.canAssignRoles() ?? false,
    canLockSession: checker?.canLockSession() ?? false,
    canChangeSettings: checker?.canChangeSettings() ?? false,
    canManageFiles: checker?.canManageFiles() ?? false,
    canSpotlight: checker?.canSpotlight() ?? false,
    canAdmitWaiting: checker?.canAdmitWaiting() ?? false,
    canBroadcast: checker?.canBroadcast() ?? false,
    roleLevel: checker?.getRoleLevel() ?? 0,
    roleName: checker?.getRoleName() ?? 'Unknown',
  };
}