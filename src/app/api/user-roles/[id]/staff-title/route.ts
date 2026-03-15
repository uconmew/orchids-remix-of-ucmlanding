import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const userRoleId = parseInt(id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { staffTitle } = requestBody;

    // Validate staffTitle is provided and is a string
    if (!staffTitle) {
      return NextResponse.json(
        {
          error: 'Staff title is required',
          code: 'MISSING_STAFF_TITLE'
        },
        { status: 400 }
      );
    }

    if (typeof staffTitle !== 'string') {
      return NextResponse.json(
        {
          error: 'Staff title must be a string',
          code: 'INVALID_STAFF_TITLE_TYPE'
        },
        { status: 400 }
      );
    }

    // Trim the staffTitle
    const sanitizedStaffTitle = staffTitle.trim();

    if (sanitizedStaffTitle.length === 0) {
      return NextResponse.json(
        {
          error: 'Staff title cannot be empty',
          code: 'EMPTY_STAFF_TITLE'
        },
        { status: 400 }
      );
    }

    // Check if user role assignment exists
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.id, userRoleId))
      .limit(1);

    if (existingUserRole.length === 0) {
      return NextResponse.json(
        {
          error: 'User role assignment not found',
          code: 'USER_ROLE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update the user role assignment with new staffTitle
    const updated = await db
      .update(userRoles)
      .set({
        staffTitle: sanitizedStaffTitle
      })
      .where(eq(userRoles.id, userRoleId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update user role assignment',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Get the updated user role with joined role details
    const updatedWithRoleDetails = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        roleId: userRoles.roleId,
        staffTitle: userRoles.staffTitle,
        assignedAt: userRoles.assignedAt,
        assignedBy: userRoles.assignedBy,
        roleName: roles.name,
        roleDescription: roles.description,
        roleLevel: roles.level
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.id, userRoleId))
      .limit(1);

    if (updatedWithRoleDetails.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve updated user role assignment',
          code: 'RETRIEVAL_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedWithRoleDetails[0], { status: 200 });

  } catch (error) {
    console.error('PUT /api/user-roles/[id]/staff-title error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}