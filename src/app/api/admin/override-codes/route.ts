import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { overrideCodes, uconRoles, roles, auditLogs, user, rolePermissions, individualPermissions } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/error-codes';

function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function hasOverridePermission(userId: string): Promise<boolean> {
  try {
    // First, check if user is a system admin by email pattern (admin@ucon.* emails are always admins)
    const userData = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    
    if (userData.length > 0) {
      const userEmail = userData[0].email?.toLowerCase() || '';
      // System admins have full access
      if (userEmail.startsWith('admin@ucon') || userEmail === 'admin@uconministries.org') {
        return true;
      }
    }

    // Check uconRoles for permission/role level
    const userRoleData = await db
      .select({
        dutyClearance: uconRoles.dutyClearance,
        permissionClearance: uconRoles.permissionClearance,
        roleLevel: roles.level,
        ucmLevelId: uconRoles.ucmLevelId,
      })
      .from(uconRoles)
      .innerJoin(roles, eq(uconRoles.ucmLevelId, roles.id))
      .where(eq(uconRoles.userId, userId))
      .limit(1);

    // If no uconRoles entry, user cannot have override permission (unless they're a system admin - checked above)
    if (userRoleData.length === 0) return false;
    
    const { dutyClearance, permissionClearance, roleLevel, ucmLevelId } = userRoleData[0];
    
    // 1. Check if user has admin role level (>= 80) OR high permission clearance (>= 90)
    if (roleLevel && roleLevel >= 80) return true;
    if (permissionClearance && permissionClearance >= 90) return true;

    // 2. Check for explicit 'transit:override' permission in role_permissions
    const rolePerm = await db.select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.ucmLevelId, ucmLevelId),
          eq(rolePermissions.resource, 'transit'),
          eq(rolePermissions.action, 'override')
        )
      )
      .limit(1);
    
    if (rolePerm.length > 0) return true;

    // 3. Check for explicit 'transit:override' in individual_permissions
    const indivPerm = await db.select()
      .from(individualPermissions)
      .where(
        and(
          eq(individualPermissions.userId, userId),
          eq(individualPermissions.resource, 'transit'),
          eq(individualPermissions.action, 'override'),
          eq(individualPermissions.isGranted, true)
        )
      )
      .limit(1);
    
    if (indivPerm.length > 0) return true;

    // 4. Fallback to duty clearance bit 1 (legacy support)
    return (dutyClearance && (dutyClearance & 1) === 1);
  } catch (error) {
    console.error('Error checking override permission:', error);
    return false;
  }
}

async function getStaffRegistrationNumber(userId: string): Promise<string | null> {
  try {
    const staffInfo = await db
      .select({ registrationNumber: user.registrationNumber })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return staffInfo[0]?.registrationNumber || null;
  } catch (error) {
    console.error('Error getting staff registration number:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  const hasPermission = await hasOverridePermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ 
      ...createErrorResponse('O1005'),
      error: 'Insufficient permissions' 
    }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    
    let codes;
    if (showAll) {
      // Show all codes
      codes = await db
        .select()
        .from(overrideCodes)
        .orderBy(desc(overrideCodes.createdAt))
        .limit(50);
    } else {
      // Default: Only show codes that are NOT used AND NOT expired
      const now = new Date().toISOString();
      codes = await db
        .select()
        .from(overrideCodes)
        .where(
          and(
            eq(overrideCodes.isUsed, false),
            sql`${overrideCodes.expiresAt} > ${now}`
          )
        )
        .orderBy(desc(overrideCodes.createdAt))
        .limit(50);
    }

    return NextResponse.json(codes);
  } catch (error) {
    console.error('Error fetching override codes:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001'),
      error: 'Failed to fetch codes' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  const hasPermission = await hasOverridePermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ 
      ...createErrorResponse('O1005'),
      error: 'You do not have permission to generate override codes' 
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { purpose, expiresInHours } = body;

    let code = generateCode();
    let attempts = 0;
    
    // Ensure unique code
    while (attempts < 10) {
      const existing = await db
        .select()
        .from(overrideCodes)
        .where(eq(overrideCodes.code, code))
        .limit(1);
      
      if (existing.length === 0) break;
      code = generateCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json({ 
        ...createErrorResponse('O1007'),
        error: 'Could not generate unique code. Please try again.' 
      }, { status: 500 });
    }

    // Get staff registration number
    const staffRegistrationNumber = await getStaffRegistrationNumber(currentUser.id);

    // Default to 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const newCode = await db.insert(overrideCodes).values({
      code,
      generatedBy: currentUser.id,
      generatedByStaffNumber: staffRegistrationNumber,
      purpose: purpose || 'transit_24h_bypass',
      expiresAt,
      createdAt: new Date().toISOString(),
    }).returning();

    // Log to audit system
    await db.insert(auditLogs).values({
      category: 'override_codes',
      action: 'generate',
      entityType: 'override_code',
      entityId: newCode[0].id.toString(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      staffRegistrationNumber,
      details: {
        code: newCode[0].code,
        purpose: newCode[0].purpose,
        expiresAt: newCode[0].expiresAt,
      },
      createdAt: new Date().toISOString(),
    });

    // Format expiration time in AM/PM format for display
    const expirationDate = new Date(expiresAt);
    const formattedExpiresAt = expirationDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return NextResponse.json({
      ...newCode[0],
      formattedExpiresAt
    });
  } catch (error) {
    console.error('Error generating override code:', error);
    return NextResponse.json({ 
      ...createErrorResponse('O1006'),
      error: 'Failed to generate code' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = await hasOverridePermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get('id');

    if (!codeId) {
      return NextResponse.json({ error: 'Code ID required' }, { status: 400 });
    }

    // Get the code before deleting for audit log
    const codeToDelete = await db
      .select()
      .from(overrideCodes)
      .where(eq(overrideCodes.id, parseInt(codeId)))
      .limit(1);

    // Check if code exists
    if (codeToDelete.length === 0) {
      return NextResponse.json({ error: 'Code not found' }, { status: 404 });
    }

    // Prevent deletion of used codes
    if (codeToDelete[0].isUsed) {
      return NextResponse.json({ 
        error: 'Cannot delete used codes. Used codes are retained for audit purposes.' 
      }, { status: 400 });
    }

    await db
      .delete(overrideCodes)
      .where(eq(overrideCodes.id, parseInt(codeId)));

    // Log to audit system
    if (codeToDelete.length > 0) {
      const staffRegistrationNumber = await getStaffRegistrationNumber(currentUser.id);
      await db.insert(auditLogs).values({
        category: 'override_codes',
        action: 'delete',
        entityType: 'override_code',
        entityId: codeId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        staffRegistrationNumber,
        details: {
          deletedCode: codeToDelete[0].code,
          wasUsed: codeToDelete[0].isUsed,
        },
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting override code:', error);
    return NextResponse.json({ error: 'Failed to delete code' }, { status: 500 });
  }
}
