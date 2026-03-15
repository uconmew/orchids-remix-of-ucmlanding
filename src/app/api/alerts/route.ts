import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAlerts } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, isNull, or, gt, sql } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/error-codes';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeRead = searchParams.get('includeRead') === 'true';
    const includeDismissed = searchParams.get('includeDismissed') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const now = new Date().toISOString();

    let whereConditions = [eq(userAlerts.userId, currentUser.id)];

    if (!includeRead) {
      whereConditions.push(eq(userAlerts.isRead, false));
    }

    if (!includeDismissed) {
      whereConditions.push(eq(userAlerts.isDismissed, false));
    }

    whereConditions.push(
      or(
        isNull(userAlerts.expiresAt),
        gt(userAlerts.expiresAt, now)
      )!
    );

    const alerts = await db
      .select()
      .from(userAlerts)
      .where(and(...whereConditions))
      .orderBy(
        sql`CASE WHEN ${userAlerts.priority} = 'urgent' THEN 0 WHEN ${userAlerts.priority} = 'high' THEN 1 WHEN ${userAlerts.priority} = 'normal' THEN 2 ELSE 3 END`,
        desc(userAlerts.createdAt)
      )
      .limit(limit);

    const unreadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userAlerts)
      .where(and(
        eq(userAlerts.userId, currentUser.id),
        eq(userAlerts.isRead, false),
        eq(userAlerts.isDismissed, false),
        or(isNull(userAlerts.expiresAt), gt(userAlerts.expiresAt, now))
      ));

    return NextResponse.json({
      alerts,
      unreadCount: Number(unreadCount[0]?.count || 0)
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to fetch alerts'),
      error: 'Failed to fetch alerts' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ids, action } = body;

    if (!action || (!id && !ids)) {
      return NextResponse.json({ 
        ...createErrorResponse('I1001', 'Action and alert ID(s) required'),
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const alertIds = ids || [id];
    const now = new Date().toISOString();

    for (const alertId of alertIds) {
      const alert = await db
        .select()
        .from(userAlerts)
        .where(and(
          eq(userAlerts.id, alertId),
          eq(userAlerts.userId, currentUser.id)
        ))
        .limit(1);

      if (alert.length === 0) continue;

      if (action === 'read') {
        await db.update(userAlerts)
          .set({ isRead: true, updatedAt: now })
          .where(eq(userAlerts.id, alertId));
      } else if (action === 'dismiss') {
        await db.update(userAlerts)
          .set({ isDismissed: true, isRead: true, updatedAt: now })
          .where(eq(userAlerts.id, alertId));
      } else if (action === 'unread') {
        await db.update(userAlerts)
          .set({ isRead: false, updatedAt: now })
          .where(eq(userAlerts.id, alertId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alerts:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to update alerts'),
      error: 'Failed to update alerts' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createErrorResponse('A1001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dismissAll = searchParams.get('dismissAll') === 'true';

    if (dismissAll) {
      await db.update(userAlerts)
        .set({ isDismissed: true, isRead: true, updatedAt: new Date().toISOString() })
        .where(eq(userAlerts.userId, currentUser.id));
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ 
        ...createErrorResponse('I1001', 'Alert ID required'),
        error: 'Missing alert ID' 
      }, { status: 400 });
    }

    await db.update(userAlerts)
      .set({ isDismissed: true, isRead: true, updatedAt: new Date().toISOString() })
      .where(and(
        eq(userAlerts.id, parseInt(id)),
        eq(userAlerts.userId, currentUser.id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return NextResponse.json({ 
      ...createErrorResponse('S1001', 'Failed to dismiss alert'),
      error: 'Failed to dismiss alert' 
    }, { status: 500 });
  }
}
