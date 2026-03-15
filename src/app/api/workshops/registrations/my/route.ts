import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopRegistrations, workshops } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const includeWorkshop = searchParams.get('includeWorkshop') === 'true';

    // Validate required userId parameter
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(workshopRegistrations.userId, userId)];
    
    if (status) {
      conditions.push(eq(workshopRegistrations.status, status));
    }

    // Query registrations with filters
    const whereCondition = conditions.length > 1 
      ? and(...conditions)
      : conditions[0];

    const registrations = await db
      .select()
      .from(workshopRegistrations)
      .where(whereCondition)
      .orderBy(desc(workshopRegistrations.registeredAt));

    // If no workshop details needed, return registrations directly
    if (!includeWorkshop || registrations.length === 0) {
      return NextResponse.json(registrations, { status: 200 });
    }

    // Get unique workshop IDs from registrations
    const workshopIds = [...new Set(registrations.map(reg => reg.workshopId))];

    // Query workshops table for all related workshops
    const workshopData = await db
      .select()
      .from(workshops)
      .where(inArray(workshops.id, workshopIds));

    // Create a map of workshops by ID for efficient lookup
    const workshopMap = new Map(
      workshopData.map(workshop => [workshop.id, workshop])
    );

    // Merge registrations with workshop details
    const registrationsWithWorkshops = registrations.map(registration => ({
      ...registration,
      workshop: workshopMap.get(registration.workshopId) || null
    }));

    return NextResponse.json(registrationsWithWorkshops, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}