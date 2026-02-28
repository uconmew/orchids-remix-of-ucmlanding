import { CONVICT_DEFAULT_PERMISSIONS } from './program-tags';

interface UserTagContext {
  userId: string;
  baseTags: string[];      // e.g., ['staff', 'coordinator']
  positionTags: string[];  // e.g., ['facilitator', 'counselor']
  programTags: string[];   // e.g., ['awaken', 'shepherd']
  clearanceLevel: number;  // 0-90 points
  roleLevel: number;       // 1-5 hierarchy
}

/**
 * Resolve full permission set based on multiplicative tag stacking
 * 
 * Example: staff + coordinator + awaken = 
 *   All staff permissions + all coordinator duties + AWAKEN coordinator permissions at their clearance
 */
export function resolveUserPermissions(context: UserTagContext): string[] {
  const permissions: Set<string> = new Set();
  
  // 1. Add Convict default permissions (everyone gets these)
  CONVICT_DEFAULT_PERMISSIONS.forEach(p => permissions.add(p));
  
  // Note: Detailed permission resolution for specific tags would be implemented here
  // based on the business rules for each tag combination.
  // For now, we provide the structure for stacking.
  
  return Array.from(permissions);
}

/**
 * Check if user has override authority over a target user
 */
export function hasOverrideAuthority(
  actorTags: string[], 
  targetTags: string[]
): boolean {
  // Executive can override anyone
  if (actorTags.includes('executive')) return true;
  
  // Director can override coordinator, staff, volunteer
  if (actorTags.includes('director')) {
    return !targetTags.includes('executive') && !targetTags.includes('director');
  }
  
  // Coordinator can override staff, volunteer (within program scope)
  if (actorTags.includes('coordinator')) {
    return !targetTags.includes('executive') && 
           !targetTags.includes('director') && 
           !targetTags.includes('coordinator');
  }
  
  return false;
}
