import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, ucmLevelPermissions, ucmLevels } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, resource, action } = body;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!resource || typeof resource !== 'string' || resource.trim() === '') {
      return NextResponse.json({ 
        error: "Valid resource is required",
        code: "MISSING_RESOURCE" 
      }, { status: 400 });
    }

    if (!action || typeof action !== 'string' || action.trim() === '') {
      return NextResponse.json({ 
        error: "Valid action is required",
        code: "MISSING_ACTION" 
      }, { status: 400 });
    }

    const userRoleResult = await db.select({
      ucmLevelId: userRoles.ucmLevelId,
      roleName: ucmLevels.name
    })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, userId.trim()))
      .limit(1);

    if (userRoleResult.length === 0) {
      return NextResponse.json({
        hasPermission: false,
        resource: resource.trim(),
        action: action.trim(),
        message: "User has no assigned role"
      }, { status: 200 });
    }

    const { ucmLevelId, roleName } = userRoleResult[0];

    const permissionResult = await db.select()
      .from(ucmLevelPermissions)
      .where(
        and(
          eq(ucmLevelPermissions.ucmLevelId, ucmLevelId),
          eq(ucmLevelPermissions.resource, resource.trim()),
          eq(ucmLevelPermissions.action, action.trim())
        )
      )
      .limit(1);

    const hasPermission = permissionResult.length > 0;

    return NextResponse.json({
      hasPermission,
      ucmLevelId,
      roleId: ucmLevelId,
      roleName,
      resource: resource.trim(),
      action: action.trim()
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}