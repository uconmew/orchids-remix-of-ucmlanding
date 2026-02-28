import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopQuestions, workshops } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

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

    const workshopIdInt = parseInt(workshopId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopIdInt))
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
    const searchParams = request.nextUrl.searchParams;
    const showAnswered = searchParams.get('showAnswered') === 'true';
    const sortBy = searchParams.get('sortBy') ?? 'upvotes';

    // Build query
    let query = db.select().from(workshopQuestions);

    // Filter by workshopId and optionally by isAnswered
    if (showAnswered) {
      query = query.where(eq(workshopQuestions.workshopId, workshopIdInt));
    } else {
      query = query.where(
        and(
          eq(workshopQuestions.workshopId, workshopIdInt),
          eq(workshopQuestions.isAnswered, false)
        )
      );
    }

    // Apply sorting
    if (sortBy === 'time') {
      query = query.orderBy(asc(workshopQuestions.askedAt));
    } else {
      // Default: sort by upvotes DESC, then askedAt ASC
      query = query.orderBy(
        desc(workshopQuestions.upvotes),
        asc(workshopQuestions.askedAt)
      );
    }

    const questions = await query;

    return NextResponse.json(questions, { status: 200 });
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
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    const workshopIdInt = parseInt(workshopId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopIdInt))
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
    const { userId, question } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required and must be a non-empty string',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate question
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Question is required and must be a non-empty string',
          code: 'INVALID_QUESTION' 
        },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length < 10) {
      return NextResponse.json(
        { 
          error: 'Question must be at least 10 characters long',
          code: 'QUESTION_TOO_SHORT' 
        },
        { status: 400 }
      );
    }

    if (trimmedQuestion.length > 500) {
      return NextResponse.json(
        { 
          error: 'Question must not exceed 500 characters',
          code: 'QUESTION_TOO_LONG' 
        },
        { status: 400 }
      );
    }

    // Create new question
    const newQuestion = await db.insert(workshopQuestions)
      .values({
        workshopId: workshopIdInt,
        userId: userId.trim(),
        question: trimmedQuestion,
        upvotes: 0,
        isAnswered: false,
        askedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newQuestion[0], { status: 201 });
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
    const questionId = searchParams.get('questionId');

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

    const workshopIdInt = parseInt(workshopId);
    const questionIdInt = parseInt(questionId);

    // Check if question exists and belongs to the workshop
    const question = await db.select()
      .from(workshopQuestions)
      .where(
        and(
          eq(workshopQuestions.id, questionIdInt),
          eq(workshopQuestions.workshopId, workshopIdInt)
        )
      )
      .limit(1);

    if (question.length === 0) {
      return NextResponse.json(
        { 
          error: 'Question not found',
          code: 'QUESTION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Delete the question
    const deleted = await db.delete(workshopQuestions)
      .where(
        and(
          eq(workshopQuestions.id, questionIdInt),
          eq(workshopQuestions.workshopId, workshopIdInt)
        )
      )
      .returning();

    return NextResponse.json(
      {
        message: 'Question deleted successfully',
        deletedQuestion: deleted[0]
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