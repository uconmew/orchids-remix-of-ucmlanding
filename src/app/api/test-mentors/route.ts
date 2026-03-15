import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, roles } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST() {
  try {
    // Get mentor role (id: 16, level: 4)
    const mentorRole = await db
      .select()
      .from(roles)
      .where(and(
        sql`lower(${roles.name}) like '%mentor%'`,
        eq(roles.level, 4)
      ))
      .limit(1);

    if (mentorRole.length === 0) {
      return NextResponse.json({ error: 'Mentor role not found' }, { status: 404 });
    }

    // Create dummy mentor assignments for testing
    const dummyUserIds = [
      'user-mentor-1',
      'user-mentor-2',
      'user-mentor-3',
      'user-mentor-4',
      'user-mentor-5'
    ];
    
    let assignedCount = 0;
    for (const userId of dummyUserIds) {
      // Check if already exists
      const existing = await db
        .select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, mentorRole[0].id)
        ))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(userRoles).values({
          userId: userId,
          roleId: mentorRole[0].id,
          staffTitle: 'Mentor',
          permissionClearance: 4,
          dutyClearance: 4,
          assignedAt: new Date().toISOString(),
        });
        assignedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      assigned: assignedCount,
      message: `Assigned ${assignedCount} users as mentors`
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET to check current mentors
export async function GET() {
  try {
    const mentors = await db
      .select({
        userId: userRoles.userId,
        staffTitle: userRoles.staffTitle,
        permissionClearance: userRoles.permissionClearance,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          sql`lower(${roles.name}) like '%mentor%'`,
          eq(userRoles.permissionClearance, 4)
        )
      );

    return NextResponse.json({ mentors, count: mentors.length });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
