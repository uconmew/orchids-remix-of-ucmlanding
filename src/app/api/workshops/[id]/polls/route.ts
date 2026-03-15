import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopPolls, workshops } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    // Verify workshop exists
    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const onlyActive = searchParams.get('onlyActive') === 'true';

    // Build query
    let query = db
      .select()
      .from(workshopPolls)
      .where(eq(workshopPolls.workshopId, parseInt(workshopId)))
      .orderBy(desc(workshopPolls.createdAt));

    // Get polls
    let polls = await query;

    // Filter by active status if requested
    if (onlyActive) {
      polls = polls.filter(poll => poll.isActive === true);
    }

    return NextResponse.json(polls, { status: 200 });
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

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    // Verify workshop exists
    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { question, options, createdBy, endsAt, isActive } = body;

    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return NextResponse.json(
        { error: 'Question is required and must be a non-empty string', code: 'INVALID_QUESTION' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options)) {
      return NextResponse.json(
        { error: 'Options must be an array', code: 'INVALID_OPTIONS_TYPE' },
        { status: 400 }
      );
    }

    if (options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required', code: 'INSUFFICIENT_OPTIONS' },
        { status: 400 }
      );
    }

    if (options.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 options allowed', code: 'TOO_MANY_OPTIONS' },
        { status: 400 }
      );
    }

    // Validate each option is non-empty string
    for (let i = 0; i < options.length; i++) {
      if (typeof options[i] !== 'string' || options[i].trim() === '') {
        return NextResponse.json(
          { error: `Option ${i + 1} must be a non-empty string`, code: 'INVALID_OPTION' },
          { status: 400 }
        );
      }
    }

    if (!createdBy || typeof createdBy !== 'string' || createdBy.trim() === '') {
      return NextResponse.json(
        { error: 'createdBy is required and must be a non-empty string', code: 'INVALID_CREATED_BY' },
        { status: 400 }
      );
    }

    // Validate endsAt if provided
    if (endsAt) {
      const endsAtDate = new Date(endsAt);
      if (isNaN(endsAtDate.getTime())) {
        return NextResponse.json(
          { error: 'endsAt must be a valid ISO timestamp', code: 'INVALID_ENDS_AT' },
          { status: 400 }
        );
      }

      if (endsAtDate <= new Date()) {
        return NextResponse.json(
          { error: 'endsAt must be in the future', code: 'ENDS_AT_IN_PAST' },
          { status: 400 }
        );
      }
    }

    // Create poll
    const newPoll = await db
      .insert(workshopPolls)
      .values({
        workshopId: parseInt(workshopId),
        question: question.trim(),
        options: JSON.stringify(options.map((opt: string) => opt.trim())),
        createdBy: createdBy.trim(),
        createdAt: new Date().toISOString(),
        endsAt: endsAt || null,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
      })
      .returning();

    return NextResponse.json(newPoll[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const pollId = searchParams.get('pollId');

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    // Validate pollId
    if (!pollId || isNaN(parseInt(pollId))) {
      return NextResponse.json(
        { error: 'Valid poll ID is required', code: 'INVALID_POLL_ID' },
        { status: 400 }
      );
    }

    // Check if poll exists and belongs to the workshop
    const poll = await db
      .select()
      .from(workshopPolls)
      .where(
        and(
          eq(workshopPolls.id, parseInt(pollId)),
          eq(workshopPolls.workshopId, parseInt(workshopId))
        )
      )
      .limit(1);

    if (poll.length === 0) {
      return NextResponse.json(
        { error: 'Poll not found or does not belong to this workshop', code: 'POLL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the poll
    const deleted = await db
      .delete(workshopPolls)
      .where(
        and(
          eq(workshopPolls.id, parseInt(pollId)),
          eq(workshopPolls.workshopId, parseInt(workshopId))
        )
      )
      .returning();

    return NextResponse.json(
      {
        message: 'Poll deleted successfully',
        poll: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}