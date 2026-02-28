import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { individualPermissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Use raw SQL to be safe since table might not exist yet
    try {
      if (!userId) {
        const result = await db.all(sql`
          SELECT 
            ip.id, ip.user_id as userId, ip.resource, ip.action, 
            ip.is_granted as isGranted, ip.granted_by as grantedBy, 
            ip.granted_at as grantedAt, ip.expires_at as expiresAt,
            u.name as userName, u.email as userEmail
          FROM individual_permissions ip
          LEFT JOIN user u ON ip.user_id = u.id
        `);
        return NextResponse.json(result, { status: 200 });
      }

      const result = await db.all(sql`
        SELECT 
          id, user_id as userId, resource, action, 
          is_granted as isGranted, granted_by as grantedBy, 
          granted_at as grantedAt, expires_at as expiresAt
        FROM individual_permissions
        WHERE user_id = ${userId}
      `);

      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      // Table might not exist, return empty array
      console.log('Table might not exist:', e);
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, resource, action, isGranted, grantedBy, expiresAt } = body;

    if (!userId || !resource || !action) {
      return NextResponse.json({ 
        error: "Missing required fields: userId, resource, and action are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    const grantedValue = isGranted !== undefined ? (isGranted ? 1 : 0) : 1;
    const now = new Date().toISOString();

    // Check if permission already exists and update
    const existing = await db.all(sql`
      SELECT id FROM individual_permissions 
      WHERE user_id = ${userId} AND resource = ${resource} AND action = ${action}
      LIMIT 1
    `);

    if (existing.length > 0) {
      await db.run(sql`
        UPDATE individual_permissions 
        SET is_granted = ${grantedValue}, 
            granted_by = ${grantedBy || null}, 
            granted_at = ${now},
            expires_at = ${expiresAt || null}
        WHERE id = ${(existing[0] as any).id}
      `);

      return NextResponse.json({ 
        id: (existing[0] as any).id, 
        userId, resource, action, 
        isGranted: grantedValue === 1, 
        grantedBy, 
        grantedAt: now 
      }, { status: 200 });
    }

    // Create new permission
    const result = await db.run(sql`
      INSERT INTO individual_permissions (user_id, resource, action, is_granted, granted_by, granted_at, expires_at)
      VALUES (${userId}, ${resource}, ${action}, ${grantedValue}, ${grantedBy || null}, ${now}, ${expiresAt || null})
    `);

    return NextResponse.json({ 
      id: result.lastInsertRowid, 
      userId, resource, action, 
      isGranted: grantedValue === 1, 
      grantedBy, 
      grantedAt: now 
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    await db.run(sql`DELETE FROM individual_permissions WHERE id = ${parseInt(id)}`);

    return NextResponse.json({ message: "Permission deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}