import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roleTags, userRoles, ucmLevels, user } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { assignRoleTagsForUser, getTagsForRoleLevel, AUDIT_APPROVER_TAGS, APPROVAL_REQUIRED_TAGS } from '@/lib/role-tags';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, syncAll, additionalTags } = body;

    if (syncAll) {
      const allUsers = await db.select({ id: user.id }).from(user);
      
      let synced = 0;
      let errors = 0;

      for (const u of allUsers) {
        const userRoleAssignments = await db
          .select({
            roleLevel: ucmLevels.level,
          })
          .from(userRoles)
          .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
          .where(eq(userRoles.userId, u.id));

        const highestLevel = userRoleAssignments.length > 0
          ? Math.min(...userRoleAssignments.map(r => r.roleLevel))
          : 7;

        const result = await assignRoleTagsForUser(u.id, highestLevel);
        
        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      }

      return NextResponse.json({
        message: `Synced role tags for ${synced} users`,
        synced,
        errors,
        total: allUsers.length
      }, { status: 200 });
    }

    if (!userId) {
      return NextResponse.json({ 
        error: "userId or syncAll is required",
        code: "MISSING_PARAMETERS" 
      }, { status: 400 });
    }

    const userRoleAssignments = await db
      .select({
        roleLevel: ucmLevels.level,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, userId));

    const highestLevel = userRoleAssignments.length > 0
      ? Math.min(...userRoleAssignments.map(r => r.roleLevel))
      : 7;

    const result = await assignRoleTagsForUser(userId, highestLevel, undefined, additionalTags);

    if (!result.success) {
      return NextResponse.json({
        error: result.error,
        code: "SYNC_FAILED"
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "Role tags synced successfully",
      tags: result.tags
    }, { status: 200 });
  } catch (error) {
    console.error('Sync role-tags error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = await db
      .select({
        tag: roleTags.tag,
        count: sql<number>`count(*)::int`,
      })
      .from(roleTags)
      .groupBy(roleTags.tag);

    const totalUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);

    const usersWithTags = await db
      .select({ count: sql<number>`count(distinct ${roleTags.userId})::int` })
      .from(roleTags);

    return NextResponse.json({
      tagCounts: stats,
      totalUsers: totalUsers[0]?.count || 0,
      usersWithTags: usersWithTags[0]?.count || 0,
      usersWithoutTags: (totalUsers[0]?.count || 0) - (usersWithTags[0]?.count || 0),
      tagDefinitions: {
        admin: 'Level 1 ONLY - Full administrative access (requires both level 1 AND admin tag)',
        staff: 'Level 1-4 - Staff member access (requires both staff level AND staff tag)',
        convict: 'All levels - Base community member access',
        executive: 'Level 1 - Executive/Visionary level, highest approval authority',
        director: 'Level 1-2 - Directors can approve audit-level changes',
        coordinator: 'Level 3 - Ministry Coordinators',
        mentor: 'Any level - Assigned to mentors',
        volunteer: 'Level 5 - Assigned to volunteers',
        facilitator: 'Any level - Assigned to workshop facilitators',
      },
      tagRules: [
        { level: 1, tags: ['executive', 'director', 'admin', 'staff', 'convict'], description: 'Executive Leadership - gets executive + director + admin + staff + convict' },
        { level: 2, tags: ['director', 'staff', 'convict'], description: 'Program Directors - gets director + staff + convict (NO admin, NO executive)' },
        { level: 3, tags: ['coordinator', 'staff', 'convict'], description: 'Ministry Coordinators - gets coordinator + staff + convict' },
        { level: 4, tags: ['staff', 'convict'], description: 'Staff Members - gets staff + convict' },
        { level: 5, tags: ['volunteer', 'convict'], description: 'Volunteers - gets volunteer + convict' },
        { level: 6, tags: ['mentor', 'convict'], description: 'Mentors - gets mentor + convict' },
        { level: 7, tags: ['convict'], description: 'Convicts (Community Members) - gets convict only' },
      ],
      approvalRules: {
        auditApproverTags: AUDIT_APPROVER_TAGS,
        approvalRequiredTags: APPROVAL_REQUIRED_TAGS,
        sensitiveChanges: [
          'Staff profile changes require 2-person approval (except self-service password reset)',
          'Audit log deletion requires Director/Executive approval',
          'Staff name changes require Director/Executive approval',
          'Operational changes require Director/Executive approval',
          'Self-service password reset: Limited to 1 per month',
        ]
      },
      cookieRules: {
        admin: 'Only issued when user has role level 1 AND admin tag present',
        staff: 'Only issued when user has role level 1-4 AND staff tag present',
        convict: 'Issued to all authenticated users regardless of level',
      }
    }, { status: 200 });
  } catch (error) {
    console.error('GET role-tags/sync error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
