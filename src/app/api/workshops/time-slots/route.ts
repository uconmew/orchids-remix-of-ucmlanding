import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopTimeSlots } from '@/db/schema';
import { eq, and, lt, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const workshopIdParam = searchParams.get('workshopId');
    const dateParam = searchParams.get('date');
    const availableParam = searchParams.get('available');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate workshopId if provided
    let workshopId: number | null = null;
    if (workshopIdParam) {
      workshopId = parseInt(workshopIdParam);
      if (isNaN(workshopId)) {
        return NextResponse.json(
          { 
            error: 'Invalid workshopId parameter. Must be a valid integer.',
            code: 'INVALID_QUERY_PARAMS'
          },
          { status: 400 }
        );
      }
    }

    // Validate date format if provided (YYYY-MM-DD)
    if (dateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateParam)) {
        return NextResponse.json(
          { 
            error: 'Invalid date format. Expected YYYY-MM-DD.',
            code: 'INVALID_QUERY_PARAMS'
          },
          { status: 400 }
        );
      }
      
      // Additional validation: check if it's a valid date
      const dateObj = new Date(dateParam);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { 
            error: 'Invalid date value.',
            code: 'INVALID_QUERY_PARAMS'
          },
          { status: 400 }
        );
      }
    }

    // Parse pagination parameters
    const limit = Math.min(parseInt(limitParam ?? '50'), 100);
    const offset = parseInt(offsetParam ?? '0');

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { 
          error: 'Invalid limit parameter. Must be a positive integer.',
          code: 'INVALID_QUERY_PARAMS'
        },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { 
          error: 'Invalid offset parameter. Must be a non-negative integer.',
          code: 'INVALID_QUERY_PARAMS'
        },
        { status: 400 }
      );
    }

    // Build query with filters
    let query = db.select().from(workshopTimeSlots);

    // Apply filters
    const conditions = [];

    if (workshopId !== null) {
      conditions.push(eq(workshopTimeSlots.workshopId, workshopId));
    }

    if (dateParam) {
      conditions.push(eq(workshopTimeSlots.date, dateParam));
    }

    if (availableParam === 'true') {
      conditions.push(eq(workshopTimeSlots.isAvailable, true));
      // For available slots, also check capacity vs booked count
      // This requires a more complex condition
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering: date ASC, then startTime ASC
    const results = await query
      .orderBy(asc(workshopTimeSlots.date), asc(workshopTimeSlots.startTime))
      .limit(limit)
      .offset(offset);

    // If available filter is true, do additional client-side filtering for capacity
    let filteredResults = results;
    if (availableParam === 'true') {
      filteredResults = results.filter(slot => {
        if (!slot.isAvailable) return false;
        if (slot.capacity === null) return true; // No capacity limit
        return slot.bookedCount < slot.capacity;
      });
    }

    return NextResponse.json(filteredResults, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}