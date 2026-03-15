import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transitConstraints, transitBookings } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql, desc } from 'drizzle-orm';

// Default transit operating parameters
const DEFAULT_START_TIME = "04:00"; // 4 AM
const DEFAULT_END_TIME = "22:00";   // 10 PM
const DEFAULT_CAPACITY = 20;

async function isStaffUser(userId: string) {
  const staffRole = await db.query.userRoles.findFirst({
    where: (roles, { eq }) => eq(roles.userId, userId)
  });
  return !!staffRole;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Return constraints (exceptions to default hours)
    const constraints = await db
      .select()
      .from(transitConstraints)
      .orderBy(desc(transitConstraints.createdAt));

    // Also return default operating parameters
    return NextResponse.json({
      defaults: {
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        capacity: DEFAULT_CAPACITY,
        description: "Transit operates daily 4:00 AM - 10:00 PM with capacity of 20 rides per day"
      },
      constraints
    });
  } catch (error) {
    console.error('Error fetching transit constraints:', error);
    return NextResponse.json({ error: 'Failed to fetch constraints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { constraintType, dayOfWeek, specificDate, startTime, endTime, maxCapacity, reason, requiresOverride } = body;

    if (!constraintType) {
      return NextResponse.json({ error: 'Constraint type is required' }, { status: 400 });
    }

    const newConstraint = await db.insert(transitConstraints).values({
      constraintType,
      dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : null,
      specificDate: specificDate || null,
      startTime: startTime || null,
      endTime: endTime || null,
      maxCapacity: maxCapacity || null,
      reason: reason || null,
      requiresOverride: requiresOverride !== false,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(newConstraint[0]);
  } catch (error) {
    console.error('Error creating transit constraint:', error);
    return NextResponse.json({ error: 'Failed to create constraint' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, constraintType, dayOfWeek, specificDate, startTime, endTime, maxCapacity, reason, requiresOverride } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing constraint ID' }, { status: 400 });
    }

    const updatedConstraint = await db
      .update(transitConstraints)
      .set({
        constraintType,
        dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : null,
        specificDate: specificDate || null,
        startTime: startTime || null,
        endTime: endTime || null,
        maxCapacity: maxCapacity || null,
        reason: reason || null,
        requiresOverride: requiresOverride !== false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(transitConstraints.id, id))
      .returning();

    return NextResponse.json(updatedConstraint[0]);
  } catch (error) {
    console.error('Error updating transit constraint:', error);
    return NextResponse.json({ error: 'Failed to update constraint' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing constraint ID' }, { status: 400 });
    }

    await db.delete(transitConstraints).where(eq(transitConstraints.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transit constraint:', error);
    return NextResponse.json({ error: 'Failed to delete constraint' }, { status: 500 });
  }
}
