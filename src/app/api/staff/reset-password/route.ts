import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, userRoles, roles, rolePermissions } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/staff/reset-password
 * Automated password reset for staff members
 * Generates a temporary password and sets requiresPasswordChange flag
 * 
 * SECURITY: Requires authentication + "Manage Staff" permission
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY CHECK 1: Verify user is authenticated
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // SECURITY CHECK 2: Verify user has "Manage Staff" permission
    const userRolesList = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleLevel: roles.level,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, currentUser.id));

    if (userRolesList.length === 0) {
      return NextResponse.json(
        { error: 'Access denied. No staff role assigned.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Check if user has "Manage Staff" permission via rolePermissions
    const roleIds = userRolesList.map(r => r.roleId);
    const userPermissions = await db
      .select({
        resource: rolePermissions.resource,
        action: rolePermissions.action,
      })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));

    // Check for staff management permission (resource: 'staff', action: 'manage')
    const hasManageStaffPermission = userPermissions.some(
      p => (p.resource === 'staff' && p.action === 'manage') ||
           (p.resource === 'admin' && p.action === 'all')
    );

    if (!hasManageStaffPermission) {
      return NextResponse.json(
        { 
          error: 'Access denied. "Manage Staff" permission required to reset passwords.',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Find user by email
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const targetUserId = existingUser[0].id;

    // Verify target user has staff role
    const targetStaffRoles = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, targetUserId));

    if (targetStaffRoles.length === 0) {
      return NextResponse.json(
        { error: 'User is not a staff member', code: 'NOT_STAFF' },
        { status: 403 }
      );
    }

    // SECURITY CHECK 3: Prevent resetting password of higher-level staff
    const targetUserRoles = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleLevel: roles.level,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, targetUserId));

    const currentUserMaxLevel = Math.min(...userRolesList.map(r => r.roleLevel));
    const targetUserMaxLevel = Math.min(...targetUserRoles.map(r => r.roleLevel));

    // Lower level number = higher authority (e.g., level 1 > level 2)
    if (targetUserMaxLevel < currentUserMaxLevel) {
      return NextResponse.json(
        { 
          error: 'Cannot reset password of staff with higher authority level',
          code: 'INSUFFICIENT_AUTHORITY'
        },
        { status: 403 }
      );
    }

    // Generate secure temporary password (12 characters)
    const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 12) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update account with new password and set requiresPasswordChange
    const updated = await db
      .update(account)
      .set({
        password: hashedPassword,
        requiresPasswordChange: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(account.userId, targetUserId),
          eq(account.providerId, 'credential')
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to reset password. Account may not exist.', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Log the action (audit trail)
    console.log(`[SECURITY AUDIT] Password reset by ${currentUser.email} (${currentUser.name}) for ${email} (${existingUser[0].name})`);

    // In production, send this via email instead of returning it
    // For now, return it in the response
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
        user: {
          name: existingUser[0].name,
          email: existingUser[0].email,
        },
        temporaryPassword: tempPassword,
        note: 'User must change this password on first login. In production, send this via email.',
        resetBy: {
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting staff password:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}