import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ucmLevelPermissions, ucmLevels } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get('roleId');
    const ucmLevelId = searchParams.get('ucmLevelId');
    const levelId = ucmLevelId || roleId;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (levelId && isNaN(parseInt(levelId))) {
      return NextResponse.json({
        error: 'Valid ucmLevelId is required',
        code: 'INVALID_UCM_LEVEL_ID'
      }, { status: 400 });
    }

    if (levelId) {
      const levelExists = await db.select()
        .from(ucmLevels)
        .where(eq(ucmLevels.id, parseInt(levelId)))
        .limit(1);

      if (levelExists.length === 0) {
        return NextResponse.json({
          error: 'UCM Level not found',
          code: 'UCM_LEVEL_NOT_FOUND'
        }, { status: 404 });
      }
    }

    let query = db.select({
      id: ucmLevelPermissions.id,
      ucmLevelId: ucmLevelPermissions.ucmLevelId,
      resource: ucmLevelPermissions.resource,
      action: ucmLevelPermissions.action,
      createdAt: ucmLevelPermissions.createdAt,
      roleName: ucmLevels.name,
      roleLevel: ucmLevels.level,
      roleDescription: ucmLevels.description,
    })
      .from(ucmLevelPermissions)
      .leftJoin(ucmLevels, eq(ucmLevelPermissions.ucmLevelId, ucmLevels.id))
      .orderBy(asc(ucmLevelPermissions.ucmLevelId), asc(ucmLevelPermissions.resource), asc(ucmLevelPermissions.action))
      .limit(limit)
      .offset(offset);

    if (levelId) {
      query = query.where(eq(ucmLevelPermissions.ucmLevelId, parseInt(levelId)));
    }

    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleId, ucmLevelId, resource, action } = body;
    const levelId = ucmLevelId || roleId;

    if (!levelId) {
      return NextResponse.json({
        error: 'ucmLevelId is required',
        code: 'MISSING_UCM_LEVEL_ID'
      }, { status: 400 });
    }

    if (!resource || typeof resource !== 'string' || resource.trim() === '') {
      return NextResponse.json({
        error: 'Valid resource is required',
        code: 'INVALID_RESOURCE'
      }, { status: 400 });
    }

    if (!action || typeof action !== 'string' || action.trim() === '') {
      return NextResponse.json({
        error: 'Valid action is required',
        code: 'INVALID_ACTION'
      }, { status: 400 });
    }

    const levelIdInt = parseInt(levelId);
    if (isNaN(levelIdInt)) {
      return NextResponse.json({
        error: 'Valid ucmLevelId is required',
        code: 'INVALID_UCM_LEVEL_ID'
      }, { status: 400 });
    }

    const levelExists = await db.select()
      .from(ucmLevels)
      .where(eq(ucmLevels.id, levelIdInt))
      .limit(1);

    if (levelExists.length === 0) {
      return NextResponse.json({
        error: 'UCM Level not found',
        code: 'UCM_LEVEL_NOT_FOUND'
      }, { status: 404 });
    }

    const sanitizedResource = resource.trim();
    const sanitizedAction = action.trim();

    const existingPermission = await db.select()
      .from(ucmLevelPermissions)
      .where(
        and(
          eq(ucmLevelPermissions.ucmLevelId, levelIdInt),
          eq(ucmLevelPermissions.resource, sanitizedResource),
          eq(ucmLevelPermissions.action, sanitizedAction)
        )
      )
      .limit(1);

    if (existingPermission.length > 0) {
      return NextResponse.json({
        error: 'Permission already exists for this level, resource, and action combination',
        code: 'DUPLICATE_PERMISSION'
      }, { status: 400 });
    }

    const newPermission = await db.insert(ucmLevelPermissions)
      .values({
        ucmLevelId: levelIdInt,
        resource: sanitizedResource,
        action: sanitizedAction,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const levelDetails = await db.select({
      id: ucmLevelPermissions.id,
      ucmLevelId: ucmLevelPermissions.ucmLevelId,
      resource: ucmLevelPermissions.resource,
      action: ucmLevelPermissions.action,
      createdAt: ucmLevelPermissions.createdAt,
      roleName: ucmLevels.name,
      roleLevel: ucmLevels.level,
      roleDescription: ucmLevels.description,
    })
      .from(ucmLevelPermissions)
      .leftJoin(ucmLevels, eq(ucmLevelPermissions.ucmLevelId, ucmLevels.id))
      .where(eq(ucmLevelPermissions.id, newPermission[0].id))
      .limit(1);

    return NextResponse.json(levelDetails[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const permissionId = parseInt(id);

    const existingPermission = await db.select({
      id: ucmLevelPermissions.id,
      ucmLevelId: ucmLevelPermissions.ucmLevelId,
      resource: ucmLevelPermissions.resource,
      action: ucmLevelPermissions.action,
      createdAt: ucmLevelPermissions.createdAt,
      roleName: ucmLevels.name,
      roleLevel: ucmLevels.level,
      roleDescription: ucmLevels.description,
    })
      .from(ucmLevelPermissions)
      .leftJoin(ucmLevels, eq(ucmLevelPermissions.ucmLevelId, ucmLevels.id))
      .where(eq(ucmLevelPermissions.id, permissionId))
      .limit(1);

    if (existingPermission.length === 0) {
      return NextResponse.json({
        error: 'Permission not found',
        code: 'PERMISSION_NOT_FOUND'
      }, { status: 404 });
    }

    await db.delete(ucmLevelPermissions)
      .where(eq(ucmLevelPermissions.id, permissionId))
      .returning();

    return NextResponse.json({
      message: 'Permission deleted successfully',
      deletedPermission: existingPermission[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}