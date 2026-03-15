import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { outreachAvailability, transitAvailability, uconRoles, roles } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, asc } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/error-codes';

async function hasAvailabilityPermission(userId: string): Promise<boolean> {
  const userRoleData = await db
    .select({
      dutyClearance: uconRoles.dutyClearance,
      roleLevel: roles.level,
    })
    .from(uconRoles)
    .innerJoin(roles, eq(uconRoles.roleId, roles.id))
    .where(eq(uconRoles.userId, userId))
    .limit(1);

  if (userRoleData.length === 0) return false;
  
  const { dutyClearance, roleLevel } = userRoleData[0];
  // duty clearance bit 2 = availability management, or role level >= 80 (admin)
  return (dutyClearance && (dutyClearance & 2) === 2) || (roleLevel && roleLevel >= 80);
}

// Get availability for a specific service or all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType');

    // If requesting transit availability specifically, also check the legacy table
    if (serviceType === 'transit') {
      // First try the new outreachAvailability table
      let availability = await db
        .select()
        .from(outreachAvailability)
        .where(and(
          eq(outreachAvailability.serviceType, 'transit'),
          eq(outreachAvailability.isActive, true)
        ))
        .orderBy(asc(outreachAvailability.dayOfWeek), asc(outreachAvailability.startTime));

      // If no records in new table, fallback to legacy transitAvailability
      if (availability.length === 0) {
        const legacyAvailability = await db
          .select()
          .from(transitAvailability)
          .where(eq(transitAvailability.isActive, true))
          .orderBy(asc(transitAvailability.dayOfWeek), asc(transitAvailability.startTime));

        // Convert legacy format to new format
        availability = legacyAvailability.map(a => ({
          id: a.id,
          serviceType: 'transit',
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          maxCapacity: a.maxCapacity,
          isActive: a.isActive,
          requiresOverrideOutsideHours: true,
          notes: null,
          createdBy: null,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }));
      }

      return NextResponse.json(availability);
    }

    // For other services or all services
    const whereClause = serviceType 
      ? and(eq(outreachAvailability.serviceType, serviceType), eq(outreachAvailability.isActive, true))
      : eq(outreachAvailability.isActive, true);

    const availability = await db
      .select()
      .from(outreachAvailability)
      .where(whereClause)
      .orderBy(asc(outreachAvailability.serviceType), asc(outreachAvailability.dayOfWeek), asc(outreachAvailability.startTime));

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching outreach availability:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to fetch availability'),
      error: 'Failed to fetch availability' 
    }, { status: 500 });
  }
}

// Create new availability slot (requires permission)
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  const hasPermission = await hasAvailabilityPermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ 
      ...createErrorResponse('A1003'),
      error: 'You do not have permission to manage availability' 
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { 
      serviceType, 
      dayOfWeek, 
      startTime, 
      endTime, 
      maxCapacity = 10,
      requiresOverrideOutsideHours = true,
      notes 
    } = body;

    if (!serviceType || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ 
        ...createErrorResponse('I1001', 'Service type, day of week, start time, and end time are required'),
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate service type
    const validServiceTypes = ['transit', 'nourish', 'haven', 'neighbors', 'voice', 'steps'];
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json({ 
        ...createErrorResponse('I1004', `Invalid service type. Must be one of: ${validServiceTypes.join(', ')}`),
        error: 'Invalid service type' 
      }, { status: 400 });
    }

    // Validate day of week (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ 
        ...createErrorResponse('I1004', 'Day of week must be 0 (Sunday) through 6 (Saturday)'),
        error: 'Invalid day of week' 
      }, { status: 400 });
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ 
        ...createErrorResponse('I1005', 'Times must be in HH:mm format (24-hour)'),
        error: 'Invalid time format' 
      }, { status: 400 });
    }

    const newAvailability = await db.insert(outreachAvailability).values({
      serviceType,
      dayOfWeek,
      startTime,
      endTime,
      maxCapacity,
      isActive: true,
      requiresOverrideOutsideHours,
      notes: notes || null,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(newAvailability[0]);
  } catch (error) {
    console.error('Error creating outreach availability:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to create availability'),
      error: 'Failed to create availability' 
    }, { status: 500 });
  }
}

// Update availability slot
export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  const hasPermission = await hasAvailabilityPermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ 
      ...createErrorResponse('A1003'),
      error: 'You do not have permission to manage availability' 
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, dayOfWeek, startTime, endTime, maxCapacity, isActive, requiresOverrideOutsideHours, notes } = body;

    if (!id) {
      return NextResponse.json({ 
        ...createErrorResponse('I1001', 'Availability ID is required'),
        error: 'Missing availability ID' 
      }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (requiresOverrideOutsideHours !== undefined) updateData.requiresOverrideOutsideHours = requiresOverrideOutsideHours;
    if (notes !== undefined) updateData.notes = notes;

    const updatedAvailability = await db
      .update(outreachAvailability)
      .set(updateData)
      .where(eq(outreachAvailability.id, id))
      .returning();

    if (updatedAvailability.length === 0) {
      return NextResponse.json({ 
        ...createErrorResponse('D1002', 'Availability slot not found'),
        error: 'Availability not found' 
      }, { status: 404 });
    }

    return NextResponse.json(updatedAvailability[0]);
  } catch (error) {
    console.error('Error updating outreach availability:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to update availability'),
      error: 'Failed to update availability' 
    }, { status: 500 });
  }
}

// Delete availability slot
export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  const hasPermission = await hasAvailabilityPermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ 
      ...createErrorResponse('A1003'),
      error: 'You do not have permission to manage availability' 
    }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        ...createErrorResponse('I1001', 'Availability ID is required'),
        error: 'Missing availability ID' 
      }, { status: 400 });
    }

    await db.delete(outreachAvailability).where(eq(outreachAvailability.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting outreach availability:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to delete availability'),
      error: 'Failed to delete availability' 
    }, { status: 500 });
  }
}
