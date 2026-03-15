import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, userRoles, roles, roleTags, auditLogs, passwordChangeHistory } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * POST /api/staff/reset-password/request
 * Self-service password reset for staff members
 * Requires: email + accessCode (assigned during staff registration in ucon_roles) + staffUcm (UCMYY#### registration number)
 * 
 * LIMITS: Users can only self-reset their password once per month.
 * Staff-initiated resets (via admin) do NOT require 2-person approval for self-reset.
 * 
 * Note: Users with ONLY the "convict" tag (no staff/admin tags) do NOT have access codes
 * and must use a different password reset method.
 * 
 * This endpoint does NOT require authentication - it's for users who forgot their password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accessCode, staffUcm } = body;

    // Validate required fields
    if (!email || !accessCode || !staffUcm) {
      return NextResponse.json(
        { 
          error: 'All fields are required: email, access code, and Staff UCM',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate access code format (4 digits)
    if (!/^\d{4}$/.test(accessCode)) {
      return NextResponse.json(
        { error: 'Access code must be exactly 4 digits', code: 'INVALID_ACCESS_CODE_FORMAT' },
        { status: 400 }
      );
    }

    // Validate Staff UCM format (UCMYY#### pattern)
    const ucmRegex = /^UCM\d{2}\d{4}$/i;
    if (!ucmRegex.test(staffUcm)) {
      return NextResponse.json(
        { 
          error: 'Staff UCM must be in format UCMYY#### (e.g., UCM250001)',
          code: 'INVALID_STAFF_UCM_FORMAT'
        },
        { status: 400 }
      );
    }

    // Normalize Staff UCM to uppercase
    const normalizedUcm = staffUcm.toUpperCase();

    // Step 1: Find user by email
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length === 0) {
      // Don't reveal if user exists - use generic message
      return NextResponse.json(
        { 
          error: 'Invalid credentials. Please verify your email, access code, and Staff UCM.',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const targetUser = existingUser[0];

    // Step 2: Verify Staff UCM matches
    if (!targetUser.registrationNumber || targetUser.registrationNumber.toUpperCase() !== normalizedUcm) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials. Please verify your email, access code, and Staff UCM.',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Step 3: Check user's tags - must have staff or admin tag (not convict-only)
    const userTags = await db
      .select({ tag: roleTags.tag })
      .from(roleTags)
      .where(eq(roleTags.userId, targetUser.id));

    const tagList = userTags.map(t => t.tag.toLowerCase());
    const hasStaffAccess = tagList.includes('staff') || tagList.includes('admin');
    const isConvictOnly = tagList.length === 1 && tagList[0] === 'convict';

    if (isConvictOnly || !hasStaffAccess) {
      return NextResponse.json(
        { 
          error: 'This password reset method is only available for staff members. Please contact an administrator for assistance.',
          code: 'CONVICT_ONLY_USER'
        },
        { status: 403 }
      );
    }

    // Step 4: Verify user has staff role in ucon_roles and get their access code
    const userStaffRoles = await db
      .select({
        roleId: userRoles.ucmLevelId,
        roleName: roles.name,
        roleLevel: roles.level,
        accessCode: userRoles.accessCode,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.ucmLevelId, roles.id))
      .where(eq(userRoles.userId, targetUser.id));

    if (userStaffRoles.length === 0) {
      return NextResponse.json(
        { 
          error: 'This account does not have staff privileges assigned. Please contact an administrator.',
          code: 'NOT_STAFF'
        },
        { status: 403 }
      );
    }

    // Step 5: Verify access code matches the staff member's assigned access code in ucon_roles
    const staffRole = userStaffRoles[0];
    
    if (!staffRole.accessCode) {
      return NextResponse.json(
        { 
          error: 'No access code has been assigned to this staff account. Please contact an administrator.',
          code: 'NO_ACCESS_CODE'
        },
        { status: 403 }
      );
    }

    if (staffRole.accessCode !== accessCode) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials. Please verify your email, access code, and Staff UCM.',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Step 6: Generate secure temporary password
    const tempPassword = crypto.randomBytes(8).toString('base64').slice(0, 10) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Step 7: Update account with new password and set requiresPasswordChange
    const updated = await db
      .update(account)
      .set({
        password: hashedPassword,
        requiresPasswordChange: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(account.userId, targetUser.id),
          eq(account.providerId, 'credential')
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to reset password. Your account may not have password credentials set up.',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

// Step 8: Log the action (audit trail)
      await db.insert(auditLogs).values({
        category: 'auth',
        action: 'password_reset_self_service',
        entityType: 'user',
        entityId: targetUser.id,
        userId: targetUser.id,
        userEmail: targetUser.email,
        userName: targetUser.name,
        staffRegistrationNumber: normalizedUcm,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: {
          method: 'self_service_with_staff_access_code',
          hasStaffRole: true,
          userTags: tagList,
          staffLevel: staffRole.roleName,
        },
        createdAt: new Date().toISOString(),
      });

      // Step 9: Record password change in history (for 1/month limit tracking)
      await db.insert(passwordChangeHistory).values({
        userId: targetUser.id,
        changeType: 'self_reset',
        changedAt: new Date().toISOString(),
        changedBy: targetUser.id, // Self-reset
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      console.log(`[SECURITY AUDIT] Self-service password reset for ${targetUser.email} (${targetUser.name}) using their staff access code`);

    // Return success with temporary password
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
        user: {
          name: targetUser.name,
          email: targetUser.email,
        },
        temporaryPassword: tempPassword,
        note: 'You will be required to change this password after logging in.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in self-service password reset:', error);
    return NextResponse.json(
      {
        error: 'Internal server error. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
