import { db } from '@/db';
import { roleTags, ucmLevels, userRoles, convicts } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Expanded valid tags including new role-specific tags
export const VALID_TAGS = [
  'convict',      // All levels - Base community member access
  'staff',        // Level 1-4 - Staff member access
  'admin',        // Level 1 ONLY - Full administrative access
  'executive',    // Level 1 - Executive/Visionary level, highest approval authority
  'director',     // Level 1-2 - Directors can approve audit-level changes
  'coordinator',  // Level 3 - Ministry Coordinators
  'mentor',       // Assigned to mentors (can be any staff level)
  'volunteer',    // Assigned to volunteers (typically level 5)
  'facilitator',  // Assigned to workshop facilitators
  
  // POSITION TAGS
  'counselor',
  'chaplain',
  'greeter',
  'prayer_partner',
  'small_group_leader',
  'sponsor',
  'driver',
  
  // PROGRAM TAGS
  'awaken',
  'transit',
  'nourish',
  'haven',
  'voice',
  'neighbors',
  'steps',
  'shepherd',
  'equip',
  'bridge',
] as const;

export type ValidTag = typeof VALID_TAGS[number];

export const TAG_CATEGORIES = {
  BASE_ROLE: 'base_role',
  POSITION: 'position',
  PROGRAM: 'program'
} as const;

// Helper to determine category for a tag
export function getTagCategory(tag: string): string {
  if (['convict', 'staff', 'admin', 'executive', 'director', 'coordinator', 'mentor', 'volunteer'].includes(tag)) {
    return TAG_CATEGORIES.BASE_ROLE;
  }
  if (['counselor', 'chaplain', 'greeter', 'prayer_partner', 'small_group_leader', 'sponsor', 'driver', 'facilitator'].includes(tag)) {
    return TAG_CATEGORIES.POSITION;
  }
  return TAG_CATEGORIES.PROGRAM;
}

// Tags that require 2-person approval to modify
export const APPROVAL_REQUIRED_TAGS = ['executive', 'director', 'admin'] as const;

// Tags that can approve audit-level changes (audit delete, staff name change, operational changes)
export const AUDIT_APPROVER_TAGS = ['executive', 'director'] as const;

// Override authority levels
export const OVERRIDE_AUTHORITY = {
  executive: {
    canOverride: ['director', 'coordinator', 'staff', 'volunteer', 'mentor', 'convict'],
    approvalLevel: 'all',
    description: 'Full override authority on any decision'
  },
  director: {
    canOverride: ['coordinator', 'staff', 'volunteer', 'mentor'],
    approvalLevel: 'audit_and_operational',
    description: 'Can approve audit deletions, staff changes, operational decisions'
  },
  coordinator: {
    canOverride: ['staff', 'volunteer'],
    approvalLevel: 'program_operational',
    description: 'Can override within assigned program scope only'
  }
} as const;

export function getTagsForRoleLevel(level: number, additionalTags?: string[]): ValidTag[] {
  let baseTags: ValidTag[] = [];
  
  switch (level) {
    case 1:
      // Executive Leadership - gets executive, director, admin, staff, convict
      baseTags = ['executive', 'director', 'admin', 'staff', 'convict'];
      break;
    case 2:
      // Program Directors - gets director, staff, convict (NO admin, NO executive)
      baseTags = ['director', 'staff', 'convict'];
      break;
    case 3:
      // Ministry Coordinators - gets coordinator, staff, convict
      baseTags = ['coordinator', 'staff', 'convict'];
      break;
    case 4:
      // Staff Members - gets staff, convict
      baseTags = ['staff', 'convict'];
      break;
    case 5:
      // Volunteers - gets volunteer, convict
      baseTags = ['volunteer', 'convict'];
      break;
    case 6:
      // Mentors - gets mentor, convict
      baseTags = ['mentor', 'convict'];
      break;
    default:
      // Level 7+ (Convicts/Community Members) - only convict tag
      baseTags = ['convict'];
  }

  // Add any additional tags (like mentor, volunteer, facilitator that can be assigned to any level)
  if (additionalTags) {
    for (const tag of additionalTags) {
      if (VALID_TAGS.includes(tag as ValidTag) && !baseTags.includes(tag as ValidTag)) {
        baseTags.push(tag as ValidTag);
      }
    }
  }

  return baseTags;
}

// Check if a user can approve audit-level changes
export function canApproveAuditChanges(tags: string[]): boolean {
  return tags.some(tag => AUDIT_APPROVER_TAGS.includes(tag as typeof AUDIT_APPROVER_TAGS[number]));
}

export function shouldHaveAdminCookie(roleLevel: number, tags: string[]): boolean {
  // Admin cookie requires Level 1 AND the admin tag
  return roleLevel === 1 && tags.includes('admin');
}

export function shouldHaveStaffCookie(roleLevel: number, tags: string[]): boolean {
  // Staff cookie requires Level 1-4 AND the staff tag
  return roleLevel >= 1 && roleLevel <= 4 && tags.includes('staff');
}

export async function assignRoleTagsForUser(
  userId: string, 
  roleLevel: number, 
  assignedBy?: string,
  additionalTags?: string[]
): Promise<{ success: boolean; tags: ValidTag[]; error?: string }> {
  try {
    const tagsToAssign = getTagsForRoleLevel(roleLevel, additionalTags);
    
    const existingTags = await db
      .select({ tag: roleTags.tag })
      .from(roleTags)
      .where(eq(roleTags.userId, userId));
    
    const existingTagSet = new Set(existingTags.map(t => t.tag));
    
    const newTags = tagsToAssign.filter(tag => !existingTagSet.has(tag));
    
    if (newTags.length > 0) {
      await db.insert(roleTags).values(
        newTags.map(tag => ({
          userId,
          tag,
          tagCategory: getTagCategory(tag),
          assignedAt: new Date().toISOString(),
          assignedBy: assignedBy || null,
        }))
      );
    }
    
    return { success: true, tags: tagsToAssign };
  } catch (error) {
    console.error('Error assigning role tags:', error);
    return { 
      success: false, 
      tags: [], 
      error: (error as Error).message 
    };
  }
}

export async function syncUserRoleTags(
  userId: string,
  assignedBy?: string
): Promise<{ success: boolean; tags: ValidTag[]; error?: string }> {
  try {
    const userRoleAssignments = await db
      .select({
        roleLevel: ucmLevels.level,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, userId));

    if (userRoleAssignments.length === 0) {
      return { success: true, tags: ['convict'] };
    }

    const highestLevel = Math.min(...userRoleAssignments.map(r => r.roleLevel));
    
    return await assignRoleTagsForUser(userId, highestLevel, assignedBy);
  } catch (error) {
    console.error('Error syncing role tags:', error);
    return { 
      success: false, 
      tags: [], 
      error: (error as Error).message 
    };
  }
}

export async function removeRoleTagsForUser(
  userId: string,
  tagsToRemove: ValidTag[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (tagsToRemove.length === 0) {
      return { success: true };
    }

    await db
      .delete(roleTags)
      .where(and(
        eq(roleTags.userId, userId),
        inArray(roleTags.tag, tagsToRemove)
      ));
    
    return { success: true };
  } catch (error) {
    console.error('Error removing role tags:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

export async function getUserRoleTags(userId: string): Promise<string[]> {
  try {
    const tags = await db
      .select({ tag: roleTags.tag })
      .from(roleTags)
      .where(eq(roleTags.userId, userId));
    
    return tags.map(t => t.tag);
  } catch (error) {
    console.error('Error getting user role tags:', error);
    return [];
  }
}

export async function userHasTag(userId: string, tag: ValidTag): Promise<boolean> {
  try {
    const result = await db
      .select({ id: roleTags.id })
      .from(roleTags)
      .where(and(
        eq(roleTags.userId, userId),
        eq(roleTags.tag, tag)
      ))
      .limit(1);
    
    return result.length > 0;
  } catch (error) {
    console.error('Error checking user tag:', error);
    return false;
  }
}
