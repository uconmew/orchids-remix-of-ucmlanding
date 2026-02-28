import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sensitiveChangeRequests, user, userRoles, ucmLevels, roleTags, notifications } from '@/db/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const forApprover = searchParams.get('forApprover') === 'true';

    let query = db
      .select({
        id: sensitiveChangeRequests.id,
        requestType: sensitiveChangeRequests.requestType,
        requesterId: sensitiveChangeRequests.requesterId,
        requesterStaffNumber: sensitiveChangeRequests.requesterStaffNumber,
        targetUserId: sensitiveChangeRequests.targetUserId,
        targetEntityType: sensitiveChangeRequests.targetEntityType,
        targetEntityId: sensitiveChangeRequests.targetEntityId,
        changeDetails: sensitiveChangeRequests.changeDetails,
        approverStaffNumber: sensitiveChangeRequests.approverStaffNumber,
        approverId: sensitiveChangeRequests.approverId,
        status: sensitiveChangeRequests.status,
        approvedAt: sensitiveChangeRequests.approvedAt,
        deniedAt: sensitiveChangeRequests.deniedAt,
        denialReason: sensitiveChangeRequests.denialReason,
        expiresAt: sensitiveChangeRequests.expiresAt,
        createdAt: sensitiveChangeRequests.createdAt,
      })
      .from(sensitiveChangeRequests);

    const conditions = [];

    if (status) {
      conditions.push(eq(sensitiveChangeRequests.status, status));
    }

    if (forApprover) {
      const userRole = await db
        .select({ registrationNumber: user.registrationNumber })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      if (userRole[0]?.registrationNumber) {
        conditions.push(eq(sensitiveChangeRequests.approverStaffNumber, userRole[0].registrationNumber));
      }
    }

    const results = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(sensitiveChangeRequests.createdAt))
      : await query.orderBy(desc(sensitiveChangeRequests.createdAt));

    const enrichedResults = await Promise.all(results.map(async (req) => {
      const [requester] = await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, req.requesterId))
        .limit(1);

      let targetUser = null;
      if (req.targetUserId) {
        const [target] = await db
          .select({ name: user.name, email: user.email })
          .from(user)
          .where(eq(user.id, req.targetUserId))
          .limit(1);
        targetUser = target;
      }

      return {
        ...req,
        requesterName: requester?.name,
        requesterEmail: requester?.email,
        targetUserName: targetUser?.name,
        targetUserEmail: targetUser?.email,
        isExpired: new Date(req.expiresAt) < new Date(),
      };
    }));

    return NextResponse.json(enrichedResults, { status: 200 });
  } catch (error) {
    console.error('GET sensitive-changes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      requestType,
      targetUserId,
      targetEntityType,
      targetEntityId,
      changeDetails,
      approverStaffNumber,
    } = body;

    if (!requestType || !changeDetails || !approverStaffNumber) {
      return NextResponse.json({
        error: 'requestType, changeDetails, and approverStaffNumber are required',
      }, { status: 400 });
    }

    const validTypes = [
      'password_reset', 'email_change', 'profile_update', 'audit_delete',
      'role_change', 'credential_change', 'staff_name_change', 'operational_change',
      'pac_change'
    ];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    const [approverUser] = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.registrationNumber, approverStaffNumber))
      .limit(1);

    if (!approverUser) {
      return NextResponse.json({
        error: 'Approver with the specified UCM Staff ID not found',
        code: 'APPROVER_NOT_FOUND'
      }, { status: 404 });
    }

    const approverRole = await db
      .select({
        level: ucmLevels.level,
        accessCode: userRoles.accessCode,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, approverUser.id))
      .limit(1);

    if (!approverRole[0]) {
      return NextResponse.json({
        error: 'Approver does not have a valid staff role',
        code: 'APPROVER_NO_ROLE'
      }, { status: 400 });
    }

    if (!approverRole[0].accessCode) {
      return NextResponse.json({
        error: 'Approver does not have a Personal Access Code (PAC) set',
        code: 'APPROVER_NO_PAC'
      }, { status: 400 });
    }

    const auditLevelChanges = ['audit_delete', 'staff_name_change', 'operational_change', 'role_change'];
    const requiredLevel = auditLevelChanges.includes(requestType) ? 2 : 3;

    if (approverRole[0].level > requiredLevel) {
      return NextResponse.json({
        error: `This change type requires approval from a Level ${requiredLevel} or higher staff member`,
        code: 'INSUFFICIENT_APPROVER_LEVEL'
      }, { status: 403 });
    }

    const [requesterUser] = await db
      .select({ registrationNumber: user.registrationNumber })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const [newRequest] = await db
      .insert(sensitiveChangeRequests)
      .values({
        requestType,
        requesterId: session.user.id,
        requesterStaffNumber: requesterUser?.registrationNumber || null,
        targetUserId: targetUserId || null,
        targetEntityType: targetEntityType || null,
        targetEntityId: targetEntityId || null,
        changeDetails,
        approverStaffNumber,
        approverId: approverUser.id,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    await db.insert(notifications).values({
      userId: approverUser.id,
      title: 'Approval Request',
      message: `${session.user.name} has requested your approval for a ${requestType.replace(/_/g, ' ')}`,
      type: 'approval_request',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ...newRequest,
      approverName: approverUser.name,
      message: `Approval request sent to ${approverUser.name}. They have 30 minutes to respond.`
    }, { status: 201 });
  } catch (error) {
    console.error('POST sensitive-changes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
