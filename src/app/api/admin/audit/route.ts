import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, uconRoles, roles } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, or, sql, like, gte, lte } from 'drizzle-orm';

// Check if user has audit permission
// UCM 1-2 with 'audit' permissions OR any duty clearance
async function hasAuditPermission(userId: string): Promise<boolean> {
  const userRoleData = await db
    .select({
      roleLevel: roles.level,
      dutyClearance: uconRoles.dutyClearance,
      permissionClearance: uconRoles.permissionClearance,
    })
    .from(uconRoles)
    .innerJoin(roles, eq(uconRoles.roleId, roles.id))
    .where(eq(uconRoles.userId, userId))
    .limit(1);

  if (userRoleData.length === 0) return false;
  
  const { roleLevel, dutyClearance, permissionClearance } = userRoleData[0];
  
  // UCM 1-2 (level >= 90) always have access
  if (roleLevel && roleLevel >= 90) return true;
  
  // Check for 'audit' permission bit (bit 8 = 256)
  if (permissionClearance && (permissionClearance & 256) === 256) return true;
  
  // Any duty clearance grants audit access
  if (dutyClearance && dutyClearance > 0) return true;
  
  return false;
}

// Audit log categories
const AUDIT_CATEGORIES = [
  'transit',
  'bookings', 
  'users',
  'donations',
  'workshops',
  'admin',
  'auth',
  'outreach',
  'override_codes',
  'settings',
  'roles',
  'permissions',
  'constraints',
  'staff',
  'convicts',
] as const;

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = await hasAuditPermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ error: 'Insufficient permissions to view audit logs' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build conditions
    const conditions = [];
    
    if (category && category !== 'all') {
      conditions.push(eq(auditLogs.category, category));
    }
    
    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }
    
    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }
    
    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }
    
    if (search) {
      conditions.push(
        or(
          like(auditLogs.userEmail, `%${search}%`),
          like(auditLogs.userName, `%${search}%`),
          like(auditLogs.staffRegistrationNumber, `%${search}%`),
          like(auditLogs.entityId, `%${search}%`)
        )
      );
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get category counts for sidebar
    const categoryCounts = await db
      .select({
        category: auditLogs.category,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLogs)
      .groupBy(auditLogs.category);

    return NextResponse.json({
      logs,
      total: countResult[0]?.count || 0,
      categories: AUDIT_CATEGORIES,
      categoryCounts: categoryCounts.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// Export audit logs (CSV)
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = await hasAuditPermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { category, startDate, endDate, format } = body;

    const conditions = [];
    
    if (category && category !== 'all') {
      conditions.push(eq(auditLogs.category, category));
    }
    
    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(10000);

    if (format === 'csv') {
      const headers = ['ID', 'Category', 'Action', 'Entity Type', 'Entity ID', 'User Email', 'User Name', 'Staff #', 'Created At'];
      const rows = logs.map(log => [
        log.id,
        log.category,
        log.action,
        log.entityType || '',
        log.entityId || '',
        log.userEmail || '',
        log.userName || '',
        log.staffRegistrationNumber || '',
        log.createdAt,
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return NextResponse.json({ error: 'Failed to export audit logs' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = await hasAuditPermission(currentUser.id);
  if (!hasPermission) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Audit log deletion requires dual authorization. Please submit a sensitive change request.',
      code: 'REQUIRES_APPROVAL',
      details: {
        requestType: 'audit_delete',
        targetEntityType: 'audit_log',
        targetEntityId: logId,
        changeDetails: { action: 'delete_audit_log', logId }
      }
    }, { status: 403 });
  } catch (error) {
    console.error('Error in audit log delete:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
