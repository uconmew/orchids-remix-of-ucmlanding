import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ucmLevels } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    let limit = 50;
    if (limitParam !== null) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { 
            error: 'Limit must be a valid positive integer',
            code: 'INVALID_LIMIT'
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100);
    }

    // Parse and validate offset parameter
    const offsetParam = searchParams.get('offset');
    let offset = 0;
    if (offsetParam !== null) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { 
            error: 'Offset must be a valid non-negative integer',
            code: 'INVALID_OFFSET'
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Query UCM levels ordered by level (1=highest authority to 5=lowest)
    const results = await db
      .select()
      .from(ucmLevels)
      .orderBy(asc(ucmLevels.level))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET /api/roles error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}