import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopReactions, workshops } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_REACTION_TYPES = ['hand', 'thumbsup', 'heart', 'clap', 'thinking'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshopId is valid integer
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

    // Get all active reactions for this workshop
    const reactions = await db
      .select()
      .from(workshopReactions)
      .where(
        and(
          eq(workshopReactions.workshopId, parseInt(workshopId)),
          eq(workshopReactions.isActive, true)
        )
      )
      .orderBy(desc(workshopReactions.createdAt));

    return NextResponse.json(reactions, { status: 200 });
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

    // Validate workshopId is valid integer
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
    const { userId, reactionType } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (!reactionType) {
      return NextResponse.json(
        { error: 'reactionType is required', code: 'MISSING_REACTION_TYPE' },
        { status: 400 }
      );
    }

    // Validate reactionType is one of the allowed values
    if (!VALID_REACTION_TYPES.includes(reactionType)) {
      return NextResponse.json(
        {
          error: `reactionType must be one of: ${VALID_REACTION_TYPES.join(', ')}`,
          code: 'INVALID_REACTION_TYPE',
        },
        { status: 400 }
      );
    }

    // Check if user already has an active reaction for this workshop
    const existingReaction = await db
      .select()
      .from(workshopReactions)
      .where(
        and(
          eq(workshopReactions.workshopId, parseInt(workshopId)),
          eq(workshopReactions.userId, userId.trim()),
          eq(workshopReactions.isActive, true)
        )
      )
      .limit(1);

    let reaction;

    if (existingReaction.length > 0) {
      // Update existing reaction to new reactionType and ensure isActive=true
      const updated = await db
        .update(workshopReactions)
        .set({
          reactionType,
          isActive: true,
        })
        .where(eq(workshopReactions.id, existingReaction[0].id))
        .returning();

      reaction = updated[0];
    } else {
      // Create new reaction
      const newReaction = await db
        .insert(workshopReactions)
        .values({
          workshopId: parseInt(workshopId),
          userId: userId.trim(),
          reactionType,
          isActive: true,
          createdAt: new Date().toISOString(),
        })
        .returning();

      reaction = newReaction[0];
    }

    return NextResponse.json(reaction, { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate workshopId is valid integer
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    // Validate userId is provided and non-empty
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Find active reaction for this user and workshop
    const existingReaction = await db
      .select()
      .from(workshopReactions)
      .where(
        and(
          eq(workshopReactions.workshopId, parseInt(workshopId)),
          eq(workshopReactions.userId, userId.trim()),
          eq(workshopReactions.isActive, true)
        )
      )
      .limit(1);

    if (existingReaction.length === 0) {
      return NextResponse.json(
        { error: 'Active reaction not found', code: 'REACTION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive=false
    const deleted = await db
      .update(workshopReactions)
      .set({
        isActive: false,
      })
      .where(eq(workshopReactions.id, existingReaction[0].id))
      .returning();

    return NextResponse.json(
      {
        message: 'Reaction removed successfully',
        reaction: deleted[0],
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