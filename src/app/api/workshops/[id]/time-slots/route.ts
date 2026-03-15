import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopTimeSlots, workshops } from '@/db/schema';
import { eq, and, lt, desc, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;
    
    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(workshopId);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { 
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date');
    const availableFilter = searchParams.get('available');

    // Build query
    let query = db.select()
      .from(workshopTimeSlots)
      .where(eq(workshopTimeSlots.workshopId, id));

    // Apply filters
    const conditions = [eq(workshopTimeSlots.workshopId, id)];

    if (dateFilter) {
      conditions.push(eq(workshopTimeSlots.date, dateFilter));
    }

    if (availableFilter === 'true') {
      conditions.push(eq(workshopTimeSlots.isAvailable, true));
    }

    let timeSlots;
    if (conditions.length > 1) {
      timeSlots = await db.select()
        .from(workshopTimeSlots)
        .where(and(...conditions))
        .orderBy(asc(workshopTimeSlots.date), asc(workshopTimeSlots.startTime));
    } else {
      timeSlots = await db.select()
        .from(workshopTimeSlots)
        .where(eq(workshopTimeSlots.workshopId, id))
        .orderBy(asc(workshopTimeSlots.date), asc(workshopTimeSlots.startTime));
    }

    // Filter by availability considering capacity
    if (availableFilter === 'true') {
      timeSlots = timeSlots.filter(slot => 
        slot.isAvailable && 
        (slot.capacity === null || slot.bookedCount < slot.capacity)
      );
    }

    return NextResponse.json(timeSlots, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;
    
    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(workshopId);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { 
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { date, startTime, endTime, capacity, isAvailable } = body;

    // Validate required fields
    if (!date || !startTime || !endTime || capacity === undefined || capacity === null) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: date, startTime, endTime, and capacity are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
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

    // Validate date is not in the past
    const slotDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (slotDate < today) {
      return NextResponse.json(
        { 
          error: 'Date cannot be in the past',
          code: 'INVALID_DATE_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) {
      return NextResponse.json(
        { 
          error: 'Invalid start time format. Expected HH:MM (24-hour format)',
          code: 'INVALID_TIME_FORMAT'
        },
        { status: 400 }
      );
    }

    if (!timeRegex.test(endTime)) {
      return NextResponse.json(
        { 
          error: 'Invalid end time format. Expected HH:MM (24-hour format)',
          code: 'INVALID_TIME_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate time range (endTime must be after startTime)
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
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

    // Validate capacity
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return NextResponse.json(
        { 
          error: 'Capacity must be a positive integer',
          code: 'INVALID_CAPACITY'
        },
        { status: 400 }
      );
    }

    // Create time slot
    const newTimeSlot = await db.insert(workshopTimeSlots)
      .values({
        workshopId: id,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        capacity: capacityNum,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        bookedCount: 0,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newTimeSlot[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}