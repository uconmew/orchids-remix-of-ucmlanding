import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, user, ucmLevels, auditLogs } from '@/db/schema';
import { eq, isNull, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/lib/auth';

function generatePAC(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staffWithoutPAC = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(userRoles)
      .innerJoin(user, eq(userRoles.userId, user.id))
      .where(isNull(userRoles.accessCode));

    if (staffWithoutPAC.length === 0) {
      return NextResponse.json({
        message: 'All staff members already have PACs assigned',
        assigned: 0,
        total: 0,
      });
    }

    const results: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      pac: string;
    }> = [];

    for (const staff of staffWithoutPAC) {
      const plainPAC = generatePAC();
      const hashedPAC = await bcrypt.hash(plainPAC, 10);

      await db
        .update(userRoles)
        .set({ accessCode: hashedPAC })
        .where(eq(userRoles.id, staff.id));

      results.push({
        userId: staff.userId,
        userName: staff.userName || 'Unknown',
        userEmail: staff.userEmail || 'Unknown',
        pac: plainPAC,
      });
    }

    await db.insert(auditLogs).values({
      category: 'admin',
      action: 'bulk_pac_assignment',
      entityType: 'staff_pac',
      entityId: 'bulk',
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      details: {
        assignedCount: results.length,
        staffIds: results.map(r => r.userId),
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `PACs assigned to ${results.length} staff members. These codes will only be shown once.`,
      assigned: results.length,
      results,
      warning: 'Save these PACs securely. The plain text versions cannot be retrieved after this response.',
    });
  } catch (error) {
    console.error('Bulk PAC assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
