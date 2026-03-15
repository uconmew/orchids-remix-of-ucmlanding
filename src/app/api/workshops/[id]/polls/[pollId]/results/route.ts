import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopPollVotes, workshopPolls, workshops } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; pollId: string } }
) {
  try {
    const workshopId = params.id;
    const pollId = params.pollId;

    // Validate workshopId is valid integer
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: "Valid workshop ID is required",
          code: "INVALID_WORKSHOP_ID" 
        },
        { status: 400 }
      );
    }

    // Validate pollId is valid integer
    if (!pollId || isNaN(parseInt(pollId))) {
      return NextResponse.json(
        { 
          error: "Valid poll ID is required",
          code: "INVALID_POLL_ID" 
        },
        { status: 400 }
      );
    }

    const workshopIdNum = parseInt(workshopId);
    const pollIdNum = parseInt(pollId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopIdNum))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { 
          error: "Workshop not found",
          code: "WORKSHOP_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Verify poll exists and belongs to workshop
    const poll = await db.select()
      .from(workshopPolls)
      .where(
        and(
          eq(workshopPolls.id, pollIdNum),
          eq(workshopPolls.workshopId, workshopIdNum)
        )
      )
      .limit(1);

    if (poll.length === 0) {
      return NextResponse.json(
        { 
          error: "Poll not found",
          code: "POLL_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    const pollData = poll[0];

    // Query all votes for this poll
    const votes = await db.select()
      .from(workshopPollVotes)
      .where(eq(workshopPollVotes.pollId, pollIdNum));

    // Count votes per optionIndex
    const voteCounts: { [key: number]: number } = {};
    votes.forEach(vote => {
      voteCounts[vote.optionIndex] = (voteCounts[vote.optionIndex] || 0) + 1;
    });

    // Calculate total votes
    const totalVotes = votes.length;

    // Parse options from JSON
    const options = Array.isArray(pollData.options) 
      ? pollData.options 
      : JSON.parse(pollData.options as string);

    // Build results array
    const results = options.map((option: string, index: number) => {
      const voteCount = voteCounts[index] || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
      
      return {
        option,
        index,
        votes: voteCount,
        percentage: Math.round(percentage * 100) / 100 // Round to 2 decimal places
      };
    });

    // Check if poll is expired
    const isExpired = pollData.endsAt 
      ? new Date(pollData.endsAt) < new Date() 
      : false;

    // Build response
    const response = {
      poll: {
        id: pollData.id,
        question: pollData.question,
        options,
        createdBy: pollData.createdBy,
        createdAt: pollData.createdAt,
        endsAt: pollData.endsAt,
        isActive: pollData.isActive
      },
      results,
      totalVotes,
      isExpired
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET poll results error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}