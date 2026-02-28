import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopCategories } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const workshopType = await db
        .select()
        .from(workshopCategories)
        .where(eq(workshopCategories.id, parseInt(id)))
        .limit(1);

      if (workshopType.length === 0) {
        return NextResponse.json(
          { error: 'Equip category not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(workshopType[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');

    let query = db.select().from(workshopCategories);

    // Filter by category if provided
    if (category) {
      query = query.where(eq(workshopCategories.category, category));
    }

    const results = await query
      .orderBy(desc(workshopCategories.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, skills, programType, sortOrder, isActive, upcomingDate } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required and must be a non-empty string', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (programType && programType !== 'equip' && programType !== 'awaken') {
      return NextResponse.json(
        { error: 'Program type must be "equip" or "awaken"', code: 'INVALID_PROGRAM_TYPE' },
        { status: 400 }
      );
    }

    if (sortOrder !== undefined && (typeof sortOrder !== 'number' || sortOrder < 0)) {
      return NextResponse.json(
        { error: 'Sort order must be a non-negative integer', code: 'INVALID_SORT_ORDER' },
        { status: 400 }
      );
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return NextResponse.json(
          { error: 'Skills must be a valid JSON array', code: 'INVALID_SKILLS' },
          { status: 400 }
        );
      }
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value', code: 'INVALID_IS_ACTIVE' },
        { status: 400 }
      );
    }

    // Validate upcomingDate if provided
    if (upcomingDate !== undefined && upcomingDate !== null) {
      if (typeof upcomingDate !== 'string' || upcomingDate.trim() === '') {
        return NextResponse.json(
          { error: 'upcomingDate must be a non-empty string', code: 'INVALID_UPCOMING_DATE' },
          { status: 400 }
        );
      }
      
      const dateObj = new Date(upcomingDate);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: 'upcomingDate must be a valid ISO date string', code: 'INVALID_UPCOMING_DATE_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      name: name.trim(),
      description: description.trim(),
      icon: icon?.trim() || null,
      skills: skills ? JSON.stringify(skills) : null,
      programType: programType || 'equip',
      sortOrder: sortOrder ?? 0,
      isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
      upcomingDate: upcomingDate?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    const newCategory = await db
      .insert(workshopCategories)
      .values(insertData)
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db
      .select()
      .from(workshopCategories)
      .where(eq(workshopCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Equip category not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, icon, skills, programType, sortOrder, isActive, upcomingDate } = body;

    // Validate optional fields
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Description must be a non-empty string', code: 'INVALID_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (programType !== undefined && programType !== 'equip' && programType !== 'awaken') {
      return NextResponse.json(
        { error: 'Program type must be "equip" or "awaken"', code: 'INVALID_PROGRAM_TYPE' },
        { status: 400 }
      );
    }

    if (sortOrder !== undefined && (typeof sortOrder !== 'number' || sortOrder < 0)) {
      return NextResponse.json(
        { error: 'Sort order must be a non-negative integer', code: 'INVALID_SORT_ORDER' },
        { status: 400 }
      );
    }

    if (skills !== undefined && !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Skills must be a valid JSON array', code: 'INVALID_SKILLS' },
        { status: 400 }
      );
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value', code: 'INVALID_IS_ACTIVE' },
        { status: 400 }
      );
    }

    // Validate upcomingDate if provided
    if (upcomingDate !== undefined && upcomingDate !== null) {
      if (typeof upcomingDate !== 'string' || upcomingDate.trim() === '') {
        return NextResponse.json(
          { error: 'upcomingDate must be a non-empty string', code: 'INVALID_UPCOMING_DATE' },
          { status: 400 }
        );
      }
      
      const dateObj = new Date(upcomingDate);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: 'upcomingDate must be a valid ISO date string', code: 'INVALID_UPCOMING_DATE_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (programType !== undefined) updateData.programType = programType;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;
    if (upcomingDate !== undefined) updateData.upcomingDate = upcomingDate?.trim() || null;

    const updated = await db
      .update(workshopCategories)
      .set(updateData)
      .where(eq(workshopCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db
      .select()
      .from(workshopCategories)
      .where(eq(workshopCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Equip category not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workshopCategories)
      .where(eq(workshopCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Equip category deleted successfully',
        category: deleted[0],
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
