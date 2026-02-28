import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const convictId = searchParams.get('convictId');

    try {
      if (!convictId) {
        const result = await db.all(sql`
          SELECT 
            cp.id, cp.convict_id as convictId, cp.resource, cp.action, 
            cp.is_granted as isGranted, cp.granted_by as grantedBy, 
            cp.granted_at as grantedAt, cp.expires_at as expiresAt,
            c.first_name as firstName, c.last_name as lastName, c.email
          FROM convict_permissions cp
          LEFT JOIN convicts c ON cp.convict_id = c.id
        `);
        return NextResponse.json(result, { status: 200 });
      }

      const result = await db.all(sql`
        SELECT 
          id, convict_id as convictId, resource, action, 
          is_granted as isGranted, granted_by as grantedBy, 
          granted_at as grantedAt, expires_at as expiresAt
        FROM convict_permissions
        WHERE convict_id = ${parseInt(convictId)}
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
    const { convictId, resource, action, isGranted, grantedBy, expiresAt } = body;

    if (!convictId || !resource || !action) {
      return NextResponse.json({ 
        error: "Missing required fields: convictId, resource, and action are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    const grantedValue = isGranted !== undefined ? (isGranted ? 1 : 0) : 1;
    const now = new Date().toISOString();
    const cId = parseInt(convictId);

    // Check if permission already exists and update
    const existing = await db.all(sql`
      SELECT id FROM convict_permissions 
      WHERE convict_id = ${cId} AND resource = ${resource} AND action = ${action}
      LIMIT 1
    `);

    if (existing.length > 0) {
      await db.run(sql`
        UPDATE convict_permissions 
        SET is_granted = ${grantedValue}, 
            granted_by = ${grantedBy || null}, 
            granted_at = ${now},
            expires_at = ${expiresAt || null}
        WHERE id = ${(existing[0] as any).id}
      `);

      return NextResponse.json({ 
        id: (existing[0] as any).id, 
        convictId: cId, resource, action, 
        isGranted: grantedValue === 1, 
        grantedBy, 
        grantedAt: now 
      }, { status: 200 });
    }

    // Create new permission
    const result = await db.run(sql`
      INSERT INTO convict_permissions (convict_id, resource, action, is_granted, granted_by, granted_at, expires_at)
      VALUES (${cId}, ${resource}, ${action}, ${grantedValue}, ${grantedBy || null}, ${now}, ${expiresAt || null})
    `);

    return NextResponse.json({ 
      id: result.lastInsertRowid, 
      convictId: cId, resource, action, 
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

    await db.run(sql`DELETE FROM convict_permissions WHERE id = ${parseInt(id)}`);

    return NextResponse.json({ message: "Permission deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}