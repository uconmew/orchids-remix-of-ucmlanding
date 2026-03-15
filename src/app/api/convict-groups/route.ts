import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convictGroups, convictGroupMembers, convicts } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const convictId = searchParams.get('convictId');

    if (convictId) {
      const memberships = await db
        .select({
          membership: convictGroupMembers,
          group: convictGroups,
        })
        .from(convictGroupMembers)
        .innerJoin(convictGroups, eq(convictGroupMembers.groupId, convictGroups.id))
        .where(eq(convictGroupMembers.convictId, parseInt(convictId)));

      return NextResponse.json(memberships.map(m => ({
        ...m.group,
        memberRole: m.membership.role,
        joinedAt: m.membership.joinedAt,
      })));
    }

    const groups = await db
      .select()
      .from(convictGroups)
      .where(eq(convictGroups.isActive, true))
      .orderBy(desc(convictGroups.createdAt));

    const groupsWithCount = await Promise.all(
      groups.map(async (group) => {
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(convictGroupMembers)
          .where(eq(convictGroupMembers.groupId, group.id));

        return {
          ...group,
          memberCount: Number(countResult[0]?.count || 0),
        };
      })
    );

    return NextResponse.json(groupsWithCount);
  } catch (error) {
    console.error('GET groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, groupType, maxMembers, createdBy } = body;

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newGroup = await db
      .insert(convictGroups)
      .values({
        name,
        description,
        groupType: groupType || 'study',
        maxMembers,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newGroup[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Group name already exists' }, { status: 409 });
    }
    console.error('POST group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, convictId, action, role } = body;

    if (!groupId || !convictId) {
      return NextResponse.json({ error: 'groupId and convictId are required' }, { status: 400 });
    }

    if (action === 'add') {
      const existing = await db
        .select()
        .from(convictGroupMembers)
        .where(eq(convictGroupMembers.groupId, groupId))
        .where(eq(convictGroupMembers.convictId, convictId))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json({ error: 'Convict already in group' }, { status: 409 });
      }

      await db.insert(convictGroupMembers).values({
        groupId,
        convictId,
        role: role || 'member',
        joinedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: 'Convict added to group' });
    }

    if (action === 'remove') {
      await db
        .delete(convictGroupMembers)
        .where(eq(convictGroupMembers.groupId, groupId))
        .where(eq(convictGroupMembers.convictId, convictId));

      return NextResponse.json({ success: true, message: 'Convict removed from group' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PUT groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
