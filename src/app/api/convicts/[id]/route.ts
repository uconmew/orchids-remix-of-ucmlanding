import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convicts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convictId = parseInt(id);

    if (isNaN(convictId)) {
      return NextResponse.json({ error: 'Invalid convict ID' }, { status: 400 });
    }

    const convict = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, convictId))
      .limit(1);

    if (convict.length === 0) {
      return NextResponse.json({ error: 'Convict not found' }, { status: 404 });
    }

    return NextResponse.json(convict[0]);
  } catch (error) {
    console.error('GET convict error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convictId = parseInt(id);
    const body = await request.json();

    if (isNaN(convictId)) {
      return NextResponse.json({ error: 'Invalid convict ID' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, convictId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Convict not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.convictType !== undefined) updateData.convictType = body.convictType;
    if (body.convictRole !== undefined) updateData.convictRole = body.convictRole;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.interests !== undefined) updateData.interests = body.interests;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.clearanceLevel !== undefined) updateData.clearanceLevel = body.clearanceLevel;
    if (body.dutyClearance !== undefined) updateData.dutyClearance = body.dutyClearance;

    const updated = await db
      .update(convicts)
      .set(updateData)
      .where(eq(convicts.id, convictId))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT convict error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convictId = parseInt(id);

    if (isNaN(convictId)) {
      return NextResponse.json({ error: 'Invalid convict ID' }, { status: 400 });
    }

    await db.delete(convicts).where(eq(convicts.id, convictId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE convict error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
