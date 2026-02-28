import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, user, ucmLevels, auditLogs } from '@/db/schema';
import { eq, isNull, isNotNull, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/lib/auth';

function generatePAC(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const staffRole = await db
        .select({
          id: userRoles.id,
          userId: userRoles.userId,
          hasAccessCode: sql<boolean>`${userRoles.accessCode} IS NOT NULL`,
          registrationNumber: sql<string>`
            COALESCE(${userRoles.accessCode}, '') || '' AS registration_check
          `,
        })
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1);

      if (staffRole.length === 0) {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
      }

      const hasPAC = await db
        .select({ accessCode: userRoles.accessCode })
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1);

      return NextResponse.json({
        userId,
        hasPAC: hasPAC.length > 0 && hasPAC[0].accessCode !== null,
      });
    }

    const staffWithPAC = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(userRoles)
      .where(isNotNull(userRoles.accessCode));

    const staffWithoutPAC = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(userRoles)
      .where(isNull(userRoles.accessCode));

    return NextResponse.json({
      staffWithPAC: staffWithPAC[0]?.count || 0,
      staffWithoutPAC: staffWithoutPAC[0]?.count || 0,
      total: (staffWithPAC[0]?.count || 0) + (staffWithoutPAC[0]?.count || 0),
    });
  } catch (error) {
    console.error('PAC GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, regenerate } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const staffRole = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        accessCode: userRoles.accessCode,
        staffTitle: userRoles.staffTitle,
      })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (staffRole.length === 0) {
      return NextResponse.json({ error: 'Staff role not found' }, { status: 404 });
    }

    if (staffRole[0].accessCode && !regenerate) {
      return NextResponse.json({ 
        error: 'PAC already exists. Set regenerate=true to generate a new one.',
        hasPAC: true 
      }, { status: 400 });
    }

    const plainPAC = generatePAC();
    const hashedPAC = await bcrypt.hash(plainPAC, 10);

    await db
      .update(userRoles)
      .set({ accessCode: hashedPAC })
      .where(eq(userRoles.userId, userId));

    await db.insert(auditLogs).values({
      category: 'admin',
      action: regenerate ? 'regenerate_pac' : 'create_pac',
      entityType: 'staff_pac',
      entityId: userId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      details: {
        targetUserId: userId,
        action: regenerate ? 'PAC regenerated' : 'PAC created',
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      pac: plainPAC,
      message: 'PAC generated successfully. This code will only be shown once. Store it securely.',
      warning: 'The PAC is hashed and stored securely. The plain text version cannot be retrieved after this response.',
    });
  } catch (error) {
    console.error('PAC POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, pac } = body;

    if (!userId || !pac) {
      return NextResponse.json({ error: 'userId and pac are required' }, { status: 400 });
    }

    const staffRole = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        accessCode: userRoles.accessCode,
      })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (staffRole.length === 0) {
      return NextResponse.json({ error: 'Staff role not found' }, { status: 404 });
    }

    if (!staffRole[0].accessCode) {
      return NextResponse.json({ error: 'No PAC set for this user' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(pac, staffRole[0].accessCode);

    if (!isValid) {
      await db.insert(auditLogs).values({
        category: 'auth',
        action: 'pac_verification_failed',
        entityType: 'staff_pac',
        entityId: userId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        details: {
          targetUserId: userId,
          result: 'invalid',
        },
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ valid: false, error: 'Invalid PAC' }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('PAC PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
