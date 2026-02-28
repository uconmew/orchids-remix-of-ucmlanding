import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopPollVotes, workshopPolls, workshops } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; pollId: string } }
) {
  try {
    const workshopId = params.id;
    const pollId = params.pollId;

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    // Validate pollId
    if (!pollId || isNaN(parseInt(pollId))) {
      return NextResponse.json(
        { 
          error: 'Valid poll ID is required',
          code: 'INVALID_POLL_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, optionIndex } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required and must be a non-empty string',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate optionIndex
    if (optionIndex === undefined || optionIndex === null || typeof optionIndex !== 'number' || optionIndex < 0 || !Number.isInteger(optionIndex)) {
      return NextResponse.json(
        { 
          error: 'Option index must be a non-negative integer',
          code: 'INVALID_OPTION_INDEX'
        },
        { status: 400 }
      );
    }

    // Verify workshop exists
    const workshopResult = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
      .limit(1);

    if (workshopResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verify poll exists and belongs to workshop
    const pollResult = await db.select()
      .from(workshopPolls)
      .where(
        and(
          eq(workshopPolls.id, parseInt(pollId)),
          eq(workshopPolls.workshopId, parseInt(workshopId))
        )
      )
      .limit(1);

    if (pollResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Poll not found or does not belong to this workshop',
          code: 'POLL_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const poll = pollResult[0];

    // Verify poll is active
    if (!poll.isActive) {
      return NextResponse.json(
        { 
          error: 'This poll is not active',
          code: 'POLL_NOT_ACTIVE'
        },
        { status: 400 }
      );
    }

    // Verify poll has not expired
    if (poll.endsAt) {
      const endsAtDate = new Date(poll.endsAt);
      const currentDate = new Date();
      if (currentDate >= endsAtDate) {
        return NextResponse.json(
          { 
            error: 'This poll has expired',
            code: 'POLL_EXPIRED'
          },
          { status: 400 }
        );
      }
    }

    // Verify optionIndex is valid
    const options = poll.options as string[];
    if (!Array.isArray(options) || optionIndex >= options.length) {
      return NextResponse.json(
        { 
          error: 'Invalid option index for this poll',
          code: 'INVALID_OPTION_INDEX_RANGE'
        },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await db.select()
      .from(workshopPollVotes)
      .where(
        and(
          eq(workshopPollVotes.pollId, parseInt(pollId)),
          eq(workshopPollVotes.userId, userId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      return NextResponse.json(
        { 
          error: 'You have already voted on this poll',
          code: 'ALREADY_VOTED'
        },
        { status: 400 }
      );
    }

    // Create vote
    const newVote = await db.insert(workshopPollVotes)
      .values({
        pollId: parseInt(pollId),
        userId: userId.trim(),
        optionIndex,
        votedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newVote[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; pollId: string } }
) {
  try {
    const workshopId = params.id;
    const pollId = params.pollId;

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    // Validate pollId
    if (!pollId || isNaN(parseInt(pollId))) {
      return NextResponse.json(
        { 
          error: 'Valid poll ID is required',
          code: 'INVALID_POLL_ID'
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Find existing vote
    const existingVote = await db.select()
      .from(workshopPollVotes)
      .where(
        and(
          eq(workshopPollVotes.pollId, parseInt(pollId)),
          eq(workshopPollVotes.userId, userId)
        )
      )
      .limit(1);

    if (existingVote.length === 0) {
      return NextResponse.json(
        { 
          error: 'Vote not found',
          code: 'VOTE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete vote
    const deleted = await db.delete(workshopPollVotes)
      .where(
        and(
          eq(workshopPollVotes.pollId, parseInt(pollId)),
          eq(workshopPollVotes.userId, userId)
        )
      )
      .returning();

    return NextResponse.json({
      message: 'Vote removed successfully',
      vote: deleted[0]
    }, { status: 200 });

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