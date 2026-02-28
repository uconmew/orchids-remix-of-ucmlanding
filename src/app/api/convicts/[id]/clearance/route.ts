import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convicts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convictId = parseInt(id);
    
    if (isNaN(convictId)) {
      return NextResponse.json({ 
        error: "Invalid convict ID",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { clearanceLevel, dutyClearance } = body;

    // Validate clearance values
    if (clearanceLevel !== undefined && (clearanceLevel < 0 || clearanceLevel > 100)) {
      return NextResponse.json({ 
        error: "Clearance level must be between 0 and 100",
        code: "INVALID_CLEARANCE_VALUE" 
      }, { status: 400 });
    }

    if (dutyClearance !== undefined && (dutyClearance < 0 || dutyClearance > 100)) {
      return NextResponse.json({ 
        error: "Duty clearance must be between 0 and 100",
        code: "INVALID_CLEARANCE_VALUE" 
      }, { status: 400 });
    }

    // Check if convict exists
    const existing = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, convictId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: "Convict not found",
        code: "CONVICT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Update clearance levels
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (clearanceLevel !== undefined) {
      updateData.clearanceLevel = clearanceLevel;
    }
    if (dutyClearance !== undefined) {
      updateData.dutyClearance = dutyClearance;
    }

    const [updated] = await db
      .update(convicts)
      .set(updateData)
      .where(eq(convicts.id, convictId))
      .returning();

    return NextResponse.json({
      message: "Clearance levels updated successfully",
      convict: updated
    }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/convicts/[id]/clearance error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
