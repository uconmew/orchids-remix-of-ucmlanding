import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: "Invalid user role ID",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { permissionClearance, dutyClearance, roleId, staffTitle, isAdmin } = body;

    // Validate clearance values
    if (permissionClearance !== undefined && (permissionClearance < 0 || permissionClearance > 100)) {
      return NextResponse.json({ 
        error: "Permission clearance must be between 0 and 100",
        code: "INVALID_CLEARANCE_VALUE" 
      }, { status: 400 });
    }

    if (dutyClearance !== undefined && (dutyClearance < 0 || dutyClearance > 100)) {
      return NextResponse.json({ 
        error: "Duty clearance must be between 0 and 100",
        code: "INVALID_CLEARANCE_VALUE" 
      }, { status: 400 });
    }

    // Check if user role exists
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.id, id))
      .limit(1);

    if (existingUserRole.length === 0) {
      return NextResponse.json({ 
        error: "User role not found",
        code: "USER_ROLE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Update clearance levels
    const updateData: any = {};
    if (permissionClearance !== undefined) {
      updateData.permissionClearance = permissionClearance;
    }
    if (dutyClearance !== undefined) {
      updateData.dutyClearance = dutyClearance;
    }
    if (roleId !== undefined) {
      updateData.roleId = roleId;
    }
    if (staffTitle !== undefined) {
      updateData.staffTitle = staffTitle;
    }
    if (isAdmin !== undefined) {
      updateData.isAdmin = isAdmin;
    }

    const [updatedUserRole] = await db
      .update(userRoles)
      .set(updateData)
      .where(eq(userRoles.id, id))
      .returning();

    return NextResponse.json({
      message: "Clearance levels updated successfully",
      userRole: updatedUserRole
    }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/user-roles/[id] error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: "Invalid user role ID",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if user role exists
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.id, id))
      .limit(1);

    if (existingUserRole.length === 0) {
      return NextResponse.json({ 
        error: "User role not found",
        code: "USER_ROLE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete the user role
    await db
      .delete(userRoles)
      .where(eq(userRoles.id, id));

    return NextResponse.json({
      message: "User role deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/user-roles/[id] error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
