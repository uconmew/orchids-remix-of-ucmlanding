import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convicts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { assignRoleTagsForUser } from '@/lib/role-tags';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(convicts)
      .where(eq(convicts.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Convict already exists' }, { status: 200 });
    }

    const nameParts = name ? name.split(' ') : ['User', ''];
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Member';

    const now = new Date().toISOString();

    await db.insert(convicts).values({
      userId,
      firstName,
      lastName,
      email,
      convictType: 'registered_user',
      status: 'active',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
      clearanceLevel: 0,
      dutyClearance: 0,
    });

    await assignRoleTagsForUser(userId, 7);

    return NextResponse.json({ message: 'Convict created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating convict after signup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
