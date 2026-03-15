import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { awakenStudies } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_ORDER = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };

function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

function isTimeAfter(endTime: string, startTime: string): boolean {
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  return endHour > startHour || (endHour === startHour && endMinute > startMinute);
}

function sortByDayAndTime(studies: any[]) {
  return studies.sort((a, b) => {
    const dayA = DAY_ORDER[a.dayOfWeek.toLowerCase() as keyof typeof DAY_ORDER] || 999;
    const dayB = DAY_ORDER[b.dayOfWeek.toLowerCase() as keyof typeof DAY_ORDER] || 999;
    
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    
    return a.startTime.localeCompare(b.startTime);
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const study = await db.select()
        .from(awakenStudies)
        .where(eq(awakenStudies.id, parseInt(id)))
        .limit(1);

      if (study.length === 0) {
        return NextResponse.json({ 
          error: 'Awaken study not found' 
        }, { status: 404 });
      }

      return NextResponse.json(study[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const isActiveParam = searchParams.get('isActive');

    let query = db.select().from(awakenStudies);

    const conditions = [];

    if (dayOfWeek) {
      const normalizedDay = dayOfWeek.toLowerCase();
      if (!VALID_DAYS.includes(normalizedDay)) {
        return NextResponse.json({ 
          error: "Invalid day of week. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
          code: "INVALID_DAY_OF_WEEK" 
        }, { status: 400 });
      }
      conditions.push(eq(awakenStudies.dayOfWeek, normalizedDay));
    }

    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true' ? 1 : 0;
      conditions.push(eq(awakenStudies.isActive, isActiveValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.limit(limit).offset(offset);

    const sortedResults = sortByDayAndTime(results);

    return NextResponse.json(sortedResults);
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      subtitle, 
      description, 
      dayOfWeek, 
      startTime, 
      endTime, 
      targetAudience, 
      programType = 'awaken',
      isRecurring = true,
      isActive = true,
      upcomingDate
    } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required and must be a non-empty string",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ 
        error: "Description is required and must be a non-empty string",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!dayOfWeek) {
      return NextResponse.json({ 
        error: "Day of week is required",
        code: "MISSING_DAY_OF_WEEK" 
      }, { status: 400 });
    }

    const normalizedDay = dayOfWeek.toLowerCase();
    if (!VALID_DAYS.includes(normalizedDay)) {
      return NextResponse.json({ 
        error: "Invalid day of week. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
        code: "INVALID_DAY_OF_WEEK" 
      }, { status: 400 });
    }

    if (!startTime) {
      return NextResponse.json({ 
        error: "Start time is required",
        code: "MISSING_START_TIME" 
      }, { status: 400 });
    }

    if (!validateTimeFormat(startTime)) {
      return NextResponse.json({ 
        error: "Start time must be in HH:MM format (24-hour)",
        code: "INVALID_START_TIME_FORMAT" 
      }, { status: 400 });
    }

    if (!endTime) {
      return NextResponse.json({ 
        error: "End time is required",
        code: "MISSING_END_TIME" 
      }, { status: 400 });
    }

    if (!validateTimeFormat(endTime)) {
      return NextResponse.json({ 
        error: "End time must be in HH:MM format (24-hour)",
        code: "INVALID_END_TIME_FORMAT" 
      }, { status: 400 });
    }

    if (!isTimeAfter(endTime, startTime)) {
      return NextResponse.json({ 
        error: "End time must be after start time",
        code: "INVALID_TIME_RANGE" 
      }, { status: 400 });
    }

    if (programType !== 'awaken') {
      return NextResponse.json({ 
        error: "Program type must be 'awaken'",
        code: "INVALID_PROGRAM_TYPE" 
      }, { status: 400 });
    }

    // Validate upcomingDate if provided
    if (upcomingDate !== undefined && upcomingDate !== null) {
      if (typeof upcomingDate !== 'string' || upcomingDate.trim() === '') {
        return NextResponse.json({ 
          error: "upcomingDate must be a non-empty string",
          code: "INVALID_UPCOMING_DATE" 
        }, { status: 400 });
      }
      
      const dateObj = new Date(upcomingDate);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ 
          error: "upcomingDate must be a valid ISO date string",
          code: "INVALID_UPCOMING_DATE_FORMAT" 
        }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    const newStudy = await db.insert(awakenStudies)
      .values({
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        description: description.trim(),
        dayOfWeek: normalizedDay,
        startTime,
        endTime,
        targetAudience: targetAudience ? targetAudience.trim() : null,
        programType,
        isRecurring: isRecurring ? 1 : 0,
        isActive: isActive ? 1 : 0,
        upcomingDate: upcomingDate?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newStudy[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existingStudy = await db.select()
      .from(awakenStudies)
      .where(eq(awakenStudies.id, parseInt(id)))
      .limit(1);

    if (existingStudy.length === 0) {
      return NextResponse.json({ 
        error: 'Awaken study not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      title, 
      subtitle, 
      description, 
      dayOfWeek, 
      startTime, 
      endTime, 
      targetAudience, 
      programType,
      isRecurring,
      isActive,
      upcomingDate
    } = body;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ 
          error: "Title must be a non-empty string",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (subtitle !== undefined) {
      updates.subtitle = subtitle ? subtitle.trim() : null;
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return NextResponse.json({ 
          error: "Description must be a non-empty string",
          code: "INVALID_DESCRIPTION" 
        }, { status: 400 });
      }
      updates.description = description.trim();
    }

    if (dayOfWeek !== undefined) {
      const normalizedDay = dayOfWeek.toLowerCase();
      if (!VALID_DAYS.includes(normalizedDay)) {
        return NextResponse.json({ 
          error: "Invalid day of week. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
          code: "INVALID_DAY_OF_WEEK" 
        }, { status: 400 });
      }
      updates.dayOfWeek = normalizedDay;
    }

    if (startTime !== undefined) {
      if (!validateTimeFormat(startTime)) {
        return NextResponse.json({ 
          error: "Start time must be in HH:MM format (24-hour)",
          code: "INVALID_START_TIME_FORMAT" 
        }, { status: 400 });
      }
      updates.startTime = startTime;
    }

    if (endTime !== undefined) {
      if (!validateTimeFormat(endTime)) {
        return NextResponse.json({ 
          error: "End time must be in HH:MM format (24-hour)",
          code: "INVALID_END_TIME_FORMAT" 
        }, { status: 400 });
      }
      updates.endTime = endTime;
    }

    const finalStartTime = updates.startTime || existingStudy[0].startTime;
    const finalEndTime = updates.endTime || existingStudy[0].endTime;

    if (!isTimeAfter(finalEndTime, finalStartTime)) {
      return NextResponse.json({ 
        error: "End time must be after start time",
        code: "INVALID_TIME_RANGE" 
      }, { status: 400 });
    }

    if (targetAudience !== undefined) {
      updates.targetAudience = targetAudience ? targetAudience.trim() : null;
    }

    if (programType !== undefined) {
      if (programType !== 'awaken') {
        return NextResponse.json({ 
          error: "Program type must be 'awaken'",
          code: "INVALID_PROGRAM_TYPE" 
        }, { status: 400 });
      }
      updates.programType = programType;
    }

    if (isRecurring !== undefined) {
      updates.isRecurring = isRecurring ? 1 : 0;
    }

    if (isActive !== undefined) {
      updates.isActive = isActive ? 1 : 0;
    }

    // Validate and add upcomingDate if provided
    if (upcomingDate !== undefined) {
      if (upcomingDate === null) {
        updates.upcomingDate = null;
      } else {
        if (typeof upcomingDate !== 'string' || upcomingDate.trim() === '') {
          return NextResponse.json({ 
            error: "upcomingDate must be a non-empty string",
            code: "INVALID_UPCOMING_DATE" 
          }, { status: 400 });
        }
        
        const dateObj = new Date(upcomingDate);
        if (isNaN(dateObj.getTime())) {
          return NextResponse.json({ 
            error: "upcomingDate must be a valid ISO date string",
            code: "INVALID_UPCOMING_DATE_FORMAT" 
          }, { status: 400 });
        }
        
        updates.upcomingDate = upcomingDate.trim();
      }
    }

    const updated = await db.update(awakenStudies)
      .set(updates)
      .where(eq(awakenStudies.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existingStudy = await db.select()
      .from(awakenStudies)
      .where(eq(awakenStudies.id, parseInt(id)))
      .limit(1);

    if (existingStudy.length === 0) {
      return NextResponse.json({ 
        error: 'Awaken study not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(awakenStudies)
      .where(eq(awakenStudies.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Awaken study deleted successfully',
      deletedStudy: deleted[0]
    });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}