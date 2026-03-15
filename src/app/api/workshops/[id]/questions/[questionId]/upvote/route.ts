import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopQuestions, workshops } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
    questionId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: workshopId, questionId } = await params;

    // Validate workshopId is valid integer
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    // Validate questionId is valid integer
    if (!questionId || isNaN(parseInt(questionId))) {
      return NextResponse.json(
        { 
          error: 'Valid question ID is required',
          code: 'INVALID_QUESTION_ID'
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);
    const parsedQuestionId = parseInt(questionId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parsedWorkshopId))
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
          eq(workshopQuestions.id, parsedQuestionId),
          eq(workshopQuestions.workshopId, parsedWorkshopId)
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

    // Increment upvotes by 1 using SQL
    const updatedQuestion = await db.update(workshopQuestions)
      .set({
        upvotes: sql`${workshopQuestions.upvotes} + 1`
      })
      .where(eq(workshopQuestions.id, parsedQuestionId))
      .returning();

    return NextResponse.json(updatedQuestion[0], { status: 200 });

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: workshopId, questionId } = await params;

    // Validate workshopId is valid integer
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    // Validate questionId is valid integer
    if (!questionId || isNaN(parseInt(questionId))) {
      return NextResponse.json(
        { 
          error: 'Valid question ID is required',
          code: 'INVALID_QUESTION_ID'
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);
    const parsedQuestionId = parseInt(questionId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parsedWorkshopId))
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
          eq(workshopQuestions.id, parsedQuestionId),
          eq(workshopQuestions.workshopId, parsedWorkshopId)
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

    // Decrement upvotes by 1, ensuring it doesn't go below 0
    const updatedQuestion = await db.update(workshopQuestions)
      .set({
        upvotes: sql`MAX(0, ${workshopQuestions.upvotes} - 1)`
      })
      .where(eq(workshopQuestions.id, parsedQuestionId))
      .returning();

    return NextResponse.json(updatedQuestion[0], { status: 200 });

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