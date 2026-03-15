import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, userRoles, roles } from '@/db/schema';
import { eq, gt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (foundUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: foundUser[0].id,
      name: foundUser[0].name,
      email: foundUser[0].email,
      emailVerified: foundUser[0].emailVerified,
    });
  } catch (error) {
    console.error('User lookup error:', error);
    return NextResponse.json({ error: 'Failed to lookup user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (foundUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = foundUser[0].id;

    // Get all sessions for this user
    const allSessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, userId));

    // Calculate active vs expired sessions
    const now = new Date();
    const activeSessions = allSessions.filter(s => new Date(s.expiresAt) > now);
    const expiredSessions = allSessions.filter(s => new Date(s.expiresAt) <= now);

    // Get user's role and clearance information
    const userRoleData = await db
      .select({
        userRole: userRoles,
        role: roles,
      })
      .from(userRoles)
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .limit(1);

    return NextResponse.json({
      user: {
        id: foundUser[0].id,
        name: foundUser[0].name,
        email: foundUser[0].email,
        emailVerified: foundUser[0].emailVerified,
        registrationNumber: foundUser[0].registrationNumber,
        createdAt: foundUser[0].createdAt,
      },
      sessions: {
        total: allSessions.length,
        active: activeSessions.length,
        expired: expiredSessions.length,
      },
      hasActiveSession: activeSessions.length > 0,
      userRole: userRoleData.length > 0 ? {
        id: userRoleData[0].userRole.id,
        roleId: userRoleData[0].userRole.roleId,
        roleName: userRoleData[0].role?.name,
        roleLevel: userRoleData[0].role?.level,
        staffTitle: userRoleData[0].userRole.staffTitle,
        permissionClearance: userRoleData[0].userRole.permissionClearance || 0,
        dutyClearance: userRoleData[0].userRole.dutyClearance || 0,
        assignedAt: userRoleData[0].userRole.assignedAt,
      } : null,
    });
  } catch (error) {
    console.error('User lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup user' },
      { status: 500 }
    );
  }
}