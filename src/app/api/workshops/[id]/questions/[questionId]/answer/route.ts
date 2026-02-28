import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopQuestions, workshops } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const workshopId = params.id;
    const questionId = params.questionId;

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

    // Validate questionId
    if (!questionId || isNaN(parseInt(questionId))) {
      return NextResponse.json(
        { 
          error: 'Valid question ID is required',
          code: 'INVALID_QUESTION_ID' 
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { isAnswered } = body;

    // Validate isAnswered field
    if (typeof isAnswered !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'isAnswered must be a boolean value',
          code: 'INVALID_IS_ANSWERED' 
        },
        { status: 400 }
      );
    }

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
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

    // Verify question exists and belongs to workshop
    const question = await db.select()
      .from(workshopQuestions)
      .where(
        and(
          eq(workshopQuestions.id, parseInt(questionId)),
          eq(workshopQuestions.workshopId, parseInt(workshopId))
        )
      )
      .limit(1);

    if (question.length === 0) {
      return NextResponse.json(
        { 
          error: 'Question not found or does not belong to this workshop',
          code: 'QUESTION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update question with new isAnswered value
    const updated = await db.update(workshopQuestions)
      .set({
        isAnswered: isAnswered
      })
      .where(
        and(
          eq(workshopQuestions.id, parseInt(questionId)),
          eq(workshopQuestions.workshopId, parseInt(workshopId))
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update question',
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