import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopTimeSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slotId = searchParams.get('slotId');

    // Validate slotId
    if (!slotId || isNaN(parseInt(slotId))) {
      return NextResponse.json(
        { 
          error: 'Valid slot ID is required',
          code: 'INVALID_SLOT_ID' 
        },
        { status: 400 }
      );
    }

    const id = parseInt(slotId);

    // Check if time slot exists
    const existingSlot = await db.select()
      .from(workshopTimeSlots)
      .where(eq(workshopTimeSlots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return NextResponse.json(
        { 
          error: 'Time slot not found',
          code: 'SLOT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const currentSlot = existingSlot[0];
    const body = await request.json();
    const { date, startTime, endTime, isAvailable, capacity } = body;

    // Validate date format if provided (YYYY-MM-DD)
    if (date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { 
            error: 'Invalid date format. Expected YYYY-MM-DD',
            code: 'INVALID_DATE_FORMAT' 
          },
          { status: 400 }
        );
      }

      // Validate date is valid
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { 
            error: 'Invalid date format. Expected YYYY-MM-DD',
            code: 'INVALID_DATE_FORMAT' 
          },
          { status: 400 }
        );
      }
    }

    // Validate time format if provided (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (startTime !== undefined && !timeRegex.test(startTime)) {
      return NextResponse.json(
        { 
          error: 'Invalid start time format. Expected HH:MM (24-hour format)',
          code: 'INVALID_TIME_FORMAT' 
        },
        { status: 400 }
      );
    }

    if (endTime !== undefined && !timeRegex.test(endTime)) {
      return NextResponse.json(
        { 
          error: 'Invalid end time format. Expected HH:MM (24-hour format)',
          code: 'INVALID_TIME_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Validate endTime > startTime if both provided
    const finalStartTime = startTime ?? currentSlot.startTime;
    const finalEndTime = endTime ?? currentSlot.endTime;

    if (startTime !== undefined || endTime !== undefined) {
      const [startHour, startMinute] = finalStartTime.split(':').map(Number);
      const [endHour, endMinute] = finalEndTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        return NextResponse.json(
          { 
            error: 'End time must be after start time',
            code: 'INVALID_TIME_RANGE' 
          },
          { status: 400 }
        );
      }
    }

    // Validate capacity >= bookedCount if updating capacity
    if (capacity !== undefined) {
      if (typeof capacity !== 'number' || capacity < 0) {
        return NextResponse.json(
          { 
            error: 'Capacity must be a non-negative number',
            code: 'INVALID_CAPACITY' 
          },
          { status: 400 }
        );
      }

      if (capacity < currentSlot.bookedCount) {
        return NextResponse.json(
          { 
            error: `Cannot reduce capacity below current bookings (${currentSlot.bookedCount})`,
            code: 'CAPACITY_TOO_LOW' 
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (date !== undefined) updates.date = date;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (capacity !== undefined) updates.capacity = capacity;

    // Update time slot
    const updated = await db.update(workshopTimeSlots)
      .set(updates)
      .where(eq(workshopTimeSlots.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update time slot',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slotId = searchParams.get('slotId');

    // Validate slotId
    if (!slotId || isNaN(parseInt(slotId))) {
      return NextResponse.json(
        { 
          error: 'Valid slot ID is required',
          code: 'INVALID_SLOT_ID' 
        },
        { status: 400 }
      );
    }

    const id = parseInt(slotId);

    // Check if time slot exists
    const existingSlot = await db.select()
      .from(workshopTimeSlots)
      .where(eq(workshopTimeSlots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return NextResponse.json(
        { 
          error: 'Time slot not found',
          code: 'SLOT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const slot = existingSlot[0];

    // Check if slot has bookings
    if (slot.bookedCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete time slot with ${slot.bookedCount} booking(s). Please cancel all bookings first.`,
          code: 'SLOT_HAS_BOOKINGS' 
        },
        { status: 400 }
      );
    }

    // Delete the time slot
    const deleted = await db.delete(workshopTimeSlots)
      .where(eq(workshopTimeSlots.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to delete time slot',
          code: 'DELETE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Time slot deleted successfully',
        deletedSlot: deleted[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}